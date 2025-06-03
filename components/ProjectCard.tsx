import React from 'react';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  onOpenModal: (project: Project) => void;
  onToggleBookmark: (project: Project) => void;
}

export const PlatformIcon: React.FC<{ platform: string, className?: string }> = ({ platform, className = "w-4 h-4" }) => {
  const p = platform ? platform.trim().toLowerCase() : 'unknown'; 
  switch (p) {
    case 'github':
      return (
        <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
        </svg>
      );
    case 'gitlab':
      return (
        <svg viewBox="0 0 36 36" fill="currentColor" className={className} aria-hidden="true">
          <path fill="#FCA326" d="M36 18.36L30.45 3.44a.9.9 0 00-1.69.02L24.31 18.1l-6.24-18.44a.9.9 0 00-1.7 0L10.43 18.1 5.55 3.46a.9.9 0 00-1.69-.02L0 18.36l6.23 18.43a.9.9 0 001.7 0l4.1-12.06 4.19 12.06a.9.9 0 001.7 0l6.32-18.43z"></path>
        </svg>
      );
    case 'bitbucket':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M2.046 4.064C2.018 3.928 2.002 3.79 2 3.649V20.35c0 .141.018.279.046.416L8.611 12 2.046 4.064zM9.042 12l6.861 8.428c.347.066.706.105 1.079.105h3.016c.66 0 1.202-.534 1.202-1.191V4.658c0-.657-.542-1.191-1.202-1.191H16.98c-.373 0-.732.04-1.079.105L9.042 12zm11.061-8.084c.028.137.046.275.046.416V20.35c0 .141-.018.279-.046.416L15.482 12l4.621-7.668z"></path>
        </svg>
      );
    case 'npm':
      return (
        <svg viewBox="0 0 18 7" fill="currentColor" className={className} aria-hidden="true">
          <path fill="#CB3837" d="M0 0h18v6H9v1H5V6H0V0zm1 1v4h3V1H1zm4 0v4h3V1H5zm4 0v4h3V1H9zm4 0v4h3V1h-3z"></path>
        </svg>
      );
    case 'pypi':
      return ( 
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          <rect width="100" height="100" rx="15" fill="#306998"/>
          <rect x="5" y="5" width="90" height="90" rx="10" fill="#FFD43B"/>
          <text x="50" y="72" fontSize="60" fill="#306998" textAnchor="middle" fontWeight="bold">Py</text>
        </svg>
      );
    case 'sourceforge':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
            <circle cx="50" cy="50" r="48" fill="#FF6600" />
            <text x="50" y="68" fontSize="50" fill="white" textAnchor="middle" fontWeight="bold">SF</text>
        </svg>
      );
    case 'codeberg':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M20.59 5.54c-.38-.48-1.02-.6-1.56-.35l-6.03 2.8V3.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v4.55L4 5.19c-.54-.25-1.18-.13-1.56.35-.38.48-.33 1.16.12 1.57L6 9.25v5.5L2.56 17.9c-.45.41-.5 1.09-.12 1.57.38.48 1.02.6 1.56.35l6.03-2.8v4.48c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19.4l6.03 2.8c.19.09.38.13.57.13.37 0 .72-.18.93-.48.38-.48.33-1.16-.12-1.57L18 14.75v-5.5l3.44-2.14c.45-.41.5-1.09.12-1.57zM16.5 14.1l-4.5 2.1v-9l4.5-2.1v9zm-6-6.9l-4.5 2.1v-2.1L10.5 5.1v2.1z"/>
        </svg>
      );
    case 'packagist': 
      return (
        <svg viewBox="0 0 248 150" className={className} aria-hidden="true" fill="#777BB4">
          <path d="M124 150c-20 0-52-4-70-21-15-14-20-33-17-52 11 8 26 13 42 13 12 0 23-3 32-8-9 28 5 42 13 68zm59-150c-12 0-23 2-33 5a50 50 0 00-17 12c-15 15-20 35-13 53 11-21 39-27 60-16s27 39 16 60c-8 14-22 21-37 21s-29-7-37-21a70 70 0 013-97c12-13 29-20 48-20h10v23h-10zM67 91c-19 0-35-7-47-19a50 50 0 01-3-56C29 2 48 0 60 0h10v23H60c-3 0-6 0-8 1-12 2-20 11-20 22s8 21 20 22c12 1 20-8 20-22s-8-21-20-22c-3 0-6 0-8-1H34c-4 0-8 2-10 6-3 6-2 13 3 17 10 10 24 15 39 15s29-5 39-15c5-4 6-11 3-17s-6-6-10-6h-7c-10 0-17 8-17 18s8 18 17 18h7c19 0 35-7 47-19a50 50 0 013-56C136 2 117 0 105 0H95v23h10c3 0 6 0 8 1 12 2 20 11 20 22s-8 21-20 22-20-8-20-22 8-21 20-22c3 0 6 0 8-1h7c4 0 8 2 10 6 3 6 2 13-3 17-10 10-24 15-39 15z"/>
        </svg>
      );
    case 'rubygems': 
      return (
        <svg viewBox="0 0 20 20" className={className} aria-hidden="true" fill="#CC342D">
           <path d="M10 0L0 6L10 12L20 6L10 0ZM0 7L10 13L20 7L10 1L0 7Z M0 14L10 20L20 14L10 8L0 14Z"/>
        </svg>
      );
    case 'crates.io': 
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true" fill="#DEA584">
          <path d="M58.2,20.3c0.1-0.6-0.2-1.1-0.7-1.3L52,16.1c-0.5-0.2-1.1,0-1.3,0.5l-1.3,3.1c-0.7-0.3-1.5-0.5-2.4-0.5h-5.1V10 c0-0.6-0.4-1-1-1H21c-0.6,0-1,0.4-1,1v9.2H15c-0.8,0-1.6,0.2-2.4,0.5l-1.3-3.1c-0.2-0.5-0.8-0.7-1.3-0.5L4.5,19 c-0.5,0.2-0.8,0.7-0.7,1.3l1.8,8.4c0.1,0.4,0.4,0.7,0.8,0.8L12,30.7V45c0,0.6,0.4,1,1,1h38c0.6,0,1-0.4,1-1V30.7l5.6-1.2 c0.4-0.1,0.7-0.4,0.8-0.8L58.2,20.3z M22,11h20v8.2H22V11z M49.3,44H14.7c-0.9,0-1.7-0.5-2.1-1.3L10.9,39H20v3c0,0.6,0.4,1,1,1h22 c0.6,0,1-0.4,1-1v-3h9.1l-1.7,3.8C51,43.5,50.2,44,49.3,44z M51.6,28.7L46,29.9V25c0-0.6-0.4-1-1-1H19c-0.6,0-1,0.4-1,1v4.9 l-5.6-1.2l-1.2-5.8l4.8-1.9L18.5,23c0.2,0.5,0.8,0.7,1.3,0.5C20.2,23.3,20.6,23,21,22.6c0,0,0,0,0.1-0.1l1.6-2.1c0.2-0.2,0.4-0.3,0.7-0.3 h17c0.3,0,0.5,0.1,0.7,0.3l1.6,2.1c0,0,0.1,0.1,0.1,0.1c0.4,0.5,0.8,0.7,1.2,0.8c0.5,0.2,1.1,0,1.3-0.5l2.5-6.1l4.8,1.9 L51.6,28.7z"/>
        </svg>
      );
    case 'maven central':
      return ( 
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="#C42E21">
          <path d="M2.667 0l12.001 21.333L29.333 0h-7.371l-6.961 12.321L8.038 0H2.667zm0 26.667V32h26.667v-5.333H2.667z"/>
        </svg>
      );
    case 'nuget':
      return ( 
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="#004880">
          <path d="M11.99 0C5.36 0 0 5.36 0 11.99s5.36 11.99 11.99 11.99S24 18.62 24 11.99C23.99 5.36 18.62 0 11.99 0zm0 22C6.47 22 2 17.52 2 11.99S6.47 2 11.99 2s9.99 4.48 9.99 9.99S17.51 22 11.99 22z"/><path d="M12 3.6l-6 4.8v7.2l6 4.8 6-4.8V8.4l-6-4.8zm4 11.4l-4 3.2-4-3.2V9l4-3.2 4 3.2v6z"/><path d="M10.49 11.21l1.51-1.21 1.51 1.21-1.51 3.59zM8.99 12.41l1.51 1.21 1.51-1.21-1.51-3.59zM13.49 12.41l1.51-1.21-1.51-1.21-1.51 3.59z"/>
        </svg>
      );
    case 'ai suggestion': 
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
            <path fillRule="evenodd" d="M11.857 2.032a.75.75 0 01.85.363l1.834 3.291 3.291 1.834a.75.75 0 01.363.85L16.162 12l2.032 1.857a.75.75 0 01-.363.85l-3.29 1.834-1.835 3.291a.75.75 0 01-.85.363L10 18.162l-1.857 2.032a.75.75 0 01-.85-.363L5.46 16.54l-3.29-1.835a.75.75 0 01-.364-.85L3.838 12 .213 10.143a.75.75 0 01.363-.85l3.291-1.834L5.7 4.167a.75.75 0 01.85-.363L10 3.838l1.857-1.806zM12 10a2 2 0 11-4 0 2 2 0 014 0z" clipRule="evenodd" />
          </svg>
        );
    case 'libraries.io': case 'open hub': case 'f-droid': case 'unknown':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
        </svg>
      );
    default:
      return ( 
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        </svg>
      );
  }
};

export const StatIcon: React.FC<{ type: 'stars' | 'forks' | 'downloads' | 'monthlyDownloads' | 'openIssues' | 'versionDownloads' | 'recentDownloads' | 'watchers', className?: string }> = ({ type, className = "w-3.5 h-3.5 text-slate-400 mr-1" }) => { 
  switch (type) {
    case 'stars':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
          <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.393c-.83.069-1.171 1.025-.53 1.601l3.635 3.19-1.07 4.73c-.205.84.726 1.508 1.451 1.057L10 15.547l4.218 2.565c.725.451 1.657-.217 1.451-1.057l-1.07-4.73 3.635-3.19c.64-.577.3-1.532-.53-1.601l-4.753-.393-1.83-4.401z" clipRule="evenodd" />
        </svg>
      );
    case 'forks':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
          <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v3.5h3.5a.75.75 0 010 1.5h-3.5v3.5a.75.75 0 01-1.5 0v-3.5h-3.5a.75.75 0 010-1.5h3.5v-3.5A.75.75 0 0110 3zM5.625 7.646a.75.75 0 011.06 0L10 10.969l3.315-3.323a.75.75 0 111.06 1.06l-3.844 3.844a.75.75 0 01-1.06 0L5.625 8.706a.75.75 0 010-1.06z" clipRule="evenodd" />
           <path d="M5.246 9.172A3.502 3.502 0 004 11.5v.077a3.5 3.5 0 003.5 3.5h5a3.5 3.5 0 003.5-3.5V11.5a3.5 3.5 0 00-1.246-2.328L10.5 12.803a.75.75 0 01-1.06 0L5.246 9.172zM3.5 11.5C3.5 9.843 4.843 8.5 6.5 8.5h7c1.657 0 3 1.343 3 3V11.5c0 .822-.336 1.578-.878 2.121L10 17.803l-5.622-4.182A2.09 2.09 0 013.5 11.5z" />
        </svg>
      );
    case 'downloads':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
          <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v8.793l2.03-2.03a.75.75 0 011.06 1.06l-3.5 3.5a.75.75 0 01-1.06 0l-3.5-3.5a.75.75 0 111.06-1.06l2.03 2.03V3.75A.75.75 0 0110 3zM2.75 14A.75.75 0 013.5 13.25h13a.75.75 0 010 1.5h-13A.75.75 0 012.75 14z" clipRule="evenodd" />
        </svg>
      );
    case 'monthlyDownloads':
        return (
         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
            <path d="M10 12.5a.75.75 0 01-.75-.75v-3.5a.75.75 0 011.5 0v3.5a.75.75 0 01-.75.75z" />
            <path fillRule="evenodd" d="M3.023 13.046A9.002 9.002 0 0010 18.5c1.963 0 3.78-.632 5.282-1.707a.75.75 0 00-.936-1.173 7.502 7.502 0 01-8.692 0 .75.75 0 00-.936 1.173zM10 3a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 3zM16.977 6.954a.75.75 0 00.936-1.174 9.002 9.002 0 00-13.211.001.75.75 0 00.936 1.173 7.502 7.502 0 0111.34 0z" clipRule="evenodd" />
         </svg>
        );
    case 'openIssues':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
          <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a.75.75 0 00-.75.75 2.25 2.25 0 002.25 2.25H13.5A2.25 2.25 0 0015.75 9.75.75.75 0 0015 9h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
          <path d="M3 12.75A2.25 2.25 0 015.25 15h9.5A2.25 2.25 0 0117 12.75V12A2.25 2.25 0 0114.75 9.75H5.25A2.25 2.25 0 013 12v.75zM5.25 11.25h9.5c.095 0 .181.028.253.075A2.226 2.226 0 0115.75 12v.75a.75.75 0 01-.75.75h-9.5A.75.75 0 014.5 12.75V12c0-.095.028-.182.075-.253A2.226 2.226 0 015.25 11.25z" />
          <path fillRule="evenodd" d="M7.505 15.15A2.251 2.251 0 009.75 17h.5a2.251 2.251 0 002.245-1.85.75.75 0 00-1.49-.153A.75.75 0 0110.25 15.5h-.5a.75.75 0 01-.744-.853.75.75 0 00-1.49-.15zM12.5 15.5a.75.75 0 01.744.647.75.75 0 001.49.153A2.251 2.251 0 0012.5 17h-.5a2.251 2.251 0 00-2.245-1.85.75.75 0 00-1.49-.152A.75.75 0 019 15.5h-.5a.75.75 0 01-.744-.853.75.75 0 00-1.49-.15A2.251 2.251 0 007.5 17h5a2.251 2.251 0 002.245-1.85.75.75 0 00-1.49-.153A.75.75 0 0112.5 15.5z" clipRule="evenodd" /> 
        </svg>
      );
    case 'versionDownloads': 
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
          <path fillRule="evenodd" d="M10 2.5c-.827 0-1.5.673-1.5 1.5v5.086L6.293 6.793a1.5 1.5 0 00-2.122 2.121l4.75 4.75a1.5 1.5 0 002.122 0l4.75-4.75a1.5 1.5 0 00-2.121-2.121L11.5 9.086V4c0-.827-.673-1.5-1.5-1.5z" clipRule="evenodd" />
          <path d="M3.5 14.5a1.5 1.5 0 000 3h13a1.5 1.5 0 000-3h-13z" />
        </svg>
      );
    case 'recentDownloads': 
      return (
         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
          <path fillRule="evenodd" d="M10 1a.75.75 0 01.75.75V5.5h1.75a.75.75 0 010 1.5H10.75V11h2.438A5.504 5.504 0 0117.5 15.75c0 2.23-1.346 4.145-3.25 4.943.098.436.167.88.217 1.33a.75.75 0 01-1.48.254c-.05-.447-.12-.887-.22-1.32A5.466 5.466 0 0110 19.75a5.466 5.466 0 01-2.767-1.043c-.1.433-.17.873-.22 1.32a.75.75 0 01-1.48-.254c.05-.45.119-.894.217-1.33A5.504 5.504 0 012.5 15.75c0-1.359.493-2.599 1.313-3.568h2.437V7H5.5a.75.75 0 010-1.5H7.25V1.75A.75.75 0 018 .999l.007.001A.75.75 0 0110 1zm0 14.25a4.002 4.002 0 003.75-3.001H6.25A4.002 4.002 0 0010 15.25z" clipRule="evenodd" />
        </svg>
      );
    case 'watchers': 
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
          <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
          <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.404a1.65 1.65 0 010 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893 2.66-9.336-6.404zM10 15c3.536 0 6.447-2.14 7.622-5C16.447 6.14 13.536 4 10 4S3.553 6.14 2.378 10C3.553 13.86 6.464 15 10 15z" clipRule="evenodd" />
        </svg>
      );
    default: return null;
  }
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onOpenModal, onToggleBookmark }) => {
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
    if (l === 'shell' || l === 'bash') return 'bg-lime-700/80 text-lime-200';
    if (l === 'html') return 'bg-red-500/80 text-red-100';
    if (l === 'css') return 'bg-blue-500/80 text-blue-100';
    return 'bg-slate-600 text-slate-200';
  };

  const platformDisplay = (platformLabel: string): { color: string; name: string } => {
    if (!platformLabel) return { color: 'bg-gray-500 text-white', name: 'N/A' };
    const p = platformLabel.trim().toLowerCase(); 
    if (p === 'github') return { color: 'bg-slate-900 text-slate-100', name: 'GitHub' };
    if (p === 'gitlab') return { color: 'bg-orange-500 text-white', name: 'GitLab' };
    if (p === 'bitbucket') return { color: 'bg-sky-600 text-white', name: 'Bitbucket' };
    if (p === 'npm') return { color: 'bg-red-600 text-white', name: 'NPM' };
    if (p === 'pypi') return { color: 'bg-sky-700 text-yellow-300', name: 'PyPI' };
    if (p === 'sourceforge') return { color: 'bg-orange-600 text-white', name: 'SourceForge' };
    if (p === 'codeberg') return { color: 'bg-teal-700 text-white', name: 'Codeberg' };
    if (p === 'packagist') return { color: 'bg-indigo-500 text-white', name: 'Packagist'};
    if (p === 'rubygems') return { color: 'bg-red-700 text-white', name: 'RubyGems'};
    if (p === 'crates.io') return { color: 'bg-orange-700 text-white', name: 'Crates.io'};
    if (p === 'maven central') return { color: 'bg-red-800 text-white', name: 'Maven Central'};
    if (p === 'nuget') return { color: 'bg-sky-800 text-white', name: 'NuGet'};
    if (p === 'ai suggestion') return { color: 'bg-purple-600 text-white', name: 'AI Idea'};
    if (p === 'libraries.io') return { color: 'bg-green-600 text-white', name: 'Libraries.io'};
    if (p === 'open hub') return { color: 'bg-purple-600 text-white', name: 'Open Hub'};
    if (p === 'f-droid') return { color: 'bg-green-700 text-white', name: 'F-Droid'};
    return { color: 'bg-gray-500 text-white', name: platformLabel };
  };

  const { color: platformBgColor, name: platformName } = platformDisplay(project.platform);

  return (
    <div className="bg-slate-800 shadow-xl rounded-xl p-5 flex flex-col justify-between transition-all duration-300 border border-slate-700 hover:border-teal-500/80 hover:shadow-teal-500/30 transform hover:-translate-y-1.5 group">
      <div>
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-bold text-teal-300 group-hover:text-teal-200 transition-colors duration-200 flex-grow pr-2 leading-tight overflow-hidden whitespace-nowrap text-ellipsis">{project.name}</h3>
          <div className="flex items-center flex-shrink-0">
            <button 
                onClick={(e) => { e.stopPropagation(); onToggleBookmark(project); }}
                className={`p-1 rounded-full hover:bg-slate-700 transition-colors mr-2 ${project.isBookmarked ? 'text-yellow-400 hover:text-yellow-300' : 'text-slate-500 hover:text-yellow-400'}`}
                aria-label={project.isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                title={project.isBookmarked ? 'Bookmarked' : 'Bookmark this project'}
            >
                {project.isBookmarked ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.116 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.619.049.863.838.438 1.258l-3.992 3.622a.563.563 0 00-.162.522l1.07 5.367c.123.617-.526 1.093-1.073.785l-4.87-2.775a.563.563 0 00-.572 0l-4.87 2.775c-.547.308-1.196-.168-1.073-.785l1.07-5.367a.563.563 0 00-.162-.522l-3.992-3.622c-.425-.42-.181-1.21.438-1.258l5.518-.442a.563.563 0 00.475-.345L11.48 3.5Z" />
                    </svg>
                )}
            </button>
            <span className={`flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${platformBgColor} shadow-sm whitespace-nowrap`} title={platformName}>
              <PlatformIcon platform={project.platform} className="w-3.5 h-3.5 mr-1.5" />
              {platformName}
            </span>
          </div>
        </div>
        <p className="text-slate-300/90 mb-4 text-sm leading-relaxed min-h-[40px] max-h-[80px] overflow-y-auto custom-scrollbar pr-1">{project.description || 'No description available.'}</p>
        
        <div className="mb-4 flex flex-wrap gap-x-2.5 gap-y-2 text-xs items-center text-slate-300">
          <span className={`inline-flex items-center font-medium px-2.5 py-1 rounded-full ${languageColor(project.language)} text-[0.7rem] shadow-sm`}>
            {project.language || 'N/A'}
          </span>
          {project.stars !== null && project.stars !== undefined && (
            <span className="inline-flex items-center" title="Stars">
              <StatIcon type="stars" />
              {project.stars.toLocaleString()}
            </span>
          )}
           {project.forks !== null && project.forks !== undefined && (
            <span className="inline-flex items-center" title="Forks">
              <StatIcon type="forks" />
              {project.forks.toLocaleString()}
            </span>
          )}
          {project.watchers !== null && project.watchers !== undefined && (
            <span className="inline-flex items-center" title="Watchers">
              <StatIcon type="watchers" />
              {project.watchers.toLocaleString()}
            </span>
          )}
          {project.openIssues !== null && project.openIssues !== undefined && (
            <span className="inline-flex items-center" title="Open Issues">
              <StatIcon type="openIssues" />
              {project.openIssues.toLocaleString()}
            </span>
          )}
          {project.downloads !== null && project.downloads !== undefined && (
             <span className="inline-flex items-center" title="Total Downloads">
              <StatIcon type="downloads" />
              {project.downloads.toLocaleString()}
            </span>
          )}
          {project.recentDownloads !== null && project.recentDownloads !== undefined && (
             <span className="inline-flex items-center" title="Recent Downloads">
              <StatIcon type="recentDownloads" />
              {project.recentDownloads.toLocaleString()}
              <span className="ml-0.5 text-slate-400 text-[0.65rem]">/recent</span>
            </span>
          )}
          {project.monthlyDownloads !== null && project.monthlyDownloads !== undefined && (
             <span className="inline-flex items-center" title="Monthly Downloads">
              <StatIcon type="monthlyDownloads" />
              {project.monthlyDownloads.toLocaleString()}
              <span className="ml-0.5 text-slate-400 text-[0.65rem]">/mo</span>
            </span>
          )}
          {project.versionDownloads !== null && project.versionDownloads !== undefined && (
             <span className="inline-flex items-center" title="Version Downloads">
              <StatIcon type="versionDownloads" />
              {project.versionDownloads.toLocaleString()}
              <span className="ml-0.5 text-slate-400 text-[0.65rem]">/ver</span>
            </span>
          )}
          {project.version && (
             <span className="inline-flex items-center" title="Version">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-slate-400 mr-1" aria-hidden="true">
                <path d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.071a1.5 1.5 0 01-.301 1.364l-1.523 1.523a.75.75 0 00-.218 1.039l1.243 2.132a.75.75 0 001.04.218l1.523-1.523a1.5 1.5 0 011.364-.301l3.071.716A1.5 1.5 0 0118 12.852V14.5a1.5 1.5 0 01-1.5 1.5h-1.382a3.25 3.25 0 00-3.242 3.034.75.75 0 01-1.466.268A5.472 5.472 0 018.75 16H4.5A1.5 1.5 0 013 14.5V12c0-.469.215-.9.562-1.195l1.247-1.038a.75.75 0 00-.262-1.291L3.083 7.869A1.5 1.5 0 012 6.445V3.5z"/>
                <path d="M3.75 5.508a.75.75 0 000 1.484l1.444.321a1.5 1.5 0 011.02.43l1.09 1.09a3 3 0 013.436 3.436l1.09 1.09a1.5 1.5 0 01.43 1.02l.322 1.444a.75.75 0 001.484 0l.322-1.444a1.5 1.5 0 01.43-1.02l1.09-1.09a3 3 0 013.436-3.436l-1.09-1.09a1.5 1.5 0 01-.43-1.02l-.322-1.444a.75.75 0 00-1.484 0l-.322 1.444a1.5 1.5 0 01-.43 1.02l-1.09 1.09a3 3 0 01-3.436 3.436l-1.09 1.09a1.5 1.5 0 01-1.02.43l-1.444.322z"/>
              </svg>
              {project.version}
            </span>
          )}
        </div>


        {project.tags && project.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1.5">
              {project.tags.slice(0, 8).map((tag, index) => ( 
                <span
                  key={index}
                  className={`px-2 py-0.5 text-[0.7rem] rounded-full shadow-sm transition-colors
                    ${tag.toLowerCase().startsWith('difficulty:') ? 'bg-amber-600/30 text-amber-300 hover:bg-amber-600/50' : 'bg-slate-700 text-teal-300/90 hover:bg-slate-600/80'}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-auto flex flex-col sm:flex-row sm:items-center gap-2.5">
          <button
            onClick={() => onOpenModal(project)}
            className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-sky-500 text-sky-300 text-xs font-semibold rounded-lg hover:bg-sky-500 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-400 transition-all duration-200 ease-in-out group-hover:shadow-sky-500/30"
            aria-label={`View details for ${project.name}`}
          >
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Zm3.75 11.625a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
            View Details
          </button>
          {project.platform === "AI Suggestion" ? (
            <a
              href={project.url === "N/A" ? undefined : project.url}
              target={project.url === "N/A" ? undefined : "_blank"}
              rel={project.url === "N/A" ? undefined : "noopener noreferrer"}
              className={`flex-1 inline-flex items-center justify-center px-3 py-2 border text-xs font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-200 ease-in-out group-hover:shadow-lg 
                ${project.url === "N/A" 
                  ? 'border-slate-600 text-slate-400 cursor-default group-hover:shadow-none' 
                  : 'border-teal-500 text-teal-300 hover:bg-teal-500 hover:text-slate-900 focus:ring-teal-400 group-hover:shadow-teal-500/40'
                }`}
              aria-label={`Explore AI idea for ${project.name}`}
              onClick={(e) => project.url === "N/A" && e.preventDefault()}
            >
              Explore Idea
              {project.url !== "N/A" && (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 ml-2 transform group-hover:translate-x-0.5 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              )}
            </a>
          ) : (
            <a
              href={project.url === "N/A" ? undefined : project.url}
              target={project.url === "N/A" ? undefined : "_blank"}
              rel={project.url === "N/A" ? undefined : "noopener noreferrer"}
              className={`flex-1 inline-flex items-center justify-center px-3 py-2 border text-xs font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-200 ease-in-out group-hover:shadow-lg 
                ${project.url === "N/A" 
                  ? 'border-slate-600 text-slate-400 cursor-default group-hover:shadow-none' 
                  : 'border-teal-500 text-teal-300 hover:bg-teal-500 hover:text-slate-900 focus:ring-teal-400 group-hover:shadow-teal-500/40'
                }`}
              aria-label={`View project ${project.name} ${project.platform !== 'AI Suggestion' ? `on ${project.platform}` : '(AI Concept)'}`}
              onClick={(e) => project.url === "N/A" && e.preventDefault()}
            >
              View Project
              {project.url !== "N/A" && (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 ml-2 transform group-hover:translate-x-0.5 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              )}
            </a>
          )}
      </div>
    </div>
  );
};

export default ProjectCard;
