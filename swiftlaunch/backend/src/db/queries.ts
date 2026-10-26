/**
 * Database query helpers for SwiftLaunch.
 *
 * Reference: Flow Launcher scoring approach
 * (github.com/Flow-Launcher/Flow.Launcher — frequency + recency weighting)
 * Adapted to compute boost scores from usage_frequency data.
 */

import type { PureJsDatabase } from './schema.js';
import type { QuickLink } from '@swiftlaunch/shared';

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
}
