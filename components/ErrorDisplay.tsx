import React from 'react';

interface ErrorDisplayProps {
  error: string | null;
  retryCount: number;
  onRetry: () => void;
  onClose: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  retryCount,
  onRetry,
  onClose,
}) => {
  const errorMessage = retryCount > 3
    ? "We're having trouble fetching the analytics data. Please try again later."
    : error === 'No analytics data available for this project'
      ? 'No analytics data available for this project yet. This could be a new or private repository.'
      : 'Unable to load analytics data. This could be due to API rate limits or network issues.';

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-2xl p-8">
        <div className="text-center space-y-4">
          <div className="inline-block p-3 bg-red-500/10 rounded-full">
            <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
          <div>
            <p className="text-lg font-semibold text-red-500">{errorMessage}</p>
            {retryCount <= 3 && (
              <p className="text-sm text-slate-400 mt-2">
                You can try again or check back in a few minutes.
              </p>
            )}
          </div>
          <div className="flex flex-col gap-3">
            {retryCount <= 3 && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
              >
                Try Again
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
