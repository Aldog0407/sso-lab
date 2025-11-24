/**
 * Web BFF Server Entry Point
 *
 * Backend for Frontend service that handles:
 * - User authentication via Keycloak/OIDC
 * - Session management
 * - API proxying with token injection
 *
 * @module web-bff
 */

import dotenv from 'dotenv';

// Load environment variables before other imports
dotenv.config();

import { validateEnv, config } from './config/index.js';
import { createApp } from './app.js';
import { initializeKeycloak } from './services/keycloak.js';

/**
 * Initializes and starts the server
 */
async function startServer() {
  try {
    // Validate required environment variables
    validateEnv();

    console.log('[Server] Starting Web BFF service...');
    console.log(`[Server] Environment: ${config.server.env}`);

    // Initialize Keycloak client
    await initializeKeycloak();

    // Create and configure Express app
    const app = createApp();

    // Start listening
    const server = app.listen(config.server.port, () => {
      console.log(`[Server] Web BFF running on http://localhost:${config.server.port}`);
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
