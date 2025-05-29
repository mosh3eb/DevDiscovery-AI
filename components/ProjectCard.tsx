import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Project } from '../services/types';
import { getProjectAnalytics } from '../services/projectAnalyticsService';
import ProjectInsights from './ProjectInsights.tsx';
import ProjectTimeline from './ProjectTimeline';

interface ProjectCardProps {
  project: Project;
  onCompare: (project: Project) => void;
  isSelected: boolean;
  comparisonCount: number;
  onBookmark: (project: Project) => void;
  isBookmarked: boolean;
}

const getProjectIcon = (url: string) => {
  if (url.includes('github.com')) return <span className="text-xl mr-2">🐙</span>;
  if (url.includes('gitlab.com')) return <span className="text-xl mr-2">🦊</span>;
  if (url.includes('codeberg.org')) return <span className="text-xl mr-2">🪧</span>;
  if (url.includes('bitbucket.org')) return <span className="text-xl mr-2">🧑‍💻</span>;
  return <span className="text-xl mr-2">🌐</span>;
};

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onCompare,
  isSelected,
  comparisonCount,
  onBookmark,
  isBookmarked
}) => {
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [analytics, setAnalytics] = useState(project.analytics);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!analytics) {
        try {
          console.log('Fetching analytics for project:', project.name);
          setIsLoading(true);
          setError(null);
          
          // Add delay before fetch to prevent race conditions with other components
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const analyticsData = await getProjectAnalytics(project);
          console.log('Received analytics data:', analyticsData);
          
          if (!analyticsData) {
            throw new Error('No analytics data received');
          }
          
          // Validate essential data
          if (typeof analyticsData.stars !== 'number' && analyticsData.stars !== null) {
            console.warn('Invalid stars value in analytics:', analyticsData.stars);
          }
          
          setAnalytics(analyticsData);
        } catch (error) {
          console.error('Error fetching analytics:', error);
          setError('Failed to load analytics');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchAnalytics();
  }, [project, analytics]);

  const visibleTags = useMemo(() => {
    return project.tags?.slice(0, 3) || [];
  }, [project.tags]);

  const handleCompare = useCallback(() => {
    onCompare(project);
  }, [onCompare, project]);

  const handleBookmark = useCallback(() => {
    onBookmark(project);
  }, [onBookmark, project]);

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col h-full shadow-lg hover:shadow-xl transition-all duration-300 w-full max-w-sm">
      <div className="p-4 flex flex-col gap-3 flex-grow">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 min-w-0">
            {getProjectIcon(project.url)}
            <h3 className="text-lg font-semibold text-white truncate" title={project.name}>
              {project.name || 'Unnamed Project'}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleBookmark}
              className={`p-1 rounded-full ${
                isBookmarked ? 'text-yellow-400' : 'text-slate-400 hover:text-yellow-400'
              }`}
              title={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
            </button>
            <button
              onClick={handleCompare}
              disabled={!isSelected && comparisonCount >= 3}
              className={`p-1 rounded-full ${
                isSelected
                  ? 'text-green-400 hover:text-red-400'
                  : comparisonCount >= 3
                  ? 'text-slate-600 cursor-not-allowed'
                  : 'text-slate-400 hover:text-green-400'
              }`}
              title={
                isSelected
                  ? 'Remove from comparison'
                  : comparisonCount >= 3
                  ? 'Maximum 3 projects can be compared'
                  : 'Add to comparison'
              }
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>
        </div>

        <p className="text-slate-300 text-sm mb-3 line-clamp-2 min-h-[2.5em]">
          {project.description || 'No description available'}
        </p>

        <div className="flex flex-wrap gap-2 mb-3">
          {project.language && (
            <span className="bg-slate-700/50 text-slate-300 px-2 py-1 rounded text-xs">
              {project.language}
            </span>
          )}
          {visibleTags.map((tag: string, index: number) => (
            <span
              key={`${tag}-${index}`}
              className="bg-slate-700/50 text-slate-300 px-2 py-1 rounded text-xs"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
          {isLoading ? (
            // Loading skeleton
            <>
              <div className="bg-slate-700/30 rounded-lg p-2 animate-pulse">
                <div className="h-4 bg-slate-600 rounded w-16 mb-2"></div>
                <div className="h-5 bg-slate-600 rounded w-12"></div>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-2 animate-pulse">
                <div className="h-4 bg-slate-600 rounded w-16 mb-2"></div>
                <div className="h-5 bg-slate-600 rounded w-12"></div>
              </div>
            </>
          ) : error ? (
            <div className="col-span-2 text-center p-2 text-red-400 text-sm">
              Failed to load analytics
            </div>
          ) : (
            <>
              <div className="bg-slate-700/30 rounded-lg p-2">
                <div className="text-slate-400 mb-0.5">Stars</div>
                <div className="text-white font-medium">
                  {analytics?.stars?.toLocaleString() || 'N/A'}
                </div>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-2">
                <div className="text-slate-400 mb-0.5">Forks</div>
                <div className="text-white font-medium">
                  {analytics?.forks?.toLocaleString() || 'N/A'}
                </div>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-2">
                <div className="text-slate-400 mb-0.5">Last Update</div>
                <div className="text-white font-medium">
                  {analytics?.lastCommit
                    ? new Date(analytics.lastCommit).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'numeric',
                        year: 'numeric'
                      })
                    : 'N/A'}
                </div>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-2">
                <div className="text-slate-400 mb-0.5">Contributors</div>
                <div className="text-white font-medium">
                  {analytics?.contributors?.toLocaleString() || 'N/A'}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <button
            onClick={() => setIsInsightsOpen(true)}
            className="text-slate-400 hover:text-white text-sm flex items-center px-2 py-1 rounded transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Insights
          </button>
          <button
            onClick={() => setIsTimelineOpen(true)}
            className="text-slate-400 hover:text-white text-sm flex items-center px-2 py-1 rounded transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Timeline
          </button>
        </div>
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 text-sm flex items-center px-2 py-1 rounded transition-colors"
        >
          View Project
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>

      {isInsightsOpen && analytics &&
        createPortal(
          <ProjectInsights project={{...project, analytics}} onClose={() => setIsInsightsOpen(false)} />,
          document.body
        )}

      {isTimelineOpen && analytics &&
        createPortal(
          <ProjectTimeline project={{...project, analytics}} onClose={() => setIsTimelineOpen(false)} />,
          document.body
        )}
    </div>
  );
};

export default ProjectCard;
