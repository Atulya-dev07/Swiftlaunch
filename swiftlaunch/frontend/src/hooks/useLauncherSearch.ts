import { useEffect, useRef, useCallback } from 'react';
import { useSearchStore } from '../state/useSearchStore.js';
import { useComboStore } from '../state/useComboStore.js';

export function useLauncherSearch(debounceMs = 150) {
  const query = useSearchStore((state) => state.query);
  const setResults = useSearchStore((state) => state.setResults);
  const setIsLoading = useSearchStore((state) => state.setIsLoading);
  const setError = useSearchStore((state) => state.setError);

  const searchSeq = useRef(0);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const executeSearch = useCallback(
    async (searchQuery: string) => {
      const currentSeq = ++searchSeq.current;
      const trimmed = searchQuery.trim();

      if (!trimmed) {
        if (searchSeq.current === currentSeq) {
          setResults([]);
          setError(null);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        if (window.api && typeof window.api.search === 'function') {
          console.log(`[useLauncherSearch] Query sent through IPC: "${trimmed}"`);
          const results = await window.api.search(trimmed);
          console.log(`[useLauncherSearch] Raw response received from IPC: ${results?.length ?? 0} item(s)`);
          const comboResults = useComboStore.getState().getComboSearchResults(trimmed);
          const merged = [...comboResults, ...(results || [])];
          // Check for stale response
          if (searchSeq.current === currentSeq) {
            setResults(merged);
          }
        } else {
          if (searchSeq.current === currentSeq) {
            const isElectron = typeof window !== 'undefined' && typeof navigator !== 'undefined' && /electron/i.test(navigator.userAgent);
            if (isElectron) {
              console.error('[useLauncherSearch] Electron preload API unavailable (window.api.search not found)');
              setError('Electron preload API unavailable');
            }
            setResults([]);
          }
        }
      } catch (err: unknown) {
        if (searchSeq.current === currentSeq) {
          console.error('[useLauncherSearch] IPC search error:', err);
          const errorMsg = err instanceof Error ? err.message : 'Search execution failed';
          setError(errorMsg);
          setResults([]);
        }
      } finally {
        if (searchSeq.current === currentSeq) {
          setIsLoading(false);
        }
      }
    },
    [setResults, setIsLoading, setError]
  );

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      executeSearch(query);
    }, debounceMs);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, debounceMs, executeSearch]);

  return { query, executeSearch };
}
