// Project Analytics Service
// This service handles project metrics and analysis
// Last updated: 2024

import { Project, ProjectHealthScore, ProjectComparison } from '../types';

export const calculateProjectHealthScore = async (project: Project): Promise<ProjectHealthScore> => {
  // This would typically make API calls to GitHub/GitLab/etc.
  // For now, we'll simulate the calculation
  const maintenanceScore = calculateMaintenanceScore(project);
  const communityScore = calculateCommunityScore(project);
  const activityScore = calculateActivityScore(project);
  const documentationScore = calculateDocumentationScore(project);

  return {
    maintenanceScore,
    communityScore,
    activityScore,
    documentationScore,
    overallScore: Math.round((maintenanceScore + communityScore + activityScore + documentationScore) / 4),
    lastUpdated: new Date().toISOString(),
    contributorsCount: project.contributors || 0,
    openIssuesCount: project.openIssues || 0,
    closedIssuesCount: project.closedIssues || 0,
    averageResponseTime: calculateAverageResponseTime(project)
  };
};

export const compareProjects = async (project1: Project, project2: Project): Promise<ProjectComparison> => {
  const commonTechnologies = findCommonTechnologies(project1, project2);
  const differentTechnologies = findDifferentTechnologies(project1, project2);

  return {
    project1,
    project2,
    commonTechnologies,
    differentTechnologies,
    activityComparison: {
      project1: {
        commitsLastMonth: project1.commitsLastMonth || 0,
        issuesLastMonth: project1.issuesLastMonth || 0,
        pullRequestsLastMonth: project1.pullRequestsLastMonth || 0
      },
      project2: {
        commitsLastMonth: project2.commitsLastMonth || 0,
        issuesLastMonth: project2.issuesLastMonth || 0,
        pullRequestsLastMonth: project2.pullRequestsLastMonth || 0
      }
    },
    communityComparison: {
      project1: {
        stars: project1.stars || 0,
        forks: project1.forks || 0,
        watchers: project1.watchers || 0
      },
      project2: {
        stars: project2.stars || 0,
        forks: project2.forks || 0,
        watchers: project2.watchers || 0
      }
    }
  };
};

// Helper functions
const calculateMaintenanceScore = (project: Project): number => {
  // Calculate maintenance score based on:
  // - Issue response time (using openIssues and closedIssues)
  // - Pull request merge time (using commitsLastMonth)
  // - Code review activity (using pullRequestsLastMonth)
  const totalIssues = (project.openIssues || 0) + (project.closedIssues || 0);
  const issueRatio = totalIssues > 0 ? (project.closedIssues || 0) / totalIssues : 0;
  
  const commits = project.commitsLastMonth || 0;
  const activityScore = Math.min(commits / 50, 1); // Normalize to 0-1
  
  const prs = project.pullRequestsLastMonth || 0;
  const prActivity = Math.min(prs / 20, 1); // Normalize to 0-1
  
  return Math.round((issueRatio * 0.4 + activityScore * 0.3 + prActivity * 0.3) * 100);
};

const calculateCommunityScore = (project: Project): number => {
  // Calculate community score based on:
  // - Number of contributors
  // - Community engagement (stars, forks, watchers)
  const contributors = project.contributors || 0;
  const contributorScore = Math.min(contributors / 50, 1); // Normalize to 0-1
  
  const stars = project.stars || 0;
  const forks = project.forks || 0;
  const watchers = project.watchers || 0;
  const engagementScore = Math.min(
    (stars + forks * 2 + watchers) / 1000,
    1
  ); // Normalize to 0-1
  
  return Math.round((contributorScore * 0.6 + engagementScore * 0.4) * 100);
};

const calculateActivityScore = (project: Project): number => {
  // Calculate activity score based on:
  // - Recent commits
  // - Issue activity
  // - Pull request activity
  const commits = project.commitsLastMonth || 0;
  const commitScore = Math.min(commits / 100, 1); // Normalize to 0-1
  
  const issues = project.issuesLastMonth || 0;
  const issueScore = Math.min(issues / 50, 1); // Normalize to 0-1
  
  const prs = project.pullRequestsLastMonth || 0;
  const prScore = Math.min(prs / 30, 1); // Normalize to 0-1
  
  return Math.round((commitScore * 0.4 + issueScore * 0.3 + prScore * 0.3) * 100);
};

const calculateDocumentationScore = (project: Project): number => {
  // Calculate documentation score based on:
  // - README quality (using description length as a proxy)
  // - Code comments (using commits as a proxy)
  const descriptionLength = (project.description || '').length;
  const descriptionScore = Math.min(descriptionLength / 500, 1); // Normalize to 0-1
  
  const commits = project.commitsLastMonth || 0;
  const commitScore = Math.min(commits / 50, 1); // Normalize to 0-1
  
  return Math.round((descriptionScore * 0.6 + commitScore * 0.4) * 100);
};

const calculateAverageResponseTime = (project: Project): number => {
  // Calculate average response time based on:
  // - Issue response time (using openIssues and closedIssues ratio)
  const openIssues = project.openIssues || 0;
  const closedIssues = project.closedIssues || 0;
  const totalIssues = openIssues + closedIssues;
  
  if (totalIssues === 0) return 24; // Default to 24 hours if no issues
  
  const issueRatio = closedIssues / totalIssues;
  // Convert ratio to hours (0-48)
  return Math.round(48 * (1 - issueRatio));
};

const findCommonTechnologies = (project1: Project, project2: Project): string[] => {
  const tech1 = new Set(project1.tags || []);
  const tech2 = new Set(project2.tags || []);
  return Array.from(new Set([...tech1].filter(x => tech2.has(x))));
};

const findDifferentTechnologies = (project1: Project, project2: Project) => {
  const tech1 = new Set(project1.tags || []);
  const tech2 = new Set(project2.tags || []);
  
  return {
    project1Only: Array.from(new Set([...tech1].filter(x => !tech2.has(x)))),
    project2Only: Array.from(new Set([...tech2].filter(x => !tech1.has(x))))
  };
}; 