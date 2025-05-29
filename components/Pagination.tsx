import React, { useState, useEffect } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  resultsPerPage: number;
  totalResults: number;
}

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  resultsPerPage,
  totalResults 
}) => {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // Show max 5 page numbers

    if (totalPages <= maxVisible) {
      // Show all pages if total is less than maxVisible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate start and end of visible range
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Add ellipsis after first page if needed
      if (start > 2) {
        pages.push('...');
      }

      // Add visible pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (end < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const startResult = ((currentPage - 1) * resultsPerPage) + 1;
  const endResult = Math.min(currentPage * resultsPerPage, totalResults);

  return (
    <div className="mt-8 flex flex-col items-center gap-4">
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <span>
          Showing {startResult}-{endResult} of {totalResults} results
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
            ${currentPage === 1
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
            }`}
          aria-label="Previous page"
        >
          Previous
        </button>

        <div className="flex items-center gap-2">
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' ? onPageChange(page) : undefined}
              disabled={page === '...'}
              className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors
                ${typeof page !== 'number'
                  ? 'text-slate-500 cursor-default'
                  : page === currentPage
                    ? 'bg-indigo-500 text-white'
                    : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                }`}
              aria-label={typeof page === 'number' ? `Page ${page}` : 'More pages'}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
            ${currentPage === totalPages
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
            }`}
          aria-label="Next page"
        >
          Next
        </button>
      </div>

      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          aria-label="Back to top"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Pagination;
