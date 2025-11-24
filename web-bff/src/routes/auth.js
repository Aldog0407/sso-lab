/**
 * Authentication routes
 * Handles login, callback, and logout flows
 */

import { Router } from 'express';
import {
  generatePKCE,
  getAuthorizationUrl,
  exchangeCodeForTokens,
  getUserInfo,
  getCallbackParams,
  getLogoutUrl,
} from '../services/keycloak.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { errorPage } from '../templates/index.js';

const router = Router();

/**
 * GET /login
 * Initiates the OIDC authentication flow with PKCE
 */
router.get(
  '/login',
  asyncHandler(async (req, res) => {
    // Generate PKCE code verifier and challenge
    const { codeVerifier, codeChallenge } = generatePKCE();

    // Store code verifier in session for later verification
    req.session.code_verifier = codeVerifier;

    // Save session before redirecting to ensure verifier is persisted
    req.session.save((err) => {
      if (err) {
        console.error('[Auth] Failed to save session:', err);
        throw new AppError('Failed to initiate authentication', 500);
      }

      // Generate and redirect to authorization URL
      const authUrl = getAuthorizationUrl(codeChallenge);
      res.redirect(authUrl);
    });
  })
);

/**
 * GET /callback
 * Handles the OAuth callback from Keycloak
 * Exchanges authorization code for tokens
 */
router.get(
  '/callback',
  asyncHandler(async (req, res) => {
    const params = getCallbackParams(req);
    const codeVerifier = req.session?.code_verifier;

    console.log('[Auth] Processing callback, verifier present:', !!codeVerifier);

    // Validate that we have the code verifier from the initial request
    if (!codeVerifier) {
      return res.status(400).send(
        errorPage({
          title: 'Session Error',
          message: 'Se perdio la sesion antes de completar la autenticacion.',
          details: 'Por favor, intenta iniciar sesion nuevamente.',
        })
      );
    }

    // Check for error in callback parameters
    if (params.error) {
      console.error('[Auth] Callback error:', params.error, params.error_description);
      return res.status(400).send(
        errorPage({
          title: 'Authentication Error',
          message: params.error_description || params.error,
        })
      );
    }

    try {
      // Exchange authorization code for tokens
      const tokenSet = await exchangeCodeForTokens(params, codeVerifier);

      // Fetch user information
      const userInfo = await getUserInfo(tokenSet.access_token);

      // Store tokens and user info in session
      req.session.tokenSet = tokenSet;
      req.session.userInfo = userInfo;

      // Clean up the code verifier
      delete req.session.code_verifier;

      console.log('[Auth] User authenticated:', userInfo.preferred_username);

      // Save session before redirecting
      req.session.save((err) => {
        if (err) {
          console.error('[Auth] Failed to save session after callback:', err);
        }
        res.redirect('/');
      });
    } catch (err) {
      console.error('[Auth] Token exchange failed:', err.message);
      res.status(500).send(
        errorPage({
          title: 'Authentication Failed',
          message: 'No se pudo completar la autenticacion.',
          details: err.message,
        })
      );
    }
  })
);

/**
 * GET /logout
 * Destroys the local session and redirects to Keycloak logout
 */
router.get('/logout', (req, res) => {
  const idToken = req.session?.tokenSet?.id_token;

  // Destroy the local session
  req.session.destroy((err) => {
    if (err) {
      console.error('[Auth] Failed to destroy session:', err);
    }

    // If we have an ID token, redirect to Keycloak logout
    if (idToken) {
      try {
        const logoutUrl = getLogoutUrl(idToken);
        return res.redirect(logoutUrl);
      } catch (error) {
        console.error('[Auth] Failed to generate logout URL:', error);
      }
    }

    // Fallback: redirect to home
    res.redirect('/');
  });
});

export default router;
