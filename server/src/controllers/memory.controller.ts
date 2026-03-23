import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import {
  plainTextSchema,
  linkSchema,
  ALLOWED_DOCUMENT_MIMES,
  updateMemorySchema,
  getMemoriesQuerySchema,
  searchMemoriesQuerySchema,
} from '../validations/memory.validation.js';
import {
  processPlainText,
  processDocument,
  processLink,
  getUserMemories,
  clearUserMemories,
  deleteUserMemoryById,
  getMemoryStats,
  getMemoryPointById,
  updateMemoryById,
  semanticSearch,
} from '../services/memory.service.js';
import { AppError } from '../utils/AppError.js';
import type { MemorySource } from '../types/memory.types.js';

/**
 * @module memory.controller
 * HTTP request handlers for memory CRUD and search endpoints.
 * Delegates all business logic to `memory.service.ts`.
 */

export function clampSearchLimit(n: number): number {
  if (isNaN(n) || n < 1) return 10;
  return Math.min(n, 50);
}

function getAuthUserId(req: Request): string {
  const user = req.user;
  if (!user?.userId) {
    throw new AppError(401, 'Authentication required.');
  }
  return user.userId;
}

export async function createFromText(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = getAuthUserId(req);

    const result = plainTextSchema.safeParse(req.body);
    if (!result.success) {
      throw new AppError(
        400,
        result.error.errors[0]?.message ?? 'Invalid input.',
      );
    }

    const response = await processPlainText({ text: result.data.text, userId });
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

export async function createFromLink(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = getAuthUserId(req);

    const result = linkSchema.safeParse(req.body);
    if (!result.success) {
      throw new AppError(
        400,
        result.error.errors[0]?.message ?? 'Invalid input.',
      );
    }

    const response = await processLink({ url: result.data.url, userId });
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

export async function createFromDocument(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = getAuthUserId(req);
    const file = (req as Request & { file?: Express.Multer.File }).file;

    if (!file) {
      throw new AppError(400, 'No file uploaded. Please attach a document.');
    }

    if (
      !(ALLOWED_DOCUMENT_MIMES as readonly string[]).includes(file.mimetype)
    ) {
      throw new AppError(
        415,
        `Unsupported file type: ${file.mimetype}. Allowed: PDF, DOCX, TXT, MD.`,
      );
    }

    const response = await processDocument({
      userId,
      filename: file.originalname,
      mimetype: file.mimetype,
      buffer: file.buffer,
    });

    res.status(201).json(response);
  } catch (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        next(new AppError(413, 'File size exceeds the 10 MB limit.'));
        return;
      }
      next(new AppError(400, `Upload error: ${err.message}`));
      return;
    }

    next(err);
  }
}

export async function getMemories(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = getAuthUserId(req);

    const parseResult = getMemoriesQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      throw new AppError(
        400,
        parseResult.error.errors[0]?.message ?? 'Invalid query parameters.',
      );
    }

    const { kind, source, limit, offset } = parseResult.data;

    const options: {
      kind?: string;
      source?: MemorySource;
      limit?: number;
      offset?: string | null;
    } = { limit };
    if (kind !== undefined) options.kind = kind;
    if (source !== undefined) options.source = source;
    if (offset !== undefined) options.offset = offset;

    const { points, nextOffset } = await getUserMemories(userId, options);

    res.status(200).json({
      success: true,
      message: `Found ${points.length} memor${points.length === 1 ? 'y' : 'ies'}.`,
      data: points,
      nextOffset,
      hasMore: nextOffset !== null,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteMemories(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = getAuthUserId(req);

    await clearUserMemories(userId);

    res.status(200).json({
      success: true,
      message: 'All memories deleted.',
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteMemoryById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = getAuthUserId(req);
    const pointId = Array.isArray(req.params['id'])
      ? req.params['id'][0]
      : req.params['id'];
    if (!pointId) {
      throw new AppError(400, 'Memory ID is required.');
    }
    await deleteUserMemoryById(userId, pointId);
    res.status(200).json({ success: true, message: 'Memory deleted.' });
  } catch (err) {
    next(err);
  }
}

export async function searchMemoriesController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = getAuthUserId(req);

    const parseResult = searchMemoriesQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      throw new AppError(
        400,
        parseResult.error.errors[0]?.message ?? 'Invalid query parameters.',
      );
    }

    const { q, limit } = parseResult.data;
    const results = await semanticSearch(q, userId, limit);

    res.status(200).json({
      success: true,
      message: `Found ${results.length} result(s).`,
      data: results,
    });
  } catch (err) {
    next(err);
  }
}

export async function getStats(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = getAuthUserId(req);
    const stats = await getMemoryStats(userId);
    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
}

export async function updateMemory(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = getAuthUserId(req);
    const pointId = Array.isArray(req.params['id'])
      ? req.params['id'][0]
      : req.params['id'];
    if (!pointId) throw new AppError(400, 'Memory ID is required.');

    const parseResult = updateMemorySchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new AppError(
        400,
        parseResult.error.errors[0]?.message ?? 'Invalid input.',
      );
    }

    const { text } = parseResult.data;

    const existing = await getMemoryPointById(pointId);
    if (!existing) throw new AppError(404, 'Memory not found.');
    if (existing.payload.userId !== userId) throw new AppError(403, 'Forbidden.');

    await updateMemoryById(pointId, text, existing.payload);

    res.status(200).json({ success: true, message: 'Memory updated.' });
  } catch (err) {
    next(err);
  }
}
