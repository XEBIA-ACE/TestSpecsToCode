/**
 * Profile Controller
 *
 * Handles HTTP requests for:
 *  GET  /api/profile/:userId  — retrieve full profile (all fields)
 *  PUT  /api/profile/:userId  — update Name field only
 *
 * Read-only fields (email, registrationDate, accountStatus) are returned in
 * responses but silently ignored if included in PUT request bodies.
 *
 * Dependencies are injected via `createProfileController(deps)` to keep the
 * controller unit-testable without live DB / email / audit connections.
 */

'use strict';

const { MUTABLE_FIELDS } = require('../models/userProfile');
const { validateName } = require('../validators/profileValidator');
const { logProfileChange } = require('../services/auditLogger');
const { sendProfileUpdateEmail } = require('../services/emailService');
const userRepository = require('../repositories/userRepository');

/**
 * Factory that returns an Express-compatible controller object.
 *
 * @param {Object} [deps]
 * @param {Object} [deps.repo]        - User repository (findById, updateName)
 * @param {Object} [deps.auditStore]  - Audit store with .write(entry)
 * @param {Object} [deps.mailer]      - Mailer with .sendMail(options)
 */
function createProfileController(deps = {}) {
  const repo = deps.repo || userRepository;
  const auditStore = deps.auditStore || null;
  const mailer = deps.mailer || null;

  /**
   * GET /api/profile/:userId
   *
   * Returns the complete user profile.
   * All fields are read-only from the client's perspective except `name`.
   */
  async function getProfile(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ error: 'userId parameter is required.' });
      }

      const profile = await repo.findById(userId);

      if (!profile) {
        return res.status(404).json({ error: 'User not found.' });
      }

      // Return all profile fields; read-only fields are included for display
      return res.status(200).json({
        id: profile.id,
        name: profile.name,
        email: profile.email,                     // read-only
        registrationDate: profile.registrationDate, // read-only
        accountStatus: profile.accountStatus,      // read-only
      });
    } catch (err) {
      console.error('[ProfileController.getProfile]', err);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  }

  /**
   * PUT /api/profile/:userId
   *
   * Accepts { name } in the request body.
   * Ignores any other fields (email, registrationDate, accountStatus are
   * read-only and cannot be changed through this endpoint).
   */
  async function updateProfile(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ error: 'userId parameter is required.' });
      }

      // Only extract the mutable field; all others are discarded
      const { name } = req.body || {};

      // Validate & sanitize name
      const { valid, sanitized, errors } = validateName(name);
      if (!valid) {
        return res.status(422).json({ error: 'Validation failed.', details: errors });
      }

      // Fetch current profile to capture old name for audit log
      const existing = await repo.findById(userId);
      if (!existing) {
        return res.status(404).json({ error: 'User not found.' });
      }

      const oldName = existing.name;

      // Persist only the name change
      const updated = await repo.updateName(userId, sanitized);
      if (!updated) {
        return res.status(404).json({ error: 'User not found.' });
      }

      // Audit log — record timestamp, IP, user agent, and field change
      logProfileChange({
        userId,
        action: 'PROFILE_NAME_UPDATE',
        ip: req.ip || req.headers['x-forwarded-for'] || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        changes: {
          name: { from: oldName, to: sanitized },
        },
        auditStore,
      });

      // Email notification (fire-and-forget; errors are logged but not fatal)
      sendProfileUpdateEmail({
        toEmail: updated.email,
        name: sanitized,
        mailer,
      }).catch((emailErr) => {
        console.error('[ProfileController] Email notification failed:', emailErr);
      });

      // Return updated profile; read-only fields are included for display only
      return res.status(200).json({
        id: updated.id,
        name: updated.name,
        email: updated.email,                     // read-only
        registrationDate: updated.registrationDate, // read-only
        accountStatus: updated.accountStatus,      // read-only
      });
    } catch (err) {
      console.error('[ProfileController.updateProfile]', err);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  }

  return { getProfile, updateProfile, MUTABLE_FIELDS };
}

module.exports = { createProfileController };
