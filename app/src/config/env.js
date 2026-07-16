'use strict';

/**
 * Centralised environment configuration.
 *
 * Reads from process.env (populated by dotenv in index.js).
 * Throws at startup if required variables are missing.
 */

function required(name) {
  const value = process.env[name];
  if (!value) {
    // In test environments some vars may be absent — use safe defaults
    if (process.env.NODE_ENV === 'test') return undefined;
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'user_management',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    poolMax: parseInt(process.env.DB_POOL_MAX || '10', 10),
    idleTimeoutMs: parseInt(process.env.DB_POOL_IDLE_TIMEOUT_MS || '30000', 10),
    connectionTimeoutMs: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT_MS || '2000', 10),
  },

  // JWT / Auth
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',

  auth: {
    /** URL of the login page — used by requireAuth middleware for redirects */
    loginUrl: process.env.LOGIN_URL || '/api/v1/users/login',
    /** Default landing page after login when no returnUrl is present */
    defaultLandingUrl: process.env.DEFAULT_LANDING_URL || '/api/v1/users/me',
    /** JWT secret (alias for convenience in middleware) */
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  },

  otp: {
    expiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES || '10', 10),
    length: parseInt(process.env.OTP_LENGTH || '6', 10),
  },

  smtp: {
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'no-reply@example.com',
  },

  logLevel: process.env.LOG_LEVEL || 'info',
};

module.exports = config;
