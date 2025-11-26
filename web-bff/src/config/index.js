/**
 * Configuration module with environment variable validation
 * Centralizes all configuration and provides defaults
 */

const requiredEnvVars = ['ISSUER', 'CLIENT_ID', 'CLIENT_SECRET', 'SESSION_SECRET'];

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
 * All hardcoded values are centralized here for easy modification
 */
const config = {
  // Server configuration
  server: {
    port: parseInt(process.env.PORT, 10) || 3000,
    env: process.env.NODE_ENV || 'development',
  },

  // Session configuration
  session: {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax',
    },
  },

  // Keycloak/OIDC configuration
  keycloak: {
    issuer: process.env.ISSUER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI || 'http://localhost:3000/callback',
    postLogoutRedirectUri: process.env.POST_LOGOUT_REDIRECT_URI || 'http://localhost:3000',
    scopes: ['openid', 'profile', 'email'],
  },

  // API configuration
  api: {
    baseUrl: process.env.API_URL || 'http://localhost:4000',
    timeout: parseInt(process.env.API_TIMEOUT, 10) || 5000,
  },

  // Security headers configuration
  security: {
    enableHelmet: true,
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Required for inline scripts
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
    },
  },
};

export { validateEnv, config };
export default config;
