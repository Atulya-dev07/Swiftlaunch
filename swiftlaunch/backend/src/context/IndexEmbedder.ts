/**
 * IndexEmbedder — manages pre-computed embedding vectors for installed apps and files.
 *
 * Checks database for existing embeddings and only generates/persists embeddings
 * for newly discovered items, avoiding expensive recomputation on every hotkey press.
 */

import type { DbQueries } from '../db/queries.js';
import type { ItemEmbeddingRecord } from '../db/schema.js';
import { getEmbedding, toBuffer, fromBuffer } from './EmbeddingClient.js';

export interface IndexableItem {
  id: string;
  type: 'app' | 'file' | string;
  label: string;
}

export interface CachedItemEmbedding {
  id: string;
  type: 'app' | 'file' | string;
  label: string;
  embedding: Float32Array;
}

export class IndexEmbedder {
  constructor(private dbQueries: DbQueries) {}

  /**
   * Index missing items: computes embeddings for items that don't yet exist in the DB
   * and saves them.
   */
  async indexItems(items: IndexableItem[]): Promise<void> {
    if (!items || items.length === 0) return;

    const existingMap = new Map<string, ItemEmbeddingRecord>();
    for (const record of this.dbQueries.getAllItemEmbeddings()) {
      existingMap.set(record.item_id, record);
    }

    const missingItems = items.filter((item) => !existingMap.has(item.id));
    if (missingItems.length === 0) {
      return;
    }

    console.log(`[IndexEmbedder] Computing embeddings for ${missingItems.length} new items...`);

    const newRecords: ItemEmbeddingRecord[] = [];
    for (const item of missingItems) {
      try {
        const embedding = await getEmbedding(item.label);
        if (embedding.length > 0) {
          newRecords.push({
            item_id: item.id,
            item_type: item.type,
            label: item.label,
            embedding: toBuffer(embedding).toString('base64'),
            updated_at: Date.now()
          });
        }
      } catch (err) {
        console.error(`[IndexEmbedder] Failed to embed item "${item.label}" (${item.id}):`, err);
      }
    }

    if (newRecords.length > 0) {
      this.dbQueries.upsertItemEmbeddings(newRecords);
      console.log(`[IndexEmbedder] Cached ${newRecords.length} new embeddings to DB`);
    }
  }

  /**
   * Read all cached item embeddings from the database.
   */
  getAllEmbeddings(): CachedItemEmbedding[] {
    const rawRecords = this.dbQueries.getAllItemEmbeddings();
    const result: CachedItemEmbedding[] = [];

    for (const record of rawRecords) {
      const embedding = fromBuffer(record.embedding);
      if (embedding.length > 0) {
        result.push({
          id: record.item_id,
          type: record.item_type,
          label: record.label,
          embedding
        });
      }
    }

    return result;
  }
}
