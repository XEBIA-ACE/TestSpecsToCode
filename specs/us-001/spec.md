---
# Functional Specification: Sign in with a Connected SSO Account (US-001)

## Narrative & Scope

As a Shopping App user with a previously-linked Single Sign-On (SSO) account, I want to securely log in to my account using OAuth 2.0 (SSO button), and receive a Shopping App JWT and session, so that I can access my profile and purchasing features without entering my app-specific password.

This feature coexists with the legacy email/mobile + password login: both are available options. The system must validate the SSO provider token, verify user linkage, issue a session, and handle failures without exposing sensitive error details. SSO provider-specific configuration must be reused from the central authentication service.

## Acceptance Criteria

1. **SSO-Linked Sign-in, Success:**
   - GIVEN SSO is enabled and the user has a mapped SSO identity,
   - WHEN SSO login is selected and authentication with the external provider succeeds,
   - THEN the Shopping App must:
     - Accept the provider's OAuth 2.0 token,
     - Validate and link it to the internal user,
     - Issue a JWT session as per Shopping App token policy,
     - Redirect / respond with profile/home page.

2. **SSO-Linked Sign-in, Failure:**
   - GIVEN SSO is enabled,
   - WHEN authentication at the provider fails or is denied,
   - THEN respond with a generic error message ("Authentication failed. Please try again.") and do not indicate any field-specific or provider-specific detail.

3. **Legacy Login Compatibility:**
   - Legacy email/mobile + password logins must remain available and functional, with no UX or security regressions.

4. **Session Token Compliance:**
   - JWT issued must include all current app claims (user id, expiry, etc) and have session expiry/timing identical to non-SSO logins.

5. **JWT Validation on API Requests:**
   - After SSO sign-in, API endpoints must accept and validate the JWT as currently implemented for normal logins (until expiry).

## Out-of-Scope

- SSO account linking process (this feature assumes the user’s identity is already mapped from an onboarding or profile management flow).
- Sign-up/registration via SSO (only sign-in is in-scope).
- SSO provider choice/selector UI.
- Mobile app-specific implementation (web only for MVP).
- Migration of legacy accounts to SSO.

## Cross-Service Dependencies

- Requires valid configuration for external OAuth providers (Google, etc), stored in the centralized config mechanism.
- Shopping App JWT/session creation must use current signing keys, expiry durations, and claim structures defined by the app.
- User identity lookups are performed via existing user service/database logic.

---