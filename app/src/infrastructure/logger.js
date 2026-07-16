'use strict';

/**
 * Winston logger instance for the User Management Service.
 *
 * Provides standard log levels plus a custom `audit` method for structured
 * audit trail entries (authentication events, data access, deletions, etc.).
 *
 * Usage:
 *   logger.info('message', { meta })
 *   logger.warn('message', { meta })
 *   logger.error('message', { stack })
 *   logger.http('message')
 *   logger.audit('event.name', { timestamp, path, ip, userAgent, action, ... })
 */

const { createLogger, format, transports } = require('winston');

const { combine, timestamp, json, colorize, simple } = format;

const isTest = process.env.NODE_ENV === 'test';

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(timestamp(), json()),
  transports: isTest
    ? [new transports.Console({ silent: true })] // suppress output during tests
    : [new transports.Console()],
});

// ── Custom audit method ───────────────────────────────────────────────────────
/**
 * Log a structured audit event.
 *
 * @param {string} event    - Dot-namespaced event identifier, e.g. 'auth.redirect'
 * @param {object} metadata - Structured metadata: timestamp, path, ip, userAgent, action, …
 */
logger.audit = function auditLog(event, metadata = {}) {
  logger.info(event, { audit: true, ...metadata });
};

module.exports = logger;
