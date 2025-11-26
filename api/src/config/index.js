/**
 * API Configuration module
 * Centralizes all configuration with environment variable validation
 */

const requiredEnvVars = ['ISSUER', 'JWKS_URI'];

/**
 * Validates that all required environment variables are present
 * @throws {Error} If any required environment variable is missing
 */
function validateEnv() {
  const missing = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file or environment configuration.'
    );
  }
}

/**
 * Application configuration object
 */
const config = {
  // Server configuration
  server: {
    port: parseInt(process.env.PORT, 10) || 4000,
    env: process.env.NODE_ENV || 'development',
  },

  // JWT/OIDC configuration
  jwt: {
    issuer: process.env.ISSUER,
    jwksUri: process.env.JWKS_URI,
    algorithms: ['RS256'],
    // Optional audience validation
    audience: process.env.JWT_AUDIENCE || undefined,
  },

  // CORS configuration
  cors: {
    // Allowed origins (comma-separated in env var)
    allowedOrigins: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
      : ['http://localhost:3000'],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
    ],
    credentials: true,
    maxAge: 86400, // 24 hours
  },

  // Rate limiting configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100, // 100 requests per window
  },
};

export { validateEnv, config };
export default config;
