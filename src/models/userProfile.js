/**
 * User Profile Model
 *
 * Represents the shape of a user profile as stored/retrieved from the database.
 * Email, registrationDate, and accountStatus are read-only fields.
 * Only `name` is mutable via the profile update endpoint.
 */

'use strict';

/**
 * @typedef {Object} UserProfile
 * @property {string} id              - Unique user identifier
 * @property {string} name            - Display name (editable)
 * @property {string} email           - Email address (read-only)
 * @property {string} registrationDate - ISO 8601 date string (read-only)
 * @property {string} accountStatus   - e.g. "active" | "suspended" (read-only)
 */

/**
 * Fields that are permitted to be updated via the profile endpoint.
 * Any other fields sent in the request body are silently ignored.
 */
const MUTABLE_FIELDS = ['name'];

/**
 * Fields that are always returned in a profile response but cannot be
 * modified through the profile update endpoint.
 */
const READ_ONLY_FIELDS = ['email', 'registrationDate', 'accountStatus'];

module.exports = { MUTABLE_FIELDS, READ_ONLY_FIELDS };
