import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '@swiftlaunch/shared';
import type { Result, ClipboardEntry } from '@swiftlaunch/shared';

contextBridge.exposeInMainWorld('api', {
  // Health check
  ping: () => ipcRenderer.invoke(IPC_CHANNELS.PING),

  // Window management
  hideWindow: () => ipcRenderer.send(IPC_CHANNELS.HIDE_WINDOW),

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

  // Listen for provider warnings
  onProviderWarning: (callback: (message: string) => void): void => {
    ipcRenderer.on(IPC_CHANNELS.PROVIDER_WARNING, (_event, message: string) => {
      callback(message);
    });
  }
});
