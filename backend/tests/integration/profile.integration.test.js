/**
 * Integration tests: PUT /api/profile
 *
 * Tests the full request → controller → service → repository pipeline.
 * Uses supertest to drive HTTP requests against an Express app instance.
 *
 * Run with: npx jest backend/tests/integration/profile.integration.test.js
 */

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app'); // Express app (see backend/app.js)
const userRepository = require('../../repositories/userRepository');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

// Helper: create a signed token for a given user id
function makeToken(userId) {
  return jwt.sign({ id: userId, email: 'test@example.com' }, JWT_SECRET, { expiresIn: '1h' });
}

// Helper: seed a user and return { user, token }
function seedUser(overrides = {}) {
  const user = userRepository._seed({
    name: 'Test User',
    email: 'test@example.com',
    passwordHash: '$2b$10$hashedpassword',
    ...overrides,
  });
  return { user, token: makeToken(user.id) };
}

describe('PUT /api/profile — integration', () => {
  describe('Authentication', () => {
    it('returns 401 when no token is provided', async () => {
      const res = await request(app).put('/api/profile').send({ name: 'New Name' });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('returns 403 when an invalid token is provided', async () => {
      const res = await request(app)
        .put('/api/profile')
        .set('Authorization', 'Bearer invalid.token.here')
        .send({ name: 'New Name' });
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Successful profile updates', () => {
    it('updates the user name and returns a success message', async () => {
      const { user, token } = seedUser();

      const res = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      // Acceptance criterion: success message is present
      expect(res.body.message).toMatch(/successfully/i);
      expect(res.body.user.name).toBe('Updated Name');
      expect(res.body.user.id).toBe(user.id);
    });

    it('updates the user email and returns a success message', async () => {
      const { token } = seedUser({ email: 'old@example.com' });

      const res = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'new@example.com' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/successfully/i);
      expect(res.body.user.email).toBe('new@example.com');
    });

    it('updates the password (hashed) and returns a success message', async () => {
      const { token } = seedUser();

      const res = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ password: 'NewSecureP@ss1' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/successfully/i);
      // Password hash must NOT be exposed in the response
      expect(res.body.user.passwordHash).toBeUndefined();
    });

    it('updates multiple fields in a single request', async () => {
      const { token } = seedUser({ email: 'multi@example.com' });

      const res = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Multi Update', email: 'multi-new@example.com' });

      expect(res.status).toBe(200);
      expect(res.body.user.name).toBe('Multi Update');
      expect(res.body.user.email).toBe('multi-new@example.com');
    });
  });

  describe('Validation and error handling', () => {
    it('returns 400 when no fields are provided', async () => {
      const { token } = seedUser();

      const res = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns 409 when the email is already taken by another user', async () => {
      seedUser({ email: 'taken@example.com' });
      const { token } = seedUser({ email: 'other@example.com' });

      const res = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'taken@example.com' });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already in use/i);
    });
  });

  describe('Response shape', () => {
    it('never exposes passwordHash in the response body', async () => {
      const { token } = seedUser();

      const res = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Safe User' });

      expect(res.body.user).not.toHaveProperty('passwordHash');
    });

    it('response contains success flag, message, and user object', async () => {
      const { token } = seedUser();

      const res = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Shape Test' });

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user).toHaveProperty('name');
      expect(res.body.user).toHaveProperty('email');
    });
  });
});
