
import React, { useEffect, useState } from 'react';
import { Project } from '../types';
import { fetchGitHubReadmeContent } from '../services/projectDiscoveryService';
import { PlatformIcon, StatIcon } from './ProjectCard';

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
  isOpen: boolean;
}

const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, onClose, isOpen }) => {
  const [readmeContent, setReadmeContent] = useState<string | null>(null);
  const [isLoadingReadme, setIsLoadingReadme] = useState<boolean>(false);

  useEffect(() => {
    // console.log("Modal isOpen:", isOpen, "Project prop:", project); 
    if (isOpen && project && project.platform === 'GitHub' && project.owner && project.name) {
      const repoName = project.name.substring(project.name.indexOf('/') + 1);
      if (project.owner && repoName) {
        setIsLoadingReadme(true);
        setReadmeContent(null); 
        fetchGitHubReadmeContent(project.owner, repoName)
          .then(content => setReadmeContent(content))
          .catch(err => {
            console.error("Error fetching README for modal:", err);
            setReadmeContent("<p class='text-red-400'>Could not load README.</p>");
          })
          .finally(() => setIsLoadingReadme(false));
      } else {
        setReadmeContent(null); // No valid owner/repo for GitHub
        setIsLoadingReadme(false);
      }
    } else {
      setReadmeContent(null); // Clear readme if not GitHub or modal closed/no project
      setIsLoadingReadme(false);
    }
  }, [project, isOpen]); // Rerun if project or isOpen changes

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !project) {
    // console.log("Modal not rendering: isOpen =", isOpen, "project =", project);
    return null;
  }
  // console.log("Modal rendering with project:", project);

  const languageColor = (lang: string | null | undefined): string => {
    if (!lang) return 'bg-slate-600 text-slate-200';
    const l = lang.toLowerCase();
    if (l === 'python') return 'bg-blue-700/80 text-blue-100';
    if (l === 'javascript' || l === 'typescript') return 'bg-yellow-600/80 text-yellow-100';
    if (l === 'java') return 'bg-orange-600/80 text-orange-100';
    if (l === 'c#' || l === 'c++' || l === 'c') return 'bg-purple-700/80 text-purple-100';
    if (l === 'go') return 'bg-sky-600/80 text-sky-100';
    if (l === 'rust') return 'bg-orange-800/80 text-orange-200';
    if (l === 'ruby') return 'bg-red-700/80 text-red-100';
    if (l === 'php') return 'bg-indigo-600/80 text-indigo-100';
    return 'bg-slate-600 text-slate-200';
  };
  
  const platformDisplay = (platformLabel: string): { color: string; name: string } => {
    if (!platformLabel) return { color: 'bg-gray-500 text-white', name: 'N/A' };
    const p = platformLabel.trim().toLowerCase(); 
    if (p === 'github') return { color: 'bg-slate-900 text-slate-100', name: 'GitHub' };
    if (p === 'gitlab') return { color: 'bg-orange-500 text-white', name: 'GitLab' };
    if (p === 'ai suggestion') return { color: 'bg-purple-600 text-white', name: 'AI Idea'};
    if (p === 'npm') return { color: 'bg-red-600 text-white', name: 'NPM' };
    if (p === 'pypi') return { color: 'bg-sky-700 text-yellow-300', name: 'PyPI' };
    if (p === 'codeberg') return { color: 'bg-teal-700 text-white', name: 'Codeberg' };
    if (p === 'packagist') return { color: 'bg-indigo-500 text-white', name: 'Packagist'};
    if (p === 'rubygems') return { color: 'bg-red-700 text-white', name: 'RubyGems'};
    if (p === 'crates.io') return { color: 'bg-orange-700 text-white', name: 'Crates.io'};
    if (p === 'maven central') return { color: 'bg-red-800 text-white', name: 'Maven Central'};
    if (p === 'nuget') return { color: 'bg-sky-800 text-white', name: 'NuGet'};
    return { color: 'bg-gray-500 text-white', name: platformLabel };
  };
  const { color: platformBgColor, name: platformName } = platformDisplay(project.platform);


  return (
    <div 
      className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300"
      onClick={onClose} // Close if overlay is clicked
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-detail-title"
    >
      <div 
        className="bg-slate-800 text-slate-200 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-slate-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing it
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
          <div className="flex items-center min-w-0">
             <span className={`flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${platformBgColor} shadow-sm whitespace-nowrap mr-3`}>
                <PlatformIcon platform={project.platform} className="w-4 h-4 mr-1.5" />
                {platformName}
            </span>
            <h2 id="project-detail-title" className="text-xl font-bold text-teal-300 truncate" title={project.name}>
              {project.name}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-teal-300 transition-colors p-1 rounded-full hover:bg-slate-700"
            aria-label="Close project details"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-grow">
          <div>
            <h4 className="text-sm font-semibold text-teal-400 mb-1">Description</h4>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{project.description || 'No description available.'}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div>
              <h4 className="text-sm font-semibold text-teal-400 mb-1">Language</h4>
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${languageColor(project.language)}`}>
                {project.language || 'N/A'}
              </span>
            </div>
            {project.owner && (
              <div>
                <h4 className="text-sm font-semibold text-teal-400 mb-1">Owner</h4>
                <p className="text-slate-300">{project.owner}</p>
              </div>
            )}
            {project.version && (
                <div>
                    <h4 className="text-sm font-semibold text-teal-400 mb-1">Version</h4>
                    <p className="text-slate-300">{project.version}</p>
                </div>
            )}
            {project.updatedAt && (
                <div>
                    <h4 className="text-sm font-semibold text-teal-400 mb-1">Last Updated</h4>
                    <p className="text-slate-300">{new Date(project.updatedAt).toLocaleDateString()}</p>
                </div>
            )}
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-teal-400 mb-2">Statistics</h4>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-300">
              {project.stars !== null && typeof project.stars === 'number' && <span className="flex items-center"><StatIcon type="stars" /> {project.stars.toLocaleString()} Stars</span>}
              {project.forks !== null && typeof project.forks === 'number' && <span className="flex items-center"><StatIcon type="forks" /> {project.forks.toLocaleString()} Forks</span>}
              {project.watchers !== null && typeof project.watchers === 'number' && <span className="flex items-center"><StatIcon type="watchers" /> {project.watchers.toLocaleString()} Watchers</span>}
              {project.openIssues !== null && typeof project.openIssues === 'number' && <span className="flex items-center"><StatIcon type="openIssues" /> {project.openIssues.toLocaleString()} Open Issues</span>}
              {project.downloads !== null && typeof project.downloads === 'number' && <span className="flex items-center"><StatIcon type="downloads" /> {project.downloads.toLocaleString()} Total D/L</span>}
              {project.recentDownloads !== null && typeof project.recentDownloads === 'number' && <span className="flex items-center"><StatIcon type="recentDownloads" /> {project.recentDownloads.toLocaleString()} Recent D/L</span>}
              {project.monthlyDownloads !== null && typeof project.monthlyDownloads === 'number' && <span className="flex items-center"><StatIcon type="monthlyDownloads" /> {project.monthlyDownloads.toLocaleString()} Monthly D/L</span>}
              {project.versionDownloads !== null && typeof project.versionDownloads === 'number' && <span className="flex items-center"><StatIcon type="versionDownloads" /> {project.versionDownloads.toLocaleString()} Version D/L</span>}
            </div>
          </div>

          {project.tags && project.tags.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-teal-400 mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, index) => (
                  <span key={index} className={`px-2.5 py-1 text-xs rounded-full shadow-sm ${tag.toLowerCase().startsWith('difficulty:') ? 'bg-amber-600/30 text-amber-300' : 'bg-slate-700 text-teal-300/90'}`}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {project.platform === 'GitHub' && (
            <div>
              <h4 className="text-sm font-semibold text-teal-400 mb-2">README</h4>
              {isLoadingReadme && <p className="text-slate-400 text-sm py-4">Loading README...</p>}
              {!isLoadingReadme && readmeContent && (
                <div 
                  className="prose prose-sm prose-invert max-w-none bg-slate-700/30 p-4 rounded-md custom-scrollbar overflow-y-auto max-h-60 text-slate-300 readme-content" 
                  dangerouslySetInnerHTML={{ __html: readmeContent }} 
                />
              )}
              {!isLoadingReadme && !readmeContent && <p className="text-slate-400 text-sm py-4">No README content available or could not be loaded.</p>}
            </div>
          )}

        </div>
        
        {/* Footer */}
        <div className="p-5 border-t border-slate-700 flex justify-end sticky bottom-0 bg-slate-800">
          {project.url !== "N/A" && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-4 py-2 border border-teal-500 text-sm font-medium rounded-md shadow-sm text-teal-300 hover:bg-teal-500 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-teal-400 transition-colors"
            >
              View on {platformName}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailModal;
