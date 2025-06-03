import React, { useState, useCallback, useEffect } from 'react';
import { UserPreferences, Project, ProjectDiscoveryResult } from './types';
import { fetchPublicProjects } from './services/projectDiscoveryService';
import { fetchAIRecommendations } from './services/geminiService'; 
import UserInputForm from './components/UserInputForm';
import ProjectCard from './components/ProjectCard';
import LoadingSpinner from './components/LoadingSpinner';
import Header from './components/Header';
import Footer from './components/Footer';
import Pagination from './components/Pagination'; 
import ProjectDetailModal from './components/ProjectDetailModal';
import { CHARACTERISTICS_OPTIONS } from './constants';

const BOOKMARKED_PROJECTS_STORAGE_KEY = 'devDiscoveryAIBookmarkedProjects';

const getProjectId = (project: Project): string => {
  return `${project.platform.toLowerCase()}-${project.name.toLowerCase()}`;
};

const App: React.FC = () => {
  const [allFetchedProjects, setAllFetchedProjects] = useState<Project[]>([]);
  const [currentDisplayedProjects, setCurrentDisplayedProjects] = useState<Project[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [projectsPerPage] = useState<number>(200); 

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [partialErrorMessages, setPartialErrorMessages] = useState<string[]>([]);

  const [aiSuggestions, setAiSuggestions] = useState<Project[]>([]);
  const [isFetchingAISuggestions, setIsFetchingAISuggestions] = useState<boolean>(false);
  const [aiSuggestionsError, setAiSuggestionsError] = useState<string | null>(null);
  const [lastUserPreferences, setLastUserPreferences] = useState<UserPreferences | null>(null);

  const [selectedProjectForModal, setSelectedProjectForModal] = useState<Project | null>(null);
  const [isProjectDetailModalOpen, setIsProjectDetailModalOpen] = useState<boolean>(false);

  const [bookmarkedProjectIds, setBookmarkedProjectIds] = useState<string[]>([]);
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState<boolean>(false);

  useEffect(() => {
    try {
      const storedBookmarks = localStorage.getItem(BOOKMARKED_PROJECTS_STORAGE_KEY);
      if (storedBookmarks) {
        setBookmarkedProjectIds(JSON.parse(storedBookmarks));
      }
    } catch (e) {
      console.error("Failed to load bookmarks from localStorage:", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(BOOKMARKED_PROJECTS_STORAGE_KEY, JSON.stringify(bookmarkedProjectIds));
    } catch (e) {
      console.error("Failed to save bookmarks to localStorage:", e);
    }
  }, [bookmarkedProjectIds]);

  const enrichProjectsWithBookmarkStatus = useCallback((projects: Project[]): Project[] => {
    return projects.map(p => ({
      ...p,
      isBookmarked: bookmarkedProjectIds.includes(getProjectId(p)),
    }));
  }, [bookmarkedProjectIds]);

  // Effect to re-enrich project lists when bookmarks change
  useEffect(() => {
    setAllFetchedProjects(prevProjects => enrichProjectsWithBookmarkStatus(prevProjects));
    setAiSuggestions(prevProjects => enrichProjectsWithBookmarkStatus(prevProjects));
  }, [bookmarkedProjectIds, enrichProjectsWithBookmarkStatus]);


  const handleFormSubmit = useCallback(async (preferences: UserPreferences) => {
    setIsLoading(true);
    setError(null);
    setPartialErrorMessages([]);
    setAllFetchedProjects([]);
    setCurrentDisplayedProjects([]);
    setCurrentPage(1); 
    setHasSearched(true);
    setLastUserPreferences(preferences); 

    setAiSuggestions([]);
    setAiSuggestionsError(null);

    try {
      const result: ProjectDiscoveryResult = await fetchPublicProjects(preferences);
      const processedProjects = enrichProjectsWithBookmarkStatus(result.projects);

      // Enhanced filtering with more flexible matching
      const userLanguages = preferences.languages.split(',').map(l => l.trim().toLowerCase()).filter(Boolean);
      const userTopics = preferences.topics.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
      const userCharacteristics = preferences.characteristics || [];

      const filteredProjects = processedProjects.filter((project: Project) => {
        // Language match (any of the user languages)
        const matchesLanguage = userLanguages.length === 0 || 
          (project.language && userLanguages.includes(project.language.toLowerCase()));

        // Topic match (any of the user topics in tags or description)
        const matchesTopic = userTopics.length === 0 || 
          (project.tags && userTopics.some(topic => 
            project.tags.map(t => t.toLowerCase()).includes(topic) ||
            (project.description && project.description.toLowerCase().includes(topic))
          ));

        // Characteristics match (at least one characteristic must be present)
        const matchesCharacteristics = userCharacteristics.length === 0 || 
          userCharacteristics.some(char => {
            const charOption = CHARACTERISTICS_OPTIONS.find(c => c.id === char);
            if (!charOption) return false;
            return project.tags && project.tags.some(tag => 
              tag.toLowerCase().includes(charOption.label.toLowerCase())
            );
          });

        return matchesLanguage && matchesTopic && matchesCharacteristics;
      });

      // If no projects match the strict criteria, try a more lenient filter
      if (filteredProjects.length === 0) {
        const lenientFilteredProjects = processedProjects.filter((project: Project) => {
          // Language match (any of the user languages)
          const matchesLanguage = userLanguages.length === 0 || 
            (project.language && userLanguages.includes(project.language.toLowerCase()));

          // Topic match (any of the user topics in tags or description)
          const matchesTopic = userTopics.length === 0 || 
            (project.tags && userTopics.some(topic => 
              project.tags.map(t => t.toLowerCase()).includes(topic) ||
              (project.description && project.description.toLowerCase().includes(topic))
            ));

          return matchesLanguage || matchesTopic;
        });

        if (lenientFilteredProjects.length > 0) {
          setAllFetchedProjects(lenientFilteredProjects);
          setPartialErrorMessages(result.partialErrors);
          setLastUserPreferences(preferences);
          return;
        }
      }

      setAllFetchedProjects(filteredProjects);
      setPartialErrorMessages(result.partialErrors);
      setLastUserPreferences(preferences);

    } catch (err) { 
      const generalErrorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(`A critical error occurred: ${generalErrorMessage}. Please check your connection and try again.`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [enrichProjectsWithBookmarkStatus]);

  useEffect(() => {
    let projectsToDisplay = allFetchedProjects;
    if (showBookmarkedOnly) {
      projectsToDisplay = allFetchedProjects.filter(p => p.isBookmarked);
    }

    if (projectsToDisplay.length > 0) {
      const startIndex = (currentPage - 1) * projectsPerPage;
      const endIndex = startIndex + projectsPerPage;
      setCurrentDisplayedProjects(projectsToDisplay.slice(startIndex, endIndex));
    } else {
      setCurrentDisplayedProjects([]); 
    }
  }, [allFetchedProjects, currentPage, projectsPerPage, showBookmarkedOnly]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    const resultsSection = document.getElementById('results-section');
    if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFetchAISuggestions = useCallback(async () => {
    if (!lastUserPreferences) return;
    setIsFetchingAISuggestions(true);
    setAiSuggestionsError(null);
    setAiSuggestions([]);
    try {
      const aiResult = await fetchAIRecommendations(lastUserPreferences);
      setAiSuggestions(enrichProjectsWithBookmarkStatus(aiResult)); 
      if (aiResult.length === 0) {
        setAiSuggestionsError("The AI couldn't generate suggestions for these criteria. Try different filters.");
      }
    } catch (err) {
      const aiErrorMessage = err instanceof Error ? err.message : 'An unexpected error occurred while fetching AI suggestions.';
      setAiSuggestionsError(aiErrorMessage);
      console.error(err);
    } finally {
      setIsFetchingAISuggestions(false);
    }
  }, [lastUserPreferences, enrichProjectsWithBookmarkStatus]);
  
  const totalPages = Math.ceil(
    (showBookmarkedOnly ? allFetchedProjects.filter(p => p.isBookmarked) : allFetchedProjects).length / projectsPerPage
  );

  const handleOpenProjectDetailModal = (project: Project) => {
    if (project) { 
      setSelectedProjectForModal(project);
      setIsProjectDetailModalOpen(true);
    } else {
      console.error("Attempted to open modal with no project selected.");
    }
  };
  const handleCloseProjectDetailModal = () => {
    setIsProjectDetailModalOpen(false);
    setTimeout(() => setSelectedProjectForModal(null), 300); 
  };

  const toggleBookmark = (project: Project) => {
    const projectId = getProjectId(project);
    setBookmarkedProjectIds((prevIds: string[]) => 
      prevIds.includes(projectId) 
        ? prevIds.filter((id: string) => id !== projectId)
        : [...prevIds, projectId]
    );
  };

  const handleShowBookmarkedToggle = () => {
    setCurrentPage(1); 
    setShowBookmarkedOnly(prev => !prev);
  };

  const currentListForDisplay = showBookmarkedOnly ? allFetchedProjects.filter(p => p.isBookmarked) : allFetchedProjects;
  
  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-200">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="lg:flex lg:gap-x-8">
          <aside className="lg:w-1/3 xl:w-1/4 mb-8 lg:mb-0 lg:sticky lg:top-28 self-start max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar pr-2">
            <UserInputForm 
              onSubmit={handleFormSubmit} 
              isLoading={isLoading}
              onFetchAISuggestions={handleFetchAISuggestions}
              isFetchingAISuggestions={isFetchingAISuggestions}
              showAIButton={!!lastUserPreferences}
              lastUserPreferences={lastUserPreferences}
            />
          </aside>

          <div className="lg:w-2/3 xl:w-3/4 lg:pl-4" id="results-section">
            {isLoading && <LoadingSpinner />}

            {partialErrorMessages.length > 0 && (!error || (error && !error.includes("All available platforms failed"))) && (
                 <div className="my-6 p-4 bg-yellow-600/10 border border-yellow-500/40 text-yellow-200 rounded-lg shadow-md text-sm" role="alert">
                    <div className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2.5 text-yellow-300 flex-shrink-0 mt-0.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.008v.008H12v-.008Z" />
                        </svg>
                        <div>
                            <h4 className="font-semibold text-yellow-100">Search Issues:</h4>
                            <ul className="list-disc list-inside mt-1">
                                {partialErrorMessages.map((msg, idx) => <li key={idx}>{msg}</li>)}
                            </ul>
                             {allFetchedProjects.length > 0 && <p className="mt-2">Displaying results from successfully queried platforms.</p>}
                        </div>
                    </div>
                </div>
            )}

            {error && (
              <div className="my-8 p-6 bg-red-600/10 border border-red-500/40 text-red-200 rounded-lg shadow-lg text-center" role="alert">
                <div className="flex items-center justify-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mr-3 text-red-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.008v.008H12v-.008Z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-red-100">Discovery Issue</h3>
                </div>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {!isLoading && !error && currentDisplayedProjects.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-700">
                    <h2 className="text-2xl md:text-3xl font-bold text-teal-300">
                    <span className="mr-2.5 text-3xl md:text-4xl">✨</span>
                    {showBookmarkedOnly ? `Bookmarked Projects (${currentListForDisplay.length})` : `Discovered Projects (${currentListForDisplay.length})`}
                    </h2>
                    <button
                        onClick={handleShowBookmarkedToggle}
                        className="px-4 py-2 text-xs font-semibold rounded-lg transition-colors duration-150 ease-in-out
                                   bg-slate-700 hover:bg-slate-600 text-teal-300 border border-slate-600 hover:border-teal-500"
                    >
                        {showBookmarkedOnly ? 'Show All Projects' : `Show Bookmarked (${bookmarkedProjectIds.length})`}
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-x-6 gap-y-8">
                  {currentDisplayedProjects.map((project) => (
                    <ProjectCard 
                        key={getProjectId(project)} 
                        project={project} 
                        onOpenModal={handleOpenProjectDetailModal}
                        onToggleBookmark={toggleBookmark}
                    />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </div>
            )}
            
            {!isLoading && !error && allFetchedProjects.length === 0 && hasSearched && !showBookmarkedOnly && (
              <div className="text-center text-slate-400 py-12 px-6 bg-slate-800 rounded-xl shadow-xl border border-slate-700">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-20 h-20 mx-auto mb-6 text-slate-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 13.5L11 11" />
                   <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75l-2.489-2.489m0 0A3.375 3.375 0 108.25 8.25a3.375 3.375 0 00-4.773 4.773m0-4.773L8.25 10.5" />
                </svg>
                <p className="text-xl font-semibold text-slate-200">No Projects Found</p>
                <p className="mt-2 text-slate-300">We couldn't find projects matching your current filters from the available platforms. Try adjusting your criteria!</p>
                 {partialErrorMessages.length > 0 && <p className="mt-3 text-xs text-yellow-300">Note: Some platforms had issues: {partialErrorMessages.join(', ')}</p>}
              </div>
            )}

             {!isLoading && showBookmarkedOnly && currentListForDisplay.length === 0 && (
                <div className="text-center text-slate-400 py-12 px-6 bg-slate-800 rounded-xl shadow-xl border border-slate-700">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-20 h-20 mx-auto mb-6 text-slate-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c-.1.198-.207.4-.32.604a12.034 12.034 0 01-1.19 2.756C14.773 8.543 13.37 10.5 12 10.5s-2.773-1.957-3.968-3.818a12.036 12.036 0 01-1.19-2.756c-.113-.204-.22-.406-.32-.604m11.054 0a1.18 1.18 0 00-2.156 0m-8.898 0a1.18 1.18 0 00-2.156 0m13.21 0C16.932 1.963 14.68 1.5 12 1.5s-4.932.463-6.604 1.822m13.21 0C17.227 5.952 14.863 8.5 12 8.5s-5.227-2.548-6.604-5.178" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.353 7.646a.75.75 0 011.06-1.06l2.122 2.121.707-.707a.75.75 0 011.06 0l.707.707 2.121-2.121a.75.75 0 011.061 1.06l-2.121 2.12.706.708a.75.75 0 010 1.06l-.706.707 2.12 2.121a.75.75 0 01-1.06 1.06l-2.121-2.12-.707.706a.75.75 0 01-1.06 0l-.707-.706-2.121 2.12a.75.75 0 01-1.06-1.06l2.12-2.121-.706-.707a.75.75 0 010-1.06l.706-.707L6.353 7.646z" />
                    </svg>
                    <p className="text-xl font-semibold text-slate-200">No Bookmarked Projects</p>
                    <p className="mt-2 text-slate-300">You haven't bookmarked any projects yet. Click the star icon on a project card to save it!</p>
                </div>
            )}

            {!isLoading && !hasSearched && (
              <div className="text-center text-slate-400 py-16 px-6 bg-gradient-to-br from-slate-800 via-slate-800/80 to-slate-800 rounded-xl shadow-2xl border border-slate-700">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-24 h-24 mx-auto mb-6 text-teal-400 filter drop-shadow(0 0 10px rgba(20, 184, 166,0.5))">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12V8.25a4.5 4.5 0 014.5 4.5v3.75M12.75 15h3.75M12.75 18h3.75M9.75 15h.008v.008H9.75V15zm.008 0-.008.008m.008 0-.008-.008m0 0 .008-.008m0 0 .008.008zm-3.75 0h.008v.008H6v-.008zm.008 0-.008.008M6 15l.008.008M6 15l-.008.008m0 0 .008-.008m.008 0 .008.008zm2.25-4.5h.008v.008H8.25v-.008zm.008 0-.008.008M8.25 10.5l.008.008M8.25 10.5l-.008.008m0 0 .008-.008M10.5 10.5h.008V10.5h-.008zm.008 0-.008.008m.008 0-.008-.008M10.5 10.5l.008.008M10.5 10.5l.008-.008" />
                </svg>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-3">Embark on Your Open Source Journey</h2>
                <p className="mt-2 text-slate-300 max-w-xl mx-auto">Use the filters on the left to specify your interests. We'll search across available platforms to guide you to exciting open source projects!</p>
              </div>
            )}
            
            {isFetchingAISuggestions && (
                <div className="mt-8"> <LoadingSpinner /> </div>
            )}

            {aiSuggestionsError && !isFetchingAISuggestions &&(
              <div className="my-8 p-4 bg-red-600/10 border border-red-500/40 text-red-200 rounded-lg shadow-md text-sm" role="alert">
                <div className="flex items-center">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2.5 text-red-300 flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.008v.008H12v-.008Z" />
                  </svg>
                  <span className="font-semibold mr-1">AI Suggestion Error:</span> {aiSuggestionsError}
                </div>
              </div>
            )}

            {aiSuggestions.length > 0 && !aiSuggestionsError && !isFetchingAISuggestions && (
              <div className="mt-10">
                <h2 className="text-2xl md:text-3xl font-bold text-purple-400 mb-6 pb-3 border-b border-slate-700">
                  <span className="mr-2.5 text-3xl md:text-4xl">💡</span>AI-Powered Suggestions ({aiSuggestions.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-x-6 gap-y-8">
                  {aiSuggestions.map((project, index) => (
                    <ProjectCard 
                        key={`ai-${getProjectId(project)}-${index}`} 
                        project={project} 
                        onOpenModal={handleOpenProjectDetailModal}
                        onToggleBookmark={toggleBookmark}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <ProjectDetailModal 
        isOpen={isProjectDetailModalOpen}
        project={selectedProjectForModal}
        onClose={handleCloseProjectDetailModal}
      />
      <Footer />
    </div>
  );
};

export default App;
