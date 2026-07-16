'use strict';

/**
 * Unit tests for requireAuth middleware (app/src/adapters/inbound/http/authMiddleware.js)
 *
 * Covers:
 *  1. Valid token passthrough — req.user populated, next() called
 *  2. Missing token redirect — 302, Location with returnUrl, empty body
 *  3. Expired token redirect — 302, audit log generated
 *  4. Malformed token redirect — 302, security warning logged
 *  5. Audit log generation — timestamp, path, IP, user agent, action fields
 */

// ── Mock jsonwebtoken before requiring the middleware ─────────────────────────
jest.mock('jsonwebtoken');
const jwt = require('jsonwebtoken');

// ── Mock the logger ───────────────────────────────────────────────────────────
jest.mock('../src/infrastructure/logger', () => ({
  audit: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
  http: jest.fn(),
}));
const logger = require('../src/infrastructure/logger');

// ── Mock env config so the middleware can resolve loginUrl without a real .env ─
jest.mock('../src/config/env', () => ({
  auth: {
    loginUrl: '/api/v1/users/login',
    defaultLandingUrl: '/api/v1/users/me',
    jwtSecret: 'test-secret',
  },
  jwtSecret: 'test-secret',
  jwtExpiresIn: '1h',
  port: 3000,
  nodeEnv: 'test',
}));

const { requireAuth } = require('../src/adapters/inbound/http/authMiddleware');

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Build a minimal mock Express request object.
 *
 * @param {object} [overrides]
 * @returns {object}
 */
function buildReq(overrides = {}) {
  return {
    headers: {},
    path: '/api/v1/users/123',
    originalUrl: '/api/v1/users/123',
    ip: '127.0.0.1',
    get(header) {
      return this.headers[header.toLowerCase()] || undefined;
    },
    ...overrides,
  };
}

/**
 * Build a minimal mock Express response object that records calls.
 *
 * @returns {object}
 */
function buildRes() {
  const res = {
    _status: null,
    _headers: {},
    _body: undefined,
    _ended: false,

    status(code) {
      this._status = code;
      return this;
    },
    setHeader(name, value) {
      this._headers[name.toLowerCase()] = value;
      return this;
    },
    redirect(codeOrUrl, url) {
      if (typeof codeOrUrl === 'number') {
        this._status = codeOrUrl;
        this._headers['location'] = url;
      } else {
        // redirect(url) — Express defaults to 302
        this._status = 302;
        this._headers['location'] = codeOrUrl;
      }
      this._body = '';
      this._ended = true;
      return this;
    },
    end(body) {
      this._body = body !== undefined ? body : '';
      this._ended = true;
      return this;
    },
    json(body) {
      this._body = body;
      this._ended = true;
      return this;
    },
    send(body) {
      this._body = body !== undefined ? body : '';
      this._ended = true;
      return this;
    },
  };
  return res;
}

// ── Test suite ────────────────────────────────────────────────────────────────

describe('requireAuth middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── 1. Valid token passthrough ──────────────────────────────────────────────
  describe('valid token passthrough', () => {
    const decodedPayload = { userId: 'user-42', email: 'alice@example.com', iat: 1000, exp: 9999999999 };

    beforeEach(() => {
      jwt.verify.mockReturnValue(decodedPayload);
    });

    it('calls next() when a valid Bearer token is provided', () => {
      const req = buildReq({
        headers: { authorization: 'Bearer valid.jwt.token' },
      });
      const res = buildRes();
      const next = jest.fn();

      requireAuth(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(); // called with no arguments (no error)
    });

    it('populates req.user with the decoded token payload', () => {
      const req = buildReq({
        headers: { authorization: 'Bearer valid.jwt.token' },
      });
      const res = buildRes();
      const next = jest.fn();

      requireAuth(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user).toMatchObject(decodedPayload);
    });

    it('does NOT redirect when the token is valid', () => {
      const req = buildReq({
        headers: { authorization: 'Bearer valid.jwt.token' },
      });
      const res = buildRes();
      const next = jest.fn();

      requireAuth(req, res, next);

      expect(res._status).not.toBe(302);
      expect(res._ended).toBe(false);
    });

    it('calls jwt.verify with the token and the configured secret', () => {
      const req = buildReq({
        headers: { authorization: 'Bearer valid.jwt.token' },
      });
      const res = buildRes();
      const next = jest.fn();

      requireAuth(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith('valid.jwt.token', 'test-secret');
    });
  });

  // ── 2. Missing token redirect ───────────────────────────────────────────────
  describe('missing token redirect', () => {
    it('returns a 302 redirect when Authorization header is absent', () => {
      const req = buildReq(); // no authorization header
      const res = buildRes();
      const next = jest.fn();

      requireAuth(req, res, next);

      expect(res._status).toBe(302);
    });

    it('sets Location header to login URL with encoded returnUrl', () => {
      const req = buildReq({
        originalUrl: '/api/v1/users/123',
      });
      const res = buildRes();
      const next = jest.fn();

      requireAuth(req, res, next);

      const location = res._headers['location'];
      expect(location).toBeDefined();
      expect(location).toContain('/api/v1/users/login');
      expect(location).toContain('returnUrl=');
      // The original URL must be URL-encoded in the query param
      expect(location).toContain(encodeURIComponent('/api/v1/users/123'));
    });

    it('does not call next() when token is missing', () => {
      const req = buildReq();
      const res = buildRes();
      const next = jest.fn();

      requireAuth(req, res, next);

      expect(next).not.toHaveBeenCalled();
    });

    it('response body is empty for missing-token redirect', () => {
      const req = buildReq();
      const res = buildRes();
      const next = jest.fn();

      requireAuth(req, res, next);

      // Body should be empty string or undefined (no data exposed)
      expect(res._body === '' || res._body === undefined || res._body === null).toBe(true);
    });

    it('generates an audit log entry for missing token', () => {
      const req = buildReq({
        originalUrl: '/api/v1/users/123',
        ip: '10.0.0.1',
        headers: { 'user-agent': 'TestAgent/1.0' },
      });
      const res = buildRes();
      const next = jest.fn();

      requireAuth(req, res, next);

      expect(logger.audit).toHaveBeenCalled();
    });
  });

  // ── 3. Expired token redirect ───────────────────────────────────────────────
  describe('expired token redirect', () => {
    beforeEach(() => {
      const expiredError = new Error('jwt expired');
      expiredError.name = 'TokenExpiredError';
      jwt.verify.mockImplementation(() => { throw expiredError; });
    });

    it('returns a 302 redirect when the JWT is expired', () => {
      const req = buildReq({
        headers: { authorization: 'Bearer expired.jwt.token' },
      });
      const res = buildRes();
      const next = jest.fn();

      requireAuth(req, res, next);

      expect(res._status).toBe(302);
    });

    it('sets Location header with returnUrl for expired token', () => {
      const req = buildReq({
        headers: { authorization: 'Bearer expired.jwt.token' },
        originalUrl: '/api/v1/users/me',
      });
      const res = buildRes();
      const next = jest.fn();

      requireAuth(req, res, next);

      const location = res._headers['location'];
      expect(location).toContain('/api/v1/users/login');
      expect(location).toContain('returnUrl=');
    });

    it('generates an audit log entry for expired token', () => {
      const req = buildReq({
        headers: { authorization: 'Bearer expired.jwt.token' },
        originalUrl: '/api/v1/users/me',
        ip: '192.168.1.1',
        headers: {
          authorization: 'Bearer expired.jwt.token',
          'user-agent': 'Mozilla/5.0',
        },
      });
      const res = buildRes();
      const next = jest.fn();

      requireAuth(req, res, next);

      expect(logger.audit).toHaveBeenCalled();
    });

    it('does not call next() for expired token', () => {
      const req = buildReq({
        headers: { authorization: 'Bearer expired.jwt.token' },
      });
      const res = buildRes();
      const next = jest.fn();

      requireAuth(req, res, next);

      expect(next).not.toHaveBeenCalled();
    });

    it('response body is empty for expired-token redirect', () => {
      const req = buildReq({
        headers: { authorization: 'Bearer expired.jwt.token' },
      });
      const res = buildRes();
      const next = jest.fn();

      requireAuth(req, res, next);

      expect(res._body === '' || res._body === undefined || res._body === null).toBe(true);
    });
  });

  // ── 4. Malformed token handling ─────────────────────────────────────────────
  describe('malformed token handling', () => {
    beforeEach(() => {
      const malformedError = new Error('invalid token');
      malformedError.name = 'JsonWebTokenError';
      jwt.verify.mockImplementation(() => { throw malformedError; });
    });

    it('returns a 302 redirect when the JWT is malformed', () => {
      const req = buildReq({
        headers: { authorization: 'Bearer not.a.valid.token' },
      });
      const res = buildRes();
      const next = jest.fn();

      requireAuth(req, res, next);

      expect(res._status).toBe(302);
    });

    it('logs a security warning for malformed token', () => {
      const req = buildReq({
        headers: { authorization: 'Bearer not.a.valid.token' },
        originalUrl: '/api/v1/users/123',
        ip: '10.10.10.10',
      });
      const res = buildRes();
      const next = jest.fn();

      requireAuth(req, res, next);

      // Either logger.warn or logger.audit should be called for security warning
      const warnCalled = logger.warn.mock.calls.length > 0;
      const auditCalled = logger.audit.mock.calls.length > 0;
      expect(warnCalled || auditCalled).toBe(true);
    });

    it('does not call next() for malformed token', () => {
      const req = buildReq({
        headers: { authorization: 'Bearer not.a.valid.token' },
      });
      const res = buildRes();
      const next = jest.fn();

      requireAuth(req, res, next);

      expect(next).not.toHaveBeenCalled();
    });

    it('response body is empty for malformed-token redirect', () => {
      const req = buildReq({
        headers: { authorization: 'Bearer not.a.valid.token' },
      });
      const res = buildRes();
      const next = jest.fn();

      requireAuth(req, res, next);

      expect(res._body === '' || res._body === undefined || res._body === null).toBe(true);
    });

    it('sets Location header with returnUrl for malformed token', () => {
      const req = buildReq({
        headers: { authorization: 'Bearer not.a.valid.token' },
        originalUrl: '/api/v1/users/profile',
      });
      const res = buildRes();
      const next = jest.fn();

      requireAuth(req, res, next);

      const location = res._headers['location'];
      expect(location).toContain('/api/v1/users/login');
      expect(location).toContain('returnUrl=');
    });
  });

  // ── 5. Audit log generation ─────────────────────────────────────────────────
  describe('audit log generation', () => {
    it('audit log includes timestamp field', () => {
      const req = buildReq({
        originalUrl: '/api/v1/users/123',
        ip: '10.0.0.5',
        headers: { 'user-agent': 'AuditTestAgent/2.0' },
      });
      const res = buildRes();
      const next = jest.fn();

      requireAuth(req, res, next);

      expect(logger.audit).toHaveBeenCalled();
      const [, meta] = logger.audit.mock.calls[0];
      expect(meta).toHaveProperty('timestamp');
    });

    it('audit log includes the requested path', () => {
      const req = buildReq({
        originalUrl: '/api/v1/users/123',
        ip: '10.0.0.5',
        headers: { 'user-agent': 'AuditTestAgent/2.0' },
      });
      const res = buildRes();
      const next = jest.fn();

      requireAuth(req, res, next);

      const [, meta] = logger.audit.mock.calls[0];
      expect(meta).toHaveProperty('path');
      expect(meta.path).toBe('/api/v1/users/123');
    });

    it('audit log includes the client IP address', () => {
      const req = buildReq({
        originalUrl: '/api/v1/users/123',
        ip: '10.0.0.5',
        headers: { 'user-agent': 'AuditTestAgent/2.0' },
      });
      const res = buildRes();
      const next = jest.fn();

      requireAuth(req, res, next);

      const [, meta] = logger.audit.mock.calls[0];
      expect(meta).toHaveProperty('ip');
      expect(meta.ip).toBe('10.0.0.5');
    });

    it('audit log includes the user agent string', () => {
      const req = buildReq({
        originalUrl: '/api/v1/users/123',
        ip: '10.0.0.5',
        headers: { 'user-agent': 'AuditTestAgent/2.0' },
      });
      const res = buildRes();
      const next = jest.fn();

      requireAuth(req, res, next);

      const [, meta] = logger.audit.mock.calls[0];
      expect(meta).toHaveProperty('userAgent');
      expect(meta.userAgent).toBe('AuditTestAgent/2.0');
    });

    it('audit log includes the action taken', () => {
      const req = buildReq({
        originalUrl: '/api/v1/users/123',
        ip: '10.0.0.5',
        headers: { 'user-agent': 'AuditTestAgent/2.0' },
      });
      const res = buildRes();
      const next = jest.fn();

      requireAuth(req, res, next);

      const [, meta] = logger.audit.mock.calls[0];
      expect(meta).toHaveProperty('action');
      // Action should describe the redirect to login
      expect(typeof meta.action).toBe('string');
      expect(meta.action.length).toBeGreaterThan(0);
    });

    it('audit log event name describes unauthenticated access', () => {
      const req = buildReq({
        originalUrl: '/api/v1/users/123',
        ip: '10.0.0.5',
        headers: { 'user-agent': 'AuditTestAgent/2.0' },
      });
      const res = buildRes();
      const next = jest.fn();

      requireAuth(req, res, next);

      const [event] = logger.audit.mock.calls[0];
      expect(typeof event).toBe('string');
      expect(event.length).toBeGreaterThan(0);
    });
  });
});
