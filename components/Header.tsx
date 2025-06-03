import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-5 border-b border-slate-700/50 shadow-lg bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span role="img" aria-label="compass" className="text-3xl md:text-4xl mr-3 filter drop-shadow-lg">🧭</span>
            <h1 
              className="text-2xl md:text-3xl font-bold text-teal-400 hover:text-teal-300 transition-colors duration-300"
              style={{ textShadow: '0 1px 3px rgba(0, 128, 128, 0.3)' }} // Subtle teal shadow
            >
              DevDiscovery <span className="text-teal-500">AI</span>
            </h1>
          </div>
          <p className="text-sm text-slate-400 hidden md:block">
            Your Compass to Open Source Innovation.
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;