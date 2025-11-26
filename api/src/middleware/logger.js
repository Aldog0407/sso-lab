/**
 * Logging middleware for API
 * Provides request/response logging
 */

import config from '../config/index.js';

/**
 * Request logger middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function requestLogger(req, res, next) {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const path = req.path;
  const hasAuth = !!req.headers.authorization;

  // Track start time for duration calculation
  const start = Date.now();

  // Log request
  console.log(
    `[${timestamp}] ${method} ${path} (auth: ${hasAuth ? 'yes' : 'no'})`
  );

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;

    // Use different log levels based on status code
    if (statusCode >= 500) {
      console.error(
        `[${timestamp}] ${method} ${path} -> ${statusCode} (${duration}ms)`
      );
    } else if (statusCode >= 400) {
      console.warn(
        `[${timestamp}] ${method} ${path} -> ${statusCode} (${duration}ms)`
      );
    } else if (config.server.env === 'development') {
      console.log(
        `[${timestamp}] ${method} ${path} -> ${statusCode} (${duration}ms)`
      );
    }
  });

  next();
}

export { requestLogger };
export default requestLogger;
