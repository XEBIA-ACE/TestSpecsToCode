/**
 * InMemoryUserProfileRepository — lightweight in-memory implementation of
 * IUserProfileRepository used for testing and local development.
 */

import { UserProfile } from '../types/UserProfile';
import { IUserProfileRepository } from './IUserProfileRepository';

export class InMemoryUserProfileRepository implements IUserProfileRepository {
  private store: Map<string, UserProfile> = new Map();

  async save(profile: UserProfile): Promise<UserProfile> {
    this.store.set(profile.id, { ...profile });
    return { ...profile };
  }

  async findById(id: string): Promise<UserProfile | null> {
    return this.store.has(id) ? { ...this.store.get(id)! } : null;
  }

  async findByEmail(email: string): Promise<UserProfile | null> {
    for (const profile of this.store.values()) {
      if (profile.email === email) return { ...profile };
    }
    return null;
  }

  async update(profile: UserProfile): Promise<UserProfile> {
    if (!this.store.has(profile.id)) {
      throw new Error(`Profile with id "${profile.id}" not found.`);
    }
    this.store.set(profile.id, { ...profile });
    return { ...profile };
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }

  async findAll(): Promise<UserProfile[]> {
    return Array.from(this.store.values()).map((p) => ({ ...p }));
  }
}
