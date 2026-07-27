---
# Quality Constitution for SSO Sign-in Feature (US-001)

## Coding Standards
- Follow existing TypeScript (BACKEND) and JavaScript (app) linting, formatting, and error handling conventions.
- All code must be written in a modular, testable fashion, supporting dependency injection.
- DRY principle: Auth flows must reuse existing centralized configuration/services (token policy, error formatting, etc).
- Error messages and HTTP status codes must remain generic and non-revealing, consistent with current login error protocols.
- JWTs must be created and validated using only the Shopping App's current cryptographic and claims policy.
- Expiry/hardening: All session tokens must have the expiration, claim structure, and security standards of normal Shopping App JWTs.

## Architecture Guardrails
- No changes must introduce regressions or breaking changes to current email/mobile login or session validation logic.
- SSO implementation must not introduce backend-specific logic into the frontend (separation of concerns).
- Any new endpoints or routes must be integrated under the existing authentication router/module in the backend.
- All SSO provider configuration must be centralized, using the same mechanism as other auth service configuration.

## Non-Functional Requirements
- No regression in login latency or error frequency (target ≤10% degradation).
- Comprehensive tests for all new SSO flows and all possible outcome branches (provider success/failure, JWT issued/rejected).
- SSO must be optional and only active if enabled in configuration; toggling it off disables new SSO logins (existing sessions persist until expiry).
- Secure handling of all OAuth tokens—no logging or exposure of provider credentials on error.
- Frontend: No leaking of backend or provider error details; show only generic "Authentication failed" states.

## Review Standards
- All acceptance criteria from the user story must be explicitly covered by tests.
- PR must include updated/added OpenAPI specs where SSO endpoints affect external APIs.
- All stories must be peer-reviewed for security, maintainability, and regression risk.
- Any change to user-supplied data handling must not create new vectors for account enumeration, information disclosure, or session fixation.

---