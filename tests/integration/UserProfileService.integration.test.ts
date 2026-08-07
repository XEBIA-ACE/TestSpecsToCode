/**
 * Integration tests for UserProfileService + InMemoryUserProfileRepository.
 *
 * These tests exercise the full service → repository interaction to confirm
 * that the data layer is correctly wired and that cross-operation consistency
 * holds (e.g. a created profile is visible to subsequent reads).
 */

import { UserProfileService } from '../../src/services/UserProfileService';
import { InMemoryUserProfileRepository } from '../../src/repositories/InMemoryUserProfileRepository';
import { CreateUserProfilePayload } from '../../src/types/UserProfile';

// ---------------------------------------------------------------------------
// Shared setup
// ---------------------------------------------------------------------------

let repo: InMemoryUserProfileRepository;
let service: UserProfileService;

beforeEach(() => {
  repo = new InMemoryUserProfileRepository();
  service = new UserProfileService(repo);
});

const basePayload: CreateUserProfilePayload = {
  username: 'integrationUser',
  email: 'integration@example.com',
  firstName: 'Integration',
  lastName: 'Test',
};

// ---------------------------------------------------------------------------
// Create → Read consistency
// ---------------------------------------------------------------------------

describe('Integration: create then read', () => {
  it('profile created via service is retrievable by id', async () => {
    const created = await service.createProfile(basePayload);
    const fetched = await service.getProfileById(created.id);

    expect(fetched.id).toBe(created.id);
    expect(fetched.email).toBe(basePayload.email);
  });

  it('profile created via service is retrievable by email', async () => {
    const created = await service.createProfile(basePayload);
    const fetched = await service.getProfileByEmail(basePayload.email);

    expect(fetched.id).toBe(created.id);
  });

  it('getAllProfiles reflects every created profile', async () => {
    await service.createProfile(basePayload);
    await service.createProfile({ ...basePayload, email: 'b@example.com', username: 'userB' });
    await service.createProfile({ ...basePayload, email: 'c@example.com', username: 'userC' });

    const all = await service.getAllProfiles();
    expect(all).toHaveLength(3);
  });
});

// ---------------------------------------------------------------------------
// Create → Update → Read consistency
// ---------------------------------------------------------------------------

describe('Integration: create then update then read', () => {
  it('updated fields are persisted and visible on subsequent read', async () => {
    const created = await service.createProfile(basePayload);
    await service.updateProfile(created.id, { bio: 'Updated bio', firstName: 'Updated' });

    const fetched = await service.getProfileById(created.id);
    expect(fetched.bio).toBe('Updated bio');
    expect(fetched.firstName).toBe('Updated');
    // Unchanged fields must remain intact
    expect(fetched.lastName).toBe(basePayload.lastName);
    expect(fetched.email).toBe(basePayload.email);
  });

  it('createdAt is immutable across updates', async () => {
    const created = await service.createProfile(basePayload);
    const updated = await service.updateProfile(created.id, { bio: 'new bio' });

    expect(updated.createdAt).toEqual(created.createdAt);
  });
});

// ---------------------------------------------------------------------------
// Create → Delete → Read consistency
// ---------------------------------------------------------------------------

describe('Integration: create then delete then read', () => {
  it('deleted profile is no longer retrievable by id', async () => {
    const created = await service.createProfile(basePayload);
    await service.deleteProfile(created.id);

    await expect(service.getProfileById(created.id)).rejects.toThrow('not found');
  });

  it('deleted profile is no longer retrievable by email', async () => {
    const created = await service.createProfile(basePayload);
    await service.deleteProfile(created.id);

    await expect(service.getProfileByEmail(basePayload.email)).rejects.toThrow('not found');
  });

  it('getAllProfiles does not include deleted profiles', async () => {
    const created = await service.createProfile(basePayload);
    await service.createProfile({ ...basePayload, email: 'keep@example.com', username: 'keep' });
    await service.deleteProfile(created.id);

    const all = await service.getAllProfiles();
    expect(all).toHaveLength(1);
    expect(all[0].email).toBe('keep@example.com');
  });
});

// ---------------------------------------------------------------------------
// Uniqueness enforcement across operations
// ---------------------------------------------------------------------------

describe('Integration: uniqueness enforcement', () => {
  it('cannot create two profiles with the same email', async () => {
    await service.createProfile(basePayload);
    await expect(service.createProfile(basePayload)).rejects.toThrow('already exists');
  });

  it('cannot update a profile to an email owned by another profile', async () => {
    const first = await service.createProfile(basePayload);
    const second = await service.createProfile({
      ...basePayload,
      email: 'other@example.com',
      username: 'other',
    });

    await expect(
      service.updateProfile(second.id, { email: first.email }),
    ).rejects.toThrow('already exists');
  });

  it('can reuse an email after the original profile is deleted', async () => {
    const created = await service.createProfile(basePayload);
    await service.deleteProfile(created.id);

    // Should not throw — email is now free
    const recreated = await service.createProfile(basePayload);
    expect(recreated.email).toBe(basePayload.email);
  });
});
