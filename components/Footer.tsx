
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="py-8 mt-12 text-center border-t border-slate-700/50 bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-sm text-slate-400 flex items-center justify-center">
          Made by: 
          <a 
            href="https://github.com/mosh3eb" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-teal-400 hover:text-teal-300 hover:underline transition-colors mx-1.5 font-semibold"
          >
            Mosh3eb
          </a>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor" 
            className="w-4 h-4 text-red-500 heart-icon"
            aria-label="love"
            role="img"
          >
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        </p>
        <p className="text-xs text-slate-500 mt-2.5">
          &copy; {new Date().getFullYear()} DevDiscovery AI. Explore with curiosity & innovate with purpose.
        </p>
      </div>
    </footer>
  );
};

export default Footer;