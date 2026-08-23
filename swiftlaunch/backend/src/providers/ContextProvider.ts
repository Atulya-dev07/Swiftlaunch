/**
 * ContextProvider — contextual screen-aware search provider.
 *
 * Implements ProviderContract to surface relevant applications and files
 * based on OCR screen capture, NLP keyword extraction, and vector similarity.
 */

import { shell } from 'electron';
import path from 'path';
import fs from 'fs';
import type { Result } from '@swiftlaunch/shared';
import type { Provider } from './ProviderContract.js';
import type { DbQueries } from '../db/queries.js';
import type { AppProvider } from './AppProvider.js';
import type { FileProvider } from './FileProvider.js';
import { scanForegroundScreen, disposeScanner } from '../context/ScreenScanner.js';
import { buildContextQuery, extractKeywords } from '../context/KeywordExtractor.js';
import { getEmbedding, cosineSimilarity, toBuffer } from '../context/EmbeddingClient.js';
import { IndexEmbedder, type IndexableItem } from '../context/IndexEmbedder.js';

const SIMILARITY_THRESHOLD = 0.45;
const MAX_RESULTS = 8;
const CACHE_TTL_MS = 15000; // 15 seconds

export class ContextProvider implements Provider {
  readonly id = 'ContextProvider';
  readonly name = 'Contextual Search';
  enabled = true;

  private indexEmbedder: IndexEmbedder;
  private cachedResults: Result[] = [];
  private lastScanTime = 0;
  private isRefreshing = false;
  private updateCallback: ((results: Result[]) => void) | null = null;

  constructor(
    private dbQueries: DbQueries,
    private appProvider?: AppProvider,
    private fileProvider?: FileProvider
  ) {
    this.indexEmbedder = new IndexEmbedder(this.dbQueries);
  }

  /** Set callback for pushing updated contextual results to renderer */
  setUpdateCallback(cb: (results: Result[]) => void): void {
    this.updateCallback = cb;
  }

  /** Wire application and file providers if instantiated later */
  setProviders(appProvider: AppProvider, fileProvider: FileProvider): void {
    this.appProvider = appProvider;
    this.fileProvider = fileProvider;
  }

  async initialize(): Promise<void> {
    // Initial background indexing of apps and known files
    try {
      const items = this.collectIndexableItems();
      if (items.length > 0) {
        await this.indexEmbedder.indexItems(items);
      }
    } catch (err) {
      console.warn('[ContextProvider] Error during initial item embedding indexing:', err);
    }
  }

  dispose(): void {
    disposeScanner().catch((err) => {
      console.error('[ContextProvider] Error disposing scanner:', err);
    });
  }

  /**
   * Refreshes contextual suggestions by capturing the screen, running OCR,
   * computing semantic similarity, and ranking items.
   */
  async refreshContext(): Promise<Result[]> {
    // Check if contextual search is enabled in settings
    if (!this.dbQueries.isContextScanEnabled()) {
      return [];
    }

    // Skip if recently scanned within TTL
    const now = Date.now();
    if (now - this.lastScanTime < CACHE_TTL_MS && this.cachedResults.length > 0) {
      return [...this.cachedResults];
    }

    if (this.isRefreshing) {
      return [...this.cachedResults];
    }

    this.isRefreshing = true;

    try {
      // 1. Capture screen & run local OCR
      const { rawText, scannedAt } = await scanForegroundScreen();
      if (!rawText || rawText.trim().length === 0) {
        this.cachedResults = [];
        this.lastScanTime = scannedAt;
        this.updateCallback?.(this.cachedResults);
        return [];
      }

      // 2. Extract NLP keywords from OCR text
      const keywords = extractKeywords(rawText);
      const contextQuery = buildContextQuery(rawText);

      if (!contextQuery || keywords.length === 0) {
        this.cachedResults = [];
        this.lastScanTime = scannedAt;
        this.updateCallback?.(this.cachedResults);
        return [];
      }

      // 3. Generate embedding vector via Ollama nomic-embed-text
      const queryEmbedding = await getEmbedding(contextQuery);
      if (queryEmbedding.length === 0) {
        // Ollama may be offline or unreachable
        return [...this.cachedResults];
      }

      // 4. Save scan cache to DB
      this.dbQueries.saveContextScanCache(
        rawText,
        toBuffer(queryEmbedding).toString('base64')
      );

      // 5. Index any newly added applications/files
      const itemsToIndex = this.collectIndexableItems();
      await this.indexEmbedder.indexItems(itemsToIndex);

      // 6. Compare query embedding with all cached item embeddings
      const allCached = this.indexEmbedder.getAllEmbeddings();
      const scored: { item: (typeof allCached)[0]; similarity: number }[] = [];

      for (const item of allCached) {
        const similarity = cosineSimilarity(queryEmbedding, item.embedding);
        if (similarity >= SIMILARITY_THRESHOLD) {
          scored.push({ item, similarity });
        }
      }

      // 7. Sort by highest similarity
      scored.sort((a, b) => b.similarity - a.similarity);
      const topMatches = scored.slice(0, MAX_RESULTS);

      // ── TEMPORARY LOG FOR OCR QUALITY & SIMILARITY VERIFICATION ──────
      // (Can be removed after manual testing)
      console.log('[ContextProvider:refreshContext] === Context Scan Results ===');
      console.log('[ContextProvider:refreshContext] OCR Text Preview:', rawText.trim().slice(0, 120).replace(/\n/g, ' '));
      console.log('[ContextProvider:refreshContext] Extracted Keywords:', keywords.slice(0, 10));
      console.log(
        '[ContextProvider:refreshContext] Ranked Matches:',
        topMatches.map((m) => ({
          label: m.item.label,
          similarity: Number(m.similarity.toFixed(4)),
          type: m.item.type
        }))
      );
      // ─────────────────────────────────────────────────────────────────

      // 8. Transform top matches into Result objects
      this.cachedResults = topMatches.map(({ item, similarity }) => {
        const isApp = item.type === 'app';
        let icon = isApp ? '🖥️' : '📄';
        if (!isApp && this.fileProvider) {
          const filePath = item.id.replace('file:', '');
          icon = this.fileProvider.getFileIcon(filePath);
        }

        const scorePercent = Math.round(similarity * 100);

        return {
          id: item.id,
          icon,
          title: item.label,
          subtitle: `Related to your screen · ${scorePercent}% match`,
          score: 85 + Math.round(similarity * 15), // High priority score for contextual suggestions
          providerId: this.id,
          actionId: isApp ? 'launch' : 'open'
        };
      });

      this.lastScanTime = scannedAt;
      this.updateCallback?.(this.cachedResults);
      return [...this.cachedResults];
    } catch (err) {
      console.error('[ContextProvider] Error refreshing context:', err);
      return [...this.cachedResults];
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Return contextual results when query is empty or prefixed with "ctx:" / "ctx".
   */
  async getResults(query: string): Promise<Result[]> {
    return this.search(query);
  }

  /**
   * Search method: surfaces cached contextual results for empty queries or ctx: prefix.
   */
  async search(query: string): Promise<Result[]> {
    const trimmed = query ? query.trim() : '';

    if (!trimmed || trimmed === 'ctx' || trimmed.startsWith('ctx:') || trimmed.startsWith('#ctx')) {
      return [...this.cachedResults];
    }

    return [];
  }

  /**
   * Execute action on a contextual result (launch application or open file).
   */
  async executeAction(resultId: string, actionId?: string): Promise<void> {
    if (resultId.startsWith('app:')) {
      const lnkPath = resultId.replace('app:', '');
      await shell.openPath(lnkPath);
      return;
    }

    if (resultId.startsWith('file:')) {
      const filePath = resultId.replace('file:', '');
      if (actionId === 'show_in_folder' || actionId === 'reveal') {
        shell.showItemInFolder(filePath);
        return;
      }
      if (fs.existsSync(filePath)) {
        await shell.openPath(filePath);
      }
    }
  }

  /**
   * Gather indexable items from AppProvider and FileProvider.
   */
  private collectIndexableItems(): IndexableItem[] {
    const items: IndexableItem[] = [];

    if (this.appProvider) {
      const apps = this.appProvider.getApplications();
      for (const app of apps) {
        items.push({
          id: app.id,
          type: 'app',
          label: app.name
        });
      }
    }

    if (this.fileProvider) {
      const files = this.fileProvider.getIndexableFiles();
      for (const file of files) {
        items.push({
          id: file.id,
          type: 'file',
          label: file.label
        });
      }
    }

    return items;
  }
}
