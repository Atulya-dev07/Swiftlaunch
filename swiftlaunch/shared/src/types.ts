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

export interface ClipboardEntry {
  id?: number;
  content: string;
  type: 'text' | 'image' | 'html';
  timestamp: number;
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
