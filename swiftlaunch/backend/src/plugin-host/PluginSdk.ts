/**
 * PluginSdk — SDK interface exposed to plugins running inside worker_threads.
 *
 * Plugins receive search messages and respond with results.
 * This module provides helper utilities that plugins can import.
 */

/**
 * SDK object available to plugins for communicating with the host.
 * In worker context, plugins use parentPort to send messages.
 */
export interface PluginSdkApi {
  /** Return search results to the host */
  showList(items: PluginResultItem[]): void;
  /** Copy text to the system clipboard */
  copyToClipboard(text: string): void;
}

export interface PluginResultItem {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  score?: number;
  actionId?: string;
}

/**
 * Create the SDK object for a plugin running inside a worker_thread.
 * Call this from the plugin's entry point.
 */
export function createPluginSdk(): PluginSdkApi {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { parentPort } = require('worker_threads');

  return {
    showList(items: PluginResultItem[]) {
      parentPort?.postMessage({ type: 'results', items });
    },
    copyToClipboard(text: string) {
      parentPort?.postMessage({ type: 'clipboard', text });
    }
  };
}
