import { create } from 'zustand';
import type { Result } from '@swiftlaunch/shared';

export interface GroupedResults {
  [category: string]: Result[];
}

interface SearchState {
  query: string;
  results: Result[];
  contextResults: Result[];
  groupedResults: GroupedResults;
  flatResults: Result[];
  selectedIndex: number;
  isLoading: boolean;
  error: string | null;
  recentQueries: string[];
  activeGroup: string | null;
  actionPanelOpen: boolean;
  detailPaneOpen: boolean;

  setQuery: (query: string) => void;
  setResults: (results: Result[]) => void;
  setContextResults: (contextResults: Result[]) => void;
  setSelectedIndex: (index: number | ((prev: number) => number)) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setActiveGroup: (group: string | null) => void;
  setActionPanelOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  toggleActionPanel: () => void;
  setDetailPaneOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  toggleDetailPane: () => void;
  providerWarning: string | null;
  setProviderWarning: (warning: string | null) => void;
  addRecentQuery: (query: string) => void;
  resetTransient: () => void;
  resetAll: () => void;
}

export function normalizeProvider(providerId?: string, resultId?: string): string {
  const raw = providerId || (resultId ? resultId.split(':')[0] : '') || 'other';
  return raw.toLowerCase().replace(/provider$/, '');
}

export function groupResults(
  results: Result[],
  activeGroup: string | null,
  query?: string,
  contextResults: Result[] = []
): { grouped: GroupedResults; flat: Result[] } {
  const isFileScope = query ? /^#(files?|file)\b/i.test(query.trim()) : false;
  const isContextScope = query ? /^#(ctx|context)\b/i.test(query.trim()) : false;

  const categories: Record<string, string> = {
    combo: 'App Combos',
    context: 'ON YOUR SCREEN',
    app: 'Applications',
    file: isFileScope ? 'Files' : 'Files & Folders',
    calc: 'Calculator',
    clip: 'Clipboard History',
    google: 'Web Search',
    plugin: 'Plugins & Commands'
  };

  const grouped: GroupedResults = {};
  const flat: Result[] = [];

  // When activeGroup is 'context' or scoped to #context, exclusively render context results
  if (activeGroup === 'context' || isContextScope) {
    if (contextResults.length > 0) {
      grouped['ON YOUR SCREEN'] = [...contextResults];
      flat.push(...contextResults);
    }
    return { grouped, flat };
  }

  // When query is empty (or starts with ctx:) and activeGroup is null / 'all', include context results at top
  const showContext =
    (!query || query.trim().length === 0 || query.trim().startsWith('ctx:')) &&
    (activeGroup === null || activeGroup === 'all') &&
    contextResults.length > 0;

  if (showContext) {
    grouped['ON YOUR SCREEN'] = [...contextResults];
  }

  for (const item of results) {
    const normalizedProvider = normalizeProvider(item.providerId, item.id);

    // In #files scope, exclusively render file results
    if (isFileScope && normalizedProvider !== 'file') {
      continue;
    }

    // Check active group filter if specified
    if (activeGroup && activeGroup !== 'all' && normalizedProvider !== activeGroup) {
      continue;
    }

    const groupTitle = categories[normalizedProvider] || 'Other Results';
    if (!grouped[groupTitle]) {
      grouped[groupTitle] = [];
    }
    grouped[groupTitle].push(item);
  }

  // Flatten in consistent order of category keys
  const categoryOrder = isFileScope
    ? ['Files', 'Files & Folders']
    : [
        'App Combos',
        'ON YOUR SCREEN',
        'Applications',
        'Files & Folders',
        'Files',
        'Calculator',
        'Clipboard History',
        'Web Search',
        'Plugins & Commands',
        'Other Results'
      ];

  for (const cat of categoryOrder) {
    if (grouped[cat]) {
      flat.push(...grouped[cat]);
    }
  }

  return { grouped, flat };
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  results: [],
  contextResults: [],
  groupedResults: {},
  flatResults: [],
  selectedIndex: 0,
  isLoading: false,
  error: null,
  recentQueries: [],
  activeGroup: null,
  actionPanelOpen: false,
  detailPaneOpen: false,
  providerWarning: null,

  setQuery: (query: string) => {
    set((state) => {
      const { grouped, flat } = groupResults(state.results, state.activeGroup, query, state.contextResults);
      return { query, groupedResults: grouped, flatResults: flat };
    });
  },
  setProviderWarning: (providerWarning: string | null) => set({ providerWarning }),

  setResults: (results: Result[]) => {
    set((state) => {
      const { grouped, flat } = groupResults(results, state.activeGroup, state.query, state.contextResults);

      // Group counts by providerId for structured boundary logging
      const byProvider: Record<string, number> = {};
      for (const r of results) {
        const p = normalizeProvider(r.providerId, r.id);
        byProvider[p] = (byProvider[p] || 0) + 1;
      }
      console.log(`[useSearchStore] Stored ${results.length} results grouped by providerId:`, byProvider);

      return {
        results,
        groupedResults: grouped,
        flatResults: flat,
        selectedIndex: 0
      };
    });
  },

  setContextResults: (contextResults: Result[]) => {
    set((state) => {
      const { grouped, flat } = groupResults(state.results, state.activeGroup, state.query, contextResults);
      console.log(`[useSearchStore] Updated contextResults with ${contextResults.length} item(s)`);
      return {
        contextResults,
        groupedResults: grouped,
        flatResults: flat
      };
    });
  },

  setSelectedIndex: (updater) => {
    set((state) => {
      const nextIndex = typeof updater === 'function' ? updater(state.selectedIndex) : updater;
      const maxIndex = Math.max(0, state.flatResults.length - 1);
      const clampedIndex = Math.max(0, Math.min(nextIndex, maxIndex));
      return { selectedIndex: clampedIndex };
    });
  },

  setIsLoading: (isLoading: boolean) => set({ isLoading }),

  setError: (error: string | null) => set({ error }),

  setActiveGroup: (activeGroup: string | null) => {
    set((state) => {
      const { grouped, flat } = groupResults(state.results, activeGroup, state.query, state.contextResults);
      return {
        activeGroup,
        groupedResults: grouped,
        flatResults: flat,
        selectedIndex: 0
      };
    });
  },

  setActionPanelOpen: (updater) => {
    set((state) => ({
      actionPanelOpen: typeof updater === 'function' ? updater(state.actionPanelOpen) : updater
    }));
  },

  toggleActionPanel: () => {
    set((state) => ({ actionPanelOpen: !state.actionPanelOpen }));
  },

  setDetailPaneOpen: (updater) => {
    set((state) => ({
      detailPaneOpen: typeof updater === 'function' ? updater(state.detailPaneOpen) : updater
    }));
  },

  toggleDetailPane: () => {
    set((state) => ({ detailPaneOpen: !state.detailPaneOpen }));
  },

  addRecentQuery: (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    set((state) => {
      const filtered = state.recentQueries.filter((q) => q.toLowerCase() !== trimmed.toLowerCase());
      return {
        recentQueries: [trimmed, ...filtered].slice(0, 10)
      };
    });
  },

  resetTransient: () => {
    set({
      selectedIndex: 0,
      actionPanelOpen: false,
      detailPaneOpen: false,
      error: null
    });
  },

  resetAll: () => {
    set({
      query: '',
      results: [],
      contextResults: [],
      groupedResults: {},
      flatResults: [],
      selectedIndex: 0,
      isLoading: false,
      error: null,
      activeGroup: null,
      actionPanelOpen: false,
      detailPaneOpen: false
    });
  }
}));
