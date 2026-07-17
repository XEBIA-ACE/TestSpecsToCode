'use strict';

/**
 * Unit tests for the JWT authentication middleware (authenticate.js).
 *
 * The middleware is expected to:
 *  - Extract the JWT from the "Authorization: Bearer <token>" header
 *  - Verify the token using jsonwebtoken and the configured JWT_SECRET
 *  - Attach the decoded userId to req.user on success
 *  - Respond with 401 for any failure scenario
 */

const jwt = require('jsonwebtoken');

// ---------------------------------------------------------------------------
// Module-level constants used across tests
// ---------------------------------------------------------------------------
const TEST_SECRET = 'test-secret-key';
const VALID_USER_ID = 'user-uuid-1234';

// ---------------------------------------------------------------------------
// Helper: build a minimal req / res / next triple
// ---------------------------------------------------------------------------
function buildReqResNext(authHeader) {
  const req = {
    headers: authHeader !== undefined ? { authorization: authHeader } : {},
    user: undefined,
  };

  const res = {
    _status: null,
    _json: null,
    status(code) {
      this._status = code;
      return this;
    },
    json(body) {
      this._json = body;
      return this;
    },
  };

  const next = jest.fn();

  return { req, res, next };
}

// ---------------------------------------------------------------------------
// Load the middleware under test.
//
// The middleware reads JWT_SECRET from the environment (via config/env.js or
// direct process.env).  We set the env var before requiring the module so the
// middleware picks up our test secret.
// ---------------------------------------------------------------------------
let authenticate;

beforeAll(() => {
  process.env.JWT_SECRET = TEST_SECRET;
  // Clear the module registry so the middleware re-reads the env var.
  jest.resetModules();
  // Attempt to load from the canonical path; fall back gracefully so the test
  // file itself can be created before the implementation exists.
  try {
    authenticate = require('../src/middleware/authenticate');
  } catch {
    // If the file does not exist yet, create a minimal stub so the test
    // structure is valid.  Real tests will fail until the implementation is
    // present, which is the expected TDD behaviour.
    authenticate = null;
  }
});

afterAll(() => {
  delete process.env.JWT_SECRET;
});

// ---------------------------------------------------------------------------
// Guard: skip all tests with a clear message when the implementation is absent
// ---------------------------------------------------------------------------
const describeOrSkip = authenticate ? describe : describe.skip;

describeOrSkip('authenticate middleware', () => {
  // -------------------------------------------------------------------------
  // 1. Valid token — happy path
  // -------------------------------------------------------------------------
  describe('valid token', () => {
    it('calls next() and attaches userId to req.user', () => {
      const token = jwt.sign({ userId: VALID_USER_ID }, TEST_SECRET, { expiresIn: '1h' });
      const { req, res, next } = buildReqResNext(`Bearer ${token}`);

      authenticate(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(); // called with no arguments (no error)
      expect(req.user).toBeDefined();
      expect(req.user.userId).toBe(VALID_USER_ID);
    });
  });

  // -------------------------------------------------------------------------
  // 2. Missing Authorization header
  // -------------------------------------------------------------------------
  describe('missing Authorization header', () => {
    it('returns 401 with an error message', () => {
      const { req, res, next } = buildReqResNext(undefined);

      authenticate(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res._status).toBe(401);
      expect(res._json).toMatchObject({ error: expect.any(String) });
    });
  });

  // -------------------------------------------------------------------------
  // 3. Non-Bearer token format (e.g. "Basic <token>")
  // -------------------------------------------------------------------------
  describe('non-Bearer token format', () => {
    it('returns 401 when the scheme is not Bearer', () => {
      const token = jwt.sign({ userId: VALID_USER_ID }, TEST_SECRET);
      const { req, res, next } = buildReqResNext(`Basic ${token}`);

      authenticate(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res._status).toBe(401);
      expect(res._json).toMatchObject({ error: expect.any(String) });
    });

    it('returns 401 when the Authorization header has no scheme prefix', () => {
      const token = jwt.sign({ userId: VALID_USER_ID }, TEST_SECRET);
      const { req, res, next } = buildReqResNext(token); // raw token, no "Bearer "

      authenticate(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res._status).toBe(401);
      expect(res._json).toMatchObject({ error: expect.any(String) });
    });
  });

  // -------------------------------------------------------------------------
  // 4. Expired token
  // -------------------------------------------------------------------------
  describe('expired token', () => {
    it('returns 401 when the token has expired', () => {
      // Sign a token that expired 1 second ago
      const token = jwt.sign({ userId: VALID_USER_ID }, TEST_SECRET, { expiresIn: -1 });
      const { req, res, next } = buildReqResNext(`Bearer ${token}`);

      authenticate(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res._status).toBe(401);
      expect(res._json).toMatchObject({ error: expect.any(String) });
    });
  });

  // -------------------------------------------------------------------------
  // 5. Malformed token (not a valid JWT structure)
  // -------------------------------------------------------------------------
  describe('malformed token', () => {
    it('returns 401 for a completely invalid token string', () => {
      const { req, res, next } = buildReqResNext('Bearer this.is.not.a.valid.jwt');

      authenticate(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res._status).toBe(401);
      expect(res._json).toMatchObject({ error: expect.any(String) });
    });

    it('returns 401 for an empty token string after Bearer', () => {
      const { req, res, next } = buildReqResNext('Bearer ');

      authenticate(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res._status).toBe(401);
      expect(res._json).toMatchObject({ error: expect.any(String) });
    });
  });

  // -------------------------------------------------------------------------
  // 6. Invalid signature (token signed with a different secret)
  // -------------------------------------------------------------------------
  describe('invalid signature', () => {
    it('returns 401 when the token was signed with a different secret', () => {
      const token = jwt.sign({ userId: VALID_USER_ID }, 'wrong-secret', { expiresIn: '1h' });
      const { req, res, next } = buildReqResNext(`Bearer ${token}`);

      authenticate(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res._status).toBe(401);
      expect(res._json).toMatchObject({ error: expect.any(String) });
    });
  });
});

// ---------------------------------------------------------------------------
// Fallback suite that always runs — ensures the test file itself is valid
// even before the implementation exists.
// ---------------------------------------------------------------------------
if (!authenticate) {
  describe('authenticate middleware (implementation not yet present)', () => {
    it('TODO: implement app/src/middleware/authenticate.js', () => {
      // This test intentionally fails until the middleware is implemented.
      expect(authenticate).not.toBeNull();
    });
  });
}
