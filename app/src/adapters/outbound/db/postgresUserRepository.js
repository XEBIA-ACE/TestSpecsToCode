'use strict';

const pool = require('../../../infrastructure/db/pool');

/**
 * PostgreSQL implementation of the UserRepository port.
 *
 * Maps between DB rows (snake_case) and domain User objects (camelCase).
 */
class PostgresUserRepository {
  // ── Helpers ─────────────────────────────────────────────────────────

  /**
   * Map a DB row to a domain User object.
   * @param {Object} row
   * @returns {import('../../../domain/entities/user').User}
   */
  _rowToUser(row) {
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      firstName: row.first_name,
      lastName: row.last_name,
      isVerified: row.is_verified,
      otpCode: row.otp_code,
      otpExpiresAt: row.otp_expires_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  // ── Port implementation ──────────────────────────────────────────────

  /**
   * Persist a new user.
   * @param {import('../../../domain/entities/user').User} user
   * @returns {Promise<import('../../../domain/entities/user').User>}
   */
  async save(user) {
    const { rows } = await pool.query(
      `INSERT INTO users
         (id, email, password_hash, first_name, last_name,
          is_verified, otp_code, otp_expires_at, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        user.id,
        user.email,
        user.passwordHash,
        user.firstName,
        user.lastName,
        user.isVerified,
        user.otpCode,
        user.otpExpiresAt,
        user.createdAt,
        user.updatedAt,
      ]
    );
    return this._rowToUser(rows[0]);
  }

  /**
   * Find a user by email.
   * @param {string} email
   * @returns {Promise<import('../../../domain/entities/user').User|null>}
   */
  async findByEmail(email) {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1 LIMIT 1',
      [email.toLowerCase().trim()]
    );
    return rows.length ? this._rowToUser(rows[0]) : null;
  }

  /**
   * Find a user by ID.
   * @param {string} id
   * @returns {Promise<import('../../../domain/entities/user').User|null>}
   */
  async findById(id) {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE id = $1 LIMIT 1',
      [id]
    );
    return rows.length ? this._rowToUser(rows[0]) : null;
  }

  /**
   * Update an existing user.
   * @param {import('../../../domain/entities/user').User} user
   * @returns {Promise<import('../../../domain/entities/user').User>}
   */
  async update(user) {
    const { rows } = await pool.query(
      `UPDATE users
       SET email          = $1,
           password_hash  = $2,
           first_name     = $3,
           last_name      = $4,
           is_verified    = $5,
           otp_code       = $6,
           otp_expires_at = $7,
           updated_at     = $8
       WHERE id = $9
       RETURNING *`,
      [
        user.email,
        user.passwordHash,
        user.firstName,
        user.lastName,
        user.isVerified,
        user.otpCode,
        user.otpExpiresAt,
        user.updatedAt,
        user.id,
      ]
    );
    return this._rowToUser(rows[0]);
  }

  /**
   * Delete a user by ID.
   * @param {string} id
   * @returns {Promise<void>}
   */
  async deleteById(id) {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
  }
}

module.exports = PostgresUserRepository;
