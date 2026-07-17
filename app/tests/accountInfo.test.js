```javascript
'use strict';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const config = require('../src/config/env');

// Mock the pool for database operations
jest.mock('../src/infrastructure/db/pool', () => ({
  query: jest.fn(),
}));

// Mock the logger to capture audit log entries
jest.mock('../src/infrastructure/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  http: jest.fn(),
  audit: jest.fn(),
}));

const pool = require('../src/infrastructure/db/pool');
const logger = require('../src/infrastructure/logger');

describe('GET /api/v1/users/me/account', () => {
  const endpoint = '/api/v1/users/me/account';
  
  const mockUser = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    first_name: 'Alice',
    last_name: 'Smith',
    email: 'alice@example.com',
    created_at: new Date('2024-01-15T10:30:00Z'),
    is_verified: true,
  };

  const generateValidToken = (userId = mockUser.id, expiresIn = '1h') => {
    return jwt.sign(
      { userId, email: mockUser.email },
      config.jwt.secret,
      { expiresIn }
    );
  };

  const generateExpiredToken = (userId = mockUser.id) => {
    return jwt.sign(
      { userId, email: mockUser.email },
      config.jwt.secret,
      { expiresIn: '-1s' }
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful account info retrieval', () => {
    it('should return 200 and account info with valid JWT', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [mockUser],
        rowCount: 1,
      });

      const token = generateValidToken();

      const response = await request(app)
        .get(endpoint)
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toEqual({
        name: 'Alice Smith',
        email: 'alice@example.com',
        registrationDate: '2024-01-15T10:30:00.000Z',
        accountStatus: 'Verified',
      });
    });

    it('should return all required fields in response', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [mockUser],
        rowCount: 1,
      });

      const token = generateValidToken();

      const response = await request(app)
        .get(endpoint)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const { data } = response.body;
      
      expect(data).toHaveProperty('name');
      expect(data).toHaveProperty('email');
      expect(data).toHaveProperty('registrationDate');
      expect(data).toHaveProperty('accountStatus');
      
      expect(typeof data.name).toBe('string');
      expect(typeof data.email).toBe('string');
      expect(typeof data.registrationDate).toBe('string');
      expect(typeof data.accountStatus).toBe('string');
    });

    it('should return "Pending Verification" for unverified users', async () => {
      const unverifiedUser = { ...mockUser, is_verified: false };
      pool.query.mockResolvedValueOnce({
        rows: [unverifiedUser],
        rowCount: 1,
      });

      const token = generateValidToken();

      const response = await request(app)
        .get(endpoint)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data.accountStatus).toBe('Pending Verification');
    });

    it('should format registrationDate in ISO 8601 format', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [mockUser],
        rowCount: 1,
      });

      const token = generateValidToken();

      const response = await request(app)
        .get(endpoint)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const { registrationDate } = response.body.data;
      
      // Verify it's a valid ISO 8601 date string
      expect(() => new Date(registrationDate)).not.toThrow();
      expect(new Date(registrationDate).toISOString()).toBe(registrationDate);
    });
  });

  describe('Authentication failures', () => {
    it('should return 401 for expired JWT', async () => {
      const expiredToken = generateExpiredToken();

      const response = await request(app)
        .get(endpoint)
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/session expired|token|invalid/i);
    });

    it('should return 401 for invalid JWT signature', async () => {
      const invalidToken = jwt.sign(
        { userId: mockUser.id },
        'wrong-secret-key',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get(endpoint)
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 for malformed JWT', async () => {
      const response = await request(app)
        .get(endpoint)
        .set('Authorization', 'Bearer malformed.token.here')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 for missing Authorization header', async () => {
      const response = await request(app)
        .get(endpoint)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 for Authorization header without Bearer prefix', async () => {
      const token = generateValidToken();

      const response = await request(app)
        .get(endpoint)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 for empty Bearer token', async () => {
      const response = await request(app)
        .get(endpoint)
        .set('Authorization', 'Bearer ')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Cache-Control header verification', () => {
    it('should set Cache-Control header to prevent caching', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [mockUser],
        rowCount: 1,
      });

      const token = generateValidToken();

      const response = await request(app)
        .get(endpoint)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.headers['cache-control']).toBeDefined();
      expect(response.headers['cache-control']).toMatch(/no-store/i);
      expect(response.headers['cache-control']).toMatch(/no-cache/i);
    });

    it('should include must-revalidate in Cache-Control header', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [mockUser],
        rowCount: 1,
      });

      const token = generateValidToken();

      const response = await request(app)
        .get(endpoint)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.headers['cache-control']).toMatch(/must-revalidate/i);
    });
  });

  describe('Audit log verification', () => {
    it('should create audit log entry on successful access', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [mockUser],
        rowCount: 1,
      });

      const token = generateValidToken();

      await request(app)
        .get(endpoint)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Verify audit log was called
      expect(logger.info).toHaveBeenCalled();
      
      // Find the audit log call
      const auditLogCall = logger.info.mock.calls.find(
        (call) => call[0] && call[0].includes && call[0].includes('ACCOUNT_INFO_VIEW')
      );
      
      expect(auditLogCall).toBeDefined();
    });

    it('should include userId in audit log entry', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [mockUser],
        rowCount: 1,
      });

      const token = generateValidToken();

      await request(app)
        .get(endpoint)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Check that logger was called with userId context
      const loggerCalls = logger.info.mock.calls;
      const auditCall = loggerCalls.find(
        (call) => {
          const message = call[0] || '';
          const context = call[1] || {};
          return (
            message.includes('ACCOUNT_INFO_VIEW') ||
            context.action === 'ACCOUNT_INFO_VIEW' ||
            context.userId === mockUser.id
          );
        }
      );
      
      expect(auditCall).toBeDefined();
    });

    it('should not create audit log entry on authentication failure', async () => {
      logger.info.mockClear();

      await request(app)
        .get(endpoint)
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      // Verify no ACCOUNT_INFO_VIEW audit log was created
      const auditLogCall = logger.info.mock.calls.find(
        (call) => call[0] && call[0].includes && call[0].includes('ACCOUNT_INFO_VIEW')
      );
      
      expect(auditLogCall).toBeUndefined();
    });
  });

  describe('Error handling', () => {
    it('should return 404 when user is not found', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
      });

      const token = generateValidToken();

      const response = await request(app)
        .get(endpoint)
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/not found/i);
    });

    it('should return 500 when database is unavailable', async () => {
      pool.query.mockRejectedValueOnce(new Error('Connection refused'));

      const token = generateValidToken();

      const response = await request(app)
        .get(endpoint)
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Response format validation', () => {
    it('should return response wrapped in data object', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [mockUser],
        rowCount: 1,
      });

      const token = generateValidToken();

      const response = await request(app)
        .get(endpoint)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(typeof response.body.data).toBe('object');
      expect(response.body.data).not.toBeNull();
    });

    it('should concatenate firstName and lastName for name field', async () => {
      const userWithNames = {
        ...mockUser,
        first_name: 'John',
        last_name: 'Doe',
      };
      
      pool.query.mockResolvedValueOnce({
        rows: [userWithNames],
        rowCount: 1,
      });

      const token = generateValidToken();

      const response = await request(app)
        .get(endpoint)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data.name).toBe('John Doe');
    });

    it('should return Content-Type as application/json', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [mockUser],
        rowCount: 1,
      });

      const token = generateValidToken();

      const response = await request(app)
        .get(endpoint)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });
});
```