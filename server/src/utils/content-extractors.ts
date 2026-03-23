import { AppError } from './AppError.js';
import { getFirecrawlClient } from '../lib/firecrawl.js';
import { extractTextFromPdfBuffer } from './pdf-extractor.js';
import { extractTextFromDocxBuffer } from './docx-extractor.js';

/**
 * @module content-extractors
 * Thin orchestrator for extracting plain text from URLs and uploaded documents.
 * Delegates to specialised extractors for each format.
 */

/**
 * Fetches and extracts markdown text from a URL using Firecrawl.
 *
 * @param url - The URL to scrape
 * @returns Extracted markdown text (may be empty string if page has no content)
 * @throws {AppError} 422 if Firecrawl reports a failure or the fetch throws
 */
export async function extractTextFromUrl(url: string): Promise<string> {
  try {
    const firecrawl = getFirecrawlClient();

    const response = (await firecrawl.scrape(url, {
      formats: ['markdown'],
    })) as {
      success: boolean;
      error?: string;
      markdown?: string;
      data?: { markdown?: string };
    };

    if (response.success === false) {
      throw new AppError(
        422,
        `Failed to scrape URL with Firecrawl: ${response.error || 'Unknown error'}`,
      );
    }

    const markdown =
      response.markdown || (response.data && response.data.markdown) || '';

    return markdown;
  } catch (err) {
    if (err instanceof AppError) throw err;

    const message =
      err instanceof Error ? err.message : 'Unknown error fetching URL';
    throw new AppError(422, `Could not extract content from URL: ${message}`);
  }
}

/**
 * Extracts plain text from an uploaded document buffer.
 * Delegates to the appropriate extractor based on MIME type.
 *
 * @param buffer - The raw file buffer
 * @param mimetype - The MIME type of the document
 * @returns Extracted plain text
 * @throws {AppError} 415 if the MIME type is unsupported
 * @throws {AppError} 422 if text extraction fails for the given format
 */
export async function extractTextFromDocument(
  buffer: Buffer,
  mimetype: string,
  filename?: string,
): Promise<string> {
  switch (mimetype) {
    case 'text/plain':
    case 'text/markdown':
      return buffer.toString('utf-8');

    case 'application/pdf':
      return await extractTextFromPdfBuffer(buffer, filename);

    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return extractTextFromDocxBuffer(buffer);

    default:
      throw new AppError(
        415,
        `Unsupported document type: ${mimetype}. Supported types: PDF, DOCX, TXT, MD.`,
      );
  }
}
