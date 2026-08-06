/**
 * User Repository
 * Data-access layer for user records.
 * Replace the in-memory store with a real DB adapter (e.g. Sequelize, Knex)
 * when connecting to a production database.
 */

// In-memory store used for development / testing.
// TODO: replace with real DB queries in production.
const users = new Map();
let nextId = 1;

function _seed(userData) {
  const id = nextId++;
  const record = { id, ...userData };
  users.set(String(id), record);
  return record;
}

/**
 * Find a user by their primary key.
 * @param {string|number} id
 * @returns {Promise<object|null>}
 */
async function findById(id) {
  return users.get(String(id)) || null;
}

/**
 * Find a user by email address (case-insensitive).
 * @param {string} email
 * @returns {Promise<object|null>}
 */
async function findByEmail(email) {
  const normalized = email.toLowerCase();
  for (const user of users.values()) {
    if (user.email && user.email.toLowerCase() === normalized) {
      return user;
    }
  }
  return null;
}

/**
 * Update a user record by ID.
 * @param {string|number} id
 * @param {object} updates - Fields to merge into the existing record.
 * @returns {Promise<object>} The updated record.
 */
async function updateById(id, updates) {
  const existing = users.get(String(id));
  if (!existing) return null;
  const updated = { ...existing, ...updates };
  users.set(String(id), updated);
  return updated;
}

module.exports = { findById, findByEmail, updateById, _seed };
