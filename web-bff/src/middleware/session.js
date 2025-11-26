/**
 * Session middleware configuration
 * Configures express-session with server-side storage
 */

import session from 'express-session';
import config from '../config/index.js';

/**
 * Creates and returns configured session middleware
 * @returns {Function} Express session middleware
 */
function createSessionMiddleware() {
  return session({
    secret: config.session.secret,
    resave: config.session.resave,
    saveUninitialized: config.session.saveUninitialized,
    cookie: config.session.cookie,
    name: 'sso.sid', // Custom session cookie name
  });
}

export { createSessionMiddleware };
export default createSessionMiddleware;
