import React from 'react';

interface ManualSearchLinksProps {
  languages: string;
  topics: string;
}

const ManualSearchLinks: React.FC<ManualSearchLinksProps> = ({ languages, topics }) => {
  if (!languages && !topics) {
    return null; // Don't show if no criteria are provided
  }

  const buildQuery = (platform: 'github' | 'gitlab' | 'google' | 'sourceforge' | 'npm' | 'pypi'): string => {
    const langArray = languages.split(',').map(l => l.trim()).filter(Boolean);
    const topicArray = topics.split(',').map(t => t.trim()).filter(Boolean);
    
    let queryParts: string[] = [];

    if (platform === 'github') {
      langArray.forEach(lang => queryParts.push(`language:${encodeURIComponent(lang)}`));
      topicArray.forEach(topic => queryParts.push(`topic:${encodeURIComponent(topic)}`));
      return `https://github.com/search?q=${queryParts.join('+')}&type=repositories`;
    }
    
    if (platform === 'gitlab') {
      // GitLab search is a bit different. We can filter by language and search by topics in the main query.
      // Multiple languages might be tricky directly in URL, focusing on first or primary one for simplicity.
      const langParam = langArray.length > 0 ? `&language=${encodeURIComponent(langArray[0])}` : '';
      const searchKeywords = [...topicArray, ...(langArray.length > 1 ? langArray.slice(1) : [])]; // Add other languages to keywords if multiple specified
      return `https://gitlab.com/explore/projects?sort=latest_activity_desc&search=${searchKeywords.map(encodeURIComponent).join('+')}${langParam}`;
    }

    if (platform === 'sourceforge') {
        const allKeywords = [...langArray, ...topicArray];
        return `https://sourceforge.net/directory/?q=${allKeywords.map(encodeURIComponent).join('%20')}`;
    }

    if (platform === 'npm') {
      const allKeywords = [...langArray, ...topicArray];
      return `https://www.npmjs.com/search?q=${allKeywords.map(encodeURIComponent).join('+')}`;
    }

    if (platform === 'pypi') {
      const allKeywords = [...langArray, ...topicArray];
      return `https://pypi.org/search/?q=${allKeywords.map(encodeURIComponent).join('+')}`;
    }
    
    // Google Search (default)
    const allKeywords = [...langArray, ...topicArray];
    return `https://www.google.com/search?q=open+source+projects+${allKeywords.map(encodeURIComponent).join('+')}`;
  };

  const searchPlatforms = [
    { name: 'GitHub', key: 'github' as const, icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-2.5" aria-hidden="true"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
    )},
    { name: 'GitLab', key: 'gitlab' as const, icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-2.5" aria-hidden="true"><path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z"/></svg>
    )},
    { name: 'SourceForge', key: 'sourceforge' as const, icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-2.5" aria-hidden="true"><path d="M12 .29C5.5.29.29 5.5.29 12S5.5 23.71 12 23.71 23.71 18.5 23.71 12 18.5.29 12 .29zm-.37 18.66l-4.88-3.43 2.32-4.24-2.4-1.65 5.07-3.65 2.69 4.86-2.35 1.67 2.22 4.05-2.67 2.39zm.75-9.22l-2.25-1.62 1.38-2.51 2.24 1.62-1.37 2.51z"></path></svg>
    )},
    { name: 'NPM', key: 'npm' as const, icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-2.5" aria-hidden="true"><path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0H1.763zm5.736 4.87h10.002v14.26h-2.99v-11.27H7.5v11.27H4.51V4.87z"/></svg>
    )},
    { name: 'PyPI', key: 'pypi' as const, icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-2.5" aria-hidden="true"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm0 3c-3.866 0-7 3.134-7 7s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7zm0 2c2.761 0 5 2.239 5 5s-2.239 5-5 5-5-2.239-5-5 2.239-5 5-5z"/></svg>
    )},
    { name: 'Google', key: 'google' as const, label: 'Open Source (Google)', icon: (
       <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-2.5" aria-hidden="true"><path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.19,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.42C19,4.42 16.59,2.18 12.19,2.18C6.42,2.18 2.03,6.8 2.03,12C2.03,17.05 6.16,21.82 12.19,21.82C17.62,21.82 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z" /></svg>
    )},
  ];

  return (
    <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-slate-700/70">
      <h3 className="text-base sm:text-lg font-semibold text-indigo-300 mb-4 sm:mb-5 text-center">
        <span className="mr-1.5 sm:mr-2">🔗</span>Explore Further on External Platforms
      </h3>
      <p className="text-xs sm:text-sm text-slate-400 text-center mb-5 sm:mb-6 max-w-xs sm:max-w-md mx-auto">
        Use your current criteria to search directly on these popular open source project sites.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-xs sm:max-w-2xl mx-auto">
        {searchPlatforms.map(platform => (
          <a
            key={platform.key}
            href={buildQuery(platform.key)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center px-3 sm:px-5 py-3 sm:py-3.5 border border-slate-600 rounded-lg text-slate-200 bg-slate-700/60 hover:bg-slate-700 hover:border-indigo-500/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-all duration-150 ease-in-out group text-xs sm:text-sm"
            aria-label={`Search for projects related to ${languages || ''} ${topics || ''} on ${platform.name}`}
          >
            {platform.icon}
            <span className="truncate">Search on {platform.label || platform.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default ManualSearchLinks;
