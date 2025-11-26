/**
 * Error handling middleware
 * Provides centralized error handling with proper logging
 */

import config from '../config/index.js';

/**
 * Custom application error class
 */
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async handler wrapper to catch errors in async route handlers
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
  const error = new AppError(`Route not found: ${req.originalUrl}`, 404);
  next(error);
}

/**
 * Global error handler middleware
 * Should be registered last in middleware chain
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function globalErrorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const isProduction = config.server.env === 'production';

  // Log error details
  console.error(`[ERROR] ${new Date().toISOString()}`);
  console.error(`Status: ${statusCode}`);
  console.error(`Message: ${err.message}`);

  if (!isProduction) {
    console.error(`Stack: ${err.stack}`);
  }

  // Send error response
  const response = {
    error: {
      message: isProduction && statusCode === 500
        ? 'Internal server error'
        : err.message,
      statusCode,
    },
  };

  // Include stack trace in development
  if (!isProduction) {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

export {
  AppError,
  asyncHandler,
  notFoundHandler,
  globalErrorHandler
};
