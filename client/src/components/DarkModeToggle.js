import React from 'react';
import { useDarkMode } from '../context/DarkModeContext';

const DarkModeToggle = ({ className = '' }) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className={`
        relative inline-flex items-center justify-center
        w-12 h-12 rounded-xl
        bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800
        border border-gray-300 dark:border-gray-600
        shadow-lg hover:shadow-xl
        transition-all duration-300 ease-in-out
        hover:scale-105 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-primary-500/20
        group overflow-hidden
        ${className}
      `}
      title={isDarkMode ? 'Açık Moda Geç' : 'Karanlık Moda Geç'}
      aria-label={isDarkMode ? 'Açık Moda Geç' : 'Karanlık Moda Geç'}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Icon Container */}
      <div className="relative z-10 flex items-center justify-center">
        {/* Sun Icon - Açık mod için */}
        <svg
          className={`
            w-6 h-6 text-yellow-500 transition-all duration-500 ease-in-out
            ${isDarkMode ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}
            absolute
          `}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
        </svg>

        {/* Moon Icon - Karanlık mod için */}
        <svg
          className={`
            w-6 h-6 text-blue-400 transition-all duration-500 ease-in-out
            ${isDarkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}
            absolute
          `}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
        </svg>
      </div>

      {/* Hover Effect Ring */}
      <div className="absolute inset-0 rounded-xl border-2 border-primary-300 opacity-0 group-hover:opacity-30 scale-95 group-hover:scale-100 transition-all duration-300"></div>
      
      {/* Active State Indicator */}
      <div className={`
        absolute -top-1 -right-1 w-3 h-3 rounded-full
        transition-all duration-300
        ${isDarkMode 
          ? 'bg-blue-400 shadow-lg shadow-blue-400/50' 
          : 'bg-yellow-400 shadow-lg shadow-yellow-400/50'
        }
      `}></div>
    </button>
  );
};

export default DarkModeToggle;
