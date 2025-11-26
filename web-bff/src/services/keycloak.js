/**
 * Keycloak service
 * Handles all Keycloak/OIDC authentication operations
 */

import { Issuer, generators } from 'openid-client';
import config from '../config/index.js';

let keycloakClient = null;
let keycloakIssuer = null;

/**
 * Initializes the Keycloak client by discovering the OIDC configuration
 * @returns {Promise<Object>} The initialized OIDC client
 * @throws {Error} If Keycloak discovery fails
 */
async function initializeKeycloak() {
  if (keycloakClient) {
    return keycloakClient;
  }

  try {
    keycloakIssuer = await Issuer.discover(config.keycloak.issuer);
    console.log(`[Keycloak] Discovered issuer: ${keycloakIssuer.issuer}`);

    keycloakClient = new keycloakIssuer.Client({
      client_id: config.keycloak.clientId,
      client_secret: config.keycloak.clientSecret,
      redirect_uris: [config.keycloak.redirectUri],
      response_types: ['code'],
    });

    return keycloakClient;
  } catch (error) {
    console.error('[Keycloak] Failed to discover issuer:', error.message);
    throw new Error(`Keycloak initialization failed: ${error.message}`);
  }
}

/**
 * Gets the current Keycloak client
 * @returns {Object|null} The Keycloak client or null if not initialized
 */
function getClient() {
  return keycloakClient;
}

/**
 * Generates PKCE code verifier and challenge
 * @returns {Object} Object containing codeVerifier and codeChallenge
 */
function generatePKCE() {
  const codeVerifier = generators.codeVerifier();
  const codeChallenge = generators.codeChallenge(codeVerifier);

  return {
    codeVerifier,
    codeChallenge,
  };
}

/**
 * Generates the authorization URL for initiating the OIDC flow
 * @param {string} codeChallenge - The PKCE code challenge
 * @returns {string} The authorization URL
 */
function getAuthorizationUrl(codeChallenge) {
  if (!keycloakClient) {
    throw new Error('Keycloak client not initialized');
  }

  return keycloakClient.authorizationUrl({
    scope: config.keycloak.scopes.join(' '),
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });
}

/**
 * Exchanges the authorization code for tokens
 * @param {Object} params - The callback parameters from the authorization server
 * @param {string} codeVerifier - The PKCE code verifier
 * @returns {Promise<Object>} The token set
 */
async function exchangeCodeForTokens(params, codeVerifier) {
  if (!keycloakClient) {
    throw new Error('Keycloak client not initialized');
  }

  return keycloakClient.callback(
    config.keycloak.redirectUri,
    params,
    { code_verifier: codeVerifier }
  );
}

/**
 * Fetches user information using the access token
 * @param {string} accessToken - The access token
 * @returns {Promise<Object>} The user info
 */
async function getUserInfo(accessToken) {
  if (!keycloakClient) {
    throw new Error('Keycloak client not initialized');
  }

  return keycloakClient.userinfo(accessToken);
}

/**
 * Extracts callback parameters from the request
 * @param {Object} req - Express request object
 * @returns {Object} The callback parameters
 */
function getCallbackParams(req) {
  if (!keycloakClient) {
    throw new Error('Keycloak client not initialized');
  }

  return keycloakClient.callbackParams(req);
}

/**
 * Generates the end session (logout) URL
 * @param {string} idToken - The ID token for the logout hint
 * @returns {string} The logout URL
 */
function getLogoutUrl(idToken) {
  if (!keycloakClient) {
    throw new Error('Keycloak client not initialized');
  }

  return keycloakClient.endSessionUrl({
    id_token_hint: idToken,
    post_logout_redirect_uri: config.keycloak.postLogoutRedirectUri,
  });
}

export {
  initializeKeycloak,
  getClient,
  generatePKCE,
  getAuthorizationUrl,
  exchangeCodeForTokens,
  getUserInfo,
  getCallbackParams,
  getLogoutUrl,
};
