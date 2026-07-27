/**
 * auth.config.ts
 *
 * Centralised authentication configuration, including JWT policy and
 * SSO provider settings. SSO is disabled by default; set SSO_ENABLED=true
 * in the environment to activate it. All OAuth provider secrets are read
 * from environment variables — never hard-coded.
 */

export interface JwtConfig {
  secret: string;
  /** Access-token lifetime in seconds (default: 3600 = 1 hour) */
  expiresInSeconds: number;
  issuer: string;
  audience: string;
}

export interface SsoProviderConfig {
  clientId: string;
  clientSecret: string;
  /** Token-info / userinfo endpoint used to validate the provider token */
  tokenInfoUrl: string;
}

export interface SsoConfig {
  /** Master switch — set SSO_ENABLED=true to activate */
  enabled: boolean;
  providers: {
    google?: SsoProviderConfig;
    // Add further providers here as needed
  };
}

export interface AuthConfig {
  jwt: JwtConfig;
  sso: SsoConfig;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name: string, fallback = ''): string {
  return process.env[name] ?? fallback;
}

export const authConfig: AuthConfig = {
  jwt: {
    secret: optionalEnv('JWT_SECRET', 'change-me-in-production'),
    expiresInSeconds: parseInt(optionalEnv('JWT_EXPIRES_IN_SECONDS', '3600'), 10),
    issuer: optionalEnv('JWT_ISSUER', 'shopping-app'),
    audience: optionalEnv('JWT_AUDIENCE', 'shopping-app-client'),
  },
  sso: {
    enabled: optionalEnv('SSO_ENABLED', 'false') === 'true',
    providers: {
      google:
        process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
          ? {
              clientId: process.env.GOOGLE_CLIENT_ID,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET,
              tokenInfoUrl:
                optionalEnv(
                  'GOOGLE_TOKEN_INFO_URL',
                  'https://oauth2.googleapis.com/tokeninfo',
                ),
            }
          : undefined,
    },
  },
};
