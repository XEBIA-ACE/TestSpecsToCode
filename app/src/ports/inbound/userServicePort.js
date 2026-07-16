'use strict';

/**
 * @fileoverview Inbound port interface for the User Service.
 *
 * Defines the contract that any inbound adapter (e.g. HTTP controller) must
 * rely on when interacting with the application layer.  Concrete
 * implementations live in `app/src/application/userService.js`.
 *
 * Following hexagonal-architecture conventions this file contains only the
 * interface description (JSDoc typedef + abstract method stubs).  No business
 * logic is placed here.
 */

/**
 * Shape of the account-information object returned by {@link IUserService#getAccountInfo}.
 *
 * @typedef {object} AccountInfo
 * @property {string} name             - User's full name (firstName + " " + lastName).
 * @property {string} email            - User's registered email address.
 * @property {string} registrationDate - ISO 8601 timestamp of when the account was created.
 * @property {string} accountStatus    - Human-readable verification status:
 *                                       `"Verified"` or `"Pending Verification"`.
 */

/**
 * Inbound port interface — User Service.
 *
 * Any class that acts as the application-layer entry point for user-related
 * use-cases must implement this interface.
 *
 * @interface IUserService
 */

/**
 * Retrieves account information for the specified user.
 *
 * Looks up the user record identified by `userId`, derives the human-readable
 * `accountStatus` from the stored `isVerified` flag, and returns a sanitised
 * view of the account data suitable for display on the dashboard.
 *
 * @function
 * @name IUserService#getAccountInfo
 * @async
 *
 * @param {string} userId - UUID of the user whose account information is
 *                          being requested.  Must be a non-empty string that
 *                          corresponds to an existing record in the users table.
 *
 * @returns {Promise<AccountInfo>} Resolves with an {@link AccountInfo} object
 *   containing:
 *   - `name`             {string} — full name composed from firstName and lastName
 *   - `email`            {string} — registered email address
 *   - `registrationDate` {string} — account creation date in ISO 8601 format
 *   - `accountStatus`    {string} — `"Verified"` when the account has been
 *                                   email-verified; `"Pending Verification"` otherwise
 *
 * @throws {NotFoundError} When no user record exists for the supplied `userId`.
 *   Callers should map this to an HTTP 404 response.
 * @throws {Error} For unexpected infrastructure failures (e.g. database
 *   unavailability).  Callers should map these to an HTTP 500 response.
 *
 * @example
 * // Typical usage inside an HTTP controller:
 * const accountInfo = await userService.getAccountInfo(req.user.id);
 * res.status(200).json({ data: accountInfo });
 */

// NOTE: This file intentionally exports nothing — it is a documentation-only
// interface definition.  The concrete implementation is in:
//   app/src/application/userService.js
