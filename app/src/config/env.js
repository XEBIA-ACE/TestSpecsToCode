'use strict';

/**
 * Centralised, validated environment configuration.
 * All process.env access must go through this module.
 */

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || 'user_management',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    poolMax: parseInt(process.env.DB_POOL_MAX, 10) || 10,
    idleTimeoutMs: parseInt(process.env.DB_POOL_IDLE_TIMEOUT_MS, 10) || 30000,
    connectionTimeoutMs: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT_MS, 10) || 2000,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'change_me_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },

  otp: {
    expiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES, 10) || 10,
    length: parseInt(process.env.OTP_LENGTH, 10) || 6,
  },

  logLevel: process.env.LOG_LEVEL || 'info',
};

module.exports = config;
