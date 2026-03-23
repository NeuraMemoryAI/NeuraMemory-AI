import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import type { Request } from 'express';
import { getUserByApiKey } from './auth.service.js';
import {
  processPlainText,
  processLink,
  getUserMemories,
  semanticSearch,
} from './memory.service.js';

/**
 * @module mcp.service
 * Manages MCP server instances, session transports, and user resolution
 * for the Model Context Protocol integration.
 */

/** In-memory map of active MCP session transports keyed by session ID. */
const transports = new Map<string, StreamableHTTPServerTransport>();

/**
 * Retrieves an active transport by session ID.
 *
 * @param sessionId - The MCP session ID from the request header
 * @returns The transport instance, or `undefined` if not found
 */
export function getTransport(
  sessionId: string,
): StreamableHTTPServerTransport | undefined {
  return transports.get(sessionId);
}

/**
 * Registers a transport for a session ID.
 *
 * @param sessionId - The MCP session ID
 * @param transport - The transport instance to store
 */
export function setTransport(
  sessionId: string,
  transport: StreamableHTTPServerTransport,
): void {
  transports.set(sessionId, transport);
}

/**
 * Removes a transport from the session map, cleaning up the session.
 *
 * @param sessionId - The MCP session ID to remove
 */
export function removeTransport(sessionId: string): void {
  transports.delete(sessionId);
}

/**
 * Resolves the authenticated user from an incoming MCP request.
 * Checks `apiKey` query param, `x-api-key` header, and `Authorization: Bearer` header.
 *
 * @param req - The Express request object
 * @returns `{ userId }` if a valid API key is found, or `null` if not
 */
export async function resolveUserFromRequest(
  req: Request,
): Promise<{ userId: string } | null> {
  const apiKey =
    (req.query['apiKey'] as string | undefined) ||
    (req.headers['x-api-key'] as string | undefined) ||
    req.headers.authorization?.replace('Bearer ', '');

  if (!apiKey) return null;

  const user = await getUserByApiKey(apiKey);
  if (!user) return null;

  return { userId: user._id.toString() };
}

/**
 * Creates and configures an MCP server instance for a specific user.
 * Registers the `save_memory`, `save_link_memory`, and `get_memories` tools.
 *
 * @param userId - The authenticated user's ID to scope all tool operations
 * @returns A configured `McpServer` instance ready to connect to a transport
 */
export function createMcpServer(userId: string): McpServer {
  const server = new McpServer(
    { name: 'neuramemory-mcp', version: '1.0.0' },
    { capabilities: { tools: {} } },
  );

  server.tool(
    'save_memory',
    'Extract and save semantic and episodic memories from plain text.',
    { text: z.string().describe('The raw text to extract memories from') },
    async ({ text }: { text: string }) => {
      try {
        const response = await processPlainText({ text, userId });
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(response, null, 2) }],
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return { isError: true, content: [{ type: 'text' as const, text: `Failed: ${msg}` }] };
      }
    },
  );

  server.tool(
    'save_link_memory',
    'Fetch content from a URL and extract memories.',
    { url: z.string().url().describe('The URL to scrape and extract from') },
    async ({ url }: { url: string }) => {
      try {
        const response = await processLink({ url, userId });
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(response, null, 2) }],
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return { isError: true, content: [{ type: 'text' as const, text: `Failed: ${msg}` }] };
      }
    },
  );

  server.tool(
    'get_memories',
    'Retrieve stored memories. Use "query" for semantic search, or leave empty to list all.',
    {
      query: z.string().optional().describe('Optional search query for semantic retrieval'),
      kind: z.enum(['semantic', 'bubble']).optional().describe('Filter by memory kind'),
      limit: z.number().min(1).max(50).default(10).describe('Max memories to return'),
    },
    async ({ query, kind, limit }) => {
      try {
        let memories;
        if (query) {
          memories = await semanticSearch(query, userId, limit);
        } else {
          const options: { limit: number; kind?: string } = { limit };
          if (kind) options.kind = kind;
          memories = (await getUserMemories(userId, options)).points;
        }
        const count = Array.isArray(memories) ? memories.length : 0;
        return {
          content: [
            { type: 'text' as const, text: JSON.stringify({ count, memories }, null, 2) },
          ],
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return { isError: true, content: [{ type: 'text' as const, text: `Failed: ${msg}` }] };
      }
    },
  );

  return server;
}
