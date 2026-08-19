import React, { useRef, useEffect } from 'react';
import { useSearchStore } from '../state/useSearchStore.js';
import { useUiStore } from '../state/useUiStore.js';
import { SearchModePills } from './SearchModePills.js';

interface SearchBarProps {
  onOpenSettings?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onOpenSettings }) => {
  const query = useSearchStore((state) => state.query);
  const setQuery = useSearchStore((state) => state.setQuery);
  const isLoading = useSearchStore((state) => state.isLoading);
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);
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
    <header className="search-header">
      <div className="search-header-top">
        <div className="brand-group">
          <span className="brand-logo">SwiftLaunch</span>
          <span className="brand-pill">v0.1</span>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="icon-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <span className="material-symbols-outlined">
              {theme === 'dark' ? 'dark_mode' : 'light_mode'}
            </span>
          </button>
          {onOpenSettings && (
            <button
              type="button"
              className="icon-btn"
              onClick={onOpenSettings}
              title="Open Settings"
            >
              <span className="material-symbols-outlined">settings</span>
            </button>
          )}
        </div>
      </div>

      <div className="search-input-wrapper">
        <div className="search-icon-box">
          {isLoading ? (
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
          ) : (
            <span className="material-symbols-outlined">search</span>
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder="Search apps, files, clipboard, math..."
          value={query}
          onChange={(e) => {
            console.log(`[SearchBar] Input query: "${e.target.value}"`);
            setQuery(e.target.value);
          }}
          autoFocus
          spellCheck={false}
          autoComplete="off"
        />

        <div className="search-meta-right">
          {query.length > 0 ? (
            <button
              type="button"
              className="search-clear-btn"
              onClick={handleClear}
              title="Clear search"
            >
              ✕
            </button>
          ) : (
            <span className="shortcut-chip">⌘K</span>
          )}
        </div>
      </div>

      <SearchModePills />
    </header>
  );
};
