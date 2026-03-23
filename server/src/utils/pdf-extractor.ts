import pdfParse from 'pdf-parse';
import { env } from '../config/env.js';
import { AppError } from './AppError.js';
import { isUnstructuredConfigured } from '../lib/unstructured.js';
import { extractTextWithUnstructured } from './unstructured-extractor.js';
import { extractTextWithLocalOcr } from './ocr-local.js';

/**
 * @module pdf-extractor
 * Extracts plain text from a PDF buffer with a three-tier strategy:
 *   1. pdf-parse  — fast, works on text-based PDFs
 *   2. Unstructured.io API — cloud OCR for scanned/image PDFs (if configured)
 *   3. Local Tesseract OCR — offline fallback via pdftoppm + tesseract
 *
 * OCR tiers are skipped when the extracted text is non-empty, unless
 * OCR_FORCE=true is set (useful for testing the OCR path directly).
 */

/**
 * Extracts text from a PDF buffer using a tiered extraction strategy.
 *
 * @param buffer - The raw PDF file buffer
 * @param filename - Optional filename hint used by the Unstructured API
 * @returns Extracted plain text
 * @throws {AppError} 422 if all extraction strategies are exhausted
 */
export async function extractTextFromPdfBuffer(
  buffer: Buffer,
  filename = 'upload.pdf',
): Promise<string> {
  const forceOcr = env.OCR_FORCE === 'true';

  // --- Tier 1: pdf-parse (text-based PDFs) ---
  if (!forceOcr) {
    try {
      const data = await pdfParse(buffer);
      const text = data.text?.trim();
      if (text) return text;
    } catch (err) {
      // Non-fatal: log and fall through to OCR tiers
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[pdf-extractor] pdf-parse failed, falling back to OCR: ${msg}`);
    }
  }

  // --- Tier 2: Unstructured.io API ---
  if (isUnstructuredConfigured()) {
    try {
      const text = await extractTextWithUnstructured(buffer, filename);
      if (text.trim()) return text;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[pdf-extractor] Unstructured OCR failed, trying local OCR: ${msg}`);
    }
  }

  // --- Tier 3: Local Tesseract OCR ---
  if (env.OCR_ENABLE_LOCAL_FALLBACK === 'true') {
    try {
      const text = await extractTextWithLocalOcr(buffer, env.OCR_TESSERACT_LANG);
      if (text.trim()) return text;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[pdf-extractor] Local OCR failed: ${msg}`);
    }
  }

  throw new AppError(
    422,
    'Could not extract text from the PDF. The file may be scanned/image‑based. ' +
      'Configure UNSTRUCTURED_API_KEY for cloud OCR, or ensure pdftoppm and tesseract are installed for local OCR.',
  );
}
