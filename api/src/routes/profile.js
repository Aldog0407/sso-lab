/**
 * Profile routes
 * Protected endpoints requiring authentication
 */

import { Router } from 'express';
import { validateToken, asyncHandler } from '../middleware/index.js';

const router = Router();

/**
 * GET /api/perfil
 * Protected endpoint - returns user profile information
 * Requires valid JWT token
 */
router.get(
  '/perfil',
  validateToken,
  asyncHandler(async (req, res) => {
    const user = req.user;

    console.log(`[Profile] Access granted to: ${user.preferred_username || user.sub}`);

    res.json({
      mensaje: 'ACCESO CONCEDIDO - API Protegida',
      usuario: user.preferred_username || user.name || user.sub,
      email: user.email || 'No disponible',
      roles: user.realm_access?.roles || [],
      detalles_token: 'Firma JWT verificada correctamente con Keycloak',
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * GET /api/perfil/detalle
 * Returns detailed user information from the token
 */
router.get(
  '/perfil/detalle',
  validateToken,
  asyncHandler(async (req, res) => {
    const user = req.user;

    // Extract relevant claims from the token
    const profile = {
      // Standard OIDC claims
      sub: user.sub,
      name: user.name,
      preferred_username: user.preferred_username,
      given_name: user.given_name,
      family_name: user.family_name,
      email: user.email,
      email_verified: user.email_verified,

      // Keycloak specific claims
      realm_access: user.realm_access,
      resource_access: user.resource_access,

      // Token metadata
      token_info: {
        issuer: user.iss,
        audience: user.aud,
        issued_at: user.iat ? new Date(user.iat * 1000).toISOString() : null,
        expires_at: user.exp ? new Date(user.exp * 1000).toISOString() : null,
      },
    };

    res.json(profile);
  })
);

export default router;
