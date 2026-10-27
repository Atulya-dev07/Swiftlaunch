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
  icon?: string;
}

export class AppProvider implements Provider {
  readonly id = 'AppProvider';
  readonly name = 'Applications';
  enabled = true;

  private cache: AppEntry[] = [];
  private iconCache = new Map<string, string>();
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
    this.warmUpIconCache();
  }

  dispose(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }

  async getResults(query: string): Promise<Result[]> {
    const q = query.toLowerCase();
    const matches = this.cache
      .filter((app) => app.name.toLowerCase().includes(q))
      .slice(0, 15);

    return Promise.all(
      matches.map(async (app) => {
        const nameLC = app.name.toLowerCase();
        const idx = nameLC.indexOf(q);
        // Score: prefix matches score highest, then by position
        let score = 70;
        if (idx === 0) score = 95;
        else if (idx > 0) score = 80 - idx;

        const icon = app.icon || (await this.getAppIcon(app.lnkPath)) || '🖥️';
        if (icon !== '🖥️' && !app.icon) {
          app.icon = icon;
        }

        return {
          id: `app:${app.lnkPath}`,
          icon,
          title: app.name,
          subtitle: app.lnkPath,
          score: Math.max(score, 10),
          providerId: this.id,
          actionId: 'launch'
        };
      })
    );
  }

  async executeAction(resultId: string): Promise<void> {
    const lnkPath = resultId.replace('app:', '');
    await shell.openPath(lnkPath);
  }

  /** Get all scanned applications for indexing and external providers. */
  async getApplications(): Promise<{ id: string; name: string; lnkPath: string; icon?: string }[]> {
    return this.cache.map((app) => ({
      id: `app:${app.lnkPath}`,
      name: app.name,
      lnkPath: app.lnkPath,
      icon: app.icon || this.iconCache.get(app.lnkPath)
    }));
  }

  private async getAppIcon(lnkPath: string): Promise<string | undefined> {
    const cached = this.iconCache.get(lnkPath);
    if (cached) return cached;

    try {
      let getFileIconFn: ((p: string, opts?: any) => Promise<any>) | undefined;
      let readShortcutFn: ((p: string) => any) | undefined;

      try {
        const electron = await import('electron');
        const electronApp = electron.app || (electron.default && (electron.default as any).app);
        const electronShell = electron.shell || (electron.default && (electron.default as any).shell) || shell;
        if (electronApp && typeof electronApp.getFileIcon === 'function') {
          getFileIconFn = electronApp.getFileIcon.bind(electronApp);
        }
        if (electronShell && typeof electronShell.readShortcutLink === 'function') {
          readShortcutFn = electronShell.readShortcutLink.bind(electronShell);
        }
      } catch {
        // Non-electron environment
      }

      if (!getFileIconFn) return undefined;

      // 1. If it's a shortcut (.lnk), try reading target or custom icon first
      let iconCandidate = lnkPath;
      if (readShortcutFn && lnkPath.toLowerCase().endsWith('.lnk')) {
        try {
          const shortcut = readShortcutFn(lnkPath);
          if (shortcut) {
            if (shortcut.icon && fs.existsSync(shortcut.icon)) {
              iconCandidate = shortcut.icon;
            } else if (shortcut.target && fs.existsSync(shortcut.target)) {
              iconCandidate = shortcut.target;
            }
          }
        } catch {
          // Fallback to lnkPath
        }
      }

      // 2. Try candidate path (target .exe or shortcut.icon)
      try {
        const nativeImg = await getFileIconFn(iconCandidate, { size: 'normal' });
        if (nativeImg && !nativeImg.isEmpty()) {
          const dataUrl = nativeImg.toDataURL();
          this.iconCache.set(lnkPath, dataUrl);
          return dataUrl;
        }
      } catch {
        // Fallback below
      }

      // 3. If candidate failed and it differs from lnkPath, try lnkPath itself
      if (iconCandidate !== lnkPath) {
        try {
          const nativeImg = await getFileIconFn(lnkPath, { size: 'normal' });
          if (nativeImg && !nativeImg.isEmpty()) {
            const dataUrl = nativeImg.toDataURL();
            this.iconCache.set(lnkPath, dataUrl);
            return dataUrl;
          }
        } catch {
          // Ignore
        }
      }
    } catch {
      // Ignore
    }

    return undefined;
  }

  private warmUpIconCache(): void {
    const appsToWarm = [...this.cache];
    const processBatch = async () => {
      const batch = appsToWarm.splice(0, 10);
      if (batch.length === 0) return;

      await Promise.all(
        batch.map(async (app) => {
          if (!app.icon) {
            const icon = await this.getAppIcon(app.lnkPath);
            if (icon) {
              app.icon = icon;
            }
          }
        })
      );

      if (appsToWarm.length > 0) {
        setTimeout(processBatch, 40);
      }
    };

    setTimeout(processBatch, 100);
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

    // Restore cached icons if already extracted
    for (const entry of this.cache) {
      const cached = this.iconCache.get(entry.lnkPath);
      if (cached) {
        entry.icon = cached;
      }
    }

    console.log(`[AppProvider] Scanned ${this.cache.length} applications`);
  }

  private scanDirectory(dir: string, entries: AppEntry[]): void {
    try {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
          this.scanDirectory(fullPath, entries);
        } else if (item.name.toLowerCase().endsWith('.lnk')) {
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
          this.scanApplications().then(() => {
            this.warmUpIconCache();
          });
        });
      })
      .catch((err) => {
        console.warn('[AppProvider] chokidar not available, file watching disabled:', err);
      });
  }
}
