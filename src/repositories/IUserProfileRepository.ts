/**
 * IUserProfileRepository — abstraction over the data layer.
 *
 * Concrete implementations (e.g. in-memory, database) must satisfy this
 * contract so that UserProfileService stays decoupled from persistence.
 */

import { UserProfile } from '../types/UserProfile';

export interface IUserProfileRepository {
  /** Persist a fully-formed profile and return it. */
  save(profile: UserProfile): Promise<UserProfile>;

  /** Retrieve a profile by its unique id. Returns null when not found. */
  findById(id: string): Promise<UserProfile | null>;

  /** Retrieve a profile by email address. Returns null when not found. */
  findByEmail(email: string): Promise<UserProfile | null>;

  /** Persist changes to an existing profile and return the updated record. */
  update(profile: UserProfile): Promise<UserProfile>;

  /** Remove a profile by id. Returns true if deleted, false if not found. */
  delete(id: string): Promise<boolean>;

  /** Return all stored profiles. */
  findAll(): Promise<UserProfile[]>;
}
