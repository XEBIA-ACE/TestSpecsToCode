/**
 * Profile Controller
 * Handles HTTP request/response for profile update operations.
 * Delegates business logic to profileService.
 */

const profileService = require('../services/profileService');

/**
 * PUT /api/profile
 * Updates the authenticated user's profile (name, email, password).
 * Responds with a success message or an appropriate error.
 */
async function updateProfile(req, res) {
  try {
    const userId = req.user.id; // set by authenticateToken middleware
    const { name, email, password } = req.body;

    if (!name && !email && !password) {
      return res.status(400).json({
        success: false,
        message: 'At least one field (name, email, password) must be provided.',
      });
    }

    const updatedUser = await profileService.updateUserProfile(userId, {
      name,
      email,
      password,
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
      },
    });
  } catch (error) {
    if (error.code === 'EMAIL_TAKEN') {
      return res.status(409).json({
        success: false,
        message: 'The email address is already in use.',
      });
    }
    if (error.code === 'USER_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }
    console.error('[profileController] updateProfile error:', error);
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred. Please try again.',
    });
  }
}

module.exports = { updateProfile };
