import { describe, it, expect } from 'vitest';
import { AppError } from './AppError.js';

describe('AppError', () => {
  it('should correctly assign properties when instantiated', () => {
    const error = new AppError(404, 'Not Found');

    expect(error.message).toBe('Not Found');
    expect(error.statusCode).toBe(404);
    expect(error.isOperational).toBe(true);
    expect(error.name).toBe('AppError');
  });

  it('should allow setting isOperational to false', () => {
    const error = new AppError(500, 'Internal Server Error', false);

    expect(error.message).toBe('Internal Server Error');
    expect(error.statusCode).toBe(500);
    expect(error.isOperational).toBe(false);
    expect(error.name).toBe('AppError');
  });

  it('should capture a stack trace', () => {
    const error = new AppError(400, 'Bad Request');
    expect(error.stack).toBeDefined();
    expect(typeof error.stack).toBe('string');
  });
});
