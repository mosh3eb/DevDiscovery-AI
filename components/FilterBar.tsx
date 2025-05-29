import React from 'react';

interface FilterBarProps {
  sortBy: string;
  onSortChange: (value: string) => void;
  totalResults: number;
  selectedProjectsCount?: number;
  onCompareClick?: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  sortBy,
  onSortChange,
  totalResults,
  selectedProjectsCount = 0,
  onCompareClick
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-2">
        <span className="text-slate-400">Sort by:</span>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="bg-slate-700 text-slate-200 rounded-lg px-3 py-1.5 text-sm border border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="relevance">Most Relevant</option>
          <option value="stars">Most Stars</option>
          <option value="updated">Recently Updated</option>
        </select>
        <span className="text-slate-400 ml-4">{totalResults.toLocaleString()} results</span>
      </div>

      {selectedProjectsCount > 0 && onCompareClick && (
        <button
          onClick={onCompareClick}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Compare Selected ({selectedProjectsCount})
        </button>
      )}
    </div>
  );
};

export default FilterBar;
