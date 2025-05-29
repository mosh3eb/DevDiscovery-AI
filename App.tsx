import React, { useState, useCallback, useMemo } from 'react';
import { searchAllSources } from './services/publicSourceService';
import UserInputForm from './components/UserInputForm';
import ProjectCard from './components/ProjectCard';
import LoadingSpinner from './components/LoadingSpinner';
import Header from './components/Header';
import Footer from './components/Footer';
import Pagination from './components/Pagination';
import ManualSearchLinks from './components/ManualSearchLinks';
import ProjectComparison from './components/ProjectComparison';
import FilterBar from './components/FilterBar';
import { Project, UserPreferences } from './services/types';

const PROJECTS_PER_PAGE = 50;

const App: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortBy, setSortBy] = useState<string>('relevance');
  
  const [currentLanguages, setCurrentLanguages] = useState<string>('');
  const [currentTopics, setCurrentTopics] = useState<string>('');
  const [selectedProjects, setSelectedProjects] = useState<Project[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [bookmarkedProjects, setBookmarkedProjects] = useState<Project[]>([]);
  const [showBookmarks, setShowBookmarks] = useState(false);

  const handleFormSubmit = useCallback(async (preferences: UserPreferences) => {
    if (!preferences.languages.trim() && !preferences.topics.trim()) {
      setError("Please enter at least one valid programming language or topic to search for.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setCurrentPage(1);
    setSelectedProjects([]);
    setShowComparison(false);

    try {
      const projects = await searchAllSources({
        languages: preferences.languages,
        topics: preferences.topics,
        characteristics: preferences.characteristics || []
      });

      if (projects.length === 0) {
        setError("No projects found matching your criteria. Try adjusting your filters or broadening your search!");
      } else {
        setRecommendations(projects);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred while searching for projects.');
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  }, []);

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const sortedProjects = useMemo(() => {
    if (!recommendations.length) return [];
    
    const sorted = [...recommendations].sort((a, b) => {
      switch (sortBy) {
        case 'stars':
          return ((b.stars || 0) - (a.stars || 0)) || 
                 ((b.relevanceScore || 0) - (a.relevanceScore || 0));
        case 'updated':
          const dateA = new Date(a.lastUpdate || '1970-01-01').getTime();
          const dateB = new Date(b.lastUpdate || '1970-01-01').getTime();
          return (dateB - dateA) ||
                 ((b.relevanceScore || 0) - (a.relevanceScore || 0));
        case 'relevance':
        default:
          return ((b.relevanceScore || 0) - (a.relevanceScore || 0)) ||
                 ((b.stars || 0) - (a.stars || 0));
      }
    });

    return sorted;
  }, [recommendations, sortBy]);

  const currentProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * PROJECTS_PER_PAGE;
    return sortedProjects.slice(startIndex, startIndex + PROJECTS_PER_PAGE);
  }, [sortedProjects, currentPage]);

  const totalPages = Math.ceil(sortedProjects.length / PROJECTS_PER_PAGE);

  const paginate = useCallback((pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [totalPages]);

  const showManualSearchLinks = currentLanguages.trim() !== '' || currentTopics.trim() !== '';

  const handleCompare = (project: Project) => {
    if (selectedProjects.includes(project)) {
      setSelectedProjects(prev => prev.filter(p => p.url !== project.url));
    } else {
      setSelectedProjects(prev => [...prev, project]);
    }
  };

  const toggleComparison = () => {
    setShowComparison(prev => !prev);
  };

  const handleBookmark = (project: Project) => {
    setBookmarkedProjects(prev => {
      const isBookmarked = prev.some(p => p.url === project.url);
      if (isBookmarked) {
        return prev.filter(p => p.url !== project.url);
      } else {
        return [...prev, project];
      }
    });
  };

  const isProjectBookmarked = (project: Project) => {
    return bookmarkedProjects.some(p => p.url === project.url);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="lg:flex lg:gap-x-8">
          {/* Sidebar */}
          <aside className="lg:w-1/3 xl:w-1/4 mb-8 lg:mb-0 lg:sticky lg:top-28 self-start max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar pr-1 lg:border-r lg:border-slate-700/60 lg:pr-6 xl:pr-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-sky-300">Search Projects</h2>
              <button
                onClick={() => setShowBookmarks(!showBookmarks)}
                className="text-slate-400 hover:text-slate-300 transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                </svg>
                <span className="text-sm font-medium">
                  Bookmarks {bookmarkedProjects.length > 0 && `(${bookmarkedProjects.length})`}
                </span>
              </button>
            </div>

            {/* UserInputForm or Bookmarks */}
            {!showBookmarks ? (
              <UserInputForm 
                onSubmit={handleFormSubmit} 
                isLoading={isLoading}
                languages={currentLanguages}
                onLanguagesChange={setCurrentLanguages}
                topics={currentTopics}
                onTopicsChange={setCurrentTopics}
              />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-sky-300">Bookmarked Projects</h3>
                  <button
                    onClick={() => setShowBookmarks(false)}
                    className="text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {bookmarkedProjects.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto mb-3 text-slate-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                    </svg>
                    <p>No bookmarked projects yet</p>
                    <p className="text-sm mt-1">Bookmark projects to save them for later</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookmarkedProjects.map((project) => (
                      <div key={project.url} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sky-300">{project.name}</h4>
                          <button
                            onClick={() => handleBookmark(project)}
                            className="text-yellow-400 hover:text-yellow-300 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-sm text-slate-300 line-clamp-2 mb-2">{project.description}</p>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-700 text-slate-300">
                            {project.language}
                          </span>
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:text-indigo-300 text-xs inline-flex items-center"
                          >
                            View Project
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 ml-1">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </aside>

          {/* Main Content */}
          <div className="lg:w-2/3 xl:w-3/4">
            {isLoading ? (
              <div className="bg-slate-800/90 rounded-xl shadow-xl border border-slate-700 p-8 transition-opacity duration-300 ease-in-out">
                <LoadingSpinner message="Loading projects..." progress={0} />
              </div>
            ) : error ? (
              <div className="text-center py-12 bg-slate-800/90 rounded-xl shadow-xl border border-slate-700 transition-all duration-300 ease-in-out">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto mb-4 text-slate-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <p className="text-lg font-semibold text-slate-200 mb-2">{error}</p>
                <p className="text-sm text-slate-400">Try adjusting your search criteria or using different terms.</p>
              </div>
            ) : null}

            {!isLoading && !error && recommendations.length > 0 && (
              <div className="transition-all duration-300 ease-in-out">
                {!showBookmarks && hasSearched && (
                  <>
                    <FilterBar
                      sortBy={sortBy}
                      onSortChange={handleSortChange}
                      totalResults={recommendations.length}
                      selectedProjectsCount={selectedProjects.length}
                      onCompareClick={toggleComparison}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
                      {currentProjects.map((project, index) => (
                        <div key={`${project.url}-${index}`} className="h-full flex transition-all duration-300 ease-in-out transform hover:scale-[1.02]">
                            <ProjectCard
                              project={project}
                              onCompare={handleCompare}
                              isSelected={selectedProjects.some(p => p.url === project.url)}
                              comparisonCount={selectedProjects.length}
                              onBookmark={handleBookmark}
                              isBookmarked={isProjectBookmarked(project)}
                            />
                          </div>
                      ))}
                    </div>
                  </>
                )}

                {recommendations.length > 0 && (
                  <div className="transition-all duration-300 ease-in-out">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={paginate}
                      resultsPerPage={PROJECTS_PER_PAGE}
                      totalResults={recommendations.length}
                    />
                  </div>
                )}
              </div>
            )}

            {!isLoading && !error && recommendations.length === 0 && hasSearched && (
              <div className="text-center text-slate-400 py-10 sm:py-12 px-4 sm:px-6 bg-slate-800 rounded-xl shadow-xl border border-slate-700 my-6 md:my-8">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-5 sm:mb-6 text-slate-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.773 4.773zM21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 13.5L13.5 10.5" />
                </svg>
                <p className="text-lg sm:text-xl font-semibold text-slate-200">No Projects Found</p>
                <p className="mt-2 text-sm sm:text-base text-slate-400">No projects found matching your current filters. Try adjusting your criteria, or use the manual search options {showManualSearchLinks ? 'below' : 'by entering languages or topics'}.</p>
              </div>
            )}

            {!isLoading && !hasSearched && !error && (
              <div className="text-center text-slate-300 py-12 sm:py-16 px-4 sm:px-6 bg-gradient-to-br from-slate-800/90 to-slate-800/70 rounded-xl shadow-2xl border border-slate-700 my-6 md:my-8">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-5 sm:mb-6 text-indigo-400 filter drop-shadow-[0_0_15px_rgba(129,140,248,0.35)]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.75L7.5 2.25M9.75 3.75L12 2.25m2.25-1.5L12 2.25m2.25-1.5L14.25 2.25M9.75 20.25l2.25 1.5m0 0l2.25-1.5m-2.25 1.5V14.25m-2.25-1.5L9.75 11.25m0 0L7.5 9.75M9.75 11.25L12 9.75m2.25 1.5l-2.25-1.5m2.25 1.5L14.25 11.25" />
                </svg>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-50 mb-3">Embark on Your Open Source Quest</h2>
                <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-md sm:max-w-xl mx-auto">
                  Define your interests using the filters on the left. Then, choose your path:
                  Click "Find Projects" to explore open source projects that match your criteria, or use the manual search links that appear as you type to explore platforms like GitHub and GitLab directly.
                </p>
              </div>
            )}
            
            {showManualSearchLinks && (
                <ManualSearchLinks 
                    languages={currentLanguages} 
                    topics={currentTopics} 
                />
            )}
          </div>
        </div>

        {/* Project Comparison Modal */}
        {showComparison && selectedProjects.length > 0 && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-sky-300">Project Comparison</h2>
                <button
                  onClick={toggleComparison}
                  className="text-slate-400 hover:text-slate-300 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <ProjectComparison
                  projects={selectedProjects}
                  onClose={toggleComparison}
                />
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default App;
