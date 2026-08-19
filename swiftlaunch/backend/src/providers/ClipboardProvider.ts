/**
 * ClipboardProvider — monitors clipboard and provides clipboard history search.
 *
 * Polls Electron's clipboard API every 500ms, deduplicates consecutive identical
 * entries, and maintains an in-memory ring buffer. Persistence to SQLite is
 * wired via setDbCallback() from the DB module.
 */

import type { Result, ClipboardEntry } from '@swiftlaunch/shared';
import type { Provider } from './ProviderContract.js';

const MAX_HISTORY = 50;
const POLL_INTERVAL = 500;

import { clipboard } from 'electron';

function getClipboardApi() {
  if (clipboard && typeof clipboard.readText === 'function') {
    return clipboard;
  }
  return {
    readText: () => '',
    writeText: () => {}
  };
}

export class ClipboardProvider implements Provider {
  readonly id = 'ClipboardProvider';
  readonly name = 'Clipboard History';
  enabled = true;

  private history: ClipboardEntry[] = [];
  private lastContent = '';
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private persistCallback: ((entry: ClipboardEntry) => void) | null = null;

  /** Wire a persistence callback from the DB module. */
  setDbCallback(cb: (entry: ClipboardEntry) => void): void {
    this.persistCallback = cb;
  }

  async initialize(): Promise<void> {
    const clipboard = getClipboardApi();
    // Read initial clipboard content
    this.lastContent = clipboard.readText();
    this.startPolling();
    console.log('[ClipboardProvider] Started clipboard polling');
  }

  dispose(): void {
    this.stopPolling();
  }

  async getResults(query: string): Promise<Result[]> {
    const q = query.toLowerCase();
    return this.history
      .filter((entry) => entry.content.toLowerCase().includes(q))
      .slice(0, 10)
      .map((entry, i) => ({
        id: `clip:${entry.timestamp}`,
        icon: '📋',
        title: entry.content.length > 60 ? entry.content.substring(0, 60) + '...' : entry.content,
        subtitle: `Copied ${this.formatTimeAgo(entry.timestamp)}`,
        score: 40 - i,
        providerId: this.id,
        actionId: 'paste'
      }));
  }

  async executeAction(resultId: string): Promise<void> {
    const timestamp = parseInt(resultId.replace('clip:', ''), 10);
    const entry = this.history.find((e) => e.timestamp === timestamp);
    if (entry) {
      const clipboard = getClipboardApi();
      clipboard.writeText(entry.content);
    }
  }

  /** Get the full clipboard history (for IPC handler). */
  getHistory(): ClipboardEntry[] {
    return [...this.history];
  }

  private startPolling(): void {
    this.pollTimer = setInterval(() => {
      const clipboard = getClipboardApi();
      const current = clipboard.readText();
      if (current && current !== this.lastContent) {
        this.lastContent = current;
        const entry: ClipboardEntry = {
          content: current,
          type: 'text',
          timestamp: Date.now()
        };
        this.history.unshift(entry);
        if (this.history.length > MAX_HISTORY) {
          this.history.pop();
        }
        this.persistCallback?.(entry);
      }
    }, POLL_INTERVAL);
  }

  private stopPolling(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  private formatTimeAgo(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }
}
