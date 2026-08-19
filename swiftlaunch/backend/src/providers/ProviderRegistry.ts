/**
 * Central provider registry that aggregates search results from all providers.
 *
 * Reference: ueli ExtensionManagerModule
 * (github.com/oliverschwendener/ueli — src/main/Core/ExtensionManager/ExtensionManagerModule.ts)
 * Adapted to fan out search across all enabled providers via Promise.allSettled,
 * merge results, and sort by score descending.
 */

import type { Result } from '@swiftlaunch/shared';
import type { Provider } from './ProviderContract.js';

export class ProviderRegistry {
  private providers: Map<string, Provider> = new Map();

  /** Register a provider instance. */
  register(provider: Provider): void {
    if (this.providers.has(provider.id)) {
      console.warn(`[ProviderRegistry] Provider "${provider.id}" is already registered, replacing.`);
    }
    this.providers.set(provider.id, provider);
    console.log(`[ProviderRegistry] Registered provider: ${provider.name} (${provider.id})`);
  }

  /** Unregister a provider by id. */
  unregister(id: string): void {
    const provider = this.providers.get(id);
    if (provider) {
      provider.dispose?.();
      this.providers.delete(id);
    }
  }

  /** Get a provider by its id. */
  getProvider(id: string): Provider | undefined {
    return this.providers.get(id);
  }

  /** Get all registered providers. */
  getAllProviders(): Provider[] {
    return Array.from(this.providers.values());
  }

  /** Initialize all registered providers. */
  async initializeAll(): Promise<void> {
    const initPromises = Array.from(this.providers.values()).map(async (p) => {
      try {
        await p.initialize?.();
        console.log(`[ProviderRegistry] Initialized: ${p.name}`);
      } catch (err) {
        console.error(`[ProviderRegistry] Failed to initialize ${p.name}:`, err);
      }
    });
    await Promise.allSettled(initPromises);
  }

  /** Dispose all registered providers. */
  disposeAll(): void {
    for (const provider of this.providers.values()) {
      try {
        provider.dispose?.();
      } catch (err) {
        console.error(`[ProviderRegistry] Failed to dispose ${provider.name}:`, err);
      }
    }
    this.providers.clear();
  }

  /**
   * Fan out a search query to all enabled providers in parallel (or route to
   * a single provider if scoped with a prefix like #files), merge results,
   * and return them sorted by score (descending).
   */
  async search(query: string): Promise<Result[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const trimmed = query.trim();

    // Check for #files / #file scope prefix
    const isFileScope = /^#(files?|file)\b/i.test(trimmed);
    if (isFileScope) {
      const scopedQuery = trimmed.replace(/^#(files?|file)\s*/i, '').trim();
      console.log(`[ProviderRegistry] Scoped file search detected: original="${trimmed}", queryToProvider="${scopedQuery}"`);
      const fileProvider = this.providers.get('FileProvider');
      if (!fileProvider || !fileProvider.enabled) {
        console.warn('[ProviderRegistry] FileProvider is not available or disabled for scoped search');
        return [];
      }
      try {
        const fileResults = await fileProvider.getResults(scopedQuery);
        console.log(`[ProviderRegistry] Provider "${fileProvider.name}" returned ${fileResults.length} result(s)`);
        return fileResults;
      } catch (err) {
        console.error('[ProviderRegistry] Error from FileProvider:', err);
        return [];
      }
    }

    const enabledProviders = Array.from(this.providers.values()).filter((p) => p.enabled);
    console.log(`[ProviderRegistry] Fan-out search query="${trimmed}" across ${enabledProviders.length} enabled provider(s)`);

    const settled = await Promise.allSettled(
      enabledProviders.map(async (provider) => {
        try {
          const results = await provider.getResults(trimmed);
          console.log(`[ProviderRegistry] Provider "${provider.name}" returned ${results.length} result(s)`);
          return results;
        } catch (err) {
          console.error(`[ProviderRegistry] Error from ${provider.name}:`, err);
          return [];
        }
      })
    );

    const allResults: Result[] = [];
    for (const outcome of settled) {
      if (outcome.status === 'fulfilled') {
        allResults.push(...outcome.value);
      }
    }

    // Sort by score descending (higher = more relevant)
    allResults.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

    return allResults;
  }
}
