/**
 * sso.config.ts
 *
 * Centralised SSO provider configuration.
 * Loaded from environment variables so secrets never appear in source code.
 *
 * SSO is DISABLED by default — set SSO_ENABLED=true to activate.
 * When disabled, no new SSO logins are accepted; existing sessions persist
 * until their normal expiry (constitution requirement).
 */

export interface SsoProviderConfig {
  /** OAuth 2.0 client identifier issued by the provider */
  clientId: string;
  /** OAuth 2.0 client secret — never log or expose this value */
  clientSecret: string;
  /** Provider's userinfo endpoint used to validate access tokens */
  userinfoEndpoint: string;
  /** Human-readable provider name (e.g. "google") */
  name: string;
}

export interface SsoConfig {
  /** Master toggle — SSO login is only accepted when this is true */
  enabled: boolean;
  /** Map of provider key → provider configuration */
  providers: Record<string, SsoProviderConfig>;
}

/**
 * Reads SSO configuration from environment variables.
 *
 * Supported providers (extend as needed):
 *   - google: SSO_GOOGLE_CLIENT_ID / SSO_GOOGLE_CLIENT_SECRET
 *
 * Provider userinfo endpoints are well-known and hard-coded here;
 * override via SSO_<PROVIDER>_USERINFO_URL if needed.
 */
function loadSsoConfig(): SsoConfig {
  const enabled = process.env.SSO_ENABLED === 'true';

  const providers: Record<string, SsoProviderConfig> = {};

  // ── Google ──────────────────────────────────────────────────────────────
  const googleClientId = process.env.SSO_GOOGLE_CLIENT_ID ?? '';
  const googleClientSecret = process.env.SSO_GOOGLE_CLIENT_SECRET ?? '';

  if (googleClientId && googleClientSecret) {
    providers['google'] = {
      name: 'google',
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      userinfoEndpoint:
        process.env.SSO_GOOGLE_USERINFO_URL ??
        'https://openidconnect.googleapis.com/v1/userinfo',
    };
  }

  // ── Additional providers can be registered here following the same pattern ──

  return { enabled, providers };
}

export const ssoConfig: SsoConfig = loadSsoConfig();
