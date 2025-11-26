/**
 * Authentication middleware
 * Provides route protection based on session authentication
 */

import { AppError } from './errorHandler.js';

/**
 * Middleware to require authentication
 * Redirects to login or returns 401 based on request type
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function requireAuth(req, res, next) {
  if (!req.session?.tokenSet) {
    // Check if it's an API request (expects JSON)
    const isApiRequest = req.xhr ||
      req.headers.accept?.includes('application/json') ||
      req.path.startsWith('/api');

    if (isApiRequest) {
      return next(new AppError('Authentication required', 401));
    }

    // Redirect to login for browser requests
    return res.redirect('/login');
  }

  next();
}

/**
 * Middleware to check if user is NOT authenticated
 * Useful for login/register pages that shouldn't be accessed when logged in
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function requireGuest(req, res, next) {
  if (req.session?.tokenSet) {
    return res.redirect('/');
  }
  next();
}

export { requireAuth, requireGuest };
