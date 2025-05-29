import React, { useState, useEffect } from 'react';
import { Project } from '../services/types';
import { getProjectAnalytics } from '../services/projectAnalyticsService';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';

interface ProjectTimelineProps {
  project: Project;
  onClose: () => void;
}

interface AnalyticsState {
  data: any | null;
  loading: boolean;
  error: string | null;
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ project, onClose }) => {
  const [analytics, setAnalytics] = useState<AnalyticsState>({
    data: project.analytics || null,
    loading: !project.analytics,
    error: null
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!project.analytics) {
        try {
          setAnalytics(prev => ({ ...prev, loading: true }));
          const analyticsData = await getProjectAnalytics(project);
          setAnalytics({
            data: analyticsData,
            loading: false,
            error: null
          });
        } catch (error) {
          console.error('Error fetching analytics:', error);
          setAnalytics({
            data: null,
            loading: false,
            error: 'Failed to load project analytics'
          });
        }
      }
    };

    fetchAnalytics();
  }, [project]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'creation': return '🎉';
      case 'release': return '🚀';
      case 'community': return '👥';
      case 'update': return '✨';
      default: return '📌';
    }
  };

  if (analytics.loading) {
    return (
      <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-2xl p-8">
          <LoadingSpinner
            message="Loading project data..."
            subMessage="Loading project data in parallel..."
            progress={0}
            tasks={[]}
          />
        </div>
      </div>
    );
  }

  if (analytics.error) {
    return (
      <ErrorDisplay
        error={analytics.error}
        retryCount={0}
        onRetry={() => {}}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{project.url.includes('github.com') ? '🐙' : '🦊'}</span>
            <h2 className="text-xl font-semibold text-sky-300">Project Timeline</h2>
          </div>
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
          <div className="space-y-6">
            {/* Project Overview */}
            <div className="bg-slate-700/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-sky-300 mb-3">{project.name}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-sm text-slate-400 mb-1">Created</div>
                  <div className="text-lg font-medium text-slate-200">
                    {analytics.data?.platformSpecific?.createdAt || 'N/A'}
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-sm text-slate-400 mb-1">Last Updated</div>
                  <div className="text-lg font-medium text-slate-200">
                    {analytics.data?.lastCommit
                      ? new Date(analytics.data.lastCommit).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'numeric',
                          year: 'numeric'
                        })
                      : 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Metrics */}
            <div className="bg-slate-700/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-sky-300 mb-3">Activity Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-sm text-slate-400 mb-1">Total Commits</div>
                  <div className="text-lg font-medium text-slate-200">
                    {analytics.data?.totalCommits?.toLocaleString() || '0'}
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-sm text-slate-400 mb-1">Contributors</div>
                  <div className="text-lg font-medium text-slate-200">
                    {analytics.data?.contributors?.toLocaleString() || '0'}
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-sm text-slate-400 mb-1">Issues</div>
                  <div className="text-lg font-medium text-slate-200">
                    {analytics.data?.issues?.toLocaleString() || '0'}
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-sm text-slate-400 mb-1">Pull Requests</div>
                  <div className="text-lg font-medium text-slate-200">
                    {analytics.data?.pullRequests?.toLocaleString() || '0'}
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-slate-700/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-sky-300 mb-3">Project Timeline</h3>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-600"></div>
                <div className="space-y-6">
                  {analytics.data?.weeklyActivity?.map((week: { date: string; commits: number }, index: number) => (
                    <div key={index} className="relative pl-10">
                      <div className="absolute left-0 w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center">
                        <span className="text-lg">{getEventIcon('update')}</span>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-3">
                        <div className="text-sm text-slate-400 mb-1">
                          {new Date(week.date).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="text-base font-medium text-slate-200">
                          {week.commits} commits
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectTimeline; 