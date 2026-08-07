/**
 * Unit tests for UserProfileService.
 *
 * All tests use the InMemoryUserProfileRepository so no real I/O occurs.
 * Each test group is isolated via a fresh repository instance.
 */

import { UserProfileService } from '../../src/services/UserProfileService';
import { InMemoryUserProfileRepository } from '../../src/repositories/InMemoryUserProfileRepository';
import { CreateUserProfilePayload, UpdateUserProfilePayload } from '../../src/types/UserProfile';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeService() {
  const repo = new InMemoryUserProfileRepository();
  const service = new UserProfileService(repo);
  return { repo, service };
}

const validPayload: CreateUserProfilePayload = {
  username: 'jdoe',
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
};

// ---------------------------------------------------------------------------
// createProfile
// ---------------------------------------------------------------------------

describe('UserProfileService.createProfile', () => {
  it('creates a profile and returns it with generated id and timestamps', async () => {
    const { service } = makeService();
    const profile = await service.createProfile(validPayload);

    expect(profile.id).toBeDefined();
    expect(profile.username).toBe('jdoe');
    expect(profile.email).toBe('john.doe@example.com');
    expect(profile.firstName).toBe('John');
    expect(profile.lastName).toBe('Doe');
    expect(profile.createdAt).toBeInstanceOf(Date);
    expect(profile.updatedAt).toBeInstanceOf(Date);
  });

  it('throws when a required field is missing', async () => {
    const { service } = makeService();
    const bad = { ...validPayload, email: '' };
    await expect(service.createProfile(bad)).rejects.toThrow('"email" is required');
  });

  it('throws when the email format is invalid', async () => {
    const { service } = makeService();
    const bad = { ...validPayload, email: 'not-an-email' };
    await expect(service.createProfile(bad)).rejects.toThrow('not a valid email');
  });

  it('throws when a profile with the same email already exists', async () => {
    const { service } = makeService();
    await service.createProfile(validPayload);
    await expect(service.createProfile(validPayload)).rejects.toThrow('already exists');
  });
});

// ---------------------------------------------------------------------------
// getProfileById
// ---------------------------------------------------------------------------

describe('UserProfileService.getProfileById', () => {
  it('returns the profile for a valid id', async () => {
    const { service } = makeService();
    const created = await service.createProfile(validPayload);
    const fetched = await service.getProfileById(created.id);
    expect(fetched).toEqual(created);
  });

  it('throws when the id is empty', async () => {
    const { service } = makeService();
    await expect(service.getProfileById('')).rejects.toThrow('id must not be empty');
  });

  it('throws when no profile matches the id', async () => {
    const { service } = makeService();
    await expect(service.getProfileById('non-existent-id')).rejects.toThrow('not found');
  });
});

// ---------------------------------------------------------------------------
// getProfileByEmail
// ---------------------------------------------------------------------------

describe('UserProfileService.getProfileByEmail', () => {
  it('returns the profile for a valid email', async () => {
    const { service } = makeService();
    const created = await service.createProfile(validPayload);
    const fetched = await service.getProfileByEmail(validPayload.email);
    expect(fetched.id).toBe(created.id);
  });

  it('throws when the email is empty', async () => {
    const { service } = makeService();
    await expect(service.getProfileByEmail('')).rejects.toThrow('Email must not be empty');
  });

  it('throws when no profile matches the email', async () => {
    const { service } = makeService();
    await expect(service.getProfileByEmail('nobody@example.com')).rejects.toThrow('not found');
  });
});

// ---------------------------------------------------------------------------
// getAllProfiles
// ---------------------------------------------------------------------------

describe('UserProfileService.getAllProfiles', () => {
  it('returns an empty array when no profiles exist', async () => {
    const { service } = makeService();
    const all = await service.getAllProfiles();
    expect(all).toEqual([]);
  });

  it('returns all created profiles', async () => {
    const { service } = makeService();
    await service.createProfile(validPayload);
    await service.createProfile({ ...validPayload, email: 'jane@example.com', username: 'jane' });
    const all = await service.getAllProfiles();
    expect(all).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// updateProfile
// ---------------------------------------------------------------------------

describe('UserProfileService.updateProfile', () => {
  it('updates allowed fields and bumps updatedAt', async () => {
    const { service } = makeService();
    const created = await service.createProfile(validPayload);

    // Ensure updatedAt will differ from createdAt
    await new Promise((r) => setTimeout(r, 5));

    const update: UpdateUserProfilePayload = { firstName: 'Jonathan', bio: 'Hello world' };
    const updated = await service.updateProfile(created.id, update);

    expect(updated.firstName).toBe('Jonathan');
    expect(updated.bio).toBe('Hello world');
    expect(updated.id).toBe(created.id);
    expect(updated.createdAt).toEqual(created.createdAt);
    expect(updated.updatedAt.getTime()).toBeGreaterThan(created.updatedAt.getTime());
  });

  it('throws when the id is empty', async () => {
    const { service } = makeService();
    await expect(service.updateProfile('', {})).rejects.toThrow('id must not be empty');
  });

  it('throws when the profile does not exist', async () => {
    const { service } = makeService();
    await expect(service.updateProfile('ghost-id', { firstName: 'X' })).rejects.toThrow('not found');
  });

  it('throws when the new email is already taken by another profile', async () => {
    const { service } = makeService();
    await service.createProfile(validPayload);
    const second = await service.createProfile({
      ...validPayload,
      email: 'second@example.com',
      username: 'second',
    });

    await expect(
      service.updateProfile(second.id, { email: validPayload.email }),
    ).rejects.toThrow('already exists');
  });

  it('allows updating the email to the same value (no-op conflict check)', async () => {
    const { service } = makeService();
    const created = await service.createProfile(validPayload);
    const updated = await service.updateProfile(created.id, { email: validPayload.email });
    expect(updated.email).toBe(validPayload.email);
  });
});

// ---------------------------------------------------------------------------
// deleteProfile
// ---------------------------------------------------------------------------

describe('UserProfileService.deleteProfile', () => {
  it('deletes an existing profile', async () => {
    const { service } = makeService();
    const created = await service.createProfile(validPayload);
    await service.deleteProfile(created.id);
    await expect(service.getProfileById(created.id)).rejects.toThrow('not found');
  });

  it('throws when the id is empty', async () => {
    const { service } = makeService();
    await expect(service.deleteProfile('')).rejects.toThrow('id must not be empty');
  });

  it('throws when the profile does not exist', async () => {
    const { service } = makeService();
    await expect(service.deleteProfile('ghost-id')).rejects.toThrow('not found');
  });
});
