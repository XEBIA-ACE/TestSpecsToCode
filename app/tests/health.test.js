'use strict';

/**
 * Health endpoint public-access tests.
 *
 * Ensures that GET /health remains accessible without any authentication,
 * i.e. it is NOT accidentally protected by the requireAuth middleware
 * introduced for US-002.
 */

const request = require('supertest');
const app = require('../src/app');

describe('GET /health — public access', () => {
  it('returns 200 without an Authorization header', async () => {
    // Deliberately omit any Authorization header to confirm the endpoint
    // is not guarded by authentication middleware (no 302 redirect).
    const res = await request(app)
      .get('/health')
      // No .set('Authorization', ...) — intentionally unauthenticated
      .expect(200);

    // Must not be a redirect
    expect(res.status).toBe(200);
    expect(res.status).not.toBe(302);
  });

  it('returns expected health check payload without authentication', async () => {
    const res = await request(app)
      .get('/health');
      // No Authorization header

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('service', 'user-management-service');
  });
});
