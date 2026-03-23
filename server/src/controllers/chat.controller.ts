import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError.js';
import { chatMessageSchema } from '../validations/chat.validation.js';
import { streamChatResponse } from '../services/chat.service.js';

/**
 * @module chat.controller
 * HTTP request handler for the chat streaming endpoint.
 * Validates input, sets SSE headers, and delegates streaming to `chat.service.ts`.
 */

export async function chatController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const userId = req.user?.userId;
  if (!userId) {
    next(new AppError(401, 'Authentication required.'));
    return;
  }

  const parseResult = chatMessageSchema.safeParse(req.body);
  if (!parseResult.success) {
    next(new AppError(400, parseResult.error.errors[0]?.message ?? 'Invalid input.'));
    return;
  }

  const { message } = parseResult.data;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  await streamChatResponse(
    message,
    userId,
    (content) => {
      res.write(`data: ${JSON.stringify({ type: 'token', content })}\n\n`);
    },
    () => {
      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      res.end();
    },
    (errorMessage) => {
      res.write(`data: ${JSON.stringify({ type: 'error', message: errorMessage })}\n\n`);
      res.end();
    },
  );
}
