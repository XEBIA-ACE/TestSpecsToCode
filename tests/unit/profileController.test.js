/**
 * Unit tests — Profile Controller
 *
 * Covers:
 *  - GET /api/profile/:userId  (happy path, not found, missing param)
 *  - PUT /api/profile/:userId  (happy path, validation errors, read-only
 *    field enforcement, not found, audit log, email notification)
 *
 * All external dependencies (repo, auditStore, mailer) are stubbed so tests
 * run without a real database or email server.
 */

'use strict';

const { createProfileController } = require('../../src/controllers/profileController');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function makeReq(overrides = {}) {
  return {
    params: {},
    body: {},
    ip: '127.0.0.1',
    headers: { 'user-agent': 'jest-test' },
    ...overrides,
  };
}

const SAMPLE_USER = {
  id: 'user-001',
  name: 'Alice Example',
  email: 'alice@example.com',
  registrationDate: '2023-01-15T10:00:00.000Z',
  accountStatus: 'active',
};

// ---------------------------------------------------------------------------
// GET /api/profile/:userId
// ---------------------------------------------------------------------------

describe('ProfileController.getProfile', () => {
  test('returns 200 with full profile for a valid userId', async () => {
    const repo = {
      findById: jest.fn().mockResolvedValue({ ...SAMPLE_USER }),
      updateName: jest.fn(),
    };
    const { getProfile } = createProfileController({ repo });

    const req = makeReq({ params: { userId: 'user-001' } });
    const res = makeRes();

    await getProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0][0];
    expect(body.id).toBe('user-001');
    expect(body.name).toBe('Alice Example');
    expect(body.email).toBe('alice@example.com');
    expect(body.registrationDate).toBe('2023-01-15T10:00:00.000Z');
    expect(body.accountStatus).toBe('active');
  });

  test('returns 404 when user does not exist', async () => {
    const repo = { findById: jest.fn().mockResolvedValue(null) };
    const { getProfile } = createProfileController({ repo });

    const req = makeReq({ params: { userId: 'no-such-user' } });
    const res = makeRes();

    await getProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json.mock.calls[0][0]).toHaveProperty('error');
  });

  test('returns 400 when userId param is missing', async () => {
    const repo = { findById: jest.fn() };
    const { getProfile } = createProfileController({ repo });

    const req = makeReq({ params: {} });
    const res = makeRes();

    await getProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 500 on unexpected repository error', async () => {
    const repo = { findById: jest.fn().mockRejectedValue(new Error('DB down')) };
    const { getProfile } = createProfileController({ repo });

    const req = makeReq({ params: { userId: 'user-001' } });
    const res = makeRes();

    await getProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ---------------------------------------------------------------------------
// PUT /api/profile/:userId
// ---------------------------------------------------------------------------

describe('ProfileController.updateProfile', () => {
  test('returns 200 with updated profile when name is valid', async () => {
    const updatedUser = { ...SAMPLE_USER, name: 'Alice Updated' };
    const repo = {
      findById: jest.fn().mockResolvedValue({ ...SAMPLE_USER }),
      updateName: jest.fn().mockResolvedValue(updatedUser),
    };
    const auditStore = { write: jest.fn() };
    const mailer = { sendMail: jest.fn().mockResolvedValue(undefined) };

    const { updateProfile } = createProfileController({ repo, auditStore, mailer });

    const req = makeReq({
      params: { userId: 'user-001' },
      body: { name: 'Alice Updated' },
    });
    const res = makeRes();

    await updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0][0];
    expect(body.name).toBe('Alice Updated');
    // Read-only fields still present in response
    expect(body.email).toBe('alice@example.com');
    expect(body.registrationDate).toBe('2023-01-15T10:00:00.000Z');
    expect(body.accountStatus).toBe('active');
  });

  test('audit log is written on successful name update', async () => {
    const updatedUser = { ...SAMPLE_USER, name: 'Bob' };
    const repo = {
      findById: jest.fn().mockResolvedValue({ ...SAMPLE_USER }),
      updateName: jest.fn().mockResolvedValue(updatedUser),
    };
    const auditStore = { write: jest.fn() };
    const mailer = { sendMail: jest.fn().mockResolvedValue(undefined) };

    const { updateProfile } = createProfileController({ repo, auditStore, mailer });

    const req = makeReq({
      params: { userId: 'user-001' },
      body: { name: 'Bob' },
    });
    const res = makeRes();

    await updateProfile(req, res);

    expect(auditStore.write).toHaveBeenCalledTimes(1);
    const auditEntry = auditStore.write.mock.calls[0][0];
    expect(auditEntry.userId).toBe('user-001');
    expect(auditEntry.action).toBe('PROFILE_NAME_UPDATE');
    expect(auditEntry.changes.name.from).toBe('Alice Example');
    expect(auditEntry.changes.name.to).toBe('Bob');
    expect(auditEntry.ip).toBe('127.0.0.1');
    expect(auditEntry.userAgent).toBe('jest-test');
    expect(auditEntry.timestamp).toBeDefined();
  });

  test('email notification is sent on successful name update', async () => {
    const updatedUser = { ...SAMPLE_USER, name: 'Carol' };
    const repo = {
      findById: jest.fn().mockResolvedValue({ ...SAMPLE_USER }),
      updateName: jest.fn().mockResolvedValue(updatedUser),
    };
    const mailer = { sendMail: jest.fn().mockResolvedValue(undefined) };

    const { updateProfile } = createProfileController({ repo, mailer });

    const req = makeReq({
      params: { userId: 'user-001' },
      body: { name: 'Carol' },
    });
    const res = makeRes();

    await updateProfile(req, res);

    expect(mailer.sendMail).toHaveBeenCalledTimes(1);
    const mailArg = mailer.sendMail.mock.calls[0][0];
    expect(mailArg.to).toBe('alice@example.com');
  });

  test('read-only fields in request body are ignored', async () => {
    const repo = {
      findById: jest.fn().mockResolvedValue({ ...SAMPLE_USER }),
      updateName: jest.fn().mockResolvedValue({ ...SAMPLE_USER, name: 'Dave' }),
    };

    const { updateProfile } = createProfileController({ repo });

    const req = makeReq({
      params: { userId: 'user-001' },
      body: {
        name: 'Dave',
        email: 'hacker@evil.com',          // should be ignored
        registrationDate: '1970-01-01',    // should be ignored
        accountStatus: 'suspended',        // should be ignored
      },
    });
    const res = makeRes();

    await updateProfile(req, res);

    // updateName should only have been called with the new name
    expect(repo.updateName).toHaveBeenCalledWith('user-001', 'Dave');
    // Response email must remain unchanged
    const body = res.json.mock.calls[0][0];
    expect(body.email).toBe('alice@example.com');
    expect(body.accountStatus).toBe('active');
  });

  test('returns 422 when name is empty', async () => {
    const repo = { findById: jest.fn(), updateName: jest.fn() };
    const { updateProfile } = createProfileController({ repo });

    const req = makeReq({ params: { userId: 'user-001' }, body: { name: '' } });
    const res = makeRes();

    await updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(repo.updateName).not.toHaveBeenCalled();
  });

  test('returns 422 when name exceeds 100 characters', async () => {
    const repo = { findById: jest.fn(), updateName: jest.fn() };
    const { updateProfile } = createProfileController({ repo });

    const req = makeReq({
      params: { userId: 'user-001' },
      body: { name: 'A'.repeat(101) },
    });
    const res = makeRes();

    await updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(422);
  });

  test('returns 422 when name contains disallowed characters', async () => {
    const repo = { findById: jest.fn(), updateName: jest.fn() };
    const { updateProfile } = createProfileController({ repo });

    const req = makeReq({
      params: { userId: 'user-001' },
      body: { name: 'Alice<script>alert(1)</script>' },
    });
    const res = makeRes();

    await updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(422);
  });

  test('returns 404 when user does not exist', async () => {
    const repo = {
      findById: jest.fn().mockResolvedValue(null),
      updateName: jest.fn(),
    };
    const { updateProfile } = createProfileController({ repo });

    const req = makeReq({
      params: { userId: 'no-such-user' },
      body: { name: 'Valid Name' },
    });
    const res = makeRes();

    await updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(repo.updateName).not.toHaveBeenCalled();
  });

  test('returns 400 when userId param is missing', async () => {
    const repo = { findById: jest.fn(), updateName: jest.fn() };
    const { updateProfile } = createProfileController({ repo });

    const req = makeReq({ params: {}, body: { name: 'Valid Name' } });
    const res = makeRes();

    await updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 500 on unexpected repository error', async () => {
    const repo = {
      findById: jest.fn().mockRejectedValue(new Error('DB down')),
      updateName: jest.fn(),
    };
    const { updateProfile } = createProfileController({ repo });

    const req = makeReq({
      params: { userId: 'user-001' },
      body: { name: 'Valid Name' },
    });
    const res = makeRes();

    await updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
