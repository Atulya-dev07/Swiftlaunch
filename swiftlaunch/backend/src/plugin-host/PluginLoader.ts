/**
 * PluginLoader — loads and manages SwiftLaunch plugins from userData/plugins.
 *
 * Reference: Flow Launcher plugin.json manifest shape
 * (github.com/Flow-Launcher/Flow.Launcher — src/Flow.Launcher.Plugin)
 * Adapted to load JSON manifests and run plugin entry points in worker_threads.
 */

import path from 'path';
import fs from 'fs';
import { Worker } from 'worker_threads';
import type { Result, PluginManifest } from '@swiftlaunch/shared';

interface LoadedPlugin {
  manifest: PluginManifest;
  worker: Worker;
  directory: string;
}

export class PluginLoader {
  private plugins: Map<string, LoadedPlugin> = new Map();
  private pluginDir: string;

  constructor(pluginDir: string) {
    this.pluginDir = pluginDir;
  }

  /** Scan plugin directory and load all valid plugins. */
  async loadAll(): Promise<void> {
    if (!fs.existsSync(this.pluginDir)) {
      console.log(`[PluginLoader] Plugin directory does not exist: ${this.pluginDir}`);
      fs.mkdirSync(this.pluginDir, { recursive: true });
      return;
    }

    const entries = fs.readdirSync(this.pluginDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const pluginPath = path.join(this.pluginDir, entry.name);
      try {
        await this.loadPlugin(pluginPath);
      } catch (err) {
        console.error(`[PluginLoader] Failed to load plugin at ${pluginPath}:`, err);
      }
    }
    console.log(`[PluginLoader] Loaded ${this.plugins.size} plugin(s)`);
  }

  /** Load a single plugin from its directory. */
  private async loadPlugin(pluginPath: string): Promise<void> {
    const manifestPath = path.join(pluginPath, 'plugin.json');
    if (!fs.existsSync(manifestPath)) {
      console.warn(`[PluginLoader] No plugin.json found in ${pluginPath}`);
      return;
    }

    const raw = fs.readFileSync(manifestPath, 'utf-8');
    const manifest: PluginManifest = JSON.parse(raw);

    if (!manifest.id || !manifest.name || !manifest.main) {
      console.warn(`[PluginLoader] Invalid manifest in ${pluginPath}: missing id, name, or main`);
      return;
    }

    const entryPoint = path.join(pluginPath, manifest.main);
    if (!fs.existsSync(entryPoint)) {
      console.warn(`[PluginLoader] Entry point not found: ${entryPoint}`);
      return;
    }

    const worker = new Worker(entryPoint, {
      workerData: { manifest, pluginDir: pluginPath }
    });

    worker.on('error', (err) => {
      console.error(`[PluginLoader] Plugin "${manifest.name}" error:`, err);
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        console.warn(`[PluginLoader] Plugin "${manifest.name}" exited with code ${code}`);
      }
      this.plugins.delete(manifest.id);
    });

    this.plugins.set(manifest.id, { manifest, worker, directory: pluginPath });
    console.log(`[PluginLoader] Loaded plugin: ${manifest.name} v${manifest.version}`);
  }

  /** Search all loaded plugins and aggregate results. */
  async search(query: string): Promise<Result[]> {
    const allResults: Result[] = [];

    const searchPromises = Array.from(this.plugins.entries()).map(
      ([id, plugin]) =>
        new Promise<Result[]>((resolve) => {
          const timeout = setTimeout(() => resolve([]), 3000);

          const handler = (message: { type: string; items?: Result[] }) => {
            if (message.type === 'results') {
              clearTimeout(timeout);
              plugin.worker.off('message', handler);
              resolve(
                (message.items || []).map((item) => ({
                  ...item,
                  providerId: `plugin:${id}`
                }))
              );
            }
          };

          plugin.worker.on('message', handler);
          plugin.worker.postMessage({ type: 'search', query });
        })
    );

    const settled = await Promise.allSettled(searchPromises);
    for (const outcome of settled) {
      if (outcome.status === 'fulfilled') {
        allResults.push(...outcome.value);
      }
    }

    return allResults;
  }

  /** Get all loaded plugin manifests. */
  getManifests(): PluginManifest[] {
    return Array.from(this.plugins.values()).map((p) => p.manifest);
  }

  /** Terminate all plugin workers. */
  disposeAll(): void {
    for (const [, plugin] of this.plugins) {
      plugin.worker.terminate();
    }
    this.plugins.clear();
  }
}
