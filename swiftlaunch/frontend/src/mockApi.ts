import type { Result, InstalledApp } from '@swiftlaunch/shared';

const MOCK_RESULTS: Result[] = [
  {
    id: 'app:c:/Users/User/AppData/Local/Programs/Antigravity/antigravity.exe',
    providerId: 'app',
    icon: '🔮',
    title: 'Antigravity',
    subtitle: 'C:\\Users\\User\\AppData\\Local\\Programs\\Antigravity\\antigravity.exe',
    score: 98
  },
  {
    id: 'app:c:/Windows/System32/notepad.exe',
    providerId: 'app',
    icon: '📝',
    title: 'Notepad',
    subtitle: 'C:\\Windows\\System32\\notepad.exe',
    score: 95
  },
  {
    id: 'app:c:/Program Files/Google/Chrome/Application/chrome.exe',
    providerId: 'app',
    icon: '🌐',
    title: 'Google Chrome',
    subtitle: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    score: 92
  },
  {
    id: 'app:c:/Users/User/AppData/Local/Programs/Microsoft VS Code/Code.exe',
    providerId: 'app',
    icon: '💻',
    title: 'Visual Studio Code',
    subtitle: 'C:\\Users\\User\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe',
    score: 90
  },
  {
    id: 'app:c:/Windows/System32/calc.exe',
    providerId: 'app',
    icon: '🧮',
    title: 'Calculator',
    subtitle: 'C:\\Windows\\System32\\calc.exe',
    score: 85
  },
  {
    id: 'app:c:/Windows/System32/cmd.exe',
    providerId: 'app',
    icon: '⚡',
    title: 'Command Prompt',
    subtitle: 'C:\\Windows\\System32\\cmd.exe',
    score: 80
  },
  {
    id: 'file:c:/Users/User/Documents/Project-Architecture.pdf',
    providerId: 'file',
    icon: '📄',
    title: 'Project-Architecture.pdf',
    subtitle: 'C:\\Users\\User\\Documents\\Project-Architecture.pdf',
    score: 75
  },
  {
    id: 'file:c:/Users/User/Pictures/Screenshots/diagram.png',
    providerId: 'file',
    icon: '🖼️',
    title: 'diagram.png',
    subtitle: 'C:\\Users\\User\\Pictures\\Screenshots\\diagram.png',
    score: 70
  },
  {
    id: 'file:c:/Users/User/Projects/swiftlaunch',
    providerId: 'file',
    icon: '📁',
    title: 'swiftlaunch',
    subtitle: 'C:\\Users\\User\\Projects\\swiftlaunch',
    score: 68
  }
];

export function isElectron(): boolean {
  if (typeof navigator === 'undefined') return false;
  if (/electron/i.test(navigator.userAgent)) return true;
  if (typeof window !== 'undefined' && (window as unknown as { process?: { type?: string } }).process?.type === 'renderer') return true;
  return false;
}

export function isMockEnvironment(): boolean {
  return !isElectron() && typeof window !== 'undefined' && !window.api;
}

export function setupMockApi(): void {
  // CRITICAL: NEVER inject mock API inside Electron runtime
  if (!isMockEnvironment()) {
    return;
  }

  console.log('[Mock API] Injecting mock window.api for browser standalone mode');

  window.api = {
    ping: async () => 'pong (mock)',

    hideWindow: () => {
      console.log('[Mock API] hideWindow called');
    },

    search: async (query: string): Promise<Result[]> => {
      const q = query.trim().toLowerCase();
      if (!q) return [];

      // Filter mock results
      const filtered = MOCK_RESULTS.filter(
        (item) => item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q)
      );

      // Web search fallback
      const googleFallback: Result = {
        id: `google:${query}`,
        providerId: 'google',
        icon: '🔍',
        title: `Search Google for "${query}"`,
        subtitle: 'Open web browser',
        score: 10
      };

      return [...filtered, googleFallback];
    },

    executeAction: async (resultId: string, actionId?: string): Promise<void> => {
      console.log(`[Mock API] executeAction resultId="${resultId}", actionId="${actionId}"`);
    },

    logUsage: (query: string, resultId: string): void => {
      console.log(`[Mock API] logUsage query="${query}", resultId="${resultId}"`);
    },

    snapWindow: async (direction: string): Promise<void> => {
      console.log(`[Mock API] snapWindow direction="${direction}"`);
    },

    onProviderWarning: (_callback: (message: string) => void): (() => void) => {
      void _callback;
      console.log('[Mock API] Registered onProviderWarning listener');
      return () => {
        console.log('[Mock API] Unsubscribed onProviderWarning listener');
      };
    },

    getAllApps: async (): Promise<InstalledApp[]> => {
      return [
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
    },

    launchAppGroup: async (appIds: string[]): Promise<void> => {
      console.log(`[Mock API] launchAppGroup triggered for ${appIds.length} app(s):`, appIds);
    }
  };
}
