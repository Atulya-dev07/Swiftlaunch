import { useEffect } from 'react';
import { useSearchStore } from '../state/useSearchStore.js';
import type { Result } from '@swiftlaunch/shared';

/**
 * Hook to subscribe to one-way contextual search results updates pushed from the backend.
 */
export function useContextResults(): void {
  const setContextResults = useSearchStore((state) => state.setContextResults);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (window.api && typeof window.api.onContextResultsUpdated === 'function') {
      unsubscribe = window.api.onContextResultsUpdated((results: Result[]) => {
        console.log(`[useContextResults] Received ${results?.length ?? 0} contextual result(s) from main process`);
        setContextResults(results || []);
      });
    }

    return () => {
      unsubscribe?.();
    };
  }, [setContextResults]);
}
