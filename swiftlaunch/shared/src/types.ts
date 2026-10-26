export interface Result {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  score?: number;
  providerId?: string;
  actionId?: string;
  action?: () => void;
}

export interface PluginManifest {
  /** Unique plugin identifier */
  id: string;
  /** Display name */
  name: string;
  /** Semantic version string */
  version: string;
  /** Human-readable description */
  description?: string;
  /** Author name */
  author?: string;
  /** Relative path to the plugin entry point JS file */
  main?: string;
  /** Keyword prefixes that activate this plugin (e.g. ["g:"] for google) */
  actionKeywords?: string[];
  /** URL to plugin website/repo */
  website?: string;
}

export interface Settings {
  theme: 'dark' | 'light';
  hotkey: string;
  autostart: boolean;
}

export interface QuickLink {
  id?: number;
  alias: string;
  target: string;
  type: 'url' | 'file' | 'command';
}

export interface UsageRecord {
  id?: number;
  query: string;
  selectedResultId: string;
  timestamp: number;
}

export interface InstalledApp {
  id: string;
  name: string;
  lnkPath?: string;
  icon?: string;
}

export interface AppCombo {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  appIds: string[];
  appNames: string[];
  createdAt: number;
}

export interface SwiftLaunchApi {
  ping: () => Promise<string>;
  hideWindow: () => void;
  search: (query: string) => Promise<Result[]>;
  executeAction: (resultId: string, actionId?: string) => Promise<void>;
  logUsage: (query: string, resultId: string) => void;
  snapWindow: (direction: string) => Promise<void>;
  onProviderWarning: (callback: (message: string) => void) => () => void;
  getAllApps?: () => Promise<InstalledApp[]>;
  launchAppGroup?: (appIds: string[]) => Promise<void>;
}
