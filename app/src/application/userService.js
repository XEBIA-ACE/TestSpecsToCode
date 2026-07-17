'use strict';

const User = require('../domain/entities/user');
const { UserNotFoundError, ServiceUnavailableError } = require('../domain/errors/domainErrors');
const logger = require('../infrastructure/logger');

/**
 * UserService — application-layer use-case orchestration.
 *
 * Depends on a userRepository that implements the outbound repository port.
 * The repository is injected at construction time to keep this class testable.
 */
class UserService {
  /**
   * @param {{ findById: (id: string) => Promise<object|null> }} userRepository
   */
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Retrieve account information for the given user ID.
   *
   * Returns the data shape required by the GET /me/account endpoint:
   *   { name, email, registrationDate, accountStatus }
   *
   * @param {string} userId - UUID of the authenticated user
   * @returns {Promise<{ name: string, email: string, registrationDate: string, accountStatus: string }>}
   * @throws {UserNotFoundError}   when no user exists for the given ID
   * @throws {ServiceUnavailableError} when the database is unreachable
   */
  async getAccountInfo(userId) {
    let rawUser;

    try {
      rawUser = await this.userRepository.findById(userId);
    } catch (err) {
      logger.error('UserService.getAccountInfo — repository error', {
        userId,
        error: err.message,
        stack: err.stack,
      });
      throw new ServiceUnavailableError('Unable to retrieve account information at this time');
    }

    if (!rawUser) {
      throw new UserNotFoundError(`User with id ${userId} not found`);
    }

    // Map raw DB row → domain entity → response DTO
    const user = new User({
      id: rawUser.id,
      firstName: rawUser.first_name ?? rawUser.firstName ?? '',
      lastName: rawUser.last_name ?? rawUser.lastName ?? '',
      email: rawUser.email,
      isVerified: rawUser.is_verified ?? rawUser.isVerified ?? false,
      isDeleted: rawUser.is_deleted ?? rawUser.isDeleted ?? false,
      createdAt: rawUser.created_at ?? rawUser.createdAt,
      updatedAt: rawUser.updated_at ?? rawUser.updatedAt,
    });

    return user.toAccountInfo();
  }
}

module.exports = UserService;
