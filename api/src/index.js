/**
 * API Server Entry Point
 *
 * Protected resource server that:
 * - Validates JWT tokens from Keycloak
 * - Provides protected endpoints
 * - Exposes public health/status endpoints
 *
 * @module api
 */

import dotenv from 'dotenv';

// Load environment variables before other imports
dotenv.config();

import { validateEnv, config } from './config/index.js';
import { createApp } from './app.js';

/**
 * Starts the API server
 */
async function startServer() {
  try {
    // Validate required environment variables
    validateEnv();

    console.log('[Server] Starting API service...');
    console.log(`[Server] Environment: ${config.server.env}`);

    // Create and configure Express app
    const app = createApp();

    // Start listening
    const server = app.listen(config.server.port, () => {
      console.log(`[Server] API running on http://localhost:${config.server.port}`);
      console.log('[Server] Ready to accept connections');
    });

    // Graceful shutdown handling
    setupGracefulShutdown(server);
  } catch (error) {
    console.error('[Server] Failed to start:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

/**
 * Sets up graceful shutdown handlers
 * @param {Object} server - HTTP server instance
 */
function setupGracefulShutdown(server) {
  const shutdown = (signal) => {
    console.log(`\n[Server] Received ${signal}, shutting down gracefully...`);

    server.close((err) => {
      if (err) {
        console.error('[Server] Error during shutdown:', err);
        process.exit(1);
      }

      console.log('[Server] Closed all connections');
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error('[Server] Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('[Server] Uncaught exception:', error);
    shutdown('uncaughtException');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('[Server] Unhandled rejection at:', promise, 'reason:', reason);
  });
}

// Start the server
startServer();
