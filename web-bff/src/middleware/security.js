/**
 * Security middleware
 * Adds security headers to protect against common vulnerabilities
 */

import config from '../config/index.js';

/**
 * Security headers middleware
 * Sets various HTTP headers to improve security
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function securityHeaders(req, res, next) {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS filter in browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Control referrer information
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy (formerly Feature-Policy)
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()'
  );

  // Content Security Policy
  if (config.security.contentSecurityPolicy) {
    const csp = config.security.contentSecurityPolicy;
    const directives = Object.entries(csp)
      .map(([key, values]) => {
        // Convert camelCase to kebab-case
        const directive = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${directive} ${values.join(' ')}`;
      })
      .join('; ');
    res.setHeader('Content-Security-Policy', directives);
  }

  // HSTS in production
  if (config.server.env === 'production') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );
  }

  next();
}

export { securityHeaders };
export default securityHeaders;
