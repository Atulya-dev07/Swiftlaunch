import React, { useRef, useEffect } from 'react';
import { useSearchStore } from '../state/useSearchStore.js';

interface SearchBarProps {
  onOpenSettings?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onOpenSettings }) => {
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
    <div
      className="search-bar-wrapper"
      onContextMenu={(e) => {
        if (onOpenSettings) {
          e.preventDefault();
          onOpenSettings();
        }
      }}
    >
      <div className="search-input-pill">
        <div className="search-icon-box">
          {isLoading ? (
            <span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>
              progress_activity
            </span>
          ) : (
            <svg
              className="search-lens-svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder="Search applications, files and settings..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
          autoFocus
          spellCheck={false}
          autoComplete="off"
        />

        <div className="search-actions-right">
          {query.length > 0 && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={handleClear}
              title="Clear search"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
          <span className="search-return-symbol" title="Press Enter to launch">
            ↵
          </span>
        </div>
      </div>
    </div>
  );
};
