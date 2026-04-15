import pg from 'pg';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

/**
 * Singleton PostgreSQL connection pool.
 * Optimized for high concurrency (100+ users).
 */
let pool: pg.Pool | null = null;

export function getPool(): pg.Pool {
  if (!pool) {
    // Note: Node.js is async. 20 physical connections can easily handle
    // 100+ simultaneous users performing sporadic API requests.
    pool = new Pool({
      connectionString: env.DATABASE_URL,
      max: 20,                          // Max connections in pool
      idleTimeoutMillis: 30000,         // How long a client is allowed to remain idle before being closed
      connectionTimeoutMillis: 2000,    // Return an error if a connection cannot be established within this time
      maxUses: 7500,                    // Close connection after 7500 uses to prevent memory leaks
    });

    pool.on('connect', () => {
      logger.info('[PostgreSQL] New client connected to pool');
    });

    pool.on('error', (err: Error) => {
      logger.error('[PostgreSQL] Unexpected pool error:', err);
    });
  }
  return pool;
}

/**
 * Convenience helper — runs a single parameterised query against the pool.
 */
export async function query<
  T extends pg.QueryResultRow = Record<string, unknown>,
>(text: string, params?: unknown[]): Promise<pg.QueryResult<T>> {
  return getPool().query<T>(text, params);
}

/**
 * Gracefully shuts down the pool (call on process exit).
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('[PostgreSQL] Pool drained and closed.');
  }
}
