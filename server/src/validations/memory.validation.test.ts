import { describe, it, expect } from 'vitest';
import { linkSchema, plainTextSchema } from './memory.validation';

describe('memory.validation', () => {
  describe('linkSchema', () => {
    it('should pass for valid http and https URLs', () => {
      expect(linkSchema.safeParse({ url: 'http://example.com' }).success).toBe(true);
      expect(linkSchema.safeParse({ url: 'https://example.com' }).success).toBe(true);
    });

    it('should trim whitespace from URLs', () => {
      const result = linkSchema.safeParse({ url: '  https://example.com  ' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.url).toBe('https://example.com');
      }
    });

    it('should fail if URL is missing', () => {
      const result = linkSchema.safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('URL is required.');
      }
    });

    it('should fail if URL is not a string', () => {
      const result = linkSchema.safeParse({ url: 123 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('URL must be a string.');
      }
    });

    it('should fail for invalid URL format', () => {
      const result = linkSchema.safeParse({ url: 'not-a-url' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Please provide a valid URL.');
      }
    });

    it('should fail for unsupported protocols like ftp or javascript', () => {
      const resultFtp = linkSchema.safeParse({ url: 'ftp://example.com' });
      expect(resultFtp.success).toBe(false);
      if (!resultFtp.success) {
        expect(resultFtp.error.issues[0].message).toBe('Only HTTP and HTTPS URLs are allowed.');
      }

      const resultJs = linkSchema.safeParse({ url: 'javascript:alert(1)' });
      expect(resultJs.success).toBe(false);
      if (!resultJs.success) {
        expect(resultJs.error.issues[0].message).toBe('Only HTTP and HTTPS URLs are allowed.');
      }
    });
  });

  describe('plainTextSchema', () => {
    it('should pass for valid text', () => {
      expect(plainTextSchema.safeParse({ text: 'Valid text input' }).success).toBe(true);
    });

    it('should trim whitespace from text', () => {
      const result = plainTextSchema.safeParse({ text: '  padded text  ' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.text).toBe('padded text');
      }
    });

    it('should fail if text is missing', () => {
      const result = plainTextSchema.safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Text content is required.');
      }
    });

    it('should fail if text is not a string', () => {
      const result = plainTextSchema.safeParse({ text: 123 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Text must be a string.');
      }
    });

    it('should fail if text is empty', () => {
      const result = plainTextSchema.safeParse({ text: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Text content cannot be empty.');
      }
    });

    it('should fail if text is empty after trimming', () => {
      const result = plainTextSchema.safeParse({ text: '   ' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Text content cannot be empty.');
      }
    });

    it('should fail if text exceeds 100,000 characters', () => {
      const longText = 'a'.repeat(100_001);
      const result = plainTextSchema.safeParse({ text: longText });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Text content must not exceed 100 000 characters.');
      }
    });
  });
});
