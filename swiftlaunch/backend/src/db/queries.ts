/**
 * Database query helpers for SwiftLaunch.
 *
 * Reference: Flow Launcher scoring approach
 * (github.com/Flow-Launcher/Flow.Launcher — frequency + recency weighting)
 * Adapted to compute boost scores from usage_frequency data.
 */

import type { PureJsDatabase, ItemEmbeddingRecord, ContextScanCacheRecord } from './schema.js';
import type { ClipboardEntry, QuickLink } from '@swiftlaunch/shared';

export class DbQueries {
  constructor(private db: PureJsDatabase) {}

  // ── Usage frequency ──────────────────────────────────────────────

  /** Log a usage event (user selected a result for a given query). */
  logUsage(query: string, selectedResultId: string): void {
    const data = this.db.Data;
    data.usage_frequency.push({
      id: data.usage_frequency.length + 1,
      query,
      selectedResultId,
      timestamp: Date.now()
    });

    // Keep last 1000 records
    if (data.usage_frequency.length > 1000) {
      data.usage_frequency = data.usage_frequency.slice(-1000);
    }
    this.db.scheduleSave();
  }

  /**
   * Compute boost scores for a set of result IDs based on usage frequency + recency.
   * Score formula (inspired by Flow Launcher):
   *   boost = SUM( 1 / (1 + daysSinceUsage) )  for each usage record
   */
  getBoostScores(resultIds: string[]): Map<string, number> {
    const scores = new Map<string, number>();
    if (resultIds.length === 0) return scores;

    const idSet = new Set(resultIds);
    const records = this.db.Data.usage_frequency.filter((r) => idSet.has(r.selectedResultId));

    const now = Date.now();
    for (const record of records) {
      const daysSince = (now - record.timestamp) / (1000 * 60 * 60 * 24);
      const recencyWeight = 1 / (1 + daysSince);
      const current = scores.get(record.selectedResultId) || 0;
      scores.set(record.selectedResultId, current + recencyWeight);
    }

    return scores;
  }

  // ── Clipboard history ────────────────────────────────────────────

  /** Add a clipboard entry, deduplicating against the most recent entry. */
  addClipboardEntry(content: string, type: 'text' | 'image' | 'html' = 'text'): void {
    const data = this.db.Data;

    // Check for duplicate of most recent entry
    if (data.clipboard_history.length > 0) {
      const last = data.clipboard_history[0];
      if (last.content === content) return;
    }

    const entry: ClipboardEntry = {
      id: data.clipboard_history.length + 1,
      content,
      type,
      timestamp: Date.now()
    };

    data.clipboard_history.unshift(entry);

    // Keep last 200 entries
    if (data.clipboard_history.length > 200) {
      data.clipboard_history = data.clipboard_history.slice(0, 200);
    }
    this.db.scheduleSave();
  }

  /** Get recent clipboard history entries. */
  getClipboardHistory(limit: number = 50): ClipboardEntry[] {
    return this.db.Data.clipboard_history.slice(0, limit);
  }

  // ── Quick links ──────────────────────────────────────────────────

  /** Add or update a quick link. */
  addQuickLink(alias: string, target: string, type: 'url' | 'file' | 'command' = 'url'): void {
    const data = this.db.Data;
    const existingIdx = data.quicklinks.findIndex((q) => q.alias === alias);
    if (existingIdx >= 0) {
      data.quicklinks[existingIdx] = { ...data.quicklinks[existingIdx], target, type };
    } else {
      data.quicklinks.push({
        id: data.quicklinks.length + 1,
        alias,
        target,
        type
      });
    }
    this.db.scheduleSave();
  }

  /** Get all quick links. */
  getQuickLinks(): QuickLink[] {
    return [...this.db.Data.quicklinks];
  }

  /** Remove a quick link by alias. */
  removeQuickLink(alias: string): void {
    const data = this.db.Data;
    data.quicklinks = data.quicklinks.filter((q) => q.alias !== alias);
    this.db.scheduleSave();
  }

  // ── Settings ─────────────────────────────────────────────────────

  /** Get a setting value by key with fallback default. */
  getSetting<T>(key: string, defaultValue: T): T {
    const settings = this.db.Data.settings || {};
    return key in settings ? (settings[key] as T) : defaultValue;
  }

  /** Set a setting key-value pair. */
  setSetting(key: string, value: any): void {
    if (!this.db.Data.settings) {
      this.db.Data.settings = {};
    }
    this.db.Data.settings[key] = value;
    this.db.scheduleSave();
  }

  /** Check if context scan is enabled (defaults to true). */
  isContextScanEnabled(): boolean {
    return this.getSetting<boolean>('context_scan_enabled', true);
  }

  // ── Item Embeddings ──────────────────────────────────────────────

  /** Get a cached embedding for an item by its ID. */
  getItemEmbedding(itemId: string): ItemEmbeddingRecord | undefined {
    const embeddings = this.db.Data.item_embeddings || [];
    return embeddings.find((e) => e.item_id === itemId);
  }

  /** Get all cached item embeddings. */
  getAllItemEmbeddings(): ItemEmbeddingRecord[] {
    return [...(this.db.Data.item_embeddings || [])];
  }

  /** Insert or update an item embedding record. */
  upsertItemEmbedding(record: ItemEmbeddingRecord): void {
    if (!this.db.Data.item_embeddings) {
      this.db.Data.item_embeddings = [];
    }
    const idx = this.db.Data.item_embeddings.findIndex((e) => e.item_id === record.item_id);
    if (idx >= 0) {
      this.db.Data.item_embeddings[idx] = record;
    } else {
      this.db.Data.item_embeddings.push(record);
    }
    this.db.scheduleSave();
  }

  /** Bulk upsert item embedding records. */
  upsertItemEmbeddings(records: ItemEmbeddingRecord[]): void {
    if (!this.db.Data.item_embeddings) {
      this.db.Data.item_embeddings = [];
    }
    for (const record of records) {
      const idx = this.db.Data.item_embeddings.findIndex((e) => e.item_id === record.item_id);
      if (idx >= 0) {
        this.db.Data.item_embeddings[idx] = record;
      } else {
        this.db.Data.item_embeddings.push(record);
      }
    }
    this.db.scheduleSave();
  }

  // ── Context Scan Cache ───────────────────────────────────────────

  /** Get the singleton last scan result. */
  getContextScanCache(): ContextScanCacheRecord | undefined {
    const cache = this.db.Data.context_scan_cache || [];
    return cache.find((c) => c.id === 1);
  }

  /** Save the singleton last scan result. */
  saveContextScanCache(ocrText: string, queryEmbedding: string): void {
    const record: ContextScanCacheRecord = {
      id: 1,
      ocr_text: ocrText,
      query_embedding: queryEmbedding,
      scanned_at: Date.now()
    };
    if (!this.db.Data.context_scan_cache) {
      this.db.Data.context_scan_cache = [];
    }
    const idx = this.db.Data.context_scan_cache.findIndex((c) => c.id === 1);
    if (idx >= 0) {
      this.db.Data.context_scan_cache[idx] = record;
    } else {
      this.db.Data.context_scan_cache.push(record);
    }
    this.db.scheduleSave();
  }
}
