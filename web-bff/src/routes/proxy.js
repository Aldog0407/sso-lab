/**
 * API Proxy routes
 * Handles proxying requests to the backend API with authentication
 */

import { Router } from 'express';
import { getUserProfile } from '../services/api.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

const router = Router();

/**
 * GET /api-proxy
 * Proxies requests to the backend API
 * Adds the access token from the session
 */
router.get(
  '/api-proxy',
  requireAuth,
  asyncHandler(async (req, res) => {
    const accessToken = req.session.tokenSet?.access_token;

    if (!accessToken) {
      throw new AppError('Access token not available', 401);
    }

    try {
      const data = await getUserProfile(accessToken);
      res.json(data);
    } catch (error) {
      console.error('[Proxy] API request failed:', error.message);

      // Return a structured error response
      res.status(502).json({
        error: 'Failed to connect to backend API',
        details: error.message,
      });
    }
  })
);

/**
 * GET /api-proxy/public
 * Proxies public API requests (no authentication required)
 */
router.get(
  '/api-proxy/public',
  asyncHandler(async (req, res) => {
    const { getPublicData } = await import('../services/api.js');

    try {
      const data = await getPublicData();
      res.json(data);
    } catch (error) {
      console.error('[Proxy] Public API request failed:', error.message);

      res.status(502).json({
        error: 'Failed to connect to backend API',
        details: error.message,
      });
    }
  })
);

export default router;
