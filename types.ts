export interface UserPreferences {
  languages: string;
  topics: string;
  characteristics: string[];
}

export interface Project {
  name: string;
  description: string;
  platform: string;
  url: string;
  language: string;
  tags: string[];
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  closedIssues: number;
  contributors: number;
  commitsLastMonth: number;
  issuesLastMonth: number;
  pullRequestsLastMonth: number;
  owner?: string;
  downloads?: number;
  recentDownloads?: number;
  monthlyDownloads?: number;
  versionDownloads?: number;
  version?: string;
  updatedAt?: string;
  isBookmarked?: boolean;
}

export interface CharacteristicOption {
  id: string;
  label: string;
}

export interface PlatformOption {
  id: string;
  label: string;
  apiUrl?: string;
  isImplemented: boolean;
  type: 'code_hosting' | 'package_registry' | 'aggregator' | 'mobile_open_source'; 
}

export interface ProjectDiscoveryResult {
  projects: Project[];
  partialErrors: string[];
}

export interface ApiError {
  platform: string;
  message: string;
  status?: number;
}

export interface ProjectHealthScore {
  maintenanceScore: number;  // 0-100
  communityScore: number;    // 0-100
  activityScore: number;     // 0-100
  documentationScore: number; // 0-100
  overallScore: number;      // 0-100
  lastUpdated: string;
  contributorsCount: number;
  openIssuesCount: number;
  closedIssuesCount: number;
  averageResponseTime: number; // in hours
}

export interface ProjectComparison {
  project1: Project;
  project2: Project;
  commonTechnologies: string[];
  differentTechnologies: {
    project1Only: string[];
    project2Only: string[];
  };
  activityComparison: {
    project1: {
      commitsLastMonth: number;
      issuesLastMonth: number;
      pullRequestsLastMonth: number;
    };
    project2: {
      commitsLastMonth: number;
      issuesLastMonth: number;
      pullRequestsLastMonth: number;
    };
  };
  communityComparison: {
    project1: {
      stars: number;
      forks: number;
      watchers: number;
    };
    project2: {
      stars: number;
      forks: number;
      watchers: number;
    };
  };
}
