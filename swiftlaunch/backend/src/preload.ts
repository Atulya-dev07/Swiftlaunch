import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '@swiftlaunch/shared';
import type { Result, ClipboardEntry } from '@swiftlaunch/shared';

console.log('[Preload] SwiftLaunch API exposed');

contextBridge.exposeInMainWorld('api', {
  // Health check
  ping: (): Promise<string> => ipcRenderer.invoke(IPC_CHANNELS.PING),

  // Window management
  hideWindow: (): void => ipcRenderer.send(IPC_CHANNELS.HIDE_WINDOW),

  // Search
  search: (query: string): Promise<Result[]> => ipcRenderer.invoke(IPC_CHANNELS.SEARCH, query),

  // Actions
  executeAction: (resultId: string, actionId?: string): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.EXECUTE_ACTION, resultId, actionId),

  // Usage logging
  logUsage: (query: string, resultId: string): void =>
    ipcRenderer.send(IPC_CHANNELS.LOG_USAGE, query, resultId),

  // Clipboard history
  getClipboardHistory: (): Promise<ClipboardEntry[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.GET_CLIPBOARD_HISTORY),

  // Window snapping
  snapWindow: (direction: string): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.SNAP_WINDOW, direction),

  // Listen for provider warnings (returns unsubscribe function)
  onProviderWarning: (callback: (message: string) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, message: string) => {
      callback(message);
    };
    ipcRenderer.on(IPC_CHANNELS.PROVIDER_WARNING, listener);
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.PROVIDER_WARNING, listener);
    };
  },

  // Listen for contextual search results updates (returns unsubscribe function)
  onContextResultsUpdated: (callback: (results: Result[]) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, results: Result[]) => {
      callback(results);
    };
    ipcRenderer.on(IPC_CHANNELS.CONTEXT_RESULTS_UPDATED, listener);
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.CONTEXT_RESULTS_UPDATED, listener);
    };
  },

  // Get all installed applications
  getAllApps: () => ipcRenderer.invoke(IPC_CHANNELS.GET_ALL_APPS),

  // Launch group of applications together
  launchAppGroup: (appIds: string[]): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.LAUNCH_APP_GROUP, appIds)
});
