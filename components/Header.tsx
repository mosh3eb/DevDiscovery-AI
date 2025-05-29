import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-5 border-b border-slate-700 shadow-lg bg-slate-900 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span role="img" aria-label="compass" className="text-3xl md:text-4xl mr-3 filter drop-shadow-md">🧭</span>
            <h1 className="text-2xl md:text-3xl font-bold text-sky-400 hover:text-sky-300 transition-colors duration-300">
              DevDiscovery <span className="text-indigo-400">AI</span>
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