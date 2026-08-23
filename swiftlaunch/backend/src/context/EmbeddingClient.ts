/**
 * EmbeddingClient — client for local Ollama embeddings and vector operations.
 *
 * Calls Ollama API (http://localhost:11434/api/embeddings) using model 'nomic-embed-text'.
 * Provides vector cosine similarity calculation and Buffer serialization utilities.
 */

const OLLAMA_EMBED_URL = 'http://localhost:11434/api/embeddings';
const EMBED_MODEL = 'nomic-embed-text';

/**
 * Fetch embedding vector for the provided text from Ollama.
 * Fails gracefully and returns an empty Float32Array if Ollama is unreachable.
 */
export async function getEmbedding(text: string): Promise<Float32Array> {
  const trimmed = text.trim();
  if (!trimmed) {
    return new Float32Array(0);
  }

  try {
    const response = await fetch(OLLAMA_EMBED_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: EMBED_MODEL,
        prompt: trimmed
      }),
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      console.error(
        `[EmbeddingClient] Ollama embeddings request failed with status ${response.status}: ${response.statusText}`
      );
      return new Float32Array(0);
    }

    const data = (await response.json()) as { embedding?: number[] };
    if (!data.embedding || !Array.isArray(data.embedding)) {
      console.warn('[EmbeddingClient] Invalid embedding response received from Ollama');
      return new Float32Array(0);
    }

    return new Float32Array(data.embedding);
  } catch (err) {
    console.error('[EmbeddingClient] Failed to connect to Ollama embeddings endpoint (ensure ollama serve is running):', err);
    return new Float32Array(0);
  }
}

/**
 * Compute cosine similarity between two Float32Array vectors.
 * Returns a value in the range [-1.0, 1.0].
 */
export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  if (!a || !b || a.length === 0 || b.length === 0 || a.length !== b.length) {
    return 0;
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    const valA = a[i]!;
    const valB = b[i]!;
    dot += valA * valB;
    normA += valA * valA;
    normB += valB * valB;
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Serialize Float32Array to a Node Buffer.
 */
export function toBuffer(arr: Float32Array): Buffer {
  return Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength);
}

/**
 * Deserialize a Buffer, Uint8Array, ArrayBuffer, or base64 string back into Float32Array.
 */
export function fromBuffer(buf: Buffer | Uint8Array | ArrayBuffer | string | null | undefined): Float32Array {
  if (!buf) return new Float32Array(0);

  if (typeof buf === 'string') {
    try {
      const nodeBuf = Buffer.from(buf, 'base64');
      const aligned = new Uint8Array(nodeBuf.buffer, nodeBuf.byteOffset, nodeBuf.byteLength);
      return new Float32Array(aligned.buffer, aligned.byteOffset, aligned.byteLength / Float32Array.BYTES_PER_ELEMENT);
    } catch {
      return new Float32Array(0);
    }
  }

  if (Buffer.isBuffer(buf)) {
    const aligned = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    return new Float32Array(aligned.buffer, aligned.byteOffset, aligned.byteLength / Float32Array.BYTES_PER_ELEMENT);
  }

  if (buf instanceof Uint8Array) {
    return new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / Float32Array.BYTES_PER_ELEMENT);
  }

  if (buf instanceof ArrayBuffer) {
    return new Float32Array(buf);
  }

  return new Float32Array(0);
}
