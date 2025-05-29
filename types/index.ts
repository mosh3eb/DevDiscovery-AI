// User preferences and search types
export interface UserPreferences {
  languages: string;
  topics: string;
  characteristics?: string[];
  usePublicSources?: boolean;
  useWebSearch?: boolean;
}

export interface SearchParams {
  languages: string;
  topics: string;
  characteristics?: string[];
}

export interface CharacteristicOption {
  id: string;
  label: string;
}

// Project types
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

// Analytics types
export interface ProjectAnalytics {
  stars: number | null;
  forks: number | null;
  issues: number;
  pullRequests: number;
  contributors: number;
  lastCommit: string;
  commitFrequency: number;
  weeklyActivity: Array<WeeklyActivity>;
  monthlyCommits?: number;
  totalCommits?: number;
  languageDistribution: LanguageDistribution;
  codeSize?: number;
  linesOfCode?: number;
  topContributors: Array<TopContributor>;
  activeContributors?: number;
  newContributors?: number;
  issueResponseTime?: number;
  prMergeTime?: number;
  communityProfile?: CommunityProfile;
  dependencies?: Dependencies;
  testCoverage?: number;
  ciStatus?: 'passing' | 'failing' | 'unknown';
  codeQuality?: CodeQuality;
  latestRelease?: Release;
  releaseFrequency?: number;
  downloads?: Downloads;
  platformSpecific?: {
    [key: string]: any;
  };
}

export interface WeeklyActivity {
  date: string;
  commits: number;
}

export interface MonthlyCommits {
  [key: number]: number;
}

export interface TopContributor {
  name: string;
  contributions: number;
}

export interface LanguageDistribution {
  [key: string]: number;
}

export interface CommitActivity {
  week: number;
  total: number;
}

export interface CommunityProfile {
  hasReadme: boolean;
  hasLicense: boolean;
  hasContributing: boolean;
  hasCodeOfConduct: boolean;
  hasIssueTemplates?: boolean;
  healthPercentage: number;
}

export interface Dependencies {
  total: number;
  outdated: number;
  vulnerable: number;
}

export interface CodeQuality {
  score: number;
  maintainability: number;
  reliability: number;
  security: number;
  issues?: any[];
}

export interface Release {
  version: string;
  date: string;
  stable: boolean;
}

export interface Downloads {
  total: number;
  monthly: number;
  trend: number;
}

export interface ApiResponse {
  language?: string;
  [key: string]: any;
} 