/**
 * Integration tests — Profile Routes
 *
 * Uses supertest to exercise the full Express stack without a real DB.
 * The in-memory userRepository is used directly (no mocking needed for
 * integration-level tests).
 */

'use strict';

const request = require('supertest');
const app = require('../../src/app');

describe('GET /api/profile/:userId', () => {
  test('200 — returns profile for seeded user', async () => {
    const res = await request(app).get('/api/profile/user-001');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('user-001');
    expect(res.body.name).toBeDefined();
    expect(res.body.email).toBeDefined();
    expect(res.body.registrationDate).toBeDefined();
    expect(res.body.accountStatus).toBeDefined();
  });

  test('404 — unknown user', async () => {
    const res = await request(app).get('/api/profile/does-not-exist');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/profile/:userId', () => {
  test('200 — updates name successfully', async () => {
    const res = await request(app)
      .put('/api/profile/user-001')
      .send({ name: 'Integration Test Name' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Integration Test Name');
  });

  test('read-only fields are not changed by PUT', async () => {
    const before = await request(app).get('/api/profile/user-001');
    const originalEmail = before.body.email;
    const originalStatus = before.body.accountStatus;

    await request(app)
      .put('/api/profile/user-001')
      .send({
        name: 'Another Name',
        email: 'hacker@evil.com',
        accountStatus: 'suspended',
      });

    const after = await request(app).get('/api/profile/user-001');
    expect(after.body.email).toBe(originalEmail);
    expect(after.body.accountStatus).toBe(originalStatus);
  });

  test('422 — rejects empty name', async () => {
    const res = await request(app)
      .put('/api/profile/user-001')
      .send({ name: '' });
    expect(res.status).toBe(422);
  });

  test('422 — rejects name with script tag', async () => {
    const res = await request(app)
      .put('/api/profile/user-001')
      .send({ name: '<script>bad()</script>' });
    expect(res.status).toBe(422);
  });

  test('404 — unknown user', async () => {
    const res = await request(app)
      .put('/api/profile/no-such-user')
      .send({ name: 'Valid Name' });
    expect(res.status).toBe(404);
  });
});
