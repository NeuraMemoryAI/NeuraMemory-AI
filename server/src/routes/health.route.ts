import { Router, Request, Response } from 'express';
import { query } from '../lib/postgres.js';
import { getQdrantClient } from '../lib/qdrant.js';

const healthRouter = Router();

healthRouter.get('/', async (_req: Request, res: Response) => {
  const start = Date.now();

  const [postgresStatus, qdrantStatus] = await Promise.all([
    checkPostgres(),
    checkQdrant(),
  ]);

  const allHealthy = postgresStatus.ok && qdrantStatus.ok;

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'ok' : 'degraded',
    uptime: process.uptime(),
    responseTimeMs: Date.now() - start,
    checks: {
      server: { ok: true },
      postgres: postgresStatus,
      qdrant: qdrantStatus,
    },
  });
});

async function checkPostgres(): Promise<{ ok: boolean; uptime?: string | undefined; error?: string }> {
  try {
    const res = await query('SELECT now() - pg_postmaster_start_time() as uptime');
    const row = res.rows[0] as { uptime: string } | undefined;
    return { ok: true, uptime: row?.uptime };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

async function checkQdrant(): Promise<{ ok: boolean; collections?: number; error?: string }> {
  try {
    const collections = await getQdrantClient().getCollections();
    return { ok: true, collections: collections.collections.length };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export default healthRouter;
