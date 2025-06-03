// Project Discovery Service
// This service handles fetching and analyzing projects from various platforms
// Last updated: 2025

import { UserPreferences, Project, ProjectDiscoveryResult, ApiError } from '../types';
import { CHARACTERISTICS_OPTIONS, PLATFORM_OPTIONS } from '../constants';

const MAX_RESULTS_PER_PLATFORM = 50; 

type PlatformFetchSuccess = {
  platform: string; 
  status: 'fulfilled'; 
  value: Project[];
};

type PlatformFetchFailure = {
  platform: string; 
  status: 'rejected'; 
  reason: ApiError;
};

type PlatformFetchOutcome = PlatformFetchSuccess | PlatformFetchFailure;

const buildKeywordString = (preferences: Omit<UserPreferences, 'platforms'>, excludeChars: string[] = []): string => {
  const keywords: string[] = [];
  if (preferences.topics) {
    preferences.topics.split(',').forEach(t => {
      const trimmedTopic = t.trim();
      if (trimmedTopic) keywords.push(trimmedTopic);
    });
  }
  preferences.characteristics.forEach(charId => {
    if (excludeChars.includes(charId)) return;
    const characteristic = CHARACTERISTICS_OPTIONS.find(c => c.id === charId);
    if (characteristic) keywords.push(characteristic.label);
  });
  return keywords.join(' ');
};

const getPrimaryLanguage = (preferences: Omit<UserPreferences, 'platforms'>): string | null => {
    const firstLang = preferences.languages.split(',')[0]?.trim();
    return firstLang ? firstLang.toLowerCase() : null;
};

// --- GitHub Specific ---
interface GitHubRepoItem {
  full_name: string; description: string | null; html_url: string; language: string | null;
  topics: string[]; stargazers_count: number; forks_count: number; pushed_at: string;
  owner: { login: string }; open_issues_count: number;
  watchers_count: number; 
  default_branch: string; 
}
const mapGitHubItemToProject = (item: GitHubRepoItem): Project => ({
  name: item.full_name, 
  description: item.description || '', 
  url: item.html_url, 
  language: item.language || 'Unknown',
  tags: Array.from(new Set([...(item.topics || []), ...(item.language ? [item.language] : [])])),
  platform: 'GitHub', 
  stars: item.stargazers_count, 
  forks: item.forks_count,
  updatedAt: item.pushed_at, 
  owner: item.owner?.login, 
  openIssues: item.open_issues_count,
  watchers: item.watchers_count,
  closedIssues: 0,
  contributors: 0,
  commitsLastMonth: 0,
  issuesLastMonth: 0,
  pullRequestsLastMonth: 0
});
const fetchGitHubProjects = async (preferences: Omit<UserPreferences, 'platforms'>): Promise<Project[]> => {
  const platform = PLATFORM_OPTIONS.find(p => p.id === 'github')!;
  const queryParts: string[] = [];
  if (preferences.languages) preferences.languages.split(',').forEach(l => {
    const lang = l.trim();
    if (lang) queryParts.push(`language:"${lang.replace(/"/g, '\\"')}"`);
  });
  if (preferences.topics) preferences.topics.split(',').forEach(t => {
    const topic = t.trim();
    if (topic) queryParts.push(`topic:"${topic.replace(/"/g, '\\"')}"`);
  });
  
  let sortBy = preferences.characteristics.includes('actively-maintained') ? 'updated' : (preferences.characteristics.includes('large-community') ? 'stars' : '');
  
  preferences.characteristics.forEach(c => {
    if (c === 'good-first-issues') queryParts.push('good-first-issues:>0');
    else if (!['actively-maintained', 'large-community'].includes(c)) {
       const char = CHARACTERISTICS_OPTIONS.find(opt => opt.id === c);
       if(char) queryParts.push(`"${char.label.toLowerCase()}"`);
    }
  });

  let q = queryParts.join(' ').trim();
  if (!q) q = 'stars:>1'; 
  if(!sortBy && !q.includes('sort:')) sortBy = 'stars';


  const params = new URLSearchParams({ q, per_page: MAX_RESULTS_PER_PLATFORM.toString() });
  if (sortBy) {
    params.append('sort', sortBy);
    params.append('order', 'desc');
  }
  const url = `${platform.apiUrl}?${params.toString()}`;
  console.log(`GitHub Fetch URL: ${url}`);
  const response = await fetch(url, { headers: { 'Accept': 'application/vnd.github.v3+json' }, mode: 'cors', cache: 'no-cache' });
  if (!response.ok) throw { platform: platform.label, message: `API request failed: ${response.statusText || response.status}`, status: response.status } as ApiError;
  const data = await response.json();
  return data.items?.map((item: GitHubRepoItem) => mapGitHubItemToProject(item)) || [];
};

export const fetchGitHubReadmeContent = async (owner: string, repo: string): Promise<string> => {
  try {
    // The /readme endpoint automatically finds the README in the repository's root, .github/, or docs/
    // and also handles various file extensions (e.g., .md, .rst).
    // It uses the default branch unless another is specified.
    const url = `https://api.github.com/repos/${owner}/${repo}/readme`;
    
    const response = await fetch(url, { 
      headers: { 
        // Requesting HTML rendering directly from GitHub
        'Accept': 'application/vnd.github.html+json' 
      },
      mode: 'cors', 
      cache: 'no-cache' 
    });

    if (response.ok) {
      const htmlContent = await response.text(); // Get the response body as text (HTML)
      return htmlContent;
    } else {
      // Handle cases where README might not exist or other API errors
      if (response.status === 404) {
        console.warn(`README not found for ${owner}/${repo}. Status: 404`);
        throw new Error('README file not found.');
      }
      // Attempt to get more detailed error message from response body if not 404
      const errorText = await response.text().catch(() => `Status: ${response.statusText || response.status}`);
      console.error(`Failed to fetch README for ${owner}/${repo}. Status: ${response.status}. Response: ${errorText.substring(0, 200)}`);
      throw new Error(`Failed to fetch README (${response.status}).`);
    }
  } catch (error) {
    console.error('Error in fetchGitHubReadmeContent:', error);
    const message = error instanceof Error ? error.message : 'Could not retrieve README.';
    // Ensure the error message itself isn't HTML that could break the display
    const safeMessage = message.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return `<p class="text-red-400">Error loading README: ${safeMessage}</p>`;
  }
};


// --- GitLab Specific ---
interface GitLabRepoItem {
  path_with_namespace: string; description: string | null; web_url: string; tag_list: string[];
  star_count: number; forks_count: number; last_activity_at: string; namespace: { name: string };
  open_issues_count?: number; 
  statistics?: { open_issues_count: number; }; // Alternative location for open_issues_count
}
const mapGitLabLanguageFromApi = (apiLangName: string | null): string | null => {
    if (!apiLangName) return null;
    const l = apiLangName.toLowerCase();
    if (l === 'c#') return 'csharp';
    if (l === 'c++') return 'cpp';
    return l;
};
const mapGitLabItemToProject = (item: GitLabRepoItem, preferences: Omit<UserPreferences, 'platforms'>): Project => {
  const userPrimaryLang = getPrimaryLanguage(preferences);
  let projectLang = userPrimaryLang; 

  if (userPrimaryLang && item.tag_list?.map(t => t.toLowerCase()).includes(mapGitLabLanguageFromApi(userPrimaryLang)!)) {
      projectLang = userPrimaryLang; 
  } else if (item.tag_list?.length > 0) {
      const commonLangs = ['python', 'javascript', 'java', 'csharp', 'cpp', 'typescript', 'go', 'rust', 'php', 'ruby', 'swift', 'kotlin'];
      const foundLangInTags = item.tag_list.find(tag => commonLangs.includes(tag.toLowerCase()));
      if (foundLangInTags) projectLang = foundLangInTags;
  }

  const openIssues = item.open_issues_count ?? item.statistics?.open_issues_count ?? 0;

  return {
    name: item.path_with_namespace, 
    description: item.description || '', 
    url: item.web_url, 
    language: projectLang ? projectLang.charAt(0).toUpperCase() + projectLang.slice(1) : 'Unknown',
    tags: Array.from(new Set([...(item.tag_list || []), ...(projectLang ? [projectLang] : [])])),
    platform: 'GitLab', 
    stars: item.star_count, 
    forks: item.forks_count,
    updatedAt: item.last_activity_at, 
    owner: item.namespace?.name,
    openIssues: openIssues,
    watchers: 0,
    closedIssues: 0,
    contributors: 0,
    commitsLastMonth: 0,
    issuesLastMonth: 0,
    pullRequestsLastMonth: 0
  };
};
const fetchGitLabProjects = async (preferences: Omit<UserPreferences, 'platforms'>): Promise<Project[]> => {
  const platform = PLATFORM_OPTIONS.find(p => p.id === 'gitlab')!;
  const params = new URLSearchParams({ per_page: MAX_RESULTS_PER_PLATFORM.toString(), min_access_level: '10', statistics: 'true' }); 
  const searchKeywordsArray: string[] = [];

  const firstLangRaw = getPrimaryLanguage(preferences);
  const gitlabLangParam = mapGitLabLanguageFromApi(firstLangRaw); 
  if (gitlabLangParam) {
    params.append('language', gitlabLangParam);
  }

  if (preferences.topics) preferences.topics.split(',').forEach(t => {
    const topic = t.trim();
    if (topic) searchKeywordsArray.push(topic);
  });
  
  let orderBy = "";
  if (preferences.characteristics.includes('actively-maintained')) {
    orderBy = 'last_activity_at';
  } else if (preferences.characteristics.includes('large-community')) {
    orderBy = 'star_count'; 
  }

  preferences.characteristics.forEach(c => {
     if (!['actively-maintained', 'large-community'].includes(c)) {
        const char = CHARACTERISTICS_OPTIONS.find(opt => opt.id === c);
        if(char) searchKeywordsArray.push(char.label);
     }
  });

  const searchString = searchKeywordsArray.join(' ').trim();
  if (searchString) {
    params.append('search', searchString);
  }
  
  if (orderBy) {
    params.append('order_by', orderBy);
    params.append('sort', 'desc');
  } else if (!searchString && !gitlabLangParam) { 
    params.append('order_by', 'star_count'); 
    params.append('sort', 'desc');
  }

  const url = `${platform.apiUrl}?${params.toString()}`;
  console.log(`GitLab Fetch URL: ${url}`);
  const response = await fetch(url, { mode: 'cors', cache: 'no-cache' });
  if (!response.ok) throw { platform: platform.label, message: `API request failed: ${response.statusText || response.status}`, status: response.status } as ApiError;
  const data = await response.json();
  return data.map((item: GitLabRepoItem) => mapGitLabItemToProject(item, preferences));
};

// --- Bitbucket Specific (Placeholder) ---
const fetchBitbucketProjects = async (): Promise<Project[]> => {
  console.warn("Bitbucket fetcher: This platform is not currently active. Returning empty array.");
  return Promise.resolve([]);
};


// --- NPM Specific ---
interface NpmPackageFromSearch { name: string; description?: string; links: { npm: string }; keywords?: string[]; date: string; publisher: { username: string }; version: string; }
interface NpmSearchResult { objects: { package: NpmPackageFromSearch, score: { final: number} }[]; total: number; }
interface NpmDownloadsPoint { downloads: number; start: string; end: string; package: string; }

const mapNpmItemToProjectBase = (item: NpmPackageFromSearch, score: number): Project => {
    let lang: string | null = null;
    if (item.keywords?.some(k => k.toLowerCase() === 'typescript')) {
        lang = 'TypeScript';
    } else if (item.keywords?.some(k => k.toLowerCase() === 'javascript')) {
        lang = 'JavaScript';
    } else {
        lang = 'JavaScript';
    }

    return {
        name: item.name, 
        description: item.description || '', 
        url: item.links.npm,
        language: lang || 'JavaScript', 
        tags: item.keywords || [], 
        platform: 'NPM', 
        updatedAt: item.date, 
        owner: item.publisher?.username,
        stars: Math.round(score * 1000), 
        downloads: undefined, 
        monthlyDownloads: undefined, 
        version: item.version,
        forks: 0,
        watchers: 0,
        openIssues: 0,
        closedIssues: 0,
        contributors: 0,
        commitsLastMonth: 0,
        issuesLastMonth: 0,
        pullRequestsLastMonth: 0
    };
};

const fetchNpmProjects = async (preferences: Omit<UserPreferences, 'platforms'>): Promise<Project[]> => {
  const platform = PLATFORM_OPTIONS.find(p => p.id === 'npm')!;
  let textQueryParts: string[] = [];
  const topics = preferences.topics.split(',').map(t => t.trim()).filter(Boolean);
  if (topics.length > 0) textQueryParts.push(...topics);

  const characteristicLabels = preferences.characteristics
      .map(id => CHARACTERISTICS_OPTIONS.find(c => c.id === id)?.label)
      .filter((item): item is string => typeof item === 'string');
  if (characteristicLabels.length > 0) textQueryParts.push(...characteristicLabels);
  
  const languages = preferences.languages.split(',').map(l => l.trim()).filter(Boolean);
  if (languages.length > 0) textQueryParts.push(...languages); 


  let textQuery = textQueryParts.join(' ');
  if (!textQuery) textQuery = "cool useful"; 
  
  let boostPopularity = preferences.characteristics.includes('large-community') ? 2 : 1;
  let boostQuality = preferences.characteristics.includes('good-documentation') ? 1.5 : 1; 
  let boostMaintenance = preferences.characteristics.includes('actively-maintained') ? 1.5 : 1;

  const params = new URLSearchParams({ 
      text: textQuery, 
      size: MAX_RESULTS_PER_PLATFORM.toString(),
      'boost-exact': 'false', 
      popularity: boostPopularity.toString(),
      quality: boostQuality.toString(),
      maintenance: boostMaintenance.toString()
  });
  const searchUrl = `${platform.apiUrl}?${params.toString()}`;
  console.log(`NPM Fetch URL: ${searchUrl}`);
  const searchResponse = await fetch(searchUrl, { mode: 'cors', cache: 'no-cache' });
  if (!searchResponse.ok) throw { platform: platform.label, message: `API search request failed: ${searchResponse.statusText || searchResponse.status}`, status: searchResponse.status } as ApiError;
  
  const searchData: NpmSearchResult = await searchResponse.json();
  const initialProjects = searchData.objects?.map(obj => mapNpmItemToProjectBase(obj.package, obj.score.final)) || [];

  if (initialProjects.length === 0) return [];

  const projectsWithStatsPromises = initialProjects.map(async (project) => {
    let monthlyDownloads: number | null = null;
    let yearlyDownloads: number | null = null;

    try {
      const monthlyRes = await fetch(`https://api.npmjs.org/downloads/point/last-month/${encodeURIComponent(project.name)}`, { mode: 'cors', cache: 'no-cache' });
      if (monthlyRes.ok) {
        const monthlyData: NpmDownloadsPoint = await monthlyRes.json();
        monthlyDownloads = monthlyData.downloads;
      } else {
        console.warn(`NPM: Failed to fetch monthly downloads for ${project.name}: ${monthlyRes.status}`);
      }

      const yearlyRes = await fetch(`https://api.npmjs.org/downloads/point/last-year/${encodeURIComponent(project.name)}`, { mode: 'cors', cache: 'no-cache' });
      if (yearlyRes.ok) {
        const yearlyData: NpmDownloadsPoint = await yearlyRes.json();
        yearlyDownloads = yearlyData.downloads;
      } else {
        console.warn(`NPM: Failed to fetch yearly downloads for ${project.name}: ${yearlyRes.status}`);
      }
    } catch (e) {
      console.warn(`NPM: Error fetching download stats for ${project.name}:`, e);
    }
    
    return {
      ...project,
      monthlyDownloads: monthlyDownloads ?? undefined, 
      downloads: yearlyDownloads ?? undefined, 
    };
  });

  let projectsWithStats = await Promise.all(projectsWithStatsPromises);
  
  if(preferences.characteristics.includes('large-community')) {
     projectsWithStats.sort((a, b) => (b.downloads ?? b.monthlyDownloads ?? 0) - (a.downloads ?? a.monthlyDownloads ?? 0));
  }

  return projectsWithStats.slice(0, MAX_RESULTS_PER_PLATFORM);
};

// --- PyPI Specific ---
const fetchPyPiProjects = async (): Promise<Project[]> => {
  console.warn("PyPI fetcher: This platform is not implemented due to API limitations (CORS, HTML responses) for client-side search. Returning empty array.");
  return Promise.resolve([]);
};


// --- SourceForge Specific (Placeholder) ---
const fetchSourceForgeProjects = async (): Promise<Project[]> => {
  console.warn("SourceForge fetcher: This platform is not implemented due to API limitations for direct keyword search suitable for client-side. Returning empty array.");
  return Promise.resolve([]);
};

// --- Codeberg/Gitea Specific ---
interface CodebergRepoItem {
  full_name: string; description: string | null; html_url: string; language: string | null;
  topics: string[]; stars_count?: number; forks_count?: number; updated_at: string; 
  owner: { login: string }; open_issues_count?: number; watchers_count?: number;
}
const mapCodebergItemToProject = (item: CodebergRepoItem): Project => ({
  name: item.full_name, 
  description: item.description || '', 
  url: item.html_url, 
  language: item.language || 'Unknown',
  tags: Array.from(new Set([...(item.topics || []), ...(item.language ? [item.language] : [])])),
  platform: 'Codeberg', 
  stars: item.stars_count ?? 0, 
  forks: item.forks_count ?? 0, 
  updatedAt: item.updated_at, 
  owner: item.owner?.login,
  openIssues: item.open_issues_count ?? 0, 
  watchers: item.watchers_count ?? 0,
  closedIssues: 0,
  contributors: 0,
  commitsLastMonth: 0,
  issuesLastMonth: 0,
  pullRequestsLastMonth: 0
});
const fetchCodebergProjects = async (preferences: Omit<UserPreferences, 'platforms'>): Promise<Project[]> => {
  const platform = PLATFORM_OPTIONS.find(p => p.id === 'codeberg')!;
  const queryParts: string[] = [];
  if (preferences.topics) preferences.topics.split(',').forEach(t => {
    const topic = t.trim();
    if (topic) queryParts.push(topic);
  });
  preferences.characteristics.forEach(c => {
      const char = CHARACTERISTICS_OPTIONS.find(opt => opt.id === c);
      if(char && !['actively-maintained', 'large-community'].includes(c)) queryParts.push(char.label);
  });

  const params = new URLSearchParams({ limit: MAX_RESULTS_PER_PLATFORM.toString() });
  const firstLang = getPrimaryLanguage(preferences);
  if (firstLang) params.append('language', firstLang); 
  
  let q = queryParts.join(' ');
  if(q) params.append('q', q.trim());
  
  if (preferences.characteristics.includes('actively-maintained')) {
    params.append('sort', 'updated'); 
  } else if (preferences.characteristics.includes('large-community') && !params.has('sort')) {
    params.append('sort', 'stars');
  } else if (!params.has('sort') && !params.has('q') && !params.has('language')) {
    params.append('sort', 'updated');
  }


  const url = `${platform.apiUrl}?${params.toString()}`;
  console.log(`Codeberg Fetch URL: ${url}`);
  const response = await fetch(url, { mode: 'cors', cache: 'no-cache' });
  if (!response.ok) throw { platform: platform.label, message: `API request failed: ${response.statusText || response.status}`, status: response.status } as ApiError;
  const data = await response.json(); 
  const items = Array.isArray(data) ? data : data.data; 
  
  let fetchedProjects = items?.map((item: CodebergRepoItem) => mapCodebergItemToProject(item)) || [];

  const shouldApplyClientSideStatsFilter =
    !preferences.characteristics.includes('needs-contributors') &&
    !preferences.characteristics.includes('beginner-friendly') &&
    !preferences.characteristics.includes('good-first-issues');

  if (shouldApplyClientSideStatsFilter && fetchedProjects.length > 0) {
    const initialCount = fetchedProjects.length;
    fetchedProjects = fetchedProjects.filter((p: Project) => (p.stars ?? 0) > 0 || (p.forks ?? 0) > 0);
    if (fetchedProjects.length < initialCount) {
      console.log(`Codeberg: Client-side filtered out ${initialCount - fetchedProjects.length} projects with 0 stars and 0 forks.`);
    }
  }
  
  return fetchedProjects;
};

// --- Packagist Specific ---
interface PackagistPackage { name: string; description: string; url: string; repository: string; downloads: number; favers: number; keywords?: string[]; }
interface PackagistResult { results: PackagistPackage[]; total: number; next?: string; }
interface PackagistStats { downloads: { total: number; monthly: number; daily: number; }; versions: string[]; }

const mapPackagistItemToProject = (item: PackagistPackage): Project => ({
  name: item.name, 
  description: item.description || '', 
  url: item.url, 
  language: "PHP", 
  tags: item.keywords || [], 
  platform: 'Packagist', 
  stars: item.favers, 
  downloads: item.downloads,
  updatedAt: undefined, 
  owner: item.name.split('/')[0], 
  version: undefined,
  forks: 0,
  watchers: 0,
  openIssues: 0,
  closedIssues: 0,
  contributors: 0,
  commitsLastMonth: 0,
  issuesLastMonth: 0,
  pullRequestsLastMonth: 0
});
const fetchPackagistProjects = async (preferences: Omit<UserPreferences, 'platforms'>): Promise<Project[]> => {
  const platform = PLATFORM_OPTIONS.find(p => p.id === 'packagist')!;
  let q = buildKeywordString(preferences, ['actively-maintained', 'large-community']);
  const firstLang = getPrimaryLanguage(preferences);
  if (firstLang && firstLang !== 'php') return []; 
  if (!q && preferences.languages.toLowerCase().includes('php')) q = "php"; 
  else if (!q) q = "library"; 

  const params = new URLSearchParams({ q, per_page: MAX_RESULTS_PER_PLATFORM.toString() });
  const url = `${platform.apiUrl}?${params.toString()}`;
  console.log(`Packagist Fetch URL: ${url}`);
  const response = await fetch(url, { mode: 'cors', cache: 'no-cache' });
  if (!response.ok) throw { platform: platform.label, message: `API request failed: ${response.statusText || response.status}`, status: response.status } as ApiError;
  const data: PackagistResult = await response.json();
  
  const initialProjects = data.results?.map(mapPackagistItemToProject) || [];

  const projectsWithStatsPromises = initialProjects.map(async (project) => {
    if (!project.name) return project;
    try {
      const statsResponse = await fetch(`https://packagist.org/packages/${project.name}/stats.json`, { mode: 'cors', cache: 'no-cache' });
      if (statsResponse.ok) {
        const statsData: PackagistStats = await statsResponse.json();
        return {
          ...project,
          monthlyDownloads: statsData?.downloads?.monthly,
          versionHistory: statsData?.versions,
        };
      } else {
        console.warn(`Failed to fetch stats for Packagist project ${project.name}: ${statsResponse.status}`);
      }
    } catch (e) {
      console.warn(`Error fetching stats for Packagist project ${project.name}:`, e);
    }
    return project; 
  });

  let projectsWithStats = await Promise.all(projectsWithStatsPromises);
  
  if(preferences.characteristics.includes('large-community')) {
    projectsWithStats.sort((a,b) => (b.stars || 0) - (a.stars || 0));
  }
  return projectsWithStats.slice(0, MAX_RESULTS_PER_PLATFORM);
};

// --- RubyGems Specific ---
const fetchRubyGemsProjects = async (): Promise<Project[]> => {
  console.warn("RubyGems fetcher: This platform is not implemented due to persistent network/API issues. Returning empty array.");
  return Promise.resolve([]);
};

// --- Crates.io Specific ---
interface CrateItem { name: string; description: string | null; homepage: string | null; repository: string | null; documentation: string | null; downloads: number; recent_downloads?: number; max_version: string; updated_at: string; created_at: string; keywords?: string[]; }
interface CratesIoResult { crates: CrateItem[]; meta: { total: number }; }
const mapCratesIoItemToProject = (item: CrateItem): Project => ({
  name: item.name, 
  description: item.description || '', 
  url: item.repository || item.homepage || `https://crates.io/crates/${item.name}`, 
  language: "Rust",
  tags: item.keywords || [], 
  platform: 'Crates.io', 
  stars: 0, 
  downloads: item.downloads, 
  recentDownloads: item.recent_downloads ?? undefined, 
  updatedAt: item.updated_at, 
  owner: undefined, 
  version: item.max_version,
  forks: 0,
  watchers: 0,
  openIssues: 0,
  closedIssues: 0,
  contributors: 0,
  commitsLastMonth: 0,
  issuesLastMonth: 0,
  pullRequestsLastMonth: 0
});
const fetchCratesIoProjects = async (preferences: Omit<UserPreferences, 'platforms'>): Promise<Project[]> => {
  const platform = PLATFORM_OPTIONS.find(p => p.id === 'crates-io')!;
  let q = buildKeywordString(preferences, ['actively-maintained', 'large-community']);
  const firstLang = getPrimaryLanguage(preferences);
  if (firstLang && firstLang !== 'rust') return [];
  if (!q && preferences.languages.toLowerCase().includes('rust')) q = "rust";
  else if (!q) q = "crate";

  let sort = 'relevance'; 
  if (preferences.characteristics.includes('actively-maintained')) sort = 'recent-updates';
  else if (preferences.characteristics.includes('large-community')) sort = 'downloads'; 

  const params = new URLSearchParams({ q, per_page: MAX_RESULTS_PER_PLATFORM.toString(), sort });
  const url = `${platform.apiUrl}?${params.toString()}`;
  console.log(`Crates.io Fetch URL: ${url}`);
  const response = await fetch(url, { mode: 'cors', cache: 'no-cache' });
  if (!response.ok) throw { platform: platform.label, message: `API request failed: ${response.statusText || response.status}`, status: response.status } as ApiError;
  const data: CratesIoResult = await response.json();
  return data.crates?.map(mapCratesIoItemToProject) || [];
};

// --- NuGet Specific ---
interface NuGetDataItem { id: string; version: string; description: string; authors: string[]; projectUrl?: string; iconUrl?: string; tags?: string[]; totalDownloads?: number; }
interface NuGetResult { totalHits: number; data: NuGetDataItem[]; }
const mapNuGetItemToProject = (item: NuGetDataItem): Project => ({
  name: item.id, 
  description: item.description || '', 
  url: item.projectUrl || `https://www.nuget.org/packages/${item.id}/`, 
  language: "C#", 
  tags: item.tags || [], 
  platform: 'NuGet', 
  stars: 0, 
  downloads: item.totalDownloads,
  updatedAt: undefined, 
  owner: Array.isArray(item.authors) ? item.authors.join(', ') : item.authors,
  version: item.version,
  forks: 0,
  watchers: 0,
  openIssues: 0,
  closedIssues: 0,
  contributors: 0,
  commitsLastMonth: 0,
  issuesLastMonth: 0,
  pullRequestsLastMonth: 0
});
const fetchNuGetProjects = async (preferences: Omit<UserPreferences, 'platforms'>): Promise<Project[]> => {
  const platform = PLATFORM_OPTIONS.find(p => p.id === 'nuget')!;
  let q = buildKeywordString(preferences, ['actively-maintained', 'large-community']);
  const firstLang = getPrimaryLanguage(preferences);
  const dotNetLangs = ['c#', 'f#', 'vb.net', '.net', 'csharp', 'vb'];
  if (firstLang && !dotNetLangs.includes(firstLang.replace(/\s/g, ''))) return []; 
  
  if (!q && (preferences.languages && dotNetLangs.some(l => preferences.languages.toLowerCase().includes(l)))) {
      q = "package"; 
  } else if(!q) {
      q = "library"; 
  }
  
  const params = new URLSearchParams({ q, take: MAX_RESULTS_PER_PLATFORM.toString(), prerelease: 'false' });
  const url = `${platform.apiUrl}?${params.toString()}`;
  console.log(`NuGet Fetch URL: ${url}`);
  const response = await fetch(url, { mode: 'cors', cache: 'no-cache' });
  if (!response.ok) throw { platform: platform.label, message: `API request failed: ${response.statusText || response.status}`, status: response.status } as ApiError;
  const data: NuGetResult = await response.json();
  let projects = data.data?.map(mapNuGetItemToProject) || [];
  if(preferences.characteristics.includes('large-community')) projects.sort((a,b) => (b.downloads || 0) - (a.downloads || 0));
  return projects;
};

// --- Placeholder fetchers for non-implemented platforms ---
const fetchLibrariesIoProjects = async (): Promise<Project[]> => {
  console.warn("Libraries.io fetcher: This platform is not implemented. It typically requires an API key for comprehensive search. Returning empty array.");
  return Promise.resolve([]);
};

const fetchOpenHubProjects = async (): Promise<Project[]> => {
  console.warn("Open Hub fetcher: This platform is not implemented. Its API is limited for general search and often requires API keys. Returning empty array.");
  return Promise.resolve([]);
};

const fetchFDroidProjects = async (): Promise<Project[]> => {
  console.warn("F-Droid fetcher: This platform is not implemented. F-Droid primarily uses an XML feed, which is incompatible with the current JSON-focused architecture. Returning empty array.");
  return Promise.resolve([]);
};


// --- Main Fetch Function ---
export const fetchPublicProjects = async (preferences: Omit<UserPreferences, 'platforms'>): Promise<ProjectDiscoveryResult> => {
  const allProjects: Project[] = [];
  const partialErrors: string[] = [];

  const platformFetchers: Record<string, (prefs: Omit<UserPreferences, 'platforms'>) => Promise<Project[]>> = {
    github: fetchGitHubProjects,
    gitlab: fetchGitLabProjects,
    bitbucket: fetchBitbucketProjects, 
    npm: fetchNpmProjects,
    pypi: fetchPyPiProjects, 
    sourceforge: fetchSourceForgeProjects, 
    codeberg: fetchCodebergProjects,
    packagist: fetchPackagistProjects,
    rubygems: fetchRubyGemsProjects,
    'crates-io': fetchCratesIoProjects,
    nuget: fetchNuGetProjects,
    'libraries-io': fetchLibrariesIoProjects,
    'open-hub': fetchOpenHubProjects,
    'f-droid': fetchFDroidProjects,
  };

  const selectedPlatformOptions = PLATFORM_OPTIONS.filter(p => p.isImplemented);
  
  const fetchPromises: Promise<PlatformFetchOutcome>[] = selectedPlatformOptions.map(platformOpt => {
    if (platformFetchers[platformOpt.id]) {
      console.log(`Initiating fetch from ${platformOpt.label}...`);
      return platformFetchers[platformOpt.id](preferences)
        .then(projects => ({ platform: platformOpt.label, status: 'fulfilled', value: projects } as PlatformFetchSuccess))
        .catch(error => {
            if (error && typeof error === 'object' && 'platform' in error && 'message' in error) {
                 return { platform: platformOpt.label, status: 'rejected', reason: error as ApiError } as PlatformFetchFailure;
            }
            return { 
                platform: platformOpt.label, 
                status: 'rejected', 
                reason: { platform: platformOpt.label, message: error instanceof Error ? error.message : 'Unknown error during fetch', status: (error as any)?.status || 500 } 
            } as PlatformFetchFailure;
        });
    }
    console.warn(`No fetcher defined for supposedly implemented platform: ${platformOpt.label}. Marking as error.`);
    return Promise.resolve({ 
        platform: platformOpt.label, 
        status: 'rejected', 
        reason: { platform: platformOpt.label, message: "Fetcher logic missing for an implemented platform.", status: 501 } 
    } as PlatformFetchFailure);
  });

  const results = await Promise.allSettled<PlatformFetchOutcome>(fetchPromises);

  results.forEach(settledResult => { 
    if (settledResult.status === 'fulfilled') { 
        const platformOutcome: PlatformFetchOutcome = settledResult.value; 
        if (platformOutcome.status === 'fulfilled') { 
            allProjects.push(...platformOutcome.value);
            console.log(`Successfully fetched from ${platformOutcome.platform}: ${platformOutcome.value.length} projects.`);
        } else { 
            const errorDetails = platformOutcome.reason;
            console.error(`Error fetching projects from ${platformOutcome.platform}:`, errorDetails.message, `Status: ${errorDetails.status}`);
            partialErrors.push(`${platformOutcome.platform}: ${errorDetails.message}${errorDetails.status ? ` (Status: ${errorDetails.status})` : ''}`);
        }
    } else { 
        console.error(`A platform fetch promise setup itself was critically rejected:`, settledResult.reason);
        const reason = settledResult.reason as any; 
        const platformName = reason?.platform || 'Unknown platform (promise setup rejected)';
        const message = reason?.message || (typeof reason === 'string' ? reason : 'Unhandled promise rejection');
        const status = reason?.status;
        partialErrors.push(`${platformName}: ${message}${status ? ` (Status: ${status})` : ''}`);
    }
  });
  
  const uniqueProjects = Array.from(new Map(allProjects.map(p => [p.url.toLowerCase(), p])).values());

  uniqueProjects.sort((a, b) => {
    const starsA = a.stars ?? (a.downloads ? (a.downloads / 100) : 0); 
    const starsB = b.stars ?? (b.downloads ? (b.downloads / 100) : 0);
    
    if (starsB !== starsA) return starsB - starsA;
    
    const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return dateB - dateA; 
  });
  
  return { projects: uniqueProjects, partialErrors };
};
