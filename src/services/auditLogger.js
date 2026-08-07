/**
 * Audit Logger
 *
 * Records profile change events with:
 *  - timestamp (ISO 8601)
 *  - userId
 *  - action type
 *  - IP address
 *  - user agent
 *  - changed fields (old → new values, excluding sensitive data)
 *
 * In production this should write to a persistent audit store (DB table,
 * append-only log service, SIEM, etc.).  The `auditStore` dependency is
 * injected so it can be swapped in tests.
 */

'use strict';

/**
 * @typedef {Object} AuditEntry
 * @property {string} timestamp
 * @property {string} userId
 * @property {string} action
 * @property {string} ip
 * @property {string} userAgent
 * @property {Object} changes
 */

/**
 * Logs a profile update audit event.
 *
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.action       - e.g. "PROFILE_NAME_UPDATE"
 * @param {string} params.ip
 * @param {string} params.userAgent
 * @param {Object} params.changes      - { field: { from, to } }
 * @param {Object} [params.auditStore] - Injectable store; defaults to console
 * @returns {AuditEntry}
 */
function logProfileChange({ userId, action, ip, userAgent, changes, auditStore }) {
  const entry = {
    timestamp: new Date().toISOString(),
    userId,
    action,
    ip: ip || 'unknown',
    userAgent: userAgent || 'unknown',
    changes,
  };

  if (auditStore && typeof auditStore.write === 'function') {
    auditStore.write(entry);
  } else {
    // Fallback: structured console log (replace with real store in production)
    console.log('[AUDIT]', JSON.stringify(entry));
  }

  return entry;
}

module.exports = { logProfileChange };
