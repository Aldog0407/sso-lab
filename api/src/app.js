/**
 * Express application configuration for API
 * Sets up middleware and routes
 */

import express from 'express';
import {
  corsMiddleware,
  securityHeaders,
  requestLogger,
  notFoundHandler,
  globalErrorHandler,
} from './middleware/index.js';
import routes from './routes/index.js';

/**
 * Creates and configures the Express application
 * @returns {Object} Configured Express app
 */
function createApp() {
  const app = express();

  // Trust proxy for proper IP detection behind reverse proxies
  app.set('trust proxy', 1);

  // Parse JSON bodies
  app.use(express.json());

  // Parse URL-encoded bodies
  app.use(express.urlencoded({ extended: true }));

  // Security headers
  app.use(securityHeaders);

  // CORS handling
  app.use(corsMiddleware);

  // Request logging
  app.use(requestLogger);

  // Application routes
  app.use(routes);

  // 404 handler
  app.use(notFoundHandler);

  // Global error handler
  app.use(globalErrorHandler);

  return app;
}

export { createApp };
export default createApp;
