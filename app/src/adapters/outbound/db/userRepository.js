```javascript
'use strict';

const pool = require('../../../infrastructure/db/pool');

/**
 * Finds a user by their email.
 *
 * @param {string} email - User's email.
 * @returns {Promise<Object|null>} - User data or null if not found.
 */
async function findUserByEmail(email) {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
}

/**
 * Creates a new user in the database.
 *
 * @param {Object} userDetails - The details of the new user.
 * @param {string} userDetails.name - The name of the user.
 * @param {string} userDetails.email - The email of the user.
 * @param {string} userDetails.password - The hashed password of the user.
 * @param {boolean} userDetails.isVerified - Whether the user's email is verified.
 * @returns {Promise<Object>} - The created user's data.
 */
async function createUser({ name, email, password, isVerified }) {
  const result = await pool.query(
    'INSERT INTO users (name, email, password, is_verified) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, email, password, isVerified]
  );
  return result.rows[0];
}

module.exports = {
  findUserByEmail,
  createUser,
};
```