'use strict';

const { v4: uuidv4 } = require('uuid');

/**
 * User entity factory.
 * Encapsulates the shape and invariants of a User domain object.
 *
 * @typedef {Object} User
 * @property {string} id          - UUID v4
 * @property {string} email       - Unique email address (lowercase)
 * @property {string} passwordHash - bcrypt hash
 * @property {string} firstName
 * @property {string} lastName
 * @property {boolean} isVerified  - Whether the email has been verified
 * @property {string|null} otpCode - Current OTP (hashed or plain depending on impl)
 * @property {Date|null} otpExpiresAt
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * Creates a new User entity with default values.
 *
 * @param {Object} params
 * @param {string} params.email
 * @param {string} params.passwordHash
 * @param {string} params.firstName
 * @param {string} params.lastName
 * @param {string} [params.id]
 * @returns {User}
 */
function createUser({ email, passwordHash, firstName, lastName, id }) {
  const now = new Date();
  return {
    id: id || uuidv4(),
    email: email.toLowerCase().trim(),
    passwordHash,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    isVerified: false,
    otpCode: null,
    otpExpiresAt: null,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Returns a safe public representation of a user (no sensitive fields).
 *
 * @param {User} user
 * @returns {Object}
 */
function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

module.exports = { createUser, toPublicUser };
