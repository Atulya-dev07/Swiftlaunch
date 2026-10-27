/**
 * IPC handlers — wires real IPC channels connecting frontend to backend.
 *
 * Replaces placeholder ping/pong with real search, action execution,
 * usage logging, and clipboard history channels.
 */

import { ipcMain, shell, BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '@swiftlaunch/shared';
import type { Result } from '@swiftlaunch/shared';
import type { ProviderRegistry } from '../providers/ProviderRegistry.js';
import type { AppProvider } from '../providers/AppProvider.js';
import type { DbQueries } from '../db/queries.js';
import type { PluginLoader } from '../plugin-host/PluginLoader.js';
import type { WindowSnapper, SnapDirection } from '../window-manager/WindowSnapper.js';

interface HandlerDependencies {
  registry: ProviderRegistry;
  dbQueries: DbQueries;
  pluginLoader: PluginLoader;
  windowSnapper: WindowSnapper;
}

export function registerIpcHandlers(deps: HandlerDependencies): void {
  const { registry, dbQueries, pluginLoader, windowSnapper } = deps;

  // Keep the ping channel for health checks
  ipcMain.handle(IPC_CHANNELS.PING, () => 'pong');

  // Hide window
  ipcMain.on(IPC_CHANNELS.HIDE_WINDOW, (event) => {
    const win = event.sender;
    const browserWindow = BrowserWindow.fromWebContents(win);
    browserWindow?.hide();
  });

  // ── Search ──────────────────────────────────────────────────────
  ipcMain.handle(IPC_CHANNELS.SEARCH, async (_event, query: string): Promise<Result[]> => {
    if (!query || query.trim().length === 0) return [];

    const isFileScope = /^#(files?|file)\b/i.test(query.trim());
    console.log(`[IPC] received search: ${query}`);

    // Fan out to providers (handles #files scope internally)
    const providerResults = await registry.search(query);

    // In #files scope, exclusively return FileProvider results (no plugins/apps/clip)
    if (isFileScope) {
      const scopedResults = providerResults.slice(0, 50);
      console.log(`[IPC] returning ${scopedResults.length} results`);
      return scopedResults;
    }

    // Fan out to plugins for non-scoped search
    let pluginResults: Result[] = [];
    try {
      pluginResults = await pluginLoader.search(query);
    } catch (err) {
      console.error('[IPC:SEARCH] Plugin search error:', err);
    }

    const allResults = [...providerResults, ...pluginResults];

    // Apply usage frequency boost scores
    const resultIds = allResults.map((r) => r.id);
    const boosts = dbQueries.getBoostScores(resultIds);
    for (const result of allResults) {
      const boost = boosts.get(result.id);
      if (boost) {
        result.score = (result.score ?? 0) + Math.round(boost * 10);
      }
    }

    // Re-sort with boosts applied
    allResults.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

    const finalResults = allResults.slice(0, 50);
    console.log(`[IPC] returning ${finalResults.length} results`);
    return finalResults;
  });

  // ── Execute action ──────────────────────────────────────────────
  ipcMain.handle(
    IPC_CHANNELS.EXECUTE_ACTION,
    async (_event, resultId: string, actionId?: string): Promise<void> => {
      // Determine which provider owns the result
      const providerId = resultId.split(':')[0];

      if (providerId === 'google') {
        // Open Google search URL
        const query = resultId.replace('google:', '');
        const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        await shell.openExternal(url);
        return;
      }

      // Try each registered provider
      for (const provider of registry.getAllProviders()) {
        if (resultId.startsWith(provider.id.replace('Provider', '').toLowerCase() + ':')) {
          await provider.executeAction?.(resultId, actionId);
          return;
        }
      }

      // Try generic open for file: results
      if (providerId === 'file') {
        const filePath = resultId.replace('file:', '');
        if (actionId === 'show_in_folder' || actionId === 'reveal' || actionId === 'open_folder') {
          shell.showItemInFolder(filePath);
          return;
        }
        const err = await shell.openPath(filePath);
        if (err) {
          console.error(`[IPC:EXECUTE_ACTION] shell.openPath failed for ${filePath}: ${err}`);
        }
        return;
      }

      // App launch
      if (providerId === 'app') {
        const lnkPath = resultId.replace('app:', '');
        await shell.openPath(lnkPath);
        return;
      }

      console.warn(`[IPC:EXECUTE_ACTION] No handler for result: ${resultId}`);
    }
  );

  // ── Log usage ───────────────────────────────────────────────────
  ipcMain.on(IPC_CHANNELS.LOG_USAGE, (_event, query: string, resultId: string) => {
    dbQueries.logUsage(query, resultId);
  });

  // ── Window snapping ─────────────────────────────────────────────
  ipcMain.handle(IPC_CHANNELS.SNAP_WINDOW, async (_event, direction: SnapDirection) => {
    await windowSnapper.snap(direction);
  });

  // ── Get all installed apps ──────────────────────────────────────
  ipcMain.handle(IPC_CHANNELS.GET_ALL_APPS, async () => {
    const appProvider = registry.getProvider('AppProvider') as AppProvider | undefined;
    if (appProvider && typeof appProvider.getApplications === 'function') {
      return await appProvider.getApplications();
    }
    return [];
  });

  // ── Launch group of apps together ───────────────────────────────
  ipcMain.handle(IPC_CHANNELS.LAUNCH_APP_GROUP, async (_event, appIds: string[]) => {
    if (!Array.isArray(appIds) || appIds.length === 0) return;
    console.log(`[IPC:LAUNCH_APP_GROUP] Launching ${appIds.length} apps together:`, appIds);

    for (const appId of appIds) {
      try {
        if (appId.startsWith('app:')) {
          const lnkPath = appId.replace('app:', '');
          await shell.openPath(lnkPath);
        } else if (appId.startsWith('file:')) {
          const filePath = appId.replace('file:', '');
          await shell.openPath(filePath);
        } else {
          for (const provider of registry.getAllProviders()) {
            if (appId.startsWith(provider.id.replace('Provider', '').toLowerCase() + ':')) {
              await provider.executeAction?.(appId);
              break;
            }
          }
        }
      } catch (err) {
        console.error(`[IPC:LAUNCH_APP_GROUP] Failed to launch ${appId}:`, err);
      }
    }
  });

  console.log('[IPC] All handlers registered');
}
