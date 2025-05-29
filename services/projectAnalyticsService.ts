import { Project, ProjectAnalytics, LanguageDistribution } from './types';
import { CODEBERG_API_BASE } from './constants';

// Add type declaration for Vite env variables
declare global {
  interface ImportMeta {
    env: {
      VITE_GITHUB_TOKEN?: string;
      VITE_GITLAB_TOKEN?: string;
    }
  }
}

// Helper functions
const createFallbackData = (project: Partial<Project>): ProjectAnalytics => {
  const now = Date.now();
  const weeklyActivity = Array.from({ length: 12 }, (_, i) => ({
    date: new Date(now - i * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    commits: 0
  })).reverse();

  return {
    stars: null,
    forks: null,
    issues: 0,
    pullRequests: 0,
    contributors: 0,
    lastCommit: new Date().toISOString(),
    commitFrequency: 0,
    weeklyActivity,
    languageDistribution: {
      [project.language || 'unknown']: 100
    },
    topContributors: [],
    monthlyCommits: 0,
    totalCommits: 0,
    codeSize: 0,
    linesOfCode: 0,
    activeContributors: 0,
    newContributors: 0,
    issueResponseTime: 0,
    prMergeTime: 0,
    communityProfile: {
      hasReadme: false,
      hasLicense: false,
      hasContributing: false,
      hasCodeOfConduct: false,
      hasIssueTemplates: false,
      healthPercentage: 0
    },
    dependencies: {
      total: 0,
      outdated: 0,
      vulnerable: 0
    },
    testCoverage: 0,
    ciStatus: 'unknown',
    codeQuality: {
      score: 0,
      maintainability: 0,
      reliability: 0,
      security: 0,
      issues: []
    },
    latestRelease: {
      version: '0.0.0',
      date: new Date().toISOString(),
      stable: false
    },
    releaseFrequency: 0,
    downloads: {
      total: 0,
      monthly: 0,
      trend: 0
    },
    platformSpecific: {}
  };
};

// Utility functions
const processLanguageDistribution = (repoData: { language?: string }): LanguageDistribution => {
  const languages: LanguageDistribution = {};
  if (repoData.language) {
    languages[repoData.language] = 100;
  }
  return languages;
};

interface RawCommitActivity {
  week: number;
  total: number;
  days: number[];
}

type WeeklyActivity = Array<{ date: string; commits: number }>;

type MonthlyCommits = { [key: string]: number };

const calculateMonthlyCommitsFromActivity = (activity: WeeklyActivity): MonthlyCommits => {
  const monthlyData: MonthlyCommits = {};
  
  activity.forEach((week) => {
    const date = new Date(week.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyData[monthKey] = (monthlyData[monthKey] || 0) + week.commits;
  });
  
  return monthlyData;
};

const calculateCommitFrequency = (commits: Array<{ date: string; commits?: number }>): number => {
  if (commits.length === 0) return 0;
  
  const dates = commits.map(c => new Date(c.date).getTime());
  const oldest = Math.min(...dates);
  const newest = Math.max(...dates);
  const days = (newest - oldest) / (1000 * 60 * 60 * 24) || 1;
  
  const totalCommits = commits.reduce((sum, c) => sum + (c.commits || 1), 0);
  return totalCommits / days;
};

// Helper functions for calculating metrics
const calculateIssueResponseTime = (issues: any[]): number => {
  if (!Array.isArray(issues)) return 0;
  
  const responseTimes = issues
    .filter(issue => issue.comments > 0)
    .map(issue => {
      const created = new Date(issue.created_at);
      const firstResponse = new Date(issue.updated_at);
      return (firstResponse.getTime() - created.getTime()) / (1000 * 60 * 60);
    });
  
  return responseTimes.length ? 
    Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length) : 
    0;
};

const calculatePRMergeTime = (prs: any[]): number => {
  if (!Array.isArray(prs)) return 0;
  
  const mergeTimes = prs
    .filter(pr => pr.merged_at)
    .map(pr => {
      const created = new Date(pr.created_at);
      const merged = new Date(pr.merged_at);
      return (merged.getTime() - created.getTime()) / (1000 * 60 * 60);
    });
  
  return mergeTimes.length ? 
    Math.round(mergeTimes.reduce((sum, time) => sum + time, 0) / mergeTimes.length) : 
    0;
};

// Removed unused function

// Remove the unused function since it's not being used in any of the analytics functions

// Analytics functions
const fetchCodebergAnalytics = async (url: string): Promise<ProjectAnalytics> => {
  try {
    const repoPath = url.split('codeberg.org/')[1];
    const apiUrl = `${CODEBERG_API_BASE}/${repoPath}`;
    
    const [repoResponse, commitsResponse, contributorsResponse] = await Promise.all([
      fetch(apiUrl),
      fetch(`${apiUrl}/commits`),
      fetch(`${apiUrl}/contributors`)
    ]);
    
    if (!repoResponse.ok) {
      throw new Error('Failed to fetch Codeberg repository data');
    }
    
    const repoData = await repoResponse.json();
    const commits = commitsResponse.ok ? await commitsResponse.json() : [];
    const contributors = contributorsResponse.ok ? await contributorsResponse.json() : [];
    
    const weeklyActivity = Array.from({ length: 12 }, (_, i) => ({
      date: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString(),
      commits: 0
    })).reverse();
    
    const monthlyData = calculateMonthlyCommitsFromActivity(weeklyActivity);
    const monthlyCommits = Object.values(monthlyData).slice(-12).reduce((sum: number, count: unknown) => sum + (count as number), 0);
    
    return {
      stars: repoData.stars_count || 0,
      forks: repoData.forks_count || 0,
      issues: repoData.open_issues_count || 0,
      pullRequests: repoData.pull_requests_count || 0,
      contributors: contributors.length,
      lastCommit: repoData.updated_at || new Date().toISOString(),
      commitFrequency: calculateCommitFrequency(weeklyActivity),
      weeklyActivity,
      languageDistribution: processLanguageDistribution(repoData),
      topContributors: contributors.map((c: any) => ({
        name: c.name || 'Anonymous',
        contributions: c.contributions || 0
      })),
      monthlyCommits,
      totalCommits: commits.length,
      codeSize: repoData.size || 0,
      linesOfCode: repoData.size ? Math.floor(repoData.size / 100) : 0,
      activeContributors: contributors.filter((c: any) => c.contributions > 0).length,
      newContributors: contributors.filter((c: any) => c.contributions === 1).length,
      issueResponseTime: 0,
      prMergeTime: 0,
      communityProfile: {
        hasReadme: repoData.has_readme || false,
        hasLicense: repoData.license !== null,
        hasContributing: repoData.has_contributing || false,
        hasCodeOfConduct: repoData.has_code_of_conduct || false,
        hasIssueTemplates: repoData.has_issue_templates || false,
        healthPercentage: 0
      },
      dependencies: {
        total: 0,
        outdated: 0,
        vulnerable: 0
      },
      testCoverage: 0,
      ciStatus: 'unknown',
      codeQuality: {
        score: 0,
        maintainability: 0,
        reliability: 0,
        security: 0,
        issues: []
      },
      latestRelease: {
        version: '0.0.0',
        date: new Date().toISOString(),
        stable: false
      },
      releaseFrequency: 0,
      downloads: {
        total: 0,
        monthly: 0,
        trend: 0
      },
      platformSpecific: {}
    };
  } catch (error) {
    console.error('Error fetching Codeberg analytics:', error);
    return createFallbackData({ url } as Partial<Project>);
  }
};


// GitHub API Types


const normalizeWeeklyActivity = (rawActivity: RawCommitActivity[]): WeeklyActivity => {
  return rawActivity.map(week => ({
    date: new Date(week.week * 1000).toISOString().split('T')[0],
    commits: week.total
  })).reverse();
};

const calculateTotalCommits = (weeklyActivity: Array<{ commits: number }>): number => {
  return weeklyActivity.reduce((sum, week) => sum + (week.commits || 0), 0);
};

// Extract username and repo from GitHub URL
const extractGitHubInfo = (url: string): { owner: string; repo: string } | null => {
  try {
    // Handle both HTTPS and SSH URLs
    let match;
    if (url.includes('github.com')) {
      // Handle HTTPS URLs
      match = url.match(/github\.com[:/]([^/]+)\/([^/]+?)(?:\.git)?(?:\/|$)/);
    } else if (url.startsWith('git@')) {
      // Handle SSH URLs
      match = url.match(/git@github\.com[:/]([^/]+)\/([^/]+?)(?:\.git)?(?:\/|$)/);
    }
    
    if (!match) {
      console.error('URL did not match expected GitHub format:', url);
      return null;
    }
    
    const [, owner, repo] = match;
    if (!owner || !repo) {
      console.error('Could not extract owner or repo from URL:', url);
      return null;
    }
    
    // Clean up the repo name
    const cleanRepo = repo.replace(/\.git$/, '');
    
    console.log('Extracted repository info:', { owner, repo: cleanRepo });
    return { owner, repo: cleanRepo };
  } catch (error) {
    console.error('Error parsing GitHub URL:', error);
    return null;
  }
};

// Main export function to get project analytics
export const getProjectAnalytics = async (project: Project): Promise<ProjectAnalytics> => {
  console.log('Starting analytics fetch for project:', project);
  
  if (!project.url) {
    console.error('Project URL is missing');
    return createFallbackData(project);
  }

  try {
    let analyticsData: ProjectAnalytics;

    // Add retry logic for failed fetches
    const fetchWithRetry = async (fetchFn: () => Promise<ProjectAnalytics>): Promise<ProjectAnalytics> => {
      const maxRetries = 3;
      let lastError;

      for (let i = 0; i < maxRetries; i++) {
        try {
          const data = await fetchFn();
          // Validate essential data
          if (data && typeof data.stars !== 'undefined' && Array.isArray(data.weeklyActivity)) {
            return data;
          }
          throw new Error('Invalid analytics data structure');
        } catch (error) {
          lastError = error;
          if (i < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          }
        }
      }
      throw lastError;
    };

    if (project.url.includes('github.com')) {
      console.log('Detected GitHub repository');
      analyticsData = await fetchWithRetry(() => fetchGitHubAnalytics(project.url));
    } else if (project.url.includes('gitlab.com')) {
      console.log('Detected GitLab repository');
      analyticsData = await fetchWithRetry(() => fetchGitLabAnalytics(project.url));
    } else if (project.url.includes('sourceforge.net')) {
      console.log('Detected SourceForge repository');
      analyticsData = await fetchWithRetry(() => fetchSourceForgeAnalytics(project.url));
    } else if (project.url.includes('npmjs.com')) {
      console.log('Detected NPM repository');
      analyticsData = await fetchWithRetry(() => fetchNPMAnalytics(project.url));
    } else if (project.url.includes('codeberg.org')) {
      console.log('Detected Codeberg repository');
      analyticsData = await fetchWithRetry(() => fetchCodebergAnalytics(project.url));
    } else {
      console.error('Unsupported repository platform:', project.url);
      return createFallbackData(project);
    }

    // Validate and sanitize analytics data
    const sanitizedData = {
      ...analyticsData,
      stars: analyticsData.stars ?? null,
      forks: analyticsData.forks ?? null,
      issues: analyticsData.issues || 0,
      pullRequests: analyticsData.pullRequests || 0,
      contributors: analyticsData.contributors || 0,
      weeklyActivity: Array.isArray(analyticsData.weeklyActivity) 
        ? analyticsData.weeklyActivity 
        : createFallbackData(project).weeklyActivity
    };

    return sanitizedData;
  } catch (error) {
    console.error('Error in getProjectAnalytics:', error);
    return createFallbackData(project);
  }
};

// Update fetchGitHubAnalytics to use new helpers
export const fetchGitHubAnalytics = async (url: string): Promise<ProjectAnalytics> => {
  console.log('Starting GitHub analytics fetch for:', url);
  
  const repoInfo = extractGitHubInfo(url);
  if (!repoInfo) {
    console.error('Invalid GitHub URL format:', url);
    return createFallbackData({ url, name: '', description: '', language: '', tags: [] });
  }

  console.log('Extracted GitHub info:', repoInfo);

  const baseUrl = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}`;
  console.log('Using base URL:', baseUrl);

  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    ...(import.meta.env.VITE_GITHUB_TOKEN ? {
      'Authorization': `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`
    } : {})
  };

  try {
    // Fetch repository data and commit activity in parallel
    console.log('Fetching repository data and commit activity...');
    const [repoResponse, activityResponse] = await Promise.all([
      fetch(baseUrl, { headers }),
      fetch(`${baseUrl}/stats/commit_activity`, { headers })
    ]);

    if (!repoResponse.ok) {
      throw new Error(`GitHub API request failed: ${repoResponse.status} ${repoResponse.statusText}`);
    }

    const repoData = await repoResponse.json();
    console.log('Repository data:', repoData);

    // Process commit activity
    let weeklyActivity: Array<{ date: string; commits: number }> = [];
    if (activityResponse.ok) {
      const rawActivity = await activityResponse.json();
      if (Array.isArray(rawActivity)) {
        weeklyActivity = normalizeWeeklyActivity(rawActivity);
        console.log('Weekly activity data:', weeklyActivity);
      }
    }

    // If no weekly activity data, try fetching commits directly
    if (weeklyActivity.length === 0) {
      console.log('No commit activity data, fetching recent commits...');
      const commitsResponse = await fetch(`${baseUrl}/commits?per_page=100`, { headers });
      if (commitsResponse.ok) {
        const commits = await commitsResponse.json();
        if (Array.isArray(commits)) {
          weeklyActivity = processCommitsIntoWeeklyActivity(commits);
          console.log('Processed commits into weekly activity:', weeklyActivity);
        }
      }
    }

    // Fetch additional data in parallel
    const [contributors, languages, issues, pulls] = await Promise.all([
      fetch(`${baseUrl}/contributors?per_page=100`, { headers })
        .then(res => res.ok ? res.json() : [])
        .catch(() => []),
      fetch(`${baseUrl}/languages`, { headers })
        .then(res => res.ok ? res.json() : {})
        .catch(() => ({})),
      fetch(`${baseUrl}/issues?state=all&per_page=100`, { headers })
        .then(res => res.ok ? res.json() : [])
        .catch(() => []),
      fetch(`${baseUrl}/pulls?state=all&per_page=100`, { headers })
        .then(res => res.ok ? res.json() : [])
        .catch(() => [])
    ]);

    // Calculate total bytes for language distribution
    const totalBytes = Object.values(languages).reduce((sum: number, bytes: any) => sum + bytes, 0);
    const languageDistribution = Object.entries(languages).reduce((acc: {[key: string]: number}, [lang, bytes]) => {
      acc[lang] = Math.round((Number(bytes) / totalBytes) * 100);
      return acc;
    }, {});

    const totalCommits = calculateTotalCommits(weeklyActivity);
    const monthlyData = calculateMonthlyCommitsFromActivity(weeklyActivity);
    const monthlyCommits = Object.values(monthlyData).reduce((sum: number, count: number) => sum + count, 0);

    return {
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      issues: repoData.open_issues_count,
      pullRequests: pulls.length,
      contributors: contributors.length,
      lastCommit: repoData.updated_at,
      commitFrequency: calculateCommitFrequency(weeklyActivity),
      weeklyActivity,
      languageDistribution,
      topContributors: contributors.slice(0, 10).map((c: any) => ({
        name: c.login || 'Anonymous',
        contributions: c.contributions || 0
      })),
      monthlyCommits,
      totalCommits,
      codeSize: repoData.size || 0,
      linesOfCode: repoData.size ? Math.floor(repoData.size / 100) : 0,
      activeContributors: contributors.filter((c: any) => c.contributions > 0).length,
      newContributors: contributors.filter((c: any) => c.contributions === 1).length,
      issueResponseTime: calculateIssueResponseTime(issues),
      prMergeTime: calculatePRMergeTime(pulls),
      communityProfile: {
        hasReadme: Boolean(repoData.has_readme),
        hasLicense: Boolean(repoData.license),
        hasContributing: false,
        hasCodeOfConduct: false,
        hasIssueTemplates: false,
        healthPercentage: 0
      },
      dependencies: {
        total: 0,
        outdated: 0,
        vulnerable: 0
      },
      testCoverage: 0,
      ciStatus: 'unknown',
      codeQuality: {
        score: 0,
        maintainability: 0,
        reliability: 0,
        security: 0,
        issues: []
      },
      latestRelease: {
        version: '0.0.0',
        date: new Date().toISOString(),
        stable: false
      },
      releaseFrequency: 0,
      downloads: {
        total: 0,
        monthly: 0,
        trend: 0
      },
      platformSpecific: {
        visibility: repoData.private ? 'private' : 'public',
        defaultBranch: repoData.default_branch,
        topics: repoData.topics || [],
        githubUrl: url,
        hasWiki: Boolean(repoData.has_wiki),
        hasPages: Boolean(repoData.has_pages),
        created: repoData.created_at || new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error in fetchGitHubAnalytics:', error);
    return createFallbackData({ 
      url, 
      name: repoInfo?.repo || '',
      description: 'Error fetching data',
      language: 'unknown',
      tags: []
    });
  }
};

// Extract username and repo from GitLab URL
const extractGitLabInfo = (url: string): { owner: string; repo: string } | null => {
  try {
    const urlObj = new URL(url);
    // Handle both gitlab.com/owner/repo and gitlab.com/api/v4/projects paths
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    
    if (pathParts.includes('api')) {
      // Handle API URL format
      const searchParams = new URLSearchParams(urlObj.search);
      const search = searchParams.get('search');
      if (search) {
        return { owner: 'search', repo: search };
      }
      return null;
    } else {
      // Handle regular gitlab.com/owner/repo format
      return pathParts.length >= 2 ? { owner: pathParts[0], repo: pathParts[1] } : null;
    }
  } catch (error) {
    console.error('Error parsing GitLab URL:', error);
    return null;
  }
};

export const fetchGitLabAnalytics = async (url: string): Promise<ProjectAnalytics> => {
  const repoInfo = extractGitLabInfo(url);
  if (!repoInfo) {
    console.error('Invalid GitLab URL:', url);
    return createFallbackData({ url, name: '', description: '', language: '', tags: [] });
  }

  try {
    console.log('Processing GitLab request for:', repoInfo);
    const headers = {
      'Accept': 'application/json',
      'PRIVATE-TOKEN': import.meta.env.VITE_GITLAB_TOKEN || ''
    };

    // Handle search queries differently from specific repos
    const baseUrl = repoInfo.owner === 'search' 
      ? `https://gitlab.com/api/v4/projects?${new URLSearchParams({
          search: repoInfo.repo,
          order_by: 'stars_count',
          sort: 'desc',
          per_page: '100'
        }).toString()}`
      : `https://gitlab.com/api/v4/projects/${encodeURIComponent(`${repoInfo.owner}/${repoInfo.repo}`)}`;
    
    console.log('Using base URL for GitLab:', baseUrl);

    // Fetch basic repository info
    const repoResponse = await fetch(baseUrl, { headers });
    if (!repoResponse.ok) {
      console.error('GitLab repo fetch failed:', repoResponse.status);
      return createFallbackData({ 
        url, 
        name: repoInfo.repo,
        description: 'Error fetching data',
        language: 'unknown',
        tags: []
      });
    }
    
    let repoData;
    if (repoInfo.owner === 'search') {
      // For search queries, get the first result
      const searchResults = await repoResponse.json();
      if (!Array.isArray(searchResults) || searchResults.length === 0) {
        console.error('No GitLab projects found for search:', repoInfo.repo);
        return createFallbackData({ 
          url, 
          name: repoInfo.repo,
          description: 'No projects found',
          language: 'unknown',
          tags: []
        });
      }
      repoData = searchResults[0];
      // Update URL to point to the found project
      url = repoData.web_url;
    } else {
      repoData = await repoResponse.json();
    }
    
    console.log('GitLab repo data:', repoData);

    // Fetch all required data in parallel
    const [
      commitsResponse,
      languagesResponse,
      contributorsResponse,
      mergeRequestsResponse,
      issuesResponse,
      statisticsResponse
    ] = await Promise.all([
      fetch(`${baseUrl}/repository/commits?per_page=100`, { headers }),
      fetch(`${baseUrl}/languages`, { headers }),
      fetch(`${baseUrl}/repository/contributors?per_page=100`, { headers }),
      fetch(`${baseUrl}/merge_requests?state=all&per_page=100`, { headers }),
      fetch(`${baseUrl}/issues?state=all&per_page=100`, { headers }),
      fetch(`${baseUrl}/statistics`, { headers })
    ]);

    const commits = commitsResponse.ok ? await commitsResponse.json() : [];
    const languages = languagesResponse.ok ? await languagesResponse.json() : {};
    const contributors = contributorsResponse.ok ? await contributorsResponse.json() : [];
    const mergeRequests = mergeRequestsResponse.ok ? await mergeRequestsResponse.json() : [];
    const issues = issuesResponse.ok ? await issuesResponse.json() : [];
    const statistics = statisticsResponse.ok ? await statisticsResponse.json() : {};

    console.log('GitLab data fetched:', {
      commits: commits.length,
      languages: Object.keys(languages).length,
      contributors: contributors.length,
      mergeRequests: mergeRequests.length,
      issues: issues.length,
      statistics
    });

    // Process weekly activity
    const now = Date.now();
    const weeklyActivity = Array.from({ length: 12 }, (_, i) => ({
      date: new Date(now - i * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      commits: 0
    })).reverse();

    // Fill commit data
    if (Array.isArray(commits)) {
      commits.forEach((commit: any) => {
        const commitDate = new Date(commit.created_at);
        const weekIndex = weeklyActivity.findIndex(week => {
          const weekDate = new Date(week.date);
          return commitDate >= weekDate && commitDate < new Date(weekDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        });
        if (weekIndex !== -1) {
          weeklyActivity[weekIndex].commits++;
        }
      });
    }

    // Calculate language distribution
    const totalBytes = Object.values(languages).reduce((sum: number, bytes: any) => sum + bytes, 0);
    const languageDistribution = Object.entries(languages).reduce((acc: {[key: string]: number}, [lang, bytes]) => {
      acc[lang] = Math.round((Number(bytes) / totalBytes) * 100);
      return acc;
    }, {});

    // Calculate monthly commits
    const monthlyData = calculateMonthlyCommitsFromActivity(weeklyActivity);
    const monthlyCommits = Object.values(monthlyData).reduce((sum: number, count: number) => sum + count, 0);

    // Process contributors
    const topContributors = Array.isArray(contributors) 
      ? contributors
          .sort((a: any, b: any) => b.commits - a.commits)
          .slice(0, 10)
          .map((c: any) => ({
            name: c.name || 'Anonymous',
            contributions: c.commits || 0
          }))
      : [];

    return {
      stars: repoData.star_count || 0,
      forks: repoData.forks_count || 0,
      issues: Array.isArray(issues) ? issues.length : (repoData.open_issues_count || 0),
      pullRequests: Array.isArray(mergeRequests) ? mergeRequests.length : (repoData.merge_requests_count || 0),
      contributors: Array.isArray(contributors) ? contributors.length : (statistics.contributor_count || 0),
      lastCommit: commits[0]?.created_at || new Date().toISOString(),
      commitFrequency: calculateCommitFrequency(weeklyActivity),
      weeklyActivity,
      languageDistribution,
      topContributors,
      monthlyCommits,
      totalCommits: Array.isArray(commits) ? commits.length : (statistics.commit_count || 0),
      codeSize: statistics.repository_size || 0,
      linesOfCode: 0,
      activeContributors: Array.isArray(contributors) ? contributors.filter((c: any) => c.commits > 0).length : 0,
      newContributors: Array.isArray(contributors) ? contributors.filter((c: any) => c.commits === 1).length : 0,
      issueResponseTime: 0,
      prMergeTime: 0,
      communityProfile: {
        hasReadme: repoData.readme_url !== null,
        hasLicense: repoData.license !== null,
        hasContributing: false,
        hasCodeOfConduct: false,
        hasIssueTemplates: false,
        healthPercentage: 0
      },
      dependencies: {
        total: 0,
        outdated: 0,
        vulnerable: 0
      },
      testCoverage: 0,
      ciStatus: repoData.ci_default_git_depth ? 'passing' : 'unknown',
      codeQuality: {
        score: 0,
        maintainability: 0,
        reliability: 0,
        security: 0
      },
      latestRelease: {
        version: repoData.tag_list?.[0] || '0.0.0',
        date: repoData.last_activity_at || new Date().toISOString(),
        stable: true
      },
      releaseFrequency: 0,
      downloads: {
        total: 0,
        monthly: 0,
        trend: 0
      },
      platformSpecific: {
        visibility: repoData.visibility,
        defaultBranch: repoData.default_branch,
        created: repoData.created_at || new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error fetching GitLab analytics:', error);
    return createFallbackData({ 
      url, 
      name: repoInfo.repo,
      description: 'Error fetching data',
      language: 'unknown',
      tags: []
    });
  }
};

export const getProjectHealth = (analytics: ProjectAnalytics): number => {
  let score = 0;
  const weights = {
    activity: 0.3,
    community: 0.3,
    codeQuality: 0.2,
    maintenance: 0.2
  };

  // Activity score (30%)
  const activityScore = (() => {
    let aScore = 0;
    if (analytics.commitFrequency > 0) aScore += 25;
    if (analytics.totalCommits > 100) aScore += 25;
    if (analytics.weeklyActivity?.some(w => w.commits > 0)) aScore += 25;
    if (analytics.monthlyCommits > 0) aScore += 25;
    return aScore;
  })();

  // Community health score (30%)
  const communityScore = (() => {
    let cScore = 0;
    if (analytics.stars) cScore += analytics.stars > 100 ? 25 : (analytics.stars / 4);
    if (analytics.forks) cScore += analytics.forks > 50 ? 25 : (analytics.forks / 2);
    if (analytics.contributors > 3) cScore += 25;
    if (analytics.communityProfile?.healthPercentage) {
      cScore += analytics.communityProfile.healthPercentage / 4;
    }
    return Math.min(100, cScore);
  })();

  // Code quality score (20%)
  const qualityScore = (() => {
    let qScore = 0;
    if (analytics.codeQuality?.score) qScore += analytics.codeQuality.score;
    if (analytics.testCoverage) qScore += analytics.testCoverage;
    if (analytics.ciStatus === 'passing') qScore += 34;
    if (analytics.communityProfile?.hasReadme) qScore += 33;
    return qScore;
  })();

  // Maintenance score (20%)
  const maintenanceScore = (() => {
    let mScore = 0;
    const now = new Date();
    const lastCommitDate = new Date(analytics.lastCommit);
    const daysSinceLastCommit = (now.getTime() - lastCommitDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceLastCommit < 30) mScore += 40;
    else if (daysSinceLastCommit < 90) mScore += 20;
    
    if (analytics.issueResponseTime && analytics.issueResponseTime < 48) mScore += 30;
    if (analytics.prMergeTime && analytics.prMergeTime < 72) mScore += 30;
    
    return mScore;
  })();

  score = (
    activityScore * weights.activity +
    communityScore * weights.community +
    qualityScore * weights.codeQuality +
    maintenanceScore * weights.maintenance
  );

  return Math.round(Math.min(100, Math.max(0, score)));
};

export const getProjectTrends = (analytics: ProjectAnalytics): { trend: 'up' | 'down' | 'stable'; confidence: number } => {
  const weeklyActivity = analytics.weeklyActivity || [];
  if (weeklyActivity.length < 2) {
    return { trend: 'stable', confidence: 0 };
  }

  // Calculate average commits for recent weeks vs older weeks
  const midPoint = Math.floor(weeklyActivity.length / 2);
  const recentWeeks = weeklyActivity.slice(midPoint);
  const olderWeeks = weeklyActivity.slice(0, midPoint);
  
  const recentAvg = recentWeeks.reduce((sum, week) => sum + week.commits, 0) / recentWeeks.length;
  const olderAvg = olderWeeks.reduce((sum, week) => sum + week.commits, 0) / olderWeeks.length;

  // Calculate trend confidence based on data consistency
  const stdDev = (weeks: typeof weeklyActivity) => {
    const mean = weeks.reduce((sum, w) => sum + w.commits, 0) / weeks.length;
    const squaredDiffs = weeks.map(w => Math.pow(w.commits - mean, 2));
    const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / weeks.length;
    return Math.sqrt(variance);
  };
  
  const recentStdDev = stdDev(recentWeeks);
  const olderStdDev = stdDev(olderWeeks);
  
  // Higher confidence if standard deviations are low (consistent data)
  const maxStdDev = Math.max(recentStdDev, olderStdDev);
  const meanCommits = (recentAvg + olderAvg) / 2;
  const confidence = maxStdDev === 0 ? 1 : Math.min(1, Math.max(0, 1 - (maxStdDev / (meanCommits + 1))));

  // Determine trend direction with a 10% threshold
  const changePct = ((recentAvg - olderAvg) / (olderAvg || 1)) * 100;
  let trend: 'up' | 'down' | 'stable';
  
  if (changePct > 10) {
    trend = 'up';
  } else if (changePct < -10) {
    trend = 'down';
  } else {
    trend = 'stable';
  }

  return { trend, confidence };
};
function processCommitsIntoWeeklyActivity(commits: any[]): { date: string; commits: number; }[] {
  const now = Date.now();
  const weeklyData = new Map<string, number>();
  
  // Initialize the last 12 weeks with zero commits
  for (let i = 0; i < 12; i++) {
    const date = new Date(now - i * 7 * 24 * 60 * 60 * 1000);
    const weekKey = date.toISOString().split('T')[0];
    weeklyData.set(weekKey, 0);
  }
  
  // Count commits per week
  commits.forEach(commit => {
    const commitDate = new Date(commit.commit?.committer?.date || commit.created_at);
    const weekKey = commitDate.toISOString().split('T')[0];
    if (weeklyData.has(weekKey)) {
      weeklyData.set(weekKey, (weeklyData.get(weekKey) || 0) + 1);
    }
  });
  
  // Convert to array and sort by date
  return Array.from(weeklyData.entries())
    .map(([date, count]) => ({ date, commits: count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function fetchSourceForgeAnalytics(url: string): Promise<ProjectAnalytics> {
  console.log('SourceForge analytics not yet implemented for:', url);
  return Promise.resolve(createFallbackData({ url }));
}

function fetchNPMAnalytics(url: string): Promise<ProjectAnalytics> {
  console.log('Attempting to fetch NPM analytics for:', url);
  return Promise.resolve(createFallbackData({ url }));
}

