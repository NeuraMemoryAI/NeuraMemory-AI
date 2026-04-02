import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractTextWithLocalOcr } from './ocr-local.js';
import { AppError } from './AppError.js';
import { promises as fs } from 'node:fs';
import { execFile } from 'node:child_process';

// Setup mocks
vi.mock('node:fs', () => {
  return {
    promises: {
      mkdtemp: vi.fn(),
      writeFile: vi.fn(),
      readdir: vi.fn(),
      rm: vi.fn(),
    },
  };
});

vi.mock('node:child_process', () => {
  return {
    execFile: vi.fn(),
  };
});

vi.mock('node:os', () => {
  return {
    default: {
      tmpdir: vi.fn().mockReturnValue('/tmp'),
    },
  };
});

describe('extractTextWithLocalOcr', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default happy path mocks
    vi.mocked(fs.mkdtemp).mockResolvedValue('/tmp/neuramemory-ocr-mock');
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);
    vi.mocked(fs.readdir).mockResolvedValue([
      'page-1.png',
      'page-2.png',
    ] as unknown as string[]);
    vi.mocked(fs.rm).mockResolvedValue(undefined);

    vi.mocked(execFile).mockImplementation(
      (
        cmd: string,
        args: ReadonlyArray<string> | null | undefined,
        opts: unknown,
        cb?: unknown,
      ) => {
        let callback = cb as (
          error: Error | null,
          stdout: { stdout: string; stderr: string },
        ) => void;
        if (typeof opts === 'function') {
          callback = opts as (
            error: Error | null,
            stdout: { stdout: string; stderr: string },
          ) => void;
        }

        if (cmd === 'pdftoppm') {
          callback(null, { stdout: '', stderr: '' });
        } else if (cmd === 'tesseract' && args) {
          const page = args[0].includes('page-1.png') ? '1' : '2';
          callback(null, {
            stdout: `Mocked OCR text page ${page}`,
            stderr: '',
          });
        } else {
          callback(new Error(`Unknown command ${cmd}`), {
            stdout: '',
            stderr: '',
          });
        }
        return {} as ReturnType<typeof execFile>;
      },
    );
  });

  it('should extract text from a PDF buffer successfully', async () => {
    const buffer = Buffer.from('mock pdf content');
    const result = await extractTextWithLocalOcr(buffer, 'eng');

    expect(result).toBe('Mocked OCR text page 1\n\nMocked OCR text page 2');

    expect(fs.mkdtemp).toHaveBeenCalled();
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('input.pdf'),
      buffer,
    );
    expect(execFile).toHaveBeenCalledWith(
      'pdftoppm',
      expect.any(Array),
      expect.any(Object),
      expect.any(Function),
    );
    expect(execFile).toHaveBeenCalledWith(
      'tesseract',
      expect.any(Array),
      expect.any(Object),
      expect.any(Function),
    );
    expect(fs.rm).toHaveBeenCalledWith('/tmp/neuramemory-ocr-mock', {
      recursive: true,
      force: true,
    });
  });

  it('should throw an AppError if no images are generated', async () => {
    vi.mocked(fs.readdir).mockResolvedValue([] as unknown as string[]);

    const buffer = Buffer.from('mock pdf content');

    await expect(extractTextWithLocalOcr(buffer, 'eng')).rejects.toThrow(
      new AppError(
        422,
        'Local OCR failed: no images were generated from the PDF.',
      ),
    );

    expect(fs.rm).toHaveBeenCalled(); // Ensure cleanup still happens
  });

  it('should throw an AppError when a dependency is missing (ENOENT)', async () => {
    vi.mocked(execFile).mockImplementation(
      (
        cmd: string,
        args: ReadonlyArray<string> | null | undefined,
        opts: unknown,
        cb?: unknown,
      ) => {
        let callback = cb as (
          error: Error | null,
          stdout: { stdout: string; stderr: string },
        ) => void;
        if (typeof opts === 'function') {
          callback = opts as (
            error: Error | null,
            stdout: { stdout: string; stderr: string },
          ) => void;
        }
        const error = new Error('spawn pdftoppm ENOENT');
        (error as Error & { code?: string }).code = 'ENOENT';
        callback(error, { stdout: '', stderr: '' });
        return {} as ReturnType<typeof execFile>;
      },
    );

    const buffer = Buffer.from('mock pdf content');

    await expect(extractTextWithLocalOcr(buffer, 'eng')).rejects.toThrow(
      new AppError(
        422,
        'Local OCR dependency "pdftoppm" is not installed or not on PATH.',
      ),
    );

    expect(fs.rm).toHaveBeenCalled();
  });

  it('should throw an AppError on general execFile failure', async () => {
    vi.mocked(execFile).mockImplementation(
      (
        cmd: string,
        args: ReadonlyArray<string> | null | undefined,
        opts: unknown,
        cb?: unknown,
      ) => {
        let callback = cb as (
          error: Error | null,
          stdout: { stdout: string; stderr: string },
        ) => void;
        if (typeof opts === 'function') {
          callback = opts as (
            error: Error | null,
            stdout: { stdout: string; stderr: string },
          ) => void;
        }
        callback(new Error('Some strange failure'), { stdout: '', stderr: '' });
        return {} as ReturnType<typeof execFile>;
      },
    );

    const buffer = Buffer.from('mock pdf content');

    await expect(extractTextWithLocalOcr(buffer, 'eng')).rejects.toThrow(
      new AppError(422, 'Local OCR failed (pdftoppm): Some strange failure'),
    );

    expect(fs.rm).toHaveBeenCalled();
  });
});
