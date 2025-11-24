/**
 * Error handling middleware for API
 * Provides centralized error handling
 */

import config from '../config/index.js';

/**
 * Custom API error class
 */
class ApiError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async handler wrapper
 * @param {Function} fn - Async route handler function
 * @returns {Function} Wrapped function with error handling
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Not found handler for undefined routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function notFoundHandler(req, res, next) {
  const error = new ApiError(
    `Endpoint not found: ${req.method} ${req.originalUrl}`,
    404,
    'NOT_FOUND'
  );
  next(error);
}

/**
 * Global error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function globalErrorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const isProduction = config.server.env === 'production';

  // Log error
  console.error(`[ERROR] ${new Date().toISOString()}`);
  console.error(`Status: ${statusCode}`);
  console.error(`Message: ${err.message}`);

  if (!isProduction) {
    console.error(`Stack: ${err.stack}`);
  }

  // Build error response
  const response = {
    error: isProduction && statusCode === 500
      ? 'Internal server error'
      : err.message,
    code: err.code || 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
  };

  // Include additional info in development
  if (!isProduction) {
    response.stack = err.stack;
    response.path = req.path;
    response.method = req.method;
  }

  res.status(statusCode).json(response);
}

export {
  ApiError,
  asyncHandler,
  notFoundHandler,
  globalErrorHandler,
};
