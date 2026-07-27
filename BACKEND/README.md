# User Management Service - Backend

This backend service implements secure registration, login (email/mobile + password), session management, account lifecycle features, and Single Sign-On (SSO) integration (OAuth2-based).  
It is built in TypeScript and uses SQLite for local development, but can be swapped for other databases.  
See [../README.md](../README.md) for overall architecture.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
  - [Core configuration](#core-configuration)
  - [SSO (Single Sign-On) Configuration](#sso-single-sign-on-configuration)
    - [Enabling/disabling SSO](#enablingdisabling-sso)
    - [SSO Provider & OAuth Secrets](#sso-provider--oauth-secrets)
    - [Example: Google SSO](#example-google-sso)
    - [Local Development](#local-development)
    - [Production Setup](#production-setup)
    - [Expected Behaviors & Integration Notes](#expected-behaviors--integration-notes)
- [Database](#database)
- [API Routes](#api-routes)
- [Testing](#testing)
- [Contributing](#contributing)

---

## Getting Started

```sh
cp .env.example .env
npm install
npm run dev
```

---

## Environment Variables

### Core configuration

Configure these variables in your `.env` file:

| Variable              | Required | Description                          | Example                   |
|-----------------------|----------|--------------------------------------|---------------------------|
| DATABASE_PATH         | Yes      | Path to SQLite DB file               | ./data/app.db             |
| JWT_SECRET            | Yes      | JWT signing secret                   | <randomstring>            |
| PORT                  | No       | API server port (default: 3000)      | 3000                      |

See `.env.example` for more.

---

### SSO (Single Sign-On) Configuration

The backend supports OAuth2-based Single Sign-On (currently Google; extensible to others).
SSO login is **optional** and must be enabled via environment variable.

#### Enabling/disabling SSO

- To **enable** SSO login, set:
  ```
  SSO_ENABLED=true
  ```
- To **disable** SSO login (default), set:
  ```
  SSO_ENABLED=false
  ```
  or omit the variable.

**When SSO is disabled, the SSO login endpoints return 404 or are inactive; only legacy login is available.**

#### SSO Provider & OAuth Secrets

- All SSO providers require the corresponding OAuth client credentials and (optionally) extra configuration, as environment variables.
- Each provider has its own documented ENV variable names. (Below: Google example)

##### Required variables for Google SSO

| Variable                 | Required if SSO enabled | Description                           |
|--------------------------|------------------------|---------------------------------------|
| SSO_ENABLED              | Yes                    | Enables SSO endpoints (`true`/`false`)|
| SSO_PROVIDER             | Yes                    | The OAuth provider name. (e.g. `google`) |
| SSO_GOOGLE_CLIENT_ID     | Yes (if provider=google)| Google OAuth2 client ID               |
| SSO_GOOGLE_CLIENT_SECRET | Yes (if provider=google)| Google OAuth2 client secret           |
| SSO_GOOGLE_CALLBACK_URL  | Yes (if provider=google)| Backend URL to receive Google OAuth callback|

##### Other providers

- To onboard other OAuth2 providers, define:
  - `SSO_<PROVIDER>_CLIENT_ID`
  - `SSO_<PROVIDER>_CLIENT_SECRET`
  - `SSO_<PROVIDER>_CALLBACK_URL`
- The `SSO_PROVIDER` variable selects the active SSO provider (`google`, etc).

#### Example: Google SSO

Minimal `.env` snippet for Google SSO:

```ini
# Enable SSO
SSO_ENABLED=true
SSO_PROVIDER=google

# Google OAuth credentials (obtain from Google Cloud Console)
SSO_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
SSO_GOOGLE_CLIENT_SECRET=your-google-client-secret
# The callback URL must match the one registered in Google Cloud (and exposed via backend)
SSO_GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/sso/callback
```

#### Local Development

- Obtain a Google OAuth2 client for local testing from [Google Cloud Console](https://console.developers.google.com/apis/credentials).
- Set `SSO_GOOGLE_CALLBACK_URL` to reference your local dev backend (`http://localhost:<port>/api/v1/auth/sso/callback`).
- Do **not** commit actual client secrets to version control.

#### Production Setup

- Use production OAuth credentials and ensure the callback URL matches your production domain.
- Set all SSO-related ENV variables securely.
- It's recommended to use a secrets manager for client secrets in production.

#### Expected Behaviors & Integration Notes

- **SSO endpoints are ONLY available if `SSO_ENABLED=true`**.
- **Both SSO and legacy logins are supported in parallel**. Disabling SSO never disables legacy email/mobile logins.
- **SSO login returns a JWT/session indistinguishable from legacy login** in claims, expiry, and token validation policy.
- **On SSO error, responses are always generic** (e.g. `{"error": "Authentication failed. Please try again."}`) to avoid leaking provider/internal state.
- **OAuth client secrets are never logged or exposed** by the system.

---

## Database

- Default: SQLite file (`./data/app.db`)
- [See db/migrate.ts for schema files](src/db/migrate.ts)

---

## API Routes

- See [OpenAPI spec](../spec/US-007/openspec.yaml) for documented routes.
- SSO endpoints (when enabled):
  - `POST /api/v1/auth/sso`: Initiates SSO login (OAuth flow)
  - `GET /api/v1/auth/sso/callback`: Handles OAuth2 provider redirects
---

## Testing

```sh
npm run test
```

---

## Contributing

- Follow [constitution.md](../.specify/memory/constitution.md) for code and security/review standards.
- All SSO config must remain centralized and optional, and there must be no regression to legacy logins.

---

### See Also

- [Frontend SSO docs](../FRONTEND/README.md)
- [Functional Spec in spec/US-007/functional_spec.md](../spec/US-007/functional_spec.md)

---