/**
 * Public routes
 * Endpoints that don't require authentication
 */

import { Router } from 'express';

const router = Router();

/**
 * GET /api/publico
 * Public endpoint accessible without authentication
 */
router.get('/publico', (req, res) => {
  res.json({
    mensaje: 'Hola, soy un endpoint publico',
    timestamp: new Date().toISOString(),
    authenticated: !!req.user,
  });
});

/**
 * GET /api/health
 * Health check endpoint for monitoring
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'api',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;
