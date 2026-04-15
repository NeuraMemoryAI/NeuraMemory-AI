import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  
  // Database
  DATABASE_URL: z.string().url(),
  QDRANT_URL: z.string().url(),
  QDRANT_API_KEY: z.string().optional(),
  
  // LLM / AI
  OPENROUTER_BASE_URL: z.string().url().default('https://openrouter.ai/api/v1'),
  OPENROUTER_API_KEY: z.string().min(1, 'OpenRouter API Key is required'),
  OPENROUTER_REFERER: z.string().url().optional(),
  OPENROUTER_TITLE: z.string().optional(),
  CHAT_MODEL: z.string().default('google/gemini-2.0-flash-001'),
  EMBEDDING_MODEL: z.string().default('google/gemini-2.0-flash-001'),
  
  // Scrapers / Ingestion
  FIRECRAWL_API_KEY: z.string().optional(),
  CRAWL4AI_API_URL: z.string().url().default('http://localhost:11235'),
  UNSTRUCTURED_API_URL: z
    .string()
    .url()
    .default('https://platform.unstructuredapp.io/api/v1'),
  UNSTRUCTURED_API_KEY: z.string().optional(),
  UNSTRUCTURED_TIMEOUT_MS: z.string().optional(),
  
  // OCR
  OCR_ENABLE_LOCAL_FALLBACK: z.string().default('true'),
  OCR_TESSERACT_LANG: z.string().default('eng'),
  OCR_FORCE: z.string().default('false'),
  
  // Security
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z
    .string()
    .default('7d')
    .transform((val) => val.split('#')[0]!.trim()),
  ADMIN_API_KEY: z.string().min(1, 'ADMIN_API_KEY is required for secure operations'),
  
  // App Logic
  ALLOWED_ORIGINS: z.string().default('http://localhost:5173'),
  SIMILARITY_THRESHOLD: z.coerce.number().default(0.82),
  DUPLICATE_THRESHOLD: z.coerce.number().default(0.95),
  CONFLICT_CONFIDENCE_THRESHOLD: z.coerce.number().default(0.75),
  RETRIEVAL_DEDUP_THRESHOLD: z.coerce.number().default(0.88),
  CONFLICT_STRATEGY: z
    .enum(['recency', 'confidence', 'merge', 'flag'])
    .default('recency'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  const missing = _env.error.errors.map(e => e.path.join('.')).join(', ');
  console.error(`❌ Invalid or missing environment variables: ${missing}`);
  process.exit(1);
}

export const env = _env.data;
