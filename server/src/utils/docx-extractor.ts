import { AppError } from './AppError.js';

/**
 * @module docx-extractor
 * Extracts plain text from a DOCX file buffer by parsing the embedded word/document.xml.
 */

/**
 * Extracts text content from a DOCX buffer by locating and parsing word/document.xml.
 * Strips XML tags, decodes HTML entities, and normalises whitespace.
 *
 * @param buffer - The raw DOCX file buffer
 * @returns Extracted plain text
 * @throws {AppError} 422 if the DOCX structure is malformed or no text is found
 */
export function extractTextFromDocxBuffer(buffer: Buffer): string {
  const marker = 'word/document.xml';
  const asString = buffer.toString('utf-8');
  const strIdx = asString.indexOf(marker);

  if (strIdx === -1) {
    throw new AppError(
      422,
      'The uploaded DOCX file appears to be malformed — could not locate word/document.xml.',
    );
  }

  const xmlStart = asString.indexOf('<?xml', strIdx);
  if (xmlStart === -1) {
    throw new AppError(
      422,
      'Could not parse the DOCX file — no XML content found.',
    );
  }

  const nextPk = asString.indexOf('PK', xmlStart + 10);
  const xmlContent =
    nextPk === -1 ? asString.slice(xmlStart) : asString.slice(xmlStart, nextPk);

  const text = xmlContent
    .replace(/<w:p[^>]*>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (!text) {
    throw new AppError(
      422,
      'Could not extract text from the DOCX file. The document may be empty.',
    );
  }

  return text;
}
