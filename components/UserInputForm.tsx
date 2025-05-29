import React, { useState } from 'react';
import { UserPreferences, CharacteristicOption } from '../services/types';
import { CHARACTERISTICS_OPTIONS } from '../constants';
import Checkbox from './Checkbox';

interface UserInputFormProps {
  onSubmit: (preferences: UserPreferences) => void;
  isLoading: boolean;
  languages: string;
  onLanguagesChange: (value: string) => void;
  topics: string;
  onTopicsChange: (value: string) => void;
}

const UserInputForm: React.FC<UserInputFormProps> = ({ 
  onSubmit, 
  isLoading,
  languages,
  onLanguagesChange,
  topics,
  onTopicsChange
}) => {
  const [selectedCharacteristics, setSelectedCharacteristics] = useState<string[]>([]);

  const handleCharacteristicChange = (characteristicId: string, isChecked: boolean) => {
    setSelectedCharacteristics(prev =>
      isChecked ? [...prev, characteristicId] : prev.filter(id => id !== characteristicId)
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({ 
      languages, 
      topics, 
      characteristics: selectedCharacteristics
    });
  };

  return (
    <div className="bg-slate-800 p-4 sm:p-6 rounded-xl shadow-2xl border border-slate-700/70">
      <h2 className="text-lg sm:text-xl font-semibold text-sky-400 mb-5 sm:mb-6 border-b border-slate-700 pb-3 sm:pb-4">
        <span className="mr-2">🛠️</span>Discover Projects
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-7">
        <div>
          <label htmlFor="languages" className="block text-xs sm:text-sm font-medium text-indigo-300 mb-1 sm:mb-1.5">
            Programming Languages
          </label>
          <input
            type="text"
            id="languages"
            value={languages}
            onChange={(e) => onLanguagesChange(e.target.value)}
            placeholder="e.g., Python, JavaScript"
            className="w-full p-2.5 sm:p-3 text-sm sm:text-base bg-slate-700 border border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-100 placeholder-slate-400 transition-colors"
            disabled={isLoading}
            aria-describedby="languages-description"
          />
          <p id="languages-description" className="mt-1 sm:mt-1.5 text-[0.65rem] sm:text-xs text-slate-400">Comma-separated list of programming languages</p>
        </div>

        <div>
          <label htmlFor="topics" className="block text-xs sm:text-sm font-medium text-indigo-300 mb-1 sm:mb-1.5">
            Topics / Domains
          </label>
          <input
            type="text"
            id="topics"
            value={topics}
            onChange={(e) => onTopicsChange(e.target.value)}
            placeholder="e.g., AI, Web Dev, Data Science"
            className="w-full p-2.5 sm:p-3 text-sm sm:text-base bg-slate-700 border border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-100 placeholder-slate-400 transition-colors"
            disabled={isLoading}
            aria-describedby="topics-description"
          />
          <p id="topics-description" className="mt-1 sm:mt-1.5 text-[0.65rem] sm:text-xs text-slate-400">Keywords related to project areas</p>
        </div>

        <div>
          <span className="block text-xs sm:text-sm font-medium text-indigo-300 mb-2 sm:mb-2.5">Project Characteristics</span>
          <div className="space-y-2 sm:space-y-3">
            {CHARACTERISTICS_OPTIONS.map((option: CharacteristicOption) => (
              <Checkbox
                key={option.id}
                id={option.id}
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
          disabled={isLoading || (!languages.trim() && !topics.trim() && selectedCharacteristics.length === 0)}
          className="w-full flex items-center justify-center px-4 sm:px-6 py-3 sm:py-3.5 border border-transparent text-sm sm:text-base font-semibold rounded-lg shadow-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 ease-in-out transform hover:scale-105 active:scale-95"
          aria-live="polite"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Discovering...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              Search Projects
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default UserInputForm;
