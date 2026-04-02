import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractTextFromUrl } from './content-extractors.js';
import { AppError } from './AppError.js';

const mockScrape = vi.fn();

vi.mock('@mendable/firecrawl-js', () => {
  return {
    default: class FirecrawlApp {
      constructor() {}
      scrape = mockScrape;
    },
  };
});

describe('content-extractors', () => {
  describe('extractTextFromUrl', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should successfully extract markdown when returned directly', async () => {
      mockScrape.mockResolvedValueOnce({
        success: true,
        markdown: '# Hello World\nThis is a test.',
      });

      const result = await extractTextFromUrl('https://example.com');

      expect(mockScrape).toHaveBeenCalledTimes(1);
      expect(mockScrape).toHaveBeenCalledWith('https://example.com', {
        formats: ['markdown'],
      });
      expect(result).toBe('# Hello World\nThis is a test.');
    });

    it('should successfully extract markdown when nested under data.markdown', async () => {
      mockScrape.mockResolvedValueOnce({
        success: true,
        data: {
          markdown: '# Nested Markdown',
        },
      });

      const result = await extractTextFromUrl('https://example.com');
      expect(result).toBe('# Nested Markdown');
    });

    it('should return empty string if no markdown is present', async () => {
      mockScrape.mockResolvedValueOnce({
        success: true,
        markdown: '',
        data: {},
      });

      const result = await extractTextFromUrl('https://example.com');
      expect(result).toBe('');
    });

    it('should throw AppError if Firecrawl success is false', async () => {
      mockScrape.mockResolvedValueOnce({
        success: false,
        error: 'Rate limited',
      });

      const error = await extractTextFromUrl('https://example.com').catch(e => e);
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(422);
      expect(error.message).toBe('Failed to scrape URL with Firecrawl: Rate limited');
    });

    it('should use default error message if Firecrawl success is false but no error message provided', async () => {
      mockScrape.mockResolvedValueOnce({
        success: false,
      });

      const error = await extractTextFromUrl('https://example.com').catch(e => e);
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(422);
      expect(error.message).toBe('Failed to scrape URL with Firecrawl: Unknown error');
    });

    it('should throw AppError if an unknown error occurs and is thrown', async () => {
      mockScrape.mockRejectedValueOnce(new Error('Network failure'));

      const error = await extractTextFromUrl('https://example.com').catch(e => e);
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(422);
      expect(error.message).toBe('Could not extract content from URL: Network failure');
    });

    it('should throw AppError with generic message if non-Error is thrown', async () => {
      mockScrape.mockRejectedValueOnce('Some string error');

      const error = await extractTextFromUrl('https://example.com').catch(e => e);
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(422);
      expect(error.message).toBe('Could not extract content from URL: Unknown error fetching URL');
    });

    it('should re-throw AppError if it was thrown inside try block', async () => {
      const customError = new AppError(500, 'Custom error');
      mockScrape.mockRejectedValueOnce(customError);

      const error = await extractTextFromUrl('https://example.com').catch(e => e);
      expect(error).toBe(customError);
    });
  });
});
