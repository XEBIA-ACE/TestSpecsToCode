---
# Implementation Tasks: Sign in with a Connected SSO Account (US-001)

## Repository: XEBIA-ACE/TestSpecsToCode.git

### Backend

- [ ] add BACKEND/src/services/sso.service.ts: implement SSO service for provider token validation & user lookup
- [ ] update BACKEND/src/routes/auth.routes.ts: add POST /api/v1/auth/sso endpoint for SSO sign-in flow
- [ ] update BACKEND/src/config/auth.config.ts: add SSO provider (e.g., Google) client ID/secret/read SSO_ENABLED flag from env
- [ ] update BACKEND/src/app.ts: register new SSO route in express app, ensuring error handling is consistent with login
- [ ] add BACKEND/tests/integration/auth.sso.test.ts: test SSO sign-in (success/failure, JWT compliance, expiry/regression)
- [ ] update docs/ or README to document new SSO config/env vars

### Frontend

- [ ] update FRONTEND/src/app/App.tsx: add SSO sign-in button to login form and handle SSO auth flow/callback
- [ ] update FRONTEND/src/app/LoginPage.tsx (or equivalent): ensure SSO and email/mobile login coexist with proper UI states
- [ ] add/extend FRONTEND/src/app/__tests__/LoginPage.sso.test.tsx: test UI for SSO success, error, and regression of legacy login

---