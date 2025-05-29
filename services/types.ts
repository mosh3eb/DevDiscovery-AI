export interface Project {
  name: string;
  description: string;
  url: string;
  language: string;
  tags: string[];
  stars?: number | null;
  lastUpdate?: string | null;
  forks?: number | null;
  relevanceScore?: number;
  analytics?: ProjectAnalytics;
}

export interface ProjectAnalytics {
  stars: number | null;
  forks: number | null;
  issues: number;
  pullRequests: number;
  contributors: number;
  lastCommit: string;
  commitFrequency: number;
  weeklyActivity: Array<{ date: string; commits: number }>;
  languageDistribution: LanguageDistribution;
  topContributors: Array<{ name: string; contributions: number }>;
  monthlyCommits: number;
  totalCommits: number;
  codeSize: number;
  linesOfCode: number;
  activeContributors: number;
  newContributors: number;
  issueResponseTime: number;
  prMergeTime: number;
  communityProfile: {
    hasReadme: boolean;
    hasLicense: boolean;
    hasContributing: boolean;
    hasCodeOfConduct: boolean;
    hasIssueTemplates?: boolean;
    healthPercentage: number;
  };
  dependencies: {
    total: number;
    outdated: number;
    vulnerable: number;
  };
  testCoverage: number;
  ciStatus: 'passing' | 'failing' | 'unknown';
  codeQuality: {
    score: number;
    maintainability: number;
    reliability: number;
    security: number;
    issues?: any[];
  };
  latestRelease: {
    version: string;
    date: string;
    stable: boolean;
  };
  releaseFrequency: number;
  downloads: {
    total: number;
    monthly: number;
    trend: number;
  };
  platformSpecific: {
    visibility?: string;
    defaultBranch?: string;
    topics?: string[];
    githubUrl?: string;
    hasWiki?: boolean;
    hasPages?: boolean;
    projectType?: string;
    categories?: string[];
    packageType?: string;
    engines?: Record<string, string>;
    keywords?: string[];
    created?: string;
  };
}

export interface LanguageDistribution {
  [key: string]: number;
}

export interface MonthlyCommits {
  [key: number]: number;
}

export interface CommitActivity {
  week: number;
  total: number;
  days: number[];
  authors?: Array<{
    login: string;
    contributions: number;
  }>;
}

export interface UserPreferences {
  languages: string;
  topics: string;
  characteristics: string[];
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  notifications?: boolean;
  defaultSort?: 'relevance' | 'stars' | 'lastUpdate';
  defaultFilter?: {
    minStars: number;
    minRelevance: number;
    languages: string[];
  };
}

export interface CharacteristicOption {
  id: string;
  label: string;
  description: string;
  category: 'performance' | 'maintainability' | 'community' | 'security' | 'documentation';
}
