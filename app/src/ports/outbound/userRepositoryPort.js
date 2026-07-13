'use strict';

/**
 * Outbound port — UserRepository interface.
 *
 * Concrete implementations live in
 * src/adapters/outbound/db/postgresUserRepository.js
 *
 * @interface IUserRepository
 */

/**
 * Persist a new user.
 * @function
 * @name IUserRepository#save
 * @param {import('../../domain/entities/user').User} user
 * @returns {Promise<import('../../domain/entities/user').User>}
 */

/**
 * Find a user by their email address.
 * @function
 * @name IUserRepository#findByEmail
 * @param {string} email
 * @returns {Promise<import('../../domain/entities/user').User|null>}
 */

/**
 * Find a user by their ID.
 * @function
 * @name IUserRepository#findById
 * @param {string} id
 * @returns {Promise<import('../../domain/entities/user').User|null>}
 */

/**
 * Persist changes to an existing user.
 * @function
 * @name IUserRepository#update
 * @param {import('../../domain/entities/user').User} user
 * @returns {Promise<import('../../domain/entities/user').User>}
 */

/**
 * Remove a user by ID.
 * @function
 * @name IUserRepository#deleteById
 * @param {string} id
 * @returns {Promise<void>}
 */

module.exports = {};
