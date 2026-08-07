/**
 * User Repository
 *
 * Abstracts database access for user profile operations.
 * Replace the in-memory store with real DB queries (e.g. Knex, Sequelize,
 * pg) in production.
 */

'use strict';

// ---------------------------------------------------------------------------
// In-memory store — replace with real DB in production
// ---------------------------------------------------------------------------
const _users = new Map([
  [
    'user-001',
    {
      id: 'user-001',
      name: 'Alice Example',
      email: 'alice@example.com',
      registrationDate: '2023-01-15T10:00:00.000Z',
      accountStatus: 'active',
    },
  ],
]);

/**
 * Retrieves a user profile by ID.
 *
 * @param {string} userId
 * @returns {Promise<Object|null>} Full user profile or null if not found
 */
async function findById(userId) {
  return _users.get(userId) || null;
}

/**
 * Updates only the `name` field of a user profile.
 * All other fields (email, registrationDate, accountStatus) are untouched.
 *
 * @param {string} userId
 * @param {string} newName - Already validated & sanitized name
 * @returns {Promise<Object|null>} Updated profile or null if user not found
 */
async function updateName(userId, newName) {
  const user = _users.get(userId);
  if (!user) return null;

  const updated = { ...user, name: newName };
  _users.set(userId, updated);
  return updated;
}

module.exports = { findById, updateName };
