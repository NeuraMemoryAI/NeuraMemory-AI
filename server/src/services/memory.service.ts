import { extractMemories } from '../utils/extract.js';
import { generateEmbeddings, generateEmbedding } from '../utils/embeddings.js';
import {
  extractTextFromUrl,
  extractTextFromDocument,
} from '../utils/content-extractors.js';
import {
  upsertMemories,
  getMemoriesByUser,
  deleteMemoriesByUser,
  deleteMemoryById,
  searchMemories,
  getMemoryStats as repoGetMemoryStats,
  getMemoryPointById as repoGetMemoryPointById,
  updateMemoryById as repoUpdateMemoryById,
} from '../repositories/memory.repository.js';
import { AppError } from '../utils/AppError.js';
import type {
  PlainTextInput,
  DocumentInput,
  LinkInput,
  MemoryResponse,
  MemoryEntry,
  MemorySource,
  StoredMemoryPayload,
} from '../types/memory.types.js';
import type { MemoryStatsResult } from '../repositories/memory.repository.js';

async function processText(
  rawText: string,
  userId: string,
  source: MemorySource,
  sourceRef?: string,
): Promise<MemoryResponse> {
  if (!rawText.trim()) {
    return {
      success: true,
      message: 'No content to extract memories from.',
      data: { memoriesStored: 0, semantic: [], bubbles: [] },
    };
  }

  const extracted = await extractMemories(rawText);

  const entries: MemoryEntry[] = [
    ...extracted.semantic.map(
      (text): MemoryEntry => ({ text, kind: 'semantic' }),
    ),
    ...extracted.bubbles.map(
      (bubble): MemoryEntry => ({
        text: bubble.text,
        kind: 'bubble',
        importance: bubble.importance,
      }),
    ),
  ];

  if (entries.length === 0) {
    return {
      success: true,
      message: 'Text processed but no extractable memories found.',
      data: { memoriesStored: 0, semantic: [], bubbles: [] },
    };
  }

  const texts = entries.map((entry) => entry.text);
  const vectors = await generateEmbeddings(texts);

  if (vectors.length !== entries.length) {
    throw new AppError(
      500,
      `Embedding count mismatch: expected ${entries.length}, got ${vectors.length}.`,
    );
  }

  const now = new Date().toISOString();
  const points = entries.map((entry, index) => ({
    vector: vectors[index]!,
    payload: {
      userId,
      text: entry.text,
      kind: entry.kind,
      importance: entry.importance ?? (entry.kind === 'semantic' ? 1.0 : 0.5),
      source,
      ...(sourceRef ? { sourceRef } : {}),
      createdAt: now,
    } satisfies StoredMemoryPayload,
  }));

  await upsertMemories(points);

  return {
    success: true,
    message: `Successfully stored ${entries.length} memor${entries.length === 1 ? 'y' : 'ies'}.`,
    data: {
      memoriesStored: entries.length,
      semantic: extracted.semantic,
      bubbles: extracted.bubbles,
    },
  };
}

export async function processPlainText(
  input: PlainTextInput,
): Promise<MemoryResponse> {
  return processText(input.text, input.userId, 'text');
}

export async function processDocument(
  input: DocumentInput,
): Promise<MemoryResponse> {
  const text = await extractTextFromDocument(
    input.buffer,
    input.mimetype,
  );
  return processText(text, input.userId, 'document', input.filename);
}

export async function processLink(input: LinkInput): Promise<MemoryResponse> {
  const text = await extractTextFromUrl(input.url);
  return processText(text, input.userId, 'link', input.url);
}

export async function getUserMemories(
  userId: string,
  options?: { kind?: string; source?: MemorySource; limit?: number; offset?: string | null },
): Promise<{ points: Array<StoredMemoryPayload & { id: string }>; nextOffset: string | null }> {
  return getMemoriesByUser(userId, options);
}

export async function semanticSearch(
  query: string,
  userId: string,
  limit?: number,
): Promise<StoredMemoryPayload[]> {
  const vector = await generateEmbedding(query);
  return searchMemories(vector, userId, limit);
}

export async function clearUserMemories(userId: string): Promise<void> {
  return deleteMemoriesByUser(userId);
}

export async function deleteUserMemoryById(
  userId: string,
  pointId: string,
): Promise<void> {
  void userId;
  await deleteMemoryById(pointId);
}

/**
 * Returns memory statistics for a user (total count, breakdown by kind and source).
 *
 * @param userId - The authenticated user's ID
 * @returns Stats object with total, byKind, and bySource counts
 */
export async function getMemoryStats(userId: string): Promise<MemoryStatsResult> {
  return repoGetMemoryStats(userId);
}

/**
 * Retrieves a single memory point by its Qdrant point ID.
 *
 * @param pointId - The Qdrant UUID of the memory point
 * @returns The point with its payload, or `null` if not found
 */
export async function getMemoryPointById(
  pointId: string,
): Promise<{ id: string; payload: StoredMemoryPayload } | null> {
  return repoGetMemoryPointById(pointId);
}

/**
 * Updates a memory point's text and regenerates its embedding.
 * The repository signature requires the vector; this service generates it internally.
 *
 * @param pointId - The Qdrant UUID of the memory point to update
 * @param text - The new text content
 * @param existingPayload - The existing payload to merge with the updated text
 */
export async function updateMemoryById(
  pointId: string,
  text: string,
  existingPayload: StoredMemoryPayload,
): Promise<void> {
  const vector = await generateEmbedding(text);
  return repoUpdateMemoryById(pointId, text, vector, existingPayload);
}
