import rateLimit, { type Options } from 'express-rate-limit';

/**
 * @module rateLimit
 * Express rate limiter middleware for authentication endpoints.
 * Uses named constants for all window durations and request limits.
 */

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const REGISTER_WINDOW_MS = 60 * 60 * 1000;
const LOGIN_MAX_REQUESTS_PROD = 5;
const REGISTER_MAX_REQUESTS_PROD = 10;
const MAX_REQUESTS_DEV = 10_000;

function rateLimitResponse(message: string) {
  return {
    success: false,
    message,
  };
}

const nodeEnv = process.env['NODE_ENV'];
const isDevelopmentLike = nodeEnv === 'development' || nodeEnv === 'test';

const baseOptions: Partial<Options> = {
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
};

export const loginRateLimiter = rateLimit({
  ...baseOptions,
  windowMs: LOGIN_WINDOW_MS,
  max: isDevelopmentLike ? MAX_REQUESTS_DEV : LOGIN_MAX_REQUESTS_PROD,
  message: rateLimitResponse(
    isDevelopmentLike
      ? 'Rate limit exceeded in development mode (unexpected).'
      : 'Too many login attempts. Please try again in 15 minutes.',
  ),
});

export const registerRateLimiter = rateLimit({
  ...baseOptions,
  windowMs: REGISTER_WINDOW_MS,
  max: isDevelopmentLike ? MAX_REQUESTS_DEV : REGISTER_MAX_REQUESTS_PROD,
  message: rateLimitResponse(
    isDevelopmentLike
      ? 'Rate limit exceeded in development mode (unexpected).'
      : 'Too many registration attempts. Please try again in 1 hour.',
  ),
});
