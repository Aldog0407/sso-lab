/**
 * Routes barrel file
 * Combines and exports all route modules
 */

import { Router } from 'express';
import publicRoutes from './public.js';
import profileRoutes from './profile.js';

const router = Router();

// Mount all routes under /api prefix
router.use('/api', publicRoutes);
router.use('/api', profileRoutes);

export default router;
