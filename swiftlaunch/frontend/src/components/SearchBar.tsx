import React, { useRef, useEffect } from 'react';
import { useSearchStore } from '../state/useSearchStore.js';
import { SearchModePills } from './SearchModePills.js';

export const SearchBar: React.FC = () => {
  const query = useSearchStore((state) => state.query);
  const setQuery = useSearchStore((state) => state.setQuery);
  const isLoading = useSearchStore((state) => state.isLoading);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Keep focus in input when launcher opens
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div className="search-bar-container">
      <div className="search-bar-row">
        <div className="search-icon-wrapper">
          {isLoading ? (
            <span className="search-spinner" />
          ) : (
            <span className="search-icon">🔍</span>
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder="Search apps, files, clipboard, math expressions..."
          value={query}
          onChange={(e) => {
            console.log(`[SearchBar] Input query: "${e.target.value}"`);
            setQuery(e.target.value);
          }}
          autoFocus
          spellCheck={false}
          autoComplete="off"
        />

        {query.length > 0 && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={handleClear}
            title="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      <SearchModePills />
    </div>
  );
};
