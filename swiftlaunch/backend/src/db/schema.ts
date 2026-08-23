/**
 * Database schema initialization for SwiftLaunch.
 *
 * Lightweight, portable pure-JS database engine that handles usage_frequency,
 * clipboard_history, and quicklinks tables without native C++ compilation dependencies.
 * Database file is stored as a JSON store in Electron's userData directory.
 */

import path from 'path';
import fs from 'fs';
import type { ClipboardEntry, QuickLink, UsageRecord } from '@swiftlaunch/shared';

export interface ItemEmbeddingRecord {
  item_id: string;
  item_type: 'app' | 'file' | string;
  label: string;
  embedding: string; // Base64 encoded or string representation of Buffer BLOB
  updated_at: number;
}

export interface ContextScanCacheRecord {
  id: number; // 1
  ocr_text: string;
  query_embedding: string; // Base64 encoded or string representation of Buffer BLOB
  scanned_at: number;
}

export interface SwiftLaunchDbData {
  usage_frequency: UsageRecord[];
  clipboard_history: ClipboardEntry[];
  quicklinks: QuickLink[];
  settings: Record<string, any>;
  item_embeddings: ItemEmbeddingRecord[];
  context_scan_cache: ContextScanCacheRecord[];
}

export class PureJsDatabase {
  private filePath: string;
  private data: SwiftLaunchDbData;
  private autoSaveTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(dbDir: string) {
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    this.filePath = path.join(dbDir, 'swiftlaunch-data.json');
    this.data = this.load();
  }

  get Data(): SwiftLaunchDbData {
    return this.data;
  }

  save(): void {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Database] Failed to save DB file:', err);
    }
  }

  scheduleSave(): void {
    if (this.autoSaveTimer) return;
    this.autoSaveTimer = setTimeout(() => {
      this.autoSaveTimer = null;
      this.save();
    }, 1000);
  }

  close(): void {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
    this.save();
    console.log('[Database] Closed and saved');
  }

  private load(): SwiftLaunchDbData {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          usage_frequency: parsed.usage_frequency || [],
          clipboard_history: parsed.clipboard_history || [],
          quicklinks: parsed.quicklinks || [],
          settings: Object.assign({ context_scan_enabled: true }, parsed.settings || {}),
          item_embeddings: parsed.item_embeddings || [],
          context_scan_cache: parsed.context_scan_cache || []
        };
      }
    } catch (err) {
      console.warn('[Database] Failed to load DB file, starting fresh:', err);
    }
    return {
      usage_frequency: [],
      clipboard_history: [],
      quicklinks: [],
      settings: { context_scan_enabled: true },
      item_embeddings: [],
      context_scan_cache: []
    };
  }
}

let dbInstance: PureJsDatabase | null = null;

/**
 * Initialize the database. Call once at startup.
 * @param dbDir - directory to store the database file (defaults to cwd for tests)
 */
export function initDatabase(dbDir?: string): PureJsDatabase {
  const dir = dbDir || process.cwd();
  dbInstance = new PureJsDatabase(dir);
  console.log(`[Database] Initialized at ${dir}`);
  return dbInstance;
}

/** Get the current database instance. Throws if not initialized. */
export function getDatabase(): PureJsDatabase {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return dbInstance;
}

/** Close the database connection. */
export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
