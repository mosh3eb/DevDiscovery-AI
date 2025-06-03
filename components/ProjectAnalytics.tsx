import React from 'react';
import { Project, ProjectHealthScore, ProjectComparison } from '../types';
import { calculateProjectHealthScore, compareProjects } from '../services/projectAnalyticsService';

interface ProjectAnalyticsProps {
  project: Project;
  comparisonProject?: Project;
}

const ProjectAnalytics: React.FC<ProjectAnalyticsProps> = ({ project, comparisonProject }) => {
  const [healthScore, setHealthScore] = React.useState<ProjectHealthScore | null>(null);
  const [comparison, setComparison] = React.useState<ProjectComparison | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const score = await calculateProjectHealthScore(project);
        setHealthScore(score);

        if (comparisonProject) {
          const comparisonData = await compareProjects(project, comparisonProject);
          setComparison(comparisonData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch project analytics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [project, comparisonProject]);

  if (isLoading) {
    return <div className="animate-pulse">Loading analytics...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      {healthScore && (
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Project Health Score</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ScoreCard
              title="Maintenance"
              score={healthScore.maintenanceScore}
              description="Based on issue response time and code quality"
            />
            <ScoreCard
              title="Community"
              score={healthScore.communityScore}
              description="Based on contributor activity and engagement"
            />
            <ScoreCard
              title="Activity"
              score={healthScore.activityScore}
              description="Based on recent commits and PR activity"
            />
            <ScoreCard
              title="Documentation"
              score={healthScore.documentationScore}
              description="Based on README and code documentation"
            />
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Overall Score</span>
              <span className="text-2xl font-bold">{healthScore.overallScore}</span>
            </div>
          </div>
        </div>
      )}

      {comparison && (
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Project Comparison</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Common Technologies</h4>
              <div className="flex flex-wrap gap-2">
                {comparison.commonTechnologies.map((tech) => (
                  <span key={tech} className="bg-slate-700 px-2 py-1 rounded">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">{comparison.project1.name} Only</h4>
                <div className="flex flex-wrap gap-2">
                  {comparison.differentTechnologies.project1Only.map((tech) => (
                    <span key={tech} className="bg-slate-700 px-2 py-1 rounded">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">{comparison.project2.name} Only</h4>
                <div className="flex flex-wrap gap-2">
                  {comparison.differentTechnologies.project2Only.map((tech) => (
                    <span key={tech} className="bg-slate-700 px-2 py-1 rounded">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Activity Comparison</h4>
                <div className="space-y-2">
                  <ComparisonRow
                    label="Commits (Last Month)"
                    value1={comparison.activityComparison.project1.commitsLastMonth}
                    value2={comparison.activityComparison.project2.commitsLastMonth}
                  />
                  <ComparisonRow
                    label="Issues (Last Month)"
                    value1={comparison.activityComparison.project1.issuesLastMonth}
                    value2={comparison.activityComparison.project2.issuesLastMonth}
                  />
                  <ComparisonRow
                    label="Pull Requests (Last Month)"
                    value1={comparison.activityComparison.project1.pullRequestsLastMonth}
                    value2={comparison.activityComparison.project2.pullRequestsLastMonth}
                  />
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Community Comparison</h4>
                <div className="space-y-2">
                  <ComparisonRow
                    label="Stars"
                    value1={comparison.communityComparison.project1.stars}
                    value2={comparison.communityComparison.project2.stars}
                  />
                  <ComparisonRow
                    label="Forks"
                    value1={comparison.communityComparison.project1.forks}
                    value2={comparison.communityComparison.project2.forks}
                  />
                  <ComparisonRow
                    label="Watchers"
                    value1={comparison.communityComparison.project1.watchers}
                    value2={comparison.communityComparison.project2.watchers}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface ScoreCardProps {
  title: string;
  score: number;
  description: string;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ title, score, description }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-slate-700 rounded-lg p-4">
      <h4 className="font-medium mb-1">{title}</h4>
      <div className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}</div>
      <p className="text-sm text-slate-400 mt-1">{description}</p>
    </div>
  );
};

interface ComparisonRowProps {
  label: string;
  value1: number;
  value2: number;
}

const ComparisonRow: React.FC<ComparisonRowProps> = ({ label, value1, value2 }) => {
  const getComparisonColor = (value1: number, value2: number) => {
    if (value1 > value2) return 'text-green-400';
    if (value1 < value2) return 'text-red-400';
    return 'text-slate-400';
  };

  return (
    <div className="flex justify-between items-center">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-4">
        <span className={getComparisonColor(value1, value2)}>{value1}</span>
        <span className="text-slate-500">vs</span>
        <span className={getComparisonColor(value2, value1)}>{value2}</span>
      </div>
    </div>
  );
};

export default ProjectAnalytics; 