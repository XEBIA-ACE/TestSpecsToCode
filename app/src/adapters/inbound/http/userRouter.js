'use strict';

const { Router } = require('express');

const authMiddleware = require('./authMiddleware');
const UserService = require('../../../application/userService');
const PostgresUserRepository = require('../../outbound/db/userRepository');
const auditLogService = require('../../../infrastructure/auditLogService');
const logger = require('../../../infrastructure/logger');

const router = Router();

// ── Dependency wiring ──────────────────────────────────────────────────────
// Repositories and services are instantiated here (composition root for this
// router). In a larger app these would be injected via a DI container.
const userRepository = new PostgresUserRepository();
const userService = new UserService(userRepository);

// ── GET /me/account ────────────────────────────────────────────────────────
/**
 * Retrieve account information for the currently authenticated user.
 *
 * Security:
 *  - authMiddleware validates the Bearer JWT and attaches req.user
 *  - Cache-Control / Pragma headers prevent browser/proxy caching of PII
 *
 * Audit:
 *  - auditLogService.logAccess() is called fire-and-forget (non-blocking)
 *    so it never adds latency to the response
 *
 * Response shape:
 *  {
 *    "data": {
 *      "name": string,
 *      "email": string,
 *      "registrationDate": string,   // ISO 8601
 *      "accountStatus": string       // "Verified" | "Pending Verification"
 *    }
 *  }
 */
router.get('/me/account', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Retrieve account information from the application layer
    const accountInfo = await userService.getAccountInfo(userId);

    // Fire-and-forget audit log — must NOT be awaited
    // Per constitution.md: "Audit logging must be non-blocking"
    auditLogService.logAccess(
      userId,
      'ACCOUNT_INFO_VIEW',
      req.ip || req.socket?.remoteAddress
    );

    // Prevent caching of sensitive account data
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.set('Pragma', 'no-cache');

    // Respond with data wrapper as per API contract
    return res.status(200).json({ data: accountInfo });
  } catch (err) {
    logger.error('GET /me/account failed', { error: err.message, stack: err.stack });
    return next(err);
  }
});

module.exports = router;
