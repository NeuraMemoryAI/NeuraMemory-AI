import FirecrawlApp from '@mendable/firecrawl-js';
import { env } from '../config/env.js';

let firecrawl: FirecrawlApp | null = null;

export function getFirecrawlClient(): FirecrawlApp {
  if (!firecrawl) {
    firecrawl = new FirecrawlApp({ apiKey: env.FIRECRAWL_API_KEY ?? '' });
    console.log('--- Firecrawl Client Initialized ---');
  }
  return firecrawl;
}
