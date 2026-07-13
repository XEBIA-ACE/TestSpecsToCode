'use strict';

const request = require('supertest');
const app = require('../../src/app');

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      status: 'ok',
      service: 'user-management-service',
    });
  });
});

describe('Unknown routes', () => {
  it('returns 404 for an unregistered path', async () => {
    const res = await request(app).get('/unknown-path');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});
