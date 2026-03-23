import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import type { Request, Response } from 'express';
import {
  createMcpServer,
  getTransport,
  setTransport,
  removeTransport,
  resolveUserFromRequest,
} from '../services/mcp.service.js';

/**
 * @module mcp.route
 * Express router for the Model Context Protocol (MCP) endpoints.
 * Delegates all MCP server creation, session management, and user resolution
 * to `mcp.service.ts`.
 */

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'NeuraMemory-MCP' });
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const auth = await resolveUserFromRequest(req);
  if (!auth) {
    res.status(401).json({ error: 'API Key required' });
    return;
  }

  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  if (sessionId) {
    const existing = getTransport(sessionId);
    if (existing) {
      await existing.handleRequest(req, res, req.body);
      return;
    }
  }

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
  });

  const server = createMcpServer(auth.userId);
  await server.connect(transport as any);

  transport.onclose = () => {
    if (transport.sessionId) {
      removeTransport(transport.sessionId);
    }
  };

  await transport.handleRequest(req, res, req.body);

  if (transport.sessionId) {
    setTransport(transport.sessionId, transport);
  }
});

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  if (!sessionId) {
    res.status(400).json({ error: 'Invalid or missing session ID' });
    return;
  }
  const transport = getTransport(sessionId);
  if (!transport) {
    res.status(400).json({ error: 'Invalid or missing session ID' });
    return;
  }
  await transport.handleRequest(req, res);
});

router.delete('/', async (req: Request, res: Response): Promise<void> => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  if (!sessionId) {
    res.status(400).json({ error: 'Invalid or missing session ID' });
    return;
  }
  const transport = getTransport(sessionId);
  if (!transport) {
    res.status(400).json({ error: 'Invalid or missing session ID' });
    return;
  }
  await transport.handleRequest(req, res);
});

export default router;
