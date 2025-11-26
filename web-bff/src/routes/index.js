/**
 * Routes barrel file
 * Combines and exports all route modules
 */

import { Router } from 'express';
import homeRoutes from './home.js';
import authRoutes from './auth.js';
import proxyRoutes from './proxy.js';

const router = Router();

// Mount route modules
router.use(homeRoutes);
router.use(authRoutes);
router.use(proxyRoutes);

export default router;
