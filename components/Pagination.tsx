
import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (pageNumber: number) => void;
  siblings?: number; 
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblings = 1, 
}) => {
  const range = (start: number, end: number) => {
    let length = end - start + 1;
    return Array.from({ length }, (_, idx) => idx + start);
  };

  const paginationRange = React.useMemo(() => {
    const totalPageNumbersInView = 2 * siblings + 5;

    if (totalPageNumbersInView >= totalPages) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblings, 1);
    const rightSiblingIndex = Math.min(currentPage + siblings, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      let leftItemCount = 3 + 2 * siblings; 
      if (currentPage + siblings < leftItemCount ) leftItemCount = currentPage + siblings +1;
      let leftRange = range(1, Math.min(leftItemCount, totalPages -1) );
      return [...leftRange, '...', totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      let rightItemCount = 3 + 2 * siblings; 
      if (totalPages - (currentPage - siblings) +1 < rightItemCount) rightItemCount = totalPages - (currentPage-siblings) + 2;
      let rightRange = range(Math.max(1, totalPages - rightItemCount +1), totalPages);
      return [firstPageIndex, '...', ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      let middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, '...', ...middleRange, '...', lastPageIndex];
    }
    
    return range(1, totalPages);

  }, [totalPages, currentPage, siblings]);


  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav aria-label="Project pagination" className="flex items-center justify-center space-x-1 sm:space-x-1.5">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-slate-300 bg-slate-700 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        Prev
      </button>

      {paginationRange.map((pageNumber, index) => {
        const key = typeof pageNumber === 'string' ? `dots-${index}` : `page-${pageNumber}`;
        if (pageNumber === '...') {
          return <span key={key} className="px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm text-slate-400">...</span>;
        }
        return (
          <button
            key={key}
            onClick={() => onPageChange(pageNumber as number)}
            disabled={currentPage === pageNumber}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${
              currentPage === pageNumber
                ? 'bg-teal-500 text-white cursor-default ring-teal-400'
                : 'text-slate-200 bg-slate-700 hover:bg-slate-600 focus:ring-teal-500'
            }`}
            aria-current={currentPage === pageNumber ? 'page' : undefined}
            aria-label={currentPage === pageNumber ? `Current page, Page ${pageNumber}` : `Go to page ${pageNumber}`}
          >
            {pageNumber}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-slate-300 bg-slate-700 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        Next
      </button>
    </nav>
  );
};

export default Pagination;