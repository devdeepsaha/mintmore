/**
 * Operational errors — errors we anticipate and handle gracefully.
 * These go through the global error handler and return clean API responses.
 * Non-operational errors (bugs, crashes) are logged and return generic 500.
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;