/**
 * CORS middleware
 * Handles Cross-Origin Resource Sharing with configurable options
 */

import config from '../config/index.js';

/**
 * Creates CORS middleware with configured options
 * @returns {Function} Express CORS middleware
 */
function corsMiddleware(req, res, next) {
  const origin = req.headers.origin;
  const { allowedOrigins, allowedMethods, allowedHeaders, credentials, maxAge } = config.cors;

  // Check if origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (allowedOrigins.includes('*')) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Methods', allowedMethods.join(', '));
  res.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(', '));

  if (credentials) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  res.setHeader('Access-Control-Max-Age', maxAge.toString());

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
}

/**
 * Validates that the request origin is allowed
 * For use in routes that need stricter origin checking
 * @param {Object} req - Express request object
 * @returns {boolean} True if origin is allowed
 */
function isOriginAllowed(req) {
  const origin = req.headers.origin;
  return !origin || config.cors.allowedOrigins.includes(origin);
}

export { corsMiddleware, isOriginAllowed };
export default corsMiddleware;
