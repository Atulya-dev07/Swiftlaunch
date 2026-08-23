/**
 * AppProvider — enumerates installed applications from Windows Start Menu.
 *
 * Reference: ueli WindowsApplicationRepository
 * (github.com/oliverschwendener/ueli — src/main/Extensions/ApplicationSearch/Windows/WindowsApplicationRepository.ts)
 * Adapted to scan user and all-users Start Menu folders for .lnk files,
 * cache in memory, and use chokidar for invalidation.
 */

import path from 'path';
import fs from 'fs';
import { shell } from 'electron';
import type { FSWatcher } from 'chokidar';
import type { Result } from '@swiftlaunch/shared';
import type { Provider } from './ProviderContract.js';

interface AppEntry {
  name: string;
  lnkPath: string;
}

export class AppProvider implements Provider {
  readonly id = 'AppProvider';
  readonly name = 'Applications';
  enabled = true;

  private cache: AppEntry[] = [];
  private watcher: FSWatcher | null = null;
  private startMenuPaths: string[];

  constructor() {
    const userStart = path.join(
      process.env['APPDATA'] || '',
      'Microsoft',
      'Windows',
      'Start Menu',
      'Programs'
    );
    const allUsersStart = path.join(
      process.env['PROGRAMDATA'] || 'C:\\ProgramData',
      'Microsoft',
      'Windows',
      'Start Menu',
      'Programs'
    );
    this.startMenuPaths = [userStart, allUsersStart].filter((p) => fs.existsSync(p));
  }

  async initialize(): Promise<void> {
    await this.scanApplications();
    this.setupWatcher();
  }

  dispose(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }

  async getResults(query: string): Promise<Result[]> {
    const q = query.toLowerCase();
    return this.cache
      .filter((app) => app.name.toLowerCase().includes(q))
      .map((app) => {
        const nameLC = app.name.toLowerCase();
        const idx = nameLC.indexOf(q);
        // Score: prefix matches score highest, then by position
        let score = 70;
        if (idx === 0) score = 95;
        else if (idx > 0) score = 80 - idx;
        return {
          id: `app:${app.lnkPath}`,
          icon: '🖥️',
          title: app.name,
          subtitle: app.lnkPath,
          score: Math.max(score, 10),
          providerId: this.id,
          actionId: 'launch'
        };
      })
      .slice(0, 15);
  }

  async executeAction(resultId: string): Promise<void> {
    const lnkPath = resultId.replace('app:', '');
    await shell.openPath(lnkPath);
  }

  /** Get all scanned applications for indexing and external providers. */
  getApplications(): { id: string; name: string; lnkPath: string }[] {
    return this.cache.map((app) => ({
      id: `app:${app.lnkPath}`,
      name: app.name,
      lnkPath: app.lnkPath
    }));
  }

  private async scanApplications(): Promise<void> {
    const entries: AppEntry[] = [];
    for (const startMenuDir of this.startMenuPaths) {
      this.scanDirectory(startMenuDir, entries);
    }
    // Deduplicate by name (keep first occurrence — user Start Menu takes priority)
    const seen = new Set<string>();
    this.cache = entries.filter((e) => {
      const key = e.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    console.log(`[AppProvider] Scanned ${this.cache.length} applications`);
  }

  private scanDirectory(dir: string, entries: AppEntry[]): void {
    try {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
          this.scanDirectory(fullPath, entries);
        } else if (item.name.endsWith('.lnk')) {
          entries.push({
            name: item.name.replace(/\.lnk$/i, ''),
            lnkPath: fullPath
          });
        }
      }
    } catch {
      // Ignore permission errors on protected folders
    }
  }

  private setupWatcher(): void {
    // Dynamic import chokidar to avoid issues in test environments
    import('chokidar')
      .then(({ watch }) => {
        this.watcher = watch(this.startMenuPaths, {
          ignoreInitial: true,
          depth: 5
        });
        this.watcher.on('all', () => {
          console.log('[AppProvider] Start Menu changed, rescanning...');
          this.scanApplications();
        });
      })
      .catch((err) => {
        console.warn('[AppProvider] chokidar not available, file watching disabled:', err);
      });
  }
}
