/**
 * @module AppError
 * Custom operational error class for the NeuraMemory-AI server.
 * Distinguishes between expected operational errors (e.g. 404, 400) and
 * unexpected programming errors so the error handler can respond appropriately.
 */

/**
 * Represents a known, operational HTTP error that should be serialised
 * and returned to the client with the given status code.
 *
 * Throw this class whenever an error is expected and intentional
 * (e.g. validation failure, resource not found, unauthorised access).
 * Do NOT throw it for unexpected programming errors — let those propagate
 * as plain `Error` instances so the error handler can return a 500.
 */
export class AppError extends Error {
  /**
   * The HTTP status code to send in the response.
   * Valid values follow standard HTTP semantics (e.g. 400, 401, 403, 404, 422, 500, 502).
   */
  public readonly statusCode: number;

  /**
   * Whether this is an operational error (expected, safe to expose to the client).
   * `true` for intentional errors like validation failures or not-found responses.
   * `false` for unexpected programming errors that should not leak details to the client.
   */
  public readonly isOperational: boolean;

  /**
   * Creates a new AppError.
   *
   * @param statusCode - The HTTP status code (e.g. 400, 404, 500)
   * @param message - Human-readable error message returned to the client
   * @param isOperational - Whether this is an expected operational error (default: `true`)
   */
  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}
