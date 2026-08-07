/**
 * Profile Routes
 *
 * Mounts profile management endpoints:
 *   GET  /api/profile/:userId  — retrieve full profile
 *   PUT  /api/profile/:userId  — update Name field only
 *
 * Authentication middleware (e.g. JWT verification) should be applied before
 * these routes in the main app.  A placeholder `authenticate` middleware is
 * referenced here; replace it with your real auth middleware.
 */

'use strict';

const express = require('express');
const { createProfileController } = require('../controllers/profileController');

/**
 * @param {Object} [deps] - Optional injected dependencies (repo, auditStore, mailer)
 * @returns {express.Router}
 */
function createProfileRouter(deps = {}) {
  const router = express.Router();
  const { getProfile, updateProfile } = createProfileController(deps);

  /**
   * GET /api/profile/:userId
   * Retrieve the complete user profile (all fields returned, all read-only
   * except name).
   */
  router.get('/:userId', getProfile);

  /**
   * PUT /api/profile/:userId
   * Update the Name field only.  Email, registrationDate, and accountStatus
   * are ignored even if included in the request body.
   */
  router.put('/:userId', updateProfile);

  return router;
}

module.exports = { createProfileRouter };
