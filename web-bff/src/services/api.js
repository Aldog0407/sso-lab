/**
 * API service
 * Handles communication with the backend API
 */

import config from '../config/index.js';

/**
 * Creates an AbortController with a timeout
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Object} Object containing controller and timeoutId
 */
function createTimeoutController(timeout) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  return { controller, timeoutId };
}

/**
 * Makes an authenticated request to the API
 * @param {string} endpoint - The API endpoint (e.g., '/api/perfil')
 * @param {string} accessToken - The access token for authentication
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Object>} The API response data
 * @throws {Error} If the request fails
 */
async function apiRequest(endpoint, accessToken, options = {}) {
  const url = `${config.api.baseUrl}${endpoint}`;
  const { controller, timeoutId } = createTimeoutController(config.api.timeout);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        ...options.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new Error(`API request timeout after ${config.api.timeout}ms`);
    }

    throw error;
  }
}

/**
 * Fetches the user profile from the API
 * @param {string} accessToken - The access token
 * @returns {Promise<Object>} The user profile data
 */
async function getUserProfile(accessToken) {
  return apiRequest('/api/perfil', accessToken);
}

/**
 * Fetches public data from the API (no authentication required)
 * @returns {Promise<Object>} The public data
 */
async function getPublicData() {
  const url = `${config.api.baseUrl}/api/publico`;
  const { controller, timeoutId } = createTimeoutController(config.api.timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new Error(`API request timeout after ${config.api.timeout}ms`);
    }

    throw error;
  }
}

export { apiRequest, getUserProfile, getPublicData };
