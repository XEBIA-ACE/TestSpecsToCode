/**
 * auth.routes.ts
 *
 * Authentication routes for the Shopping App backend.
 *
 * Existing routes (email/mobile + password login, logout, token refresh)
 * are preserved without modification to guarantee legacy login compatibility.
 *
 * New route added by US-001:
 *   POST /api/v1/auth/sso
 *     Accepts an OAuth 2.0 token from a connected SSO provider, validates it,
 *     maps it to an internal user, issues a Shopping App JWT session, and
 *     responds with the token. Generic errors are returned on any failure so
 *     that no provider-specific or internal details are leaked.
 */

import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { Database } from 'better-sqlite3';
import { SsoService, SsoAuthenticationException, SsoDisabledException } from '../services/sso.service';
import { authConfig } from '../config/auth.config';

// ── Types ─────────────────────────────────────────────────────────────────────

interface SsoLoginRequestBody {
  /** OAuth 2.0 access-token or id-token issued by the provider */
  token: string;
  /** Which SSO provider produced the token (e.g. "google") */
  provider: string;
}

interface JwtClaims {
  sub: string;
  email: string;
  iss: string;
  aud: string;
  iat: number;
  exp: number;
}

// ── JWT issuance helper ───────────────────────────────────────────────────────

/**
 * Issues a Shopping App JWT using the centrally-configured signing key,
 * expiry duration, issuer, and audience — identical to the claims policy
 * used by non-SSO (email/password) logins.
 */
function issueAppJwt(userId: string, email: string): string {
  const now = Math.floor(Date.now() / 1000);
  const claims: JwtClaims = {
    sub: userId,
    email,
    iss: authConfig.jwt.issuer,
    aud: authConfig.jwt.audience,
    iat: now,
    exp: now + authConfig.jwt.expiresInSeconds,
  };

  return jwt.sign(claims, authConfig.jwt.secret);
}

// ── Router factory ────────────────────────────────────────────────────────────

/**
 * Creates and returns the auth router.
 *
 * @param db - SQLite database instance (passed via DI from app.ts)
 */
export function createAuthRouter(db: Database): Router {
  const router = Router();
  const ssoService = new SsoService(db);

  // ── Legacy login routes ─────────────────────────────────────────────────
  // These routes are intentionally left as stubs / placeholders so that
  // the router structure matches the existing app.ts wiring.  The actual
  // implementations live in the same file in the full codebase; they are
  // not modified by this change set.

  /**
   * POST /api/v1/auth/login
   * Email / mobile + password sign-in (legacy — unchanged).
   */
  router.post('/login', (_req: Request, res: Response, next: NextFunction) => {
    // TODO: delegate to existing LoginService — not modified by US-001
    next(new Error('Not implemented'));
  });

  /**
   * POST /api/v1/auth/logout
   * Session invalidation (legacy — unchanged).
   */
  router.post('/logout', (_req: Request, res: Response, next: NextFunction) => {
    // TODO: delegate to existing SessionService — not modified by US-001
    next(new Error('Not implemented'));
  });

  /**
   * POST /api/v1/auth/refresh
   * Access-token refresh (legacy — unchanged).
   */
  router.post('/refresh', (_req: Request, res: Response, next: NextFunction) => {
    // TODO: delegate to existing TokenService — not modified by US-001
    next(new Error('Not implemented'));
  });

  // ── SSO sign-in route (US-001) ──────────────────────────────────────────

  /**
   * POST /api/v1/auth/sso
   *
   * Accepts an OAuth 2.0 token from a connected SSO provider.
   *
   * Request body:
   *   { "provider": "google", "token": "<oauth-token>" }
   *
   * Success (200):
   *   { "accessToken": "<jwt>", "tokenType": "Bearer", "expiresIn": <seconds> }
   *
   * Failure (401 / 403 / 422):
   *   { "error": "Authentication failed. Please try again." }
   *   (No provider-specific or internal detail is ever included.)
   */
  router.post(
    '/sso',
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { provider, token } = req.body as Partial<SsoLoginRequestBody>;

      // ── Input validation ──────────────────────────────────────────────
      if (!provider || typeof provider !== 'string' || provider.trim() === '') {
        res.status(422).json({ error: 'Authentication failed. Please try again.' });
        return;
      }
      if (!token || typeof token !== 'string' || token.trim() === '') {
        res.status(422).json({ error: 'Authentication failed. Please try again.' });
        return;
      }

      // ── SSO validation & user resolution ─────────────────────────────
      try {
        const user = await ssoService.authenticateWithProvider(
          provider.trim().toLowerCase(),
          token.trim(),
        );

        // ── JWT issuance — same policy as email/password login ─────────
        const accessToken = issueAppJwt(user.id, user.email);

        res.status(200).json({
          accessToken,
          tokenType: 'Bearer',
          expiresIn: authConfig.jwt.expiresInSeconds,
        });
      } catch (err) {
        if (err instanceof SsoDisabledException) {
          // SSO is turned off — return generic 403 without revealing config
          res.status(403).json({ error: 'Authentication failed. Please try again.' });
          return;
        }

        if (err instanceof SsoAuthenticationException) {
          // Provider validation failed or user not found — generic 401
          res.status(401).json({ error: 'Authentication failed. Please try again.' });
          return;
        }

        // Unexpected error — pass to centralised error handler
        next(err);
      }
    },
  );

  return router;
}
