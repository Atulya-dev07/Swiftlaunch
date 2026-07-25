/// <reference types="vite/client" />

import type { Result, ClipboardEntry } from '@swiftlaunch/shared';

declare global {
  interface Window {
    api?: {
      ping: () => Promise<string>;
      hideWindow: () => void;
      search: (query: string) => Promise<Result[]>;
      executeAction: (resultId: string, actionId?: string) => Promise<void>;
      logUsage: (query: string, resultId: string) => void;
      getClipboardHistory: () => Promise<ClipboardEntry[]>;
      snapWindow: (direction: string) => Promise<void>;
      onProviderWarning: (callback: (message: string) => void) => void;
    };
  }
}

export {};
