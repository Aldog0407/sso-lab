/**
 * JWT Authentication middleware
 * Validates access tokens using JWKS from the identity provider
 */

import { createRemoteJWKSet, jwtVerify } from 'jose';
import config from '../config/index.js';

// Cache for the JWKS (JSON Web Key Set)
let jwksCache = null;

/**
 * Gets or creates the JWKS (lazy initialization)
 * @returns {Function} JWKS function for JWT verification
 */
function getJWKS() {
  if (!jwksCache) {
    jwksCache = createRemoteJWKSet(new URL(config.jwt.jwksUri));
  }
  return jwksCache;
}

/**
 * JWT validation middleware
 * Validates the access token from the Authorization header
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
async function validateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  // Check for Authorization header
  if (!authHeader) {
    return res.status(401).json({
      error: 'Authorization header missing',
      code: 'MISSING_AUTH_HEADER',
    });
  }

  // Validate Bearer token format
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Invalid authorization format. Expected: Bearer <token>',
      code: 'INVALID_AUTH_FORMAT',
    });
  }

  const token = authHeader.slice(7); // Remove 'Bearer ' prefix

  if (!token) {
    return res.status(401).json({
      error: 'Access token is empty',
      code: 'EMPTY_TOKEN',
    });
  }

  try {
    // Verify token signature, expiration, and issuer
    const verifyOptions = {
      issuer: config.jwt.issuer,
    };

    // Add audience validation if configured
    if (config.jwt.audience) {
      verifyOptions.audience = config.jwt.audience;
    }

    const { payload } = await jwtVerify(token, getJWKS(), verifyOptions);

    // Attach user data to request
    req.user = payload;
    req.token = token;

    next();
  } catch (err) {
    console.error('[Auth] Token validation failed:', err.message);

    // Return specific error messages based on error type
    if (err.code === 'ERR_JWT_EXPIRED') {
      return res.status(401).json({
        error: 'Token has expired',
        code: 'TOKEN_EXPIRED',
      });
    }

    if (err.code === 'ERR_JWT_CLAIM_VALIDATION_FAILED') {
      return res.status(401).json({
        error: 'Token validation failed: invalid claims',
        code: 'INVALID_CLAIMS',
      });
    }

    if (err.code === 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED') {
      return res.status(401).json({
        error: 'Invalid token signature',
        code: 'INVALID_SIGNATURE',
      });
    }

    return res.status(401).json({
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN',
    });
  }
}

/**
 * Optional authentication middleware
 * Attempts to validate token but allows request to proceed even if invalid
 * Useful for routes that behave differently for authenticated vs anonymous users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.slice(7);

  try {
    const { payload } = await jwtVerify(token, getJWKS(), {
      issuer: config.jwt.issuer,
    });

    req.user = payload;
    req.token = token;
  } catch {
    // Silently ignore invalid tokens for optional auth
  }

  next();
}

export { validateToken, optionalAuth, getJWKS };
export default validateToken;
