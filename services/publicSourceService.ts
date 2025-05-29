import { Project } from './types';
import { getProjectAnalytics } from './projectAnalyticsService';

interface SearchParams {
  languages: string;
  topics: string;
  characteristics?: string[];
}

interface SearchResult {
  projects: Project[];
  error?: string;
}

// Constants
const REQUEST_TIMEOUT = 10000; // 10 seconds
const RESULTS_PER_SOURCE = 100; // Number of results to fetch from each source

// API endpoints
const GITHUB_API_BASE = 'https://api.github.com/search/repositories';
const GITLAB_API_BASE = 'https://gitlab.com/api/v4/projects';
const NPM_API_BASE = 'https://registry.npmjs.org/-/v1/search';
const PYPI_API_BASE = 'https://pypi.org/pypi';
const SOURCEFORGE_API_BASE = 'https://sourceforge.net/rest/p';
const CODEBERG_API_BASE = 'https://codeberg.org/api/v1/repos/search';
const BITBUCKET_API_BASE = 'https://api.bitbucket.org/2.0/repositories';

// Source identifiers for analytics
const enum SourceType {
  GITHUB = 'github',
  GITLAB = 'gitlab',
  NPM = 'npm',
  PYPI = 'pypi',
  SOURCEFORGE = 'sourceforge',
  CODEBERG = 'codeberg',
  BITBUCKET = 'bitbucket',
  BLOG = 'blog'
}

interface ProjectSource {
  name: string;
  baseUrl: string;
  searchFn: (languages: string[], topics: string[], characteristics: string[]) => Promise<SearchResult>;
  enabled: boolean;
}

// Source configurations
const sources: Record<string, ProjectSource> = {
  [SourceType.GITHUB]: {
    name: 'GitHub',
    baseUrl: GITHUB_API_BASE,
    searchFn: async (langs, topics) => {
      const res = await searchGitHub(langs, topics);
      return { projects: res };
    },
    enabled: true
  },
  [SourceType.GITLAB]: {
    name: 'GitLab',
    baseUrl: GITLAB_API_BASE,
    searchFn: async (langs, topics) => {
      const res = await searchGitLab(langs, topics);
      return { projects: res };
    },
    enabled: true
  },
  [SourceType.SOURCEFORGE]: {
    name: 'SourceForge',
    baseUrl: SOURCEFORGE_API_BASE,
    searchFn: async (langs, topics) => {
      const res = await searchSourceForge(langs, topics);
      return { projects: res };
    },
    enabled: true
  },
  [SourceType.CODEBERG]: {
    name: 'Codeberg',
    baseUrl: CODEBERG_API_BASE,
    searchFn: async (langs, topics) => {
      const res = await searchCodeberg(langs, topics);
      return { projects: res };
    },
    enabled: true
  },
  [SourceType.BITBUCKET]: {
    name: 'BitBucket',
    baseUrl: BITBUCKET_API_BASE,
    searchFn: async (langs, topics) => {
      const res = await searchBitbucket(langs, topics);
      return { projects: res };
    },
    enabled: true
  },
  [SourceType.NPM]: {
    name: 'NPM',
    baseUrl: NPM_API_BASE,
    searchFn: async (langs, topics) => {
      const res = await searchNPM(langs, topics);
      return { projects: res };
    },
    enabled: true
  },
  [SourceType.PYPI]: {
    name: 'PyPI',
    baseUrl: PYPI_API_BASE,
    searchFn: async (langs, topics) => {
      const res = await searchPyPI(langs, topics);
      return { projects: res };
    },
    enabled: true
  }
};

// Helper functions
const validateSearchInput = (input: string): string[] => {
  return input
    .split(',')
    .map(term => term.trim().toLowerCase())
    .filter(term => term.length > 0 && term.length <= 100)
    .filter(term => /^[a-z0-9\-\+\#\s]+$/i.test(term));
};

// Helper function for fetch with timeout
const fetchWithTimeout = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
};

// Source-specific search functions
const searchSourceForge = async (languages: string[], topics: string[]): Promise<Project[]> => {
  try {
    const query = [
      ...languages.map(lang => `lang:${lang}`),
      ...topics
    ].join(' ');

    const response = await fetchWithTimeout(
      `${SOURCEFORGE_API_BASE}/search?q=${encodeURIComponent(query)}&limit=${RESULTS_PER_SOURCE}`
    );

    if (!response.ok) {
      throw new Error(`SourceForge API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.projects.map((item: any) => ({
      name: item.name,
      description: item.shortdesc || 'No description available',
      url: `https://sourceforge.net/projects/${item.unix_name}`,
      language: item.programming_languages?.[0] || 'Unknown',
      tags: [
        ...(item.topics || []),
        ...(item.programming_languages || []),
        'sourceforge',
        ...(item.activity_percentile > 90 ? ['actively-maintained'] : []),
        ...(item.reviews_rating >= 4 ? ['community-recommended'] : []),
        ...(item.developers.length === 1 ? ['beginner-friendly'] : []),
        ...(item.developers.length > 5 ? ['large-community'] : [])
      ],
      stars: item.reviews_rating * 20,
      lastUpdate: item.last_updated,
      forks: null,
      relevanceScore: 0
    }));
  } catch (error) {
    console.error('SourceForge search error:', error);
    return [];
  }
};

const searchCodeberg = async (languages: string[], topics: string[]): Promise<Project[]> => {
  try {
    const query = [
      ...languages.map(lang => `language:${lang}`),
      ...topics.map(topic => topic),
      'fork:false'
    ].join(' ');

    const response = await fetchWithTimeout(
      `${CODEBERG_API_BASE}?q=${encodeURIComponent(query)}&limit=${RESULTS_PER_SOURCE}`
    );

    if (!response.ok) {
      throw new Error(`Codeberg API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.map((item: any) => ({
      name: item.name,
      description: item.description || 'No description available',
      url: item.html_url,
      language: item.language || 'Unknown',
      tags: [
        ...(item.topics || []),
        item.language,
        'codeberg',
        ...(item.updated_at && new Date(item.updated_at) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) ? ['actively-maintained'] : []),
        ...(item.stars_count > 100 ? ['popular'] : []),
        ...(item.fork_count > 10 ? ['collaborative'] : [])
      ],
      stars: item.stars_count,
      lastUpdate: item.updated_at,
      forks: item.fork_count,
      relevanceScore: 0
    }));
  } catch (error) {
    console.error('Codeberg search error:', error);
    return [];
  }
};

const searchBitbucket = async (languages: string[], topics: string[]): Promise<Project[]> => {
  try {
    const query = [
      ...languages.map(lang => `language="${lang}"`),
      ...topics.map(topic => topic)
    ].join(' AND ');

    const response = await fetchWithTimeout(
      `${BITBUCKET_API_BASE}?q=${encodeURIComponent(query)}&pagelen=${RESULTS_PER_SOURCE}`
    );

    if (!response.ok) {
      throw new Error(`BitBucket API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.values.map((item: any) => ({
      name: item.name,
      description: item.description || 'No description available',
      url: item.links.html.href,
      language: item.language || 'Unknown',
      tags: [
        item.language,
        'bitbucket',
        ...(item.updated_on && new Date(item.updated_on) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) ? ['actively-maintained'] : []),
        ...(item.size > 1000000 ? ['large-project'] : []),
        ...(item.mainbranch?.type === 'branch' ? ['has-documentation'] : [])
      ],
      stars: null,
      lastUpdate: item.updated_on,
      forks: null,
      relevanceScore: 0
    }));
  } catch (error) {
    console.error('BitBucket search error:', error);
    return [];
  }
};

// Implement searchGitLab function
async function searchGitLab(languages: string[], topics: string[]): Promise<Project[]> {
  try {
    // GitLab's search API requires a simpler approach
    // We'll use a single search term and let GitLab handle the matching
    const searchTerms = [...topics, ...languages].join(' ');
    
    const queryParams = new URLSearchParams({
      search: searchTerms,
      order_by: 'stars_count',
      sort: 'desc',
      per_page: RESULTS_PER_SOURCE.toString()
    });

    const url = `${GITLAB_API_BASE}?${queryParams.toString()}`;
    console.log('GitLab API URL:', url); // Debug log

    const response = await fetchWithTimeout(url, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.warn('GitLab API rate limit exceeded.');
        return [];
      }
      console.error('GitLab API error:', {
        status: response.status,
        statusText: response.statusText,
        url: url
      });
      throw new Error(`GitLab API error: ${response.statusText} (Status: ${response.status})`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error('GitLab API response format unexpected:', data);
      return [];
    }

    // Filter results by language if specified
    const filteredData = languages.length > 0
      ? data.filter((item: any) => 
          languages.some(lang => 
            item.language?.toLowerCase() === lang.toLowerCase()
          )
        )
      : data;

    return filteredData.map((item: any) => ({
      name: item.name,
      description: item.description || 'No description available',
      url: item.web_url,
      language: item.language || 'Unknown',
      tags: [
        ...(item.topics || []),
        item.language,
        'gitlab',
        ...(item.last_activity_at && new Date(item.last_activity_at) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) ? ['actively-maintained'] : []),
        ...(item.star_count > 100 ? ['popular'] : []),
        ...(item.forks_count > 10 ? ['collaborative'] : []),
        ...(item.open_issues_count > 0 ? ['has-issues'] : []),
        ...(item.wiki_enabled ? ['has-documentation'] : [])
      ].filter(tag => tag),
      stars: item.star_count,
      lastUpdate: item.last_activity_at,
      forks: item.forks_count,
      relevanceScore: 0
    }));
  } catch (error) {
    console.error('GitLab search error:', error);
    return [];
  }
}

// Main search function
export const searchAllSources = async (params: SearchParams): Promise<Project[]> => {
  const languages = validateSearchInput(params.languages);
  const topics = validateSearchInput(params.topics);
  const characteristics = params.characteristics || [];

  if (languages.length === 0 && topics.length === 0 && characteristics.length === 0) {
    throw new Error('Please provide at least one valid programming language, topic, or characteristic to search for.');
  }

  // Get enabled sources and create search promises
  const enabledSources = Object.values(sources).filter(source => source.enabled);

  const searchPromises = enabledSources.map(source =>
    source.searchFn(languages, topics, characteristics)
      .catch(error => {
          console.error(`Error during search from ${source.name}:`, error);
          return { projects: [], error: error instanceof Error ? error.message : 'Unknown error' };
      })
  );

  const results = await Promise.allSettled(searchPromises);
  let allProjects: Project[] = [];
  const errors: string[] = [];

  results.forEach(result => {
    if (result.status === 'fulfilled' && result.value) {
      allProjects = [...allProjects, ...result.value.projects];
      if (result.value.error) {
          errors.push(`${result.value.error}`);
      }
    } else if (result.status === 'rejected') {
        errors.push(`Search promise rejected: ${result.reason}`);
    }
  });

  if (errors.length > 0) {
      console.error('Errors encountered during search:', errors);
  }

  // Remove duplicates based on URL
  const uniqueProjects = Array.from(
    new Map(allProjects.map(project => [project.url, project])).values()
  );

  // Calculate relevance scores
  const projectsWithScores = uniqueProjects.map(project => ({
    ...project,
    relevanceScore: calculateRelevanceScore(project, languages, topics)
  }));

  // Sort by relevance score
  const sortedProjects = projectsWithScores.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

  // Fetch analytics data for each project
  const projectsWithAnalytics = await Promise.all(
    sortedProjects.map(async (project) => {
      try {
        const analytics = await getProjectAnalytics(project);
        return {
          ...project,
          analytics
        };
      } catch (error) {
        console.error(`Failed to fetch analytics for ${project.url}:`, error);
        return project;
      }
    })
  );

  return projectsWithAnalytics;
};

const calculateRelevanceScore = (project: Project, languages: string[], topics: string[]): number => {
  let score = 0;

  // Language match (0-30 points)
  if (project.language && languages.includes(project.language.toLowerCase())) {
    score += 30;
  }

  // Topic matches (0-30 points)
  const projectTags = project.tags || [];
  const matchingTopics = topics.filter(topic => 
    projectTags.includes(topic.toLowerCase())
  );
  score += matchingTopics.length * 10;

  // Activity bonus (0-20 points)
  if (project.lastUpdate) {
    const monthsAgo = (Date.now() - new Date(project.lastUpdate).getTime()) / (30 * 24 * 60 * 60 * 1000);
    if (monthsAgo <= 1) score += 20;
    else if (monthsAgo <= 3) score += 15;
    else if (monthsAgo <= 6) score += 10;
    else if (monthsAgo <= 12) score += 5;
  }

  // Popularity bonus (0-20 points)
  if (project.stars) {
    if (project.stars >= 1000) score += 20;
    else if (project.stars >= 500) score += 15;
    else if (project.stars >= 100) score += 10;
    else if (project.stars >= 50) score += 5;
  }

  return Math.min(100, score);
};


async function searchGitHub(languages: string[], topics: string[]): Promise<Project[]> {
  try {
    const queryParts = [
      ...languages.map(lang => `language:${lang}`),
      ...topics.map(topic => `topic:${topic}`),
      'fork:false' // Exclude forks by default
    ];
    const query = queryParts.join(' ');

    if (!query) {
      console.warn('GitHub search called with empty query.');
      return [];
    }

    const url = `${GITHUB_API_BASE}?q=${encodeURIComponent(query)}&per_page=${RESULTS_PER_SOURCE}`;

    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      // GitHub API might return 422 for invalid queries or rate limits
      if (response.status === 422) {
         console.warn(`GitHub API returned 422 for query: ${query}. This might be due to invalid search terms or rate limiting.`);
         return [];
      }
      throw new Error(`GitHub API error: ${response.statusText} (Status: ${response.status})`);
    }

    const data = await response.json();

    if (!data || !Array.isArray(data.items)) {
        console.error('GitHub API response format unexpected:', data);
        return [];
    }

    return data.items.map((item: any) => ({
      name: item.name,
      description: item.description || 'No description available',
      url: item.html_url,
      language: item.language || 'Unknown',
      tags: [
        ...(item.topics || []),
        item.language,
        'github',
        ...(item.pushed_at && new Date(item.pushed_at) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) ? ['actively-maintained'] : []),
        ...(item.stargazers_count > 1000 ? ['popular'] : []),
        ...(item.forks_count > 100 ? ['collaborative'] : [])
      ].filter(tag => tag), // Filter out null/undefined tags
      stars: item.stargazers_count,
      lastUpdate: item.pushed_at,
      forks: item.forks_count,
      relevanceScore: 0 // Will be calculated later
    }));
  } catch (error) {
    console.error('GitHub search error:', error);
    return [];
  }
}
async function searchNPM(languages: string[], topics: string[]): Promise<Project[]> {
  try {
    // NPM search uses a single 'text' parameter for keywords, package names, etc.
    // Combine languages and topics into a single search string.
    const query = [...languages, ...topics].join(' ');

    if (!query) {
      console.warn('NPM search called with empty query.');
      return [];
    }

    // NPM search API: https://registry.npmjs.org/-/v1/search?text=...&size=...
    const url = `${NPM_API_BASE}?text=${encodeURIComponent(query)}&size=${RESULTS_PER_SOURCE}`;

    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      throw new Error(`NPM API error: ${response.statusText} (Status: ${response.status})`);
    }

    const data = await response.json();

    if (!data || !Array.isArray(data.objects)) {
        console.error('NPM API response format unexpected:', data);
        return [];
    }

    return data.objects.map((item: any) => ({
      name: item.package.name,
      description: item.package.description || 'No description available',
      url: item.package.links.npm, // Link to the NPM package page
      language: 'Unknown', // NPM API doesn't typically provide primary language
      tags: [
        ...(item.package.keywords || []),
        'npm',
        // Could potentially add tags based on score.detail (quality, popularity, maintenance)
        ...(item.score?.detail?.quality > 0.7 ? ['high-quality'] : []),
        ...(item.score?.detail?.popularity > 0.7 ? ['popular'] : []),
        ...(item.score?.detail?.maintenance > 0.7 ? ['well-maintained'] : []),
        ...(item.package.date && new Date(item.package.date) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) ? ['recently-updated'] : []),
      ].filter(tag => tag), // Filter out null/undefined tags
      stars: null, // NPM doesn't have a direct star count like GitHub
      lastUpdate: item.package.date,
      forks: null, // NPM packages don't have forks
      relevanceScore: 0 // Will be calculated later
    }));
  } catch (error) {
    console.error('NPM search error:', error);
    return [];
  }
}
async function searchPyPI(languages: string[], topics: string[]): Promise<Project[]> {
  try {
    // PyPI's primary search endpoint is HTML-based (https://pypi.org/search)
    // The PYPI_API_BASE constant points to the package details endpoint (https://pypi.org/pypi)
    // A direct JSON search API like GitHub/GitLab is not readily available for PyPI.
    // This implementation constructs a search query but cannot easily parse the HTML results
    // into the Project format. It serves as a placeholder acknowledging the API structure.

    const query = [...languages, ...topics].join(' ');

    if (!query) {
      console.warn('PyPI search called with empty query.');
      return [];
    }

    // Using the search endpoint, which returns HTML
    const searchUrl = `https://pypi.org/search?q=${encodeURIComponent(query)}`;

    // We can fetch the page, but parsing HTML to extract project data is complex
    // and brittle. For now, we'll just acknowledge the attempt and return empty.
    console.warn(`Attempting PyPI search for query "${query}" at ${searchUrl}. Note: PyPI search endpoint returns HTML, direct JSON parsing is not straightforward.`);

    // Example of fetching (response will be HTML)
    // const response = await fetchWithTimeout(searchUrl);
    // if (!response.ok) {
    //   console.warn(`PyPI search request failed: ${response.statusText}`);
    //   return [];
    // }
    // const html = await response.text();
    // // HTML parsing logic would be needed here, which is outside the scope
    // // of a simple API call implementation.

    // Returning empty array as a placeholder until proper PyPI search integration
    // (e.g., using XML-RPC or a dedicated search service) is implemented.
    return [];

  } catch (error) {
    console.error('PyPI search error:', error);
    return [];
  }
}

