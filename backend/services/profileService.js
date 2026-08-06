/**
 * Profile Service
 * Business logic for updating user profile fields.
 * Passwords are hashed before storage (bcrypt).
 */

const bcrypt = require('bcrypt');
const userRepository = require('../repositories/userRepository');

const SALT_ROUNDS = 10;

/**
 * Updates a user's profile fields.
 * Only fields that are provided (non-undefined) are updated.
 *
 * @param {string|number} userId - The ID of the user to update.
 * @param {{ name?: string, email?: string, password?: string }} fields
 * @returns {Promise<object>} The updated user record.
 */
async function updateUserProfile(userId, { name, email, password }) {
  const user = await userRepository.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.code = 'USER_NOT_FOUND';
    throw err;
  }

  const updates = {};

  if (name !== undefined && name !== null && name.trim() !== '') {
    updates.name = name.trim();
  }

  if (email !== undefined && email !== null && email.trim() !== '') {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await userRepository.findByEmail(normalizedEmail);
    if (existing && String(existing.id) !== String(userId)) {
      const err = new Error('Email already taken');
      err.code = 'EMAIL_TAKEN';
      throw err;
    }
    updates.email = normalizedEmail;
  }

  if (password !== undefined && password !== null && password.trim() !== '') {
    updates.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  }

  if (Object.keys(updates).length === 0) {
    // Nothing to update — return current user unchanged
    return user;
  }

  const updatedUser = await userRepository.updateById(userId, updates);
  return updatedUser;
}

module.exports = { updateUserProfile };
