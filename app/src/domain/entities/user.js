'use strict';

/**
 * User domain entity.
 * Encapsulates user data and provides derived properties.
 */
class User {
  /**
   * @param {object} params
   * @param {string} params.id - UUID primary key
   * @param {string} params.firstName
   * @param {string} params.lastName
   * @param {string} params.email
   * @param {boolean} params.isVerified
   * @param {boolean} [params.isDeleted]
   * @param {Date|string} params.createdAt
   * @param {Date|string} [params.updatedAt]
   */
  constructor({ id, firstName, lastName, email, isVerified, isDeleted = false, createdAt, updatedAt }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.isVerified = isVerified;
    this.isDeleted = isDeleted;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /** Full display name. */
  get name() {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  /**
   * Human-readable account status derived from isVerified flag.
   * @returns {'Verified'|'Pending Verification'}
   */
  get accountStatus() {
    return this.isVerified ? 'Verified' : 'Pending Verification';
  }

  /**
   * Registration date in ISO 8601 format.
   * @returns {string}
   */
  get registrationDate() {
    return new Date(this.createdAt).toISOString();
  }

  /**
   * Serialise to the account-info response shape.
   * @returns {{ name: string, email: string, registrationDate: string, accountStatus: string }}
   */
  toAccountInfo() {
    return {
      name: this.name,
      email: this.email,
      registrationDate: this.registrationDate,
      accountStatus: this.accountStatus,
    };
  }
}

module.exports = User;
