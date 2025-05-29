import React from 'react';

interface LoadingSpinnerProps {
  message: string;
  subMessage?: string;
  progress: number;
  tasks?: Array<{
    name: string;
    completed: boolean;
  }>;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message,
  subMessage,
  progress,
  tasks
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative mb-6">
        {/* Outer circle */}
        <div className="relative">
          <svg
            className="animate-spin h-16 w-16 text-indigo-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          
          {/* Progress percentage */}
          {typeof progress === 'number' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-medium text-indigo-300">
                {Math.round(progress)}%
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="text-center space-y-3 max-w-sm">
        <h3 className="text-lg font-semibold text-slate-200">{message}</h3>
        {subMessage && (
          <p className="text-sm text-slate-400">{subMessage}</p>
        )}

        {/* Task list */}
        {tasks && tasks.length > 0 && (
          <div className="mt-4 space-y-2">
            {tasks.map((task, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50"
              >
                <span className="text-sm text-slate-300">{task.name}</span>
                {task.completed ? (
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <div className="w-4 h-4 border-2 border-t-indigo-400 border-r-indigo-400 border-b-slate-600 border-l-slate-600 rounded-full animate-spin" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;