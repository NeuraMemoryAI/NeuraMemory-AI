import { env } from '../config/env.js';

/**
 * @module unstructured
 * Configuration check for the Unstructured.io integration.
 * All orchestration logic lives in `utils/unstructured-extractor.ts`.
 */

/**
 * Returns whether the Unstructured.io API is configured.
 * Used to decide whether to attempt OCR via the Unstructured API.
 *
 * @returns `true` if `UNSTRUCTURED_API_KEY` is set, `false` otherwise
 */
export function isUnstructuredConfigured(): boolean {
  return Boolean(env.UNSTRUCTURED_API_KEY);
}
