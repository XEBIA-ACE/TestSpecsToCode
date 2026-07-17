'use strict';

const logger = require('./logger');

/**
 * Audit Log Service.
 *
 * Provides fire-and-forget audit logging for security-sensitive operations.
 * Entries are written to the structured logger (Winston) and can be forwarded
 * to a dedicated audit_logs table in a future iteration.
 *
 * Per constitution.md:
 *  - Audit log entries must include: timestamp (ISO 8601), user ID, action type, and IP address
 *  - Audit logging must be non-blocking (fire-and-forget with error logging)
 *  - Audit logs must not contain sensitive PII beyond user ID; no passwords or tokens in logs
 */

/**
 * Log an access event asynchronously (fire-and-forget).
 *
 * Callers must NOT await this function — it is intentionally non-blocking.
 *
 * @param {string} userId   - UUID of the user performing the action
 * @param {string} action   - Action type constant, e.g. 'ACCOUNT_INFO_VIEW'
 * @param {string} [ip]     - Client IP address (optional)
 * @returns {void}
 */
function logAccess(userId, action, ip) {
  // Deliberately not awaited by callers — errors are swallowed after logging
  setImmediate(() => {
    try {
      logger.info('AUDIT', {
        timestamp: new Date().toISOString(),
        userId,
        action,
        ip: ip || 'unknown',
      });
    } catch (err) {
      // Must never throw — audit failure must not affect the user response
      logger.error('auditLogService.logAccess failed', { error: err.message });
    }
  });
}

module.exports = { logAccess };
