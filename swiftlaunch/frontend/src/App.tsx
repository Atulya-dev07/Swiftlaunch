import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Result } from '@swiftlaunch/shared';
import { SearchBar } from './components/SearchBar.js';
import { ResultsList } from './components/ResultsList.js';
import './index.css';

const DUMMY_RESULTS: Result[] = [
  {
    id: '1',
    icon: '🧮',
    title: 'Calculator',
    subtitle: 'Perform fast math calculations'
  },
  {
    id: '2',
    icon: '⚙️',
    title: 'System Settings',
    subtitle: 'Configure system parameters'
  },
  {
    id: '3',
    icon: '💻',
    title: 'Terminal',
    subtitle: 'Open command line terminal'
  }
];

export const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasApi = !!(window.api && typeof window.api.search === 'function');

  // Debounced search via IPC
  const doSearch = useCallback(
    (q: string) => {
      if (!hasApi) {
        // Browser fallback: filter dummy results
        const filtered = DUMMY_RESULTS.filter(
          (item) =>
            item.title.toLowerCase().includes(q.toLowerCase()) ||
            item.subtitle.toLowerCase().includes(q.toLowerCase())
        );
        setResults(filtered);
        setSelectedIndex(0);
        return;
      }

      if (!q.trim()) {
        setResults([]);
        setSelectedIndex(0);
        return;
      }

      window.api!.search(q).then((res) => {
        setResults(res);
        setSelectedIndex(0);
      }).catch((err) => {
        console.error('[Search] Error:', err);
        setResults([]);
      });
    },
    [hasApi]
  );

  const handleQueryChange = useCallback(
    (q: string) => {
      setQuery(q);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => doSearch(q), 150);
    },
    [doSearch]
  );

  useEffect(() => {
    // Validate IPC ping round-trip on mount
    if (window.api && typeof window.api.ping === 'function') {
      window.api
        .ping()
        .then((response) => {
          console.log(`[IPC] Ping response: ${response}`);
        })
        .catch((err) => {
          console.error('[IPC] Ping error:', err);
        });
    } else {
      console.log('[Browser Mode] window.api unavailable');
    }

    // Listen for provider warnings
    if (window.api && typeof window.api.onProviderWarning === 'function') {
      window.api.onProviderWarning((message) => {
        console.warn(`[Provider Warning] ${message}`);
      });
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (window.api && typeof window.api.hideWindow === 'function') {
          window.api.hideWindow();
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && results.length > 0) {
        e.preventDefault();
        const selected = results[selectedIndex];
        if (selected && window.api) {
          window.api.executeAction(selected.id, selected.actionId);
          window.api.logUsage(query, selected.id);
          window.api.hideWindow();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [results, selectedIndex, query]);

  return (
    <div className="launcher-window">
      <SearchBar query={query} onQueryChange={handleQueryChange} />
      <ResultsList results={results} selectedIndex={selectedIndex} />
    </div>
  );
};

export default App;
