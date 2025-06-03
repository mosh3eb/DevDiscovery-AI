
import React, { useState, useEffect } from 'react';
import { UserPreferences, CharacteristicOption } from '../types'; 
import { CHARACTERISTICS_OPTIONS } from '../constants'; 
import Checkbox from './Checkbox';

interface UserInputFormProps {
  onSubmit: (preferences: Omit<UserPreferences, 'platforms'>) => void; 
  isLoading: boolean;
  onFetchAISuggestions: () => void;
  isFetchingAISuggestions: boolean;
  showAIButton: boolean;
  lastUserPreferences: UserPreferences | null; // Kept for AI button and potential future use
}

const UserInputForm: React.FC<UserInputFormProps> = ({ 
  onSubmit, 
  isLoading,
  onFetchAISuggestions,
  isFetchingAISuggestions,
  showAIButton,
  lastUserPreferences 
}) => {
  const [languages, setLanguages] = useState<string>('');
  const [topics, setTopics] = useState<string>('');
  const [selectedCharacteristics, setSelectedCharacteristics] = useState<string[]>([]);
  
  const handleCharacteristicChange = (characteristicId: string, isChecked: boolean) => {
    setSelectedCharacteristics(prev =>
      isChecked ? [...prev, characteristicId] : prev.filter(id => id !== characteristicId)
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({ languages, topics, characteristics: selectedCharacteristics });
  };
  
  // Effect to update form fields if lastUserPreferences changes (e.g., loaded from a potential future source)
  useEffect(() => {
    if (lastUserPreferences) {
        setLanguages(lastUserPreferences.languages);
        setTopics(lastUserPreferences.topics);
        setSelectedCharacteristics(lastUserPreferences.characteristics);
    }
  }, [lastUserPreferences]);


  const isSubmitDisabled = isLoading || (!languages && !topics && selectedCharacteristics.length === 0);
  const isAISubmitDisabled = isLoading || isFetchingAISuggestions;

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-700/60">
      <h2 className="text-xl font-semibold text-teal-300 mb-6 border-b border-slate-700 pb-4">
        <span className="mr-2">🛠️</span>Filter Your Discovery
      </h2>
      <form onSubmit={handleSubmit} className="space-y-7">
        <div>
          <label htmlFor="languages" className="block text-sm font-semibold text-teal-300 mb-1.5">
            Programming Languages
          </label>
          <input
            type="text"
            id="languages"
            value={languages}
            onChange={(e) => setLanguages(e.target.value)}
            placeholder="e.g., Python, JavaScript, Rust"
            className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-400 focus:border-teal-500 text-slate-100 placeholder-slate-400 transition-colors"
            disabled={isLoading}
            aria-describedby="languages-description"
          />
          <p id="languages-description" className="mt-1.5 text-xs text-slate-400">Comma-separated (e.g., javascript, python).</p>
        </div>

        <div>
          <label htmlFor="topics" className="block text-sm font-semibold text-teal-300 mb-1.5">
            Topics / Domains
          </label>
          <input
            type="text"
            id="topics"
            value={topics}
            onChange={(e) => setTopics(e.target.value)}
            placeholder="e.g., AI, Web Dev, Blockchain"
            className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-400 focus:border-teal-500 text-slate-100 placeholder-slate-400 transition-colors"
            disabled={isLoading}
            aria-describedby="topics-description"
          />
          <p id="topics-description" className="mt-1.5 text-xs text-slate-400">Keywords (e.g., machine-learning, game-dev).</p>
        </div>

        <div>
          <span className="block text-sm font-semibold text-teal-300 mb-2.5">Project Characteristics</span>
          <div className="space-y-3">
            {CHARACTERISTICS_OPTIONS.map((option: CharacteristicOption) => (
              <Checkbox
                key={option.id}
                id={`char-${option.id}`}
                label={option.label}
                checked={selectedCharacteristics.includes(option.id)}
                onChange={(isChecked) => handleCharacteristicChange(option.id, isChecked)}
                disabled={isLoading}
              />
            ))}
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="w-full flex items-center justify-center px-6 py-3.5 border border-transparent text-base font-semibold rounded-lg shadow-md text-white btn-primary-gradient focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 ease-in-out transform hover:scale-105 active:scale-95"
          aria-live="polite"
        >
          {isLoading && !isFetchingAISuggestions ? ( 
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Discovering Projects...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              Find Projects
            </>
          )}
        </button>
      </form>

      {showAIButton && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <button
            onClick={onFetchAISuggestions}
            disabled={isAISubmitDisabled}
            className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-md text-white btn-secondary-gradient focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 ease-in-out transform hover:scale-105 active:scale-95"
            aria-live="polite"
          >
            {isFetchingAISuggestions ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                AI is Conjuring Ideas...
              </>
            ) : (
               <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                Get AI Project Ideas
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserInputForm;
