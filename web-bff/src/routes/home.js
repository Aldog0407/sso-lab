/**
 * Home routes
 * Handles the main page and public routes
 */

import { Router } from 'express';
import { loginPage, dashboardPage } from '../templates/index.js';

const router = Router();

/**
 * GET /
 * Renders the home page
 * Shows login page for guests, dashboard for authenticated users
 */
router.get('/', (req, res) => {
  if (req.session?.tokenSet && req.session?.userInfo) {
    // User is authenticated - show dashboard
    res.send(dashboardPage(req.session.userInfo));
  } else {
    // User is not authenticated - show login page
    res.send(loginPage());
  }
});

/**
 * GET /health
 * Health check endpoint for monitoring
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;
