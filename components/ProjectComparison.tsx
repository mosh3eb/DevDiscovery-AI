import React, { useMemo } from 'react';
import { Project } from '../services/types';
import { getProjectAnalytics, getProjectHealth, getProjectTrends } from '../services/projectAnalyticsService';

interface ProjectComparisonProps {
  projects: Project[];
  onClose: () => void;
}

const ProjectComparison: React.FC<ProjectComparisonProps> = React.memo(({ projects, onClose }) => {
  const [analytics, setAnalytics] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const analyticsData = await Promise.all(
          projects.map(project => getProjectAnalytics(project))
        );
        setAnalytics(analyticsData);
        setError(null);
      } catch (err) {
        setError('Failed to load project analytics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [projects]);

  const healthScores = useMemo(() => 
    analytics.map(data => getProjectHealth(data))
  , [analytics]);

  const trends = useMemo(() => 
    analytics.map(data => getProjectTrends(data))
  , [analytics]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        );
      case 'down':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
          </svg>
        );
    }
  };

  const getCommonTags = (projects: Project[]): string[] => {
    if (projects.length === 0) return [];
    
    const allTags = projects.map(p => p.tags || []);
    return allTags.reduce((common, tags) => 
      common.filter(tag => tags.includes(tag))
    );
  };

  const getUniqueTags = (projects: Project[]): string[] => {
    if (projects.length === 0) return [];
    
    const allTags = new Set(projects.flatMap(p => p.tags || []));
    const commonTags = new Set(getCommonTags(projects));
    
    return Array.from(allTags).filter(tag => !commonTags.has(tag));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-6xl p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-6xl p-8">
          <div className="text-red-500 text-center">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-lg font-semibold">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-sky-300">Project Comparison</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-300 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto p-4 max-h-[calc(90vh-4rem)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <div key={project.url} className="bg-slate-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">{project.name}</h3>
                <p className="text-slate-300 text-sm mb-4">{project.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.language && (
                    <span className="bg-slate-700/50 text-slate-300 px-2 py-1 rounded text-xs">
                      {project.language}
                    </span>
                  )}
                  {(project.tags || []).map((tag, tagIndex) => (
                    <span
                      key={`${tag}-${tagIndex}`}
                      className="bg-slate-700/50 text-slate-300 px-2 py-1 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                {/* Project Health */}
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-sky-300 mb-3">Project Health</h3>
                  <div className="flex items-center gap-4">
                    <div className="relative w-24 h-24">
                      <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#2d3748"
                          strokeWidth="3"
                        />
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke={healthScores[index] >= 70 ? '#10b981' : healthScores[index] >= 40 ? '#f59e0b' : '#ef4444'}
                          strokeWidth="3"
                          strokeDasharray={`${healthScores[index]}, 100`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-slate-200">{healthScores[index]}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-800/50 rounded-lg p-3">
                          <div className="text-sm text-slate-400 mb-1">Stars</div>
                          <div className="text-lg font-medium text-slate-200">
                            {analytics[index].stars.toLocaleString()}
                          </div>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3">
                          <div className="text-sm text-slate-400 mb-1">Forks</div>
                          <div className="text-lg font-medium text-slate-200">
                            {analytics[index].forks.toLocaleString()}
                          </div>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3">
                          <div className="text-sm text-slate-400 mb-1">Contributors</div>
                          <div className="text-lg font-medium text-slate-200">
                            {analytics[index].contributors.toLocaleString()}
                          </div>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3">
                          <div className="text-sm text-slate-400 mb-1">Last Update</div>
                          <div className="text-lg font-medium text-slate-200">
                            {new Date(analytics[index].lastCommit).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity Metrics */}
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-sky-300 mb-3">Activity Metrics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <div className="text-sm text-slate-400 mb-1">Commit Frequency</div>
                      <div className="text-lg font-medium text-slate-200">
                        {analytics[index].commitFrequency.toFixed(1)} commits/day
                      </div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <div className="text-sm text-slate-400 mb-1">Open Issues</div>
                      <div className="text-lg font-medium text-slate-200">
                        {analytics[index].issues.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <div className="text-sm text-slate-400 mb-1">Pull Requests</div>
                      <div className="text-lg font-medium text-slate-200">
                        {analytics[index].pullRequests.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <div className="text-sm text-slate-400 mb-1">Activity Trend</div>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(trends[index].trend)}
                        <span className="text-lg font-medium text-slate-200">
                          {trends[index].trend.charAt(0).toUpperCase() + trends[index].trend.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weekly Activity Chart */}
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-sky-300 mb-3">Weekly Activity</h3>
                  <div className="h-48">
                    <div className="flex items-end justify-between h-full gap-1">
                      {analytics[index].weeklyActivity.map((week: { date: string; commits: number }, weekIndex: number) => (
                        <div key={weekIndex} className="flex-1 flex flex-col items-center">
                          <div
                            className="w-full bg-sky-500/50 hover:bg-sky-500/70 transition-colors rounded-t"
                            style={{
                              height: `${(week.commits / Math.max(...analytics[index].weeklyActivity.map((w: { commits: number }) => w.commits))) * 100}%`
                            }}
                          />
                          <div className="text-xs text-slate-400 mt-1">
                            {new Date(week.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Top Contributors */}
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-sky-300 mb-3">Top Contributors</h3>
                  <div className="space-y-3">
                    {analytics[index].topContributors.map((contributor: { name: string; contributions: number }, contributorIndex: number) => (
                      <div key={contributorIndex} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-slate-300 font-medium">
                            {contributor.name.charAt(0)}
                          </div>
                          <span className="text-slate-200">{contributor.name}</span>
                        </div>
                        <div className="text-slate-400">
                          {contributor.contributions.toLocaleString()} contributions
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tags Comparison */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Tags Comparison</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-slate-300 mb-2">Common Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {getCommonTags(projects).map((tag, index) => (
                    <span
                      key={`common-${tag}-${index}`}
                      className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-slate-300 mb-2">Unique Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {getUniqueTags(projects).map((tag, index) => (
                    <span
                      key={`unique-${tag}-${index}`}
                      className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ProjectComparison.displayName = 'ProjectComparison';

export default ProjectComparison; 