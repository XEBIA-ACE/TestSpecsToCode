/**
 * sso.service.ts
 *
 * Validates an OAuth 2.0 provider token and resolves it to an internal user.
 *
 * Responsibilities:
 *  1. Verify the provider token against the OAuth provider's token-info endpoint.
 *  2. Extract a stable provider-side identity (e.g. Google "sub" claim).
 *  3. Look up the internal user whose SSO identity matches that provider identity.
 *
 * All provider-specific errors are caught here and re-thrown as the opaque
 * SsoAuthenticationException so that callers (routes) never expose provider
 * details in responses.
 */

import type { Database } from 'better-sqlite3';
import { authConfig } from '../config/auth.config';

// ── Domain types ─────────────────────────────────────────────────────────────

export interface SsoProviderIdentity {
  /** Stable unique identifier from the OAuth provider (e.g. Google "sub") */
  providerUserId: string;
  /** Provider-reported e-mail — used only as a fallback for lookup, not trusted */
  email: string;
  /** Which provider produced this identity */
  provider: string;
}

export interface InternalUser {
  id: string;
  email: string;
  username: string;
  isActive: boolean;
}

// ── Errors ───────────────────────────────────────────────────────────────────

/**
 * Thrown for any SSO authentication failure. The message is intentionally
 * generic — do NOT include provider-specific details.
 */
export class SsoAuthenticationException extends Error {
  public readonly statusCode = 401;

  constructor(message = 'Authentication failed. Please try again.') {
    super(message);
    this.name = 'SsoAuthenticationException';
  }
}

/**
 * Thrown when SSO is administratively disabled via configuration.
 */
export class SsoDisabledException extends Error {
  public readonly statusCode = 403;

  constructor() {
    super('SSO login is not enabled.');
    this.name = 'SsoDisabledException';
  }
}

// ── Service ──────────────────────────────────────────────────────────────────

export class SsoService {
  constructor(private readonly db: Database) {}

  /**
   * Validates the provider OAuth token and returns the matching internal user.
   *
   * @param provider  - OAuth provider name (e.g. "google")
   * @param oauthToken - Raw OAuth access-token or id-token from the provider
   * @throws SsoDisabledException      if SSO is not enabled in config
   * @throws SsoAuthenticationException for any validation / lookup failure
   */
  async authenticateWithProvider(
    provider: string,
    oauthToken: string,
  ): Promise<InternalUser> {
    if (!authConfig.sso.enabled) {
      throw new SsoDisabledException();
    }

    let identity: SsoProviderIdentity;
    try {
      identity = await this.validateProviderToken(provider, oauthToken);
    } catch (err) {
      // Swallow provider-specific error details — never surface them
      if (err instanceof SsoAuthenticationException || err instanceof SsoDisabledException) {
        throw err;
      }
      throw new SsoAuthenticationException();
    }

    const user = this.resolveUser(identity);
    if (!user) {
      // No linked account found — generic error, no enumeration risk
      throw new SsoAuthenticationException();
    }

    if (!user.isActive) {
      throw new SsoAuthenticationException();
    }

    return user;
  }

  // ── Private helpers ─────────────────────────────────────────────────────

  /**
   * Calls the OAuth provider's token-info / userinfo endpoint and extracts
   * a stable provider identity. Throws SsoAuthenticationException on any
   * network or validation error.
   */
  private async validateProviderToken(
    provider: string,
    oauthToken: string,
  ): Promise<SsoProviderIdentity> {
    const providerConfig = authConfig.sso.providers[provider as keyof typeof authConfig.sso.providers];
    if (!providerConfig) {
      // Unknown or unconfigured provider — treat as auth failure
      throw new SsoAuthenticationException();
    }

    const url = `${providerConfig.tokenInfoUrl}?id_token=${encodeURIComponent(oauthToken)}`;

    let response: Response;
    try {
      response = await fetch(url, { method: 'GET' });
    } catch {
      // Network error — generic failure
      throw new SsoAuthenticationException();
    }

    if (!response.ok) {
      throw new SsoAuthenticationException();
    }

    let payload: Record<string, string>;
    try {
      payload = (await response.json()) as Record<string, string>;
    } catch {
      throw new SsoAuthenticationException();
    }

    const providerUserId = payload['sub'];
    const email = payload['email'];

    if (!providerUserId || !email) {
      throw new SsoAuthenticationException();
    }

    return { providerUserId, email, provider };
  }

  /**
   * Looks up the internal user linked to the given provider identity.
   * Returns null when no matching user exists.
   *
   * The lookup uses the `sso_identities` table (provider + provider_user_id).
   * Falls back to e-mail match only when an explicit identity row is absent,
   * so that early-adopter accounts linked by e-mail still work.
   */
  private resolveUser(identity: SsoProviderIdentity): InternalUser | null {
    // Primary lookup: explicit SSO identity link
    const byIdentity = this.db
      .prepare(
        `SELECT u.id, u.email, u.username, u.is_active
         FROM users u
         INNER JOIN sso_identities si ON si.user_id = u.id
         WHERE si.provider = ? AND si.provider_user_id = ?
         LIMIT 1`,
      )
      .get(identity.provider, identity.providerUserId) as
      | { id: string; email: string; username: string; is_active: number }
      | undefined;

    if (byIdentity) {
      return {
        id: byIdentity.id,
        email: byIdentity.email,
        username: byIdentity.username,
        isActive: byIdentity.is_active === 1,
      };
    }

    // Fallback: e-mail match (only when sso_identities table has no row yet)
    const byEmail = this.db
      .prepare(
        `SELECT id, email, username, is_active
         FROM users
         WHERE email = ? AND is_active = 1
         LIMIT 1`,
      )
      .get(identity.email) as
      | { id: string; email: string; username: string; is_active: number }
      | undefined;

    if (byEmail) {
      return {
        id: byEmail.id,
        email: byEmail.email,
        username: byEmail.username,
        isActive: byEmail.is_active === 1,
      };
    }

    return null;
  }
}
