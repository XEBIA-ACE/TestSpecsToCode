/**
 * Profile Routes
 * Exposes the PUT /api/profile endpoint for updating user profile data.
 * Handles name, email, and password changes.
 */

const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticateToken } = require('../middleware/auth');

// PUT /api/profile — update the authenticated user's profile
router.put('/', authenticateToken, profileController.updateProfile);

module.exports = router;
