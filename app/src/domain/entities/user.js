'use strict';

const { v4: uuidv4 } = require('uuid');

/**
 * User entity — pure domain object, no framework dependencies.
 *
 * @typedef {Object} UserProps
 * @property {string}  [id]         - UUID (generated if omitted)
 * @property {string}  name         - Full name
 * @property {string}  email        - Email address (lowercased)
 * @property {string}  passwordHash - bcrypt hash of the password
 * @property {boolean} [isVerified] - Whether the email has been verified
 * @property {boolean} [isDeleted]  - Soft-delete flag
 * @property {Date}    [createdAt]  - Creation timestamp
 * @property {Date}    [updatedAt]  - Last-update timestamp
 */

class User {
  /**
   * @param {UserProps} props
   */
  constructor({ id, name, email, passwordHash, isVerified = false, isDeleted = false, createdAt, updatedAt } = {}) {
    this.id = id || uuidv4();
    this.name = name;
    this.email = email ? email.toLowerCase().trim() : email;
    this.passwordHash = passwordHash;
    this.isVerified = isVerified;
    this.isDeleted = isDeleted;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  /**
   * Returns a safe public representation (no password hash).
   * @returns {Object}
   */
  toPublic() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      isVerified: this.isVerified,
      createdAt: this.createdAt,
    };
  }

  /**
   * Reconstruct a User from a database row.
   * @param {Object} row
   * @returns {User}
   */
  static fromRow(row) {
    return new User({
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.password_hash,
      isVerified: row.is_verified,
      isDeleted: row.is_deleted,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }
}

module.exports = User;
