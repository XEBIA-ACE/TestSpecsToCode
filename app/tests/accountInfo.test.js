'use strict';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const config = require('../src/config/env');

// Mock the required modules
jest.mock('../src/infrastructure/db/pool', () => ({
  query: jest.fn(),
}));
jest.mock('../src/infrastructure/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  http: jest.fn(),
  audit: jest.fn(),
}));

const pool = require('../src/infrastructure/db/pool');
const logger = require('../src/infrastructure/logger');

describe('POST /api/v1/users/me/profile', () => {
  const endpoint = '/api/v1/users/me/profile';
  
  const mockUser = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    first_name: 'Alice',
    last_name: 'Smith',
    email: 'alice@example.com',
    created_at: new Date('2024-01-15T10:30:00Z'),
    is_verified: true,
  };

  const validUpdatePayload = {
    first_name: 'AliceUpdated',
    last_name: 'SmithUpdated',
    email: 'aliceupdated@example.com',
  };

  const invalidUpdatePayload = {
    first_name: '',  // Invalid because it's empty
    email: 'not-an-email', // Invalid email format
  };

  const generateValidToken = (userId = mockUser.id, expiresIn = '1h') => {
    return jwt.sign(
      { userId, email: mockUser.email },
      config.jwt.secret,
      { expiresIn }
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful profile update', () => {
    it('should return 200 and updated user info with valid data', async () => {
      // Mock successful database update
      pool.query.mockResolvedValueOnce({
        rows: [{ ...mockUser, ...validUpdatePayload }],
        rowCount: 1,
      });

      const token = generateValidToken();

      const response = await request(app)
        .post(endpoint)
        .set('Authorization', `Bearer ${token}`)
        .send(validUpdatePayload)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toMatchObject(validUpdatePayload);
    });
  });

  describe('Profile update validation errors', () => {
    it('should return 422 for invalid update data', async () => {
      const token = generateValidToken();

      const response = await request(app)
        .post(endpoint)
        .set('Authorization', `Bearer ${token}`)
        .send(invalidUpdatePayload)
        .expect('Content-Type', /json/)
        .expect(422);

      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toContainEqual(expect.objectContaining({
        field: 'first_name',
        message: expect.any(String),
      }));
      expect(response.body.errors).toContainEqual(expect.objectContaining({
        field: 'email',
        message: expect.any(String),
      }));
    });
  });
});
