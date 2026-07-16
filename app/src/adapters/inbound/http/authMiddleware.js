'use strict';

/**
 * Authentication middleware — requireAuth
 *
 * Validates a JWT Bearer token from the Authorization header.
 * - Valid token  → attaches decoded payload to req.user and calls next()
 * - Missing/expired/malformed token → 302 redirect to login with returnUrl
 *
 * Audit log entries are generated for every unauthenticated access attempt.
 * Security warnings are logged for malformed tokens.
 *
 * @module authMiddleware
 */

const jwt = require('jsonwebtoken');
const logger = require('../../../infrastructure/logger');
const config = require('../../../config/env');

// Resolve login URL from config, falling back to a safe default
const LOGIN_URL =
  (config.auth && config.auth.loginUrl) || '/api/v1/users/login';

const JWT_SECRET =
  (config.auth && config.auth.jwtSecret) || config.jwtSecret || process.env.JWT_SECRET;

/**
 * Express middleware that enforces JWT authentication.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  // ── No token present ────────────────────────────────────────────────────────
  if (!token) {
    _auditRedirect(req, 'UNAUTHENTICATED_ACCESS', 'No token provided');
    return _redirectToLogin(req, res);
  }

  // ── Verify token ────────────────────────────────────────────────────────────
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      // Expired token — treat as unauthenticated
      _auditRedirect(req, 'TOKEN_EXPIRED', 'JWT token has expired');
    } else {
      // Malformed / invalid token — log security warning
      logger.warn('Malformed JWT token detected', {
        ip: req.ip,
        path: req.originalUrl,
        error: err.message,
      });
      _auditRedirect(req, 'MALFORMED_TOKEN', 'JWT token is malformed or invalid');
    }

    return _redirectToLogin(req, res);
  }
}

// ── Private helpers ───────────────────────────────────────────────────────────

/**
 * Issue a 302 redirect to the login page, preserving the original URL as
 * a `returnUrl` query parameter.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
function _redirectToLogin(req, res) {
  const returnUrl = encodeURIComponent(req.originalUrl || req.path || '/');
  const location = `${LOGIN_URL}?returnUrl=${returnUrl}`;
  return res.redirect(302, location);
}

/**
 * Write a structured audit log entry for an unauthenticated access attempt.
 *
 * @param {import('express').Request} req
 * @param {string} action  - Short action identifier (e.g. 'UNAUTHENTICATED_ACCESS')
 * @param {string} reason  - Human-readable reason
 */
function _auditRedirect(req, action, reason) {
  logger.audit('auth.redirect', {
    timestamp: new Date().toISOString(),
    path: req.originalUrl || req.path,
    ip: req.ip,
    userAgent: req.get ? req.get('user-agent') : (req.headers && req.headers['user-agent']),
    action,
    reason,
  });
}

module.exports = { requireAuth };
