/**
 * Logging middleware
 * Provides request logging with configurable verbosity
 */

import config from '../config/index.js';

/**
 * Request logger middleware
 * Logs incoming requests with session status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function requestLogger(req, res, next) {
  const timestamp = new Date().toISOString();
  const hasSession = !!req.session?.tokenSet;
  const method = req.method;
  const path = req.path;

  // Log format: [timestamp] METHOD /path (authenticated: yes/no)
  console.log(
    `[${timestamp}] ${method} ${path} (authenticated: ${hasSession ? 'yes' : 'no'})`
  );

  // Track response time in development
  if (config.server.env === 'development') {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(
        `[${timestamp}] ${method} ${path} completed in ${duration}ms with status ${res.statusCode}`
      );
    });
  }

  next();
}

export { requestLogger };
export default requestLogger;
