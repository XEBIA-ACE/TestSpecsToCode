```javascript
'use strict';

/**
 * Integration tests for POST /api/v1/users/register
 *
 * userService is mocked so no real DB is needed.
 */

jest.mock('../src/application/userService', () => ({
  register: jest.fn(),
}));

const request = require('supertest');
const app = require('../src/app');
const userService = require('../src/application/userService');
const { ConflictError } = require('../src/domain/errors/domainErrors');

const REGISTER_URL = '/api/v1/users/register';

const validPayload = {
  name: 'Alice',
  email: 'alice@example.com',
  password: 'securepassword',
};

describe('POST /api/v1/users/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('route is accessible via HTTP (returns non-404)', async () => {
    userService.register.mockResolvedValue({
      id: 'uuid-1',
      name: 'Alice',
      email: 'alice@example.com',
      isVerified: false,
      createdAt: new Date(),
    });

    const res = await request(app).post(REGISTER_URL).send(validPayload);
    expect(res.status).not.toBe(404);
  });

  it('returns 201 with user object on valid input', async () => {
    const mockUser = {
      id: 'uuid-1',
      name: 'Alice',
      email: 'alice@example.com',
      isVerified: false,
      createdAt: new Date().toISOString(),
    };
    userService.register.mockResolvedValue(mockUser);

    const res = await request(app).post(REGISTER_URL).send(validPayload);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe('alice@example.com');
  });

  // New validation tests
  it('returns 422 when name is missing', async () => {
    const res = await request(app)
      .post(REGISTER_URL)
      .send({ email: 'alice@example.com', password: 'securepassword' });

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('errors');
    const fields = res.body.errors.map((e) => e.field);
    expect(fields).toContain('name');
  });

  it('returns 422 when email is missing', async () => {
    const res = await request(app)
      .post(REGISTER_URL)
      .send({ name: 'Alice', password: 'securepassword' });

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('errors');
    const fields = res.body.errors.map((e) => e.field);
    expect(fields).toContain('email');
  });

  it('returns 422 when email format is invalid', async () => {
    const res = await request(app)
      .post(REGISTER_URL)
      .send({ name: 'Alice', email: 'not-an-email', password: 'securepassword' });

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('errors');
  });

  it('returns 422 when password is missing', async () => {
    const res = await request(app)
      .post(REGISTER_URL)
      .send({ name: 'Alice', email: 'alice@example.com' });

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('errors');
    const fields = res.body.errors.map((e) => e.field);
    expect(fields).toContain('password');
  });

  it('returns 422 when password is too short', async () => {
    const res = await request(app)
      .post(REGISTER_URL)
      .send({ name: 'Alice', email: 'alice@example.com', password: 'short' });

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('errors');
    const fields = res.body.errors.map((e) => e.field);
    expect(fields).toContain('password');
  });
});
```

These changes add new validation rules in the backend and add comprehensive unit tests that cover these validation scenarios as outlined in the user story.