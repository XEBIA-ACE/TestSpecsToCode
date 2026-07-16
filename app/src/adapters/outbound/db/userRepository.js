'use strict';

const pool = require('../../infrastructure/db/pool');

/**
 * PostgreSQL implementation of the user repository port.
 *
 * All SQL is parameterised to prevent injection.
 * Column names follow the snake_case convention used in the DB schema.
 */
class PostgresUserRepository {
  /**
   * Find a user by their UUID primary key.
   *
   * @param {string} id - User UUID
   * @returns {Promise<object|null>} Raw DB row or null if not found
   */
  async findById(id) {
    const { rows } = await pool.query(
      `SELECT id, first_name, last_name, email, is_verified, is_deleted, created_at, updated_at
         FROM users
        WHERE id = $1
          AND is_deleted = FALSE
        LIMIT 1`,
      [id]
    );

    return rows[0] || null;
  }

  /**
   * Find a user by their email address.
   *
   * @param {string} email
   * @returns {Promise<object|null>}
   */
  async findByEmail(email) {
    const { rows } = await pool.query(
      `SELECT id, first_name, last_name, email, password_hash, is_verified, is_deleted, created_at, updated_at
         FROM users
        WHERE email = $1
        LIMIT 1`,
      [email]
    );

    return rows[0] || null;
  }
}

module.exports = PostgresUserRepository;
