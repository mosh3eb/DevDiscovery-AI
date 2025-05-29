import { useMemo, useCallback, useEffect, useState } from 'react';
import { Project, ProjectAnalytics } from '../services/types';
import { getProjectHealth, getProjectTrends, getProjectAnalytics } from '../services/projectAnalyticsService';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler 
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ProjectInsightsProps {
  project: Project;
  onClose: () => void;
}

interface AnalyticsState {
  data: ProjectAnalytics | null;
  loading: boolean;
  error: string | null;
}

// Main component
const ProjectInsights = ({ project, onClose }: ProjectInsightsProps) => {
  const [analytics, setAnalytics] = useState<AnalyticsState>({
    data: project.analytics || null,
    loading: !project.analytics,
    error: null
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!project.analytics) {
        try {
          setAnalytics(prev => ({ ...prev, loading: true, error: null }));
          
          // Add small delay to prevent race conditions
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const analyticsData = await getProjectAnalytics(project);
          console.log('Insights: Received analytics data:', analyticsData);
          
          if (!analyticsData || !analyticsData.weeklyActivity) {
            throw new Error('Invalid analytics data received');
          }
          
          setAnalytics({
            data: analyticsData,
            loading: false,
            error: null
          });
        } catch (error) {
          console.error('Error fetching analytics for insights:', error);
          setAnalytics({
            data: null,
            loading: false,
            error: 'Failed to load project analytics. Please try again later.'
          });
        }
      }
    };

    fetchAnalytics();
  }, [project]);

  const healthScore = useMemo(() => 
    analytics.data ? getProjectHealth(analytics.data) : 0
  , [analytics.data]);

  const trends = useMemo(() => 
    analytics.data ? getProjectTrends(analytics.data) : { trend: 'stable', confidence: 0 }
  , [analytics.data]);

  const getTrendIcon = useCallback((trend: string) => {
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
  }, []);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Prepare data for the chart
  const chartData = useMemo(() => {
    if (!analytics.data?.weeklyActivity?.length) return null;

    const data = {
      labels: analytics.data.weeklyActivity.map((week: any) => new Date(week.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Commits',
          data: analytics.data.weeklyActivity.map((week: any) => week.commits),
          borderColor: 'rgb(56, 189, 248)', // sky-400
          backgroundColor: 'rgba(56, 189, 248, 0.1)',
          tension: 0.3,
          fill: true,
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: 'rgb(56, 189, 248)',
          pointBorderColor: 'rgb(30, 41, 59)', // slate-800
          pointBorderWidth: 2,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: 'rgb(56, 189, 248)',
          pointHoverBorderColor: 'rgb(248, 250, 252)', // slate-50
          pointHoverBorderWidth: 2,
        },
      ],
    };
    return data;
  }, [analytics.data?.weeklyActivity]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#e2e8f0',
        bodyColor: '#e2e8f0',
        borderColor: '#475569',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          title: function(context: any) {
            return `Week ending ${new Date(context[0].label).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}`;
          },
          label: function(context: any) {
            return `${context.raw.toLocaleString()} commits`;
          }
        }
      }
    },
    scales: {
      x: {
        border: {
          display: false
        },
        grid: {
          color: 'rgba(71, 85, 105, 0.2)', // slate-600 at 20% opacity
          tickLength: 0
        },
        ticks: {
          color: '#94A3B8', // slate-400
          maxRotation: 0,
          font: {
            size: 11
          },
          callback: function(value: any) {
            const date = new Date(value);
            return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          }
        }
      },
      y: {
        border: {
          display: false
        },
        grid: {
          color: 'rgba(71, 85, 105, 0.2)', // slate-600 at 20% opacity
        },
        ticks: {
          color: '#94A3B8', // slate-400
          padding: 8,
          font: {
            size: 11
          },
          callback: function(value: any) {
            return value.toLocaleString();
          }
        },
        beginAtZero: true
      }
    },
  }), []);

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
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-40 flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-4xl mx-auto bg-slate-800/95 rounded-xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700/60 sticky top-0 bg-slate-800 z-10">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{project.url.includes('github.com') ? '🐙' : '🦊'}</span>
            <h2 className="text-xl sm:text-2xl font-semibold text-sky-300">{project.name}</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-300 transition-colors p-2 hover:bg-slate-700/50 rounded-lg"
            aria-label="Close insights"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
          {/* Health Score & Trend Analysis Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Health Score Card */}
            <div className="bg-slate-800/80 rounded-xl border border-slate-700/60 p-6">
              <h3 className="text-sm font-medium text-slate-400 mb-3">Health Score</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#1e293b"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={healthScore >= 70 ? '#10b981' : healthScore >= 40 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="3"
                      strokeDasharray={`${healthScore}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{healthScore}</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm px-2.5 py-1 rounded-full bg-slate-700/60 text-slate-300 inline-block mb-2">
                    {trends.confidence > 0.7 ? 'High confidence' : trends.confidence > 0.4 ? 'Medium confidence' : 'Low confidence'}
                  </div>
                  <div className="flex items-center gap-2 text-lg font-medium">
                    {getTrendIcon(trends.trend)}
                    <span className="capitalize">{trends.trend} trend</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Overview Card */}
            <div className="bg-slate-800/80 rounded-xl border border-slate-700/60 p-6">
              <h3 className="text-sm font-medium text-slate-400 mb-4">Activity Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.95-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-slate-300">Total Commits</span>
                  </div>
                  <div className="text-xl font-semibold text-white">
                    {analytics.data?.totalCommits?.toLocaleString() || '0'}
                  </div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.646 5.146a.5.5 0 01.708 0l2 2a.5.5 0 01-.708.708L8.5 6.707V10.5a.5.5 0 01-1 0V6.707L6.354 7.854a.5.5 0 11-.708-.708l2-2z" clipRule="evenodd" />
                    </svg>
                    <span className="text-slate-300">Contributors</span>
                  </div>
                  <div className="text-xl font-semibold text-white">
                    {analytics.data?.contributors?.toLocaleString() || '0'}
                  </div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-slate-300">Issues</span>
                  </div>
                  <div className="text-xl font-semibold text-white">
                    {analytics.data?.issues?.toLocaleString() || '0'}
                  </div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-slate-300">Pull Requests</span>
                  </div>
                  <div className="text-xl font-semibold text-white">
                    {analytics.data?.pullRequests?.toLocaleString() || '0'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Chart */}
          {analytics.data?.weeklyActivity && analytics.data.weeklyActivity.length > 0 && chartData && (
            <div className="bg-slate-800/80 rounded-xl border border-slate-700/60 p-6">
              <h3 className="text-sm font-medium text-slate-400 mb-4">Commit Activity</h3>
              <div className="h-64">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          )}

          {/* Contributors Section */}
          {analytics.data?.topContributors && analytics.data.topContributors.length > 0 && (
            <div className="bg-slate-800/80 rounded-xl border border-slate-700/60 p-6">
              <h3 className="text-sm font-medium text-slate-400 mb-4">Top Contributors</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {analytics.data?.topContributors.slice(0, 6).map((contributor: { name: string; contributions: number }, index: number) => (
                  <div key={index} className="bg-slate-700/30 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-slate-300 font-medium">
                        {contributor.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-200">{contributor.name}</div>
                        <div className="text-xs text-slate-400">{contributor.contributions} commits</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectInsights;
