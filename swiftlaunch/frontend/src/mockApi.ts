import type { Result, ClipboardEntry } from '@swiftlaunch/shared';

const MOCK_RESULTS: Result[] = [
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
  },
  {
    id: 'clip:1',
    providerId: 'clip',
    icon: '📋',
    title: 'pnpm --filter @swiftlaunch/frontend dev',
    subtitle: 'Clipboard (text) • 5 mins ago',
    score: 60
  },
  {
    id: 'clip:2',
    providerId: 'clip',
    icon: '📋',
    title: 'https://github.com/swiftlaunch/swiftlaunch',
    subtitle: 'Clipboard (text) • 20 mins ago',
    score: 55
  }
];

const MOCK_CLIPBOARD_ENTRIES: ClipboardEntry[] = [
  {
    id: 1,
    content: 'pnpm --filter @swiftlaunch/frontend dev',
    type: 'text',
    timestamp: Date.now() - 300000
  },
  {
    id: 2,
    content: 'https://github.com/swiftlaunch/swiftlaunch',
    type: 'text',
    timestamp: Date.now() - 1200000
  },
  {
    id: 3,
    content: 'const raycastStyle = { dense: true, keyboard: true };',
    type: 'text',
    timestamp: Date.now() - 3600000
  }
];

const MOCK_CONTEXT_RESULTS: Result[] = [
  {
    id: 'app:c:/Users/User/AppData/Local/Programs/Microsoft VS Code/Code.exe',
    providerId: 'context',
    icon: '💻',
    title: 'Visual Studio Code',
    subtitle: 'Related to your screen · 94% match',
    score: 98
  },
  {
    id: 'file:c:/Users/User/Documents/Project-Architecture.pdf',
    providerId: 'context',
    icon: '📄',
    title: 'Project-Architecture.pdf',
    subtitle: 'Related to your screen · 88% match',
    score: 92
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

      // Check math expression
      if (/^[\d\s+\-*/%().^]+$/.test(q)) {
        try {
          // Safe math evaluation mock
          const expr = q.replace(/[^0-9+\-*/%().]/g, '');
          const val = Function(`"use strict"; return (${expr})`)();
          if (typeof val === 'number' && !isNaN(val)) {
            return [
              {
                id: `calc:${val}`,
                providerId: 'calc',
                icon: '🧮',
                title: `= ${val}`,
                subtitle: `Calculation: ${q}`,
                score: 100
              }
            ];
          }
        } catch {
          // ignore eval error
        }
      }

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

    getClipboardHistory: async (): Promise<ClipboardEntry[]> => {
      return MOCK_CLIPBOARD_ENTRIES;
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

    onContextResultsUpdated: (callback: (results: Result[]) => void): (() => void) => {
      console.log('[Mock API] Registered onContextResultsUpdated listener');
      // Simulate delayed arrival of context results in standalone browser dev mode
      const timer = setTimeout(() => {
        callback(MOCK_CONTEXT_RESULTS);
      }, 500);

      return () => {
        clearTimeout(timer);
        console.log('[Mock API] Unsubscribed onContextResultsUpdated listener');
      };
    }
  };
}
