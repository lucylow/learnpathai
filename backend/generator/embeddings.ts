// backend/generator/embeddings.ts
// Embedding utilities for semantic similarity

/**
 * Compute cosine similarity between two embedding vectors
 * @param a - First embedding vector
 * @param b - Second embedding vector
 * @returns Similarity score (0 to 1)
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length === 0 || b.length === 0) {
    return 0;
  }

  if (a.length !== b.length) {
    console.warn('Embedding vectors have different dimensions');
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) {
    return 0;
  }

  return dotProduct / denominator;
}

/**
 * Compute average embedding from multiple vectors
 * @param embeddings - Array of embedding vectors
 * @returns Average embedding vector
 */
export function averageEmbedding(embeddings: number[][]): number[] {
  if (embeddings.length === 0) {
    return [];
  }

  const dim = embeddings[0].length;
  const avg = new Array(dim).fill(0);

  for (const emb of embeddings) {
    if (emb.length !== dim) continue;
    for (let i = 0; i < dim; i++) {
      avg[i] += emb[i];
    }
  }

  for (let i = 0; i < dim; i++) {
    avg[i] /= embeddings.length;
  }

  return avg;
}

/**
 * Normalize an embedding vector to unit length
 * @param embedding - Embedding vector
 * @returns Normalized embedding vector
 */
export function normalizeEmbedding(embedding: number[]): number[] {
  const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (norm === 0) return embedding;
  return embedding.map((val) => val / norm);
}

/**
 * Find most similar items from a pool based on embedding similarity
 * @param queryEmbedding - Query embedding vector
 * @param candidates - Array of items with embeddings
 * @param topK - Number of top results to return
 * @returns Top K most similar items with scores
 */
export function findMostSimilar<T extends { embedding?: number[] }>(
  queryEmbedding: number[],
  candidates: T[],
  topK: number = 5
): Array<{ item: T; score: number }> {
  const scored = candidates
    .filter((item) => item.embedding && item.embedding.length > 0)
    .map((item) => ({
      item,
      score: cosineSimilarity(queryEmbedding, item.embedding!),
    }))
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, topK);
}

/**
 * Compute pairwise similarity matrix
 * @param embeddings - Array of embedding vectors
 * @returns 2D similarity matrix
 */
export function computeSimilarityMatrix(embeddings: number[][]): number[][] {
  const n = embeddings.length;
  const matrix: number[][] = [];

  for (let i = 0; i < n; i++) {
    matrix[i] = [];
    for (let j = 0; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 1.0;
      } else {
        matrix[i][j] = cosineSimilarity(embeddings[i], embeddings[j]);
      }
    }
  }

  return matrix;
}

/**
 * Mock function to generate random embedding (for testing)
 * In production, replace with actual embedding service call
 * @param text - Text to embed
 * @param dim - Embedding dimension
 * @returns Random embedding vector
 */
export function mockTextEmbedding(text: string, dim: number = 128): number[] {
  // Use text hash as seed for deterministic random
  let seed = 0;
  for (let i = 0; i < text.length; i++) {
    seed = (seed * 31 + text.charCodeAt(i)) % 1000000;
  }

  const embedding: number[] = [];
  for (let i = 0; i < dim; i++) {
    // Simple pseudo-random based on seed
    seed = (seed * 1103515245 + 12345) % 2147483648;
    embedding.push((seed / 2147483648) * 2 - 1);
  }

  return normalizeEmbedding(embedding);
}

