import { create } from 'zustand';
import type { AppCombo, InstalledApp, Result } from '@swiftlaunch/shared';

const LOCAL_STORAGE_KEY = 'swiftlaunch_app_combos';

const DEFAULT_COMBOS: AppCombo[] = [
  {
    id: 'combo:antigravity-chrome',
    name: 'Antigravity + Chrome',
    icon: '🚀',
    color: '#818CF8',
    appIds: [
      'app:c:/Users/User/AppData/Local/Programs/Antigravity/antigravity.exe',
      'app:c:/Program Files/Google/Chrome/Application/chrome.exe'
    ],
    appNames: ['Antigravity', 'Google Chrome'],
    createdAt: Date.now() - 100000
  },
  {
    id: 'combo:vscode-terminal',
    name: 'VS Code + Terminal',
    icon: '💻',
    color: '#38BDF8',
    appIds: [
      'app:c:/Users/User/AppData/Local/Programs/Microsoft VS Code/Code.exe',
      'app:c:/Windows/System32/cmd.exe'
    ],
    appNames: ['Visual Studio Code', 'Command Prompt'],
    createdAt: Date.now() - 50000
  }
];

const FALLBACK_APPS: InstalledApp[] = [
  {
    id: 'app:c:/Users/User/AppData/Local/Programs/Antigravity/antigravity.exe',
    name: 'Antigravity',
    lnkPath: 'C:\\Users\\User\\AppData\\Local\\Programs\\Antigravity\\antigravity.exe'
  },
  {
    id: 'app:c:/Program Files/Google/Chrome/Application/chrome.exe',
    name: 'Google Chrome',
    lnkPath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  },
  {
    id: 'app:c:/Users/User/AppData/Local/Programs/Microsoft VS Code/Code.exe',
    name: 'Visual Studio Code',
    lnkPath: 'C:\\Users\\User\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe'
  },
  {
    id: 'app:c:/Windows/System32/notepad.exe',
    name: 'Notepad',
    lnkPath: 'C:\\Windows\\System32\\notepad.exe'
  },
  {
    id: 'app:c:/Windows/System32/calc.exe',
    name: 'Calculator',
    lnkPath: 'C:\\Windows\\System32\\calc.exe'
  },
  {
    id: 'app:c:/Windows/System32/cmd.exe',
    name: 'Command Prompt',
    lnkPath: 'C:\\Windows\\System32\\cmd.exe'
  },
  {
    id: 'app:c:/Windows/System32/WindowsPowerShell/v1.0/powershell.exe',
    name: 'PowerShell',
    lnkPath: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe'
  },
  {
    id: 'app:c:/Users/User/AppData/Local/Discord/Discord.exe',
    name: 'Discord',
    lnkPath: 'C:\\Users\\User\\AppData\\Local\\Discord\\Discord.exe'
  },
  {
    id: 'app:c:/Users/User/AppData/Roaming/Spotify/Spotify.exe',
    name: 'Spotify',
    lnkPath: 'C:\\Users\\User\\AppData\\Roaming\\Spotify\\Spotify.exe'
  }
];

interface ComboState {
  combos: AppCombo[];
  availableApps: InstalledApp[];
  isLoadingApps: boolean;
  launchFeedback: string | null;
  loadCombos: () => void;
  fetchAvailableApps: () => Promise<void>;
  addCombo: (combo: Omit<AppCombo, 'id' | 'createdAt'>) => AppCombo;
  deleteCombo: (id: string) => void;
  updateCombo: (id: string, updates: Partial<AppCombo>) => void;
  launchCombo: (combo: AppCombo) => Promise<void>;
  getComboSearchResults: (query: string) => Result[];
}

export const useComboStore = create<ComboState>((set, get) => ({
  combos: [],
  availableApps: [],
  isLoadingApps: false,
  launchFeedback: null,

  loadCombos: () => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          set({ combos: parsed });
          return;
        }
      }
    } catch (err) {
      console.warn('[useComboStore] Failed to load combos from localStorage:', err);
    }
    // Initialize defaults if none saved
    set({ combos: DEFAULT_COMBOS });
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_COMBOS));
    } catch {
      // ignore storage error
    }
  },

  fetchAvailableApps: async () => {
    set({ isLoadingApps: true });
    try {
      if (window.api && typeof window.api.getAllApps === 'function') {
        const apps = await window.api.getAllApps();
        if (Array.isArray(apps) && apps.length > 0) {
          // Merge with Antigravity if not in list
          const hasAntigravity = apps.some((a) => a.name.toLowerCase().includes('antigravity'));
          const finalList = hasAntigravity ? apps : [FALLBACK_APPS[0], ...apps];
          set({ availableApps: finalList, isLoadingApps: false });
          return;
        }
      }
    } catch (err) {
      console.warn('[useComboStore] Failed to fetch apps from backend:', err);
    }
    set({ availableApps: FALLBACK_APPS, isLoadingApps: false });
  },

  addCombo: (data) => {
    const newCombo: AppCombo = {
      ...data,
      id: `combo:${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now()
    };
    const updated = [newCombo, ...get().combos];
    set({ combos: updated });
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return newCombo;
  },

  deleteCombo: (id: string) => {
    const updated = get().combos.filter((c) => c.id !== id);
    set({ combos: updated });
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  },

  updateCombo: (id: string, updates: Partial<AppCombo>) => {
    const updated = get().combos.map((c) => (c.id === id ? { ...c, ...updates } : c));
    set({ combos: updated });
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  },

  launchCombo: async (combo: AppCombo) => {
    console.log(`[useComboStore] Launching combo "${combo.name}" with apps:`, combo.appNames);
    set({ launchFeedback: `Launching ${combo.name}...` });

    try {
      const api = window.api;
      if (api && typeof api.launchAppGroup === 'function') {
        await api.launchAppGroup(combo.appIds);
      } else if (api && typeof api.executeAction === 'function') {
        // Fallback: launch each app in parallel
        await Promise.allSettled(combo.appIds.map((id) => api.executeAction(id)));
      }
    } catch (err) {
      console.error('[useComboStore] Error launching combo:', err);
    }

    // Clear feedback toast after 2.5s
    setTimeout(() => {
      set((state) => (state.launchFeedback?.includes(combo.name) ? { launchFeedback: null } : {}));
    }, 2500);
  },

  getComboSearchResults: (query: string): Result[] => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return get()
      .combos.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.appNames.some((name) => name.toLowerCase().includes(q)) ||
          'combo'.includes(q) ||
          'club'.includes(q)
      )
      .map((c) => ({
        id: c.id,
        icon: c.icon || '🚀',
        title: c.name,
        subtitle: `App Combo • Launches ${c.appNames.join(', ')}`,
        score: 99,
        providerId: 'combo',
        actionId: 'launch_combo'
      }));
  }
}));
