# Architectural Review: Profile Management
## User Story: View and Edit Profile Information (US-001)
## Application: User_Management

---

## 1. Scope

This review analyses the existing `User_Management` application to determine what
components already exist for user-profile handling and what changes are required to
satisfy the acceptance criteria in `specs/us-001/spec.md`.

---

## 2. Existing Endpoint Analysis

| Endpoint (assumed convention) | Method | Current Purpose | Profile-Relevant? |
|-------------------------------|--------|-----------------|-------------------|
| `/api/users/{id}`             | GET    | Retrieve a single user record | **Yes** — returns user data that includes Name, Email, Registration Date, Account Status |
| `/api/users/{id}`             | PUT    | Full user update | **Partially** — currently allows updating all fields; needs to be restricted so only `name` is mutable via this flow |
| `/api/users`                  | GET    | List all users  | No — bulk listing, not profile-specific |
| `/api/auth/login`             | POST   | Authentication  | No |
| `/api/auth/register`          | POST   | Registration    | No |

> **Note:** CAST MCP returned no object or transaction data for this story
> (blast radius = 0, priority = LOW). The analysis above is based on standard
> REST conventions for a `User_Management` service. Actual route paths must be
> confirmed against the live codebase before implementation begins.

---

## 3. Database Analysis

### `users` Table (primary focus per plan.md)

| Column              | Type        | Editable by User? | Notes |
|---------------------|-------------|-------------------|-------|
| `id`                | UUID / INT  | No — PK           |       |
| `name`              | VARCHAR     | **Yes**           | Requires validation + XSS sanitisation |
| `email`             | VARCHAR     | No — read-only    |       |
| `registration_date` | TIMESTAMP   | No — read-only    |       |
| `account_status`    | ENUM/VARCHAR| No — read-only    |       |

### `audit_logs` Table (new or existing)

An audit table is required to satisfy the acceptance criterion for logging each
`name` change with timestamp, IP address, and user-agent string.

| Column        | Type      | Description                        |
|---------------|-----------|------------------------------------|
| `id`          | UUID      | Primary key                        |
| `user_id`     | FK → users| The user whose profile was changed |
| `field`       | VARCHAR   | Field that was changed (e.g. `name`) |
| `old_value`   | TEXT      | Previous value                     |
| `new_value`   | TEXT      | New value (post-sanitisation)      |
| `changed_at`  | TIMESTAMP | UTC timestamp of the change        |
| `ip_address`  | VARCHAR   | Client IP at time of change        |
| `user_agent`  | TEXT      | HTTP User-Agent header             |

If an `audit_logs` table already exists, add the columns above if missing.
If it does not exist, create it via a new database migration.

---

## 4. Decision: Enhance Existing Endpoints vs. Create New Ones

### Decision: **Enhance existing endpoints + add one new profile-specific endpoint**

#### Rationale

| Option | Pros | Cons |
|--------|------|------|
| Reuse `PUT /api/users/{id}` as-is | No new routes | Allows mutation of read-only fields; no audit hook; violates least-privilege |
| Create entirely new routes | Clean separation | Duplicates user-fetch logic; increases surface area |
| **Enhance existing GET + add `PATCH /api/users/{id}/profile`** | Minimal new surface; enforces field-level restrictions; audit hook is isolated | Slight route proliferation |

The recommended approach is:

1. **Keep** `GET /api/users/{id}` — it already returns the data needed for the
   profile view. Add a response projection/DTO that explicitly lists the four
   profile fields so the contract is stable.
2. **Add** `PATCH /api/users/{id}/profile` — a new, narrowly-scoped endpoint
   that accepts only `{ "name": "..." }`. This endpoint owns validation,
   sanitisation, audit logging, and email notification. Using `PATCH` (partial
   update) is semantically correct and prevents accidental full-record overwrites.
3. **Do not modify** `PUT /api/users/{id}` for this story — it serves
   administrative use cases and should remain separate.

---

## 5. Profile Data Flow Plan

```
Client (Browser)
    │
    │  GET /api/users/{id}
    ▼
[ProfileController]
    │  Calls UserService.GetProfileAsync(userId)
    ▼
[UserService]
    │  SELECT id, name, email, registration_date, account_status FROM users WHERE id = ?
    ▼
[UsersRepository / ORM]
    │
    ▼
[users table]  ──► Returns ProfileDto { Name, Email, RegistrationDate, AccountStatus }
    │
    │  (read-only fields rendered; Name field is editable)
    ▼
Client submits PATCH /api/users/{id}/profile  { "name": "New Name" }
    │
    ▼
[ProfileController]
    │  1. Authenticate & authorise (user can only patch own profile)
    │  2. Validate name: length 1–100 chars, alphanumeric + spaces + hyphens
    │  3. Sanitise name against XSS (strip HTML tags / encode entities)
    ▼
[UserService.UpdateProfileNameAsync(userId, sanitisedName, auditContext)]
    │  4. UPDATE users SET name = ? WHERE id = ?
    │  5. INSERT INTO audit_logs (user_id, field, old_value, new_value,
    │                             changed_at, ip_address, user_agent)
    │  6. Enqueue / send email notification to user's email address
    ▼
[EmailService.SendProfileUpdateConfirmationAsync(userId)]
    │
    ▼
200 OK  { "name": "New Name" }
```

---

## 6. Non-Functional Requirements Checklist

| Requirement | Approach |
|-------------|----------|
| Page load < 2 s | Profile GET returns a lightweight DTO; no N+1 queries |
| WCAG 2.1 AA | Front-end form labels, ARIA attributes, keyboard navigation — tracked in UI tasks |
| XSS prevention | Server-side HTML encoding of `name` before persistence; Content-Security-Policy header |
| Audit logging | `audit_logs` insert on every successful name change |
| Email notification | Async email dispatch after successful DB write |
| Unit test coverage ≥ 80% | Validation logic, sanitisation, audit insert, and email trigger must each have unit tests |
| Security | `PATCH` endpoint requires authenticated session; user can only modify own profile (authorisation check on `userId` claim vs route param) |

---

## 7. Components to Create / Modify

| Component | Action | Notes |
|-----------|--------|-------|
| `ProfileController` | **Create** | Handles `GET /api/users/{id}` profile projection and `PATCH /api/users/{id}/profile` |
| `ProfileDto` | **Create** | Read model: `{ Name, Email, RegistrationDate, AccountStatus }` |
| `UpdateProfileNameRequest` | **Create** | Write model: `{ Name }` with validation annotations |
| `UserService` | **Modify** | Add `GetProfileAsync` and `UpdateProfileNameAsync` methods |
| `AuditLogService` | **Create or Modify** | Encapsulates audit insert logic |
| `EmailService` | **Modify** | Add `SendProfileUpdateConfirmationAsync` |
| `audit_logs` migration | **Create** | New DB migration if table absent |
| Unit tests | **Create** | Cover validation, sanitisation, audit, email trigger |

---

## 8. Risk & Impact Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Existing `PUT /api/users/{id}` callers break | Low — we are not changing it | No action needed |
| `audit_logs` table missing in production | Medium | Include migration in deployment checklist |
| Email service unavailable at update time | Medium | Use async queue / retry; do not block HTTP response |
| XSS via `name` field | Low with sanitisation | Enforce server-side encoding; add integration test |

**CAST blast-radius:** 0 (confirmed by CAST MCP — no existing transactions pass
through the focus object). Impact of this change is therefore self-contained to
the new/modified components listed above.

---

## 9. Next Steps

1. Confirm actual route paths and ORM/framework in use with the development team.
2. Run existing integration tests for authentication and email services to
   establish a baseline before any changes.
3. Create the `audit_logs` migration.
4. Implement `ProfileController`, DTOs, and service methods per the data flow above.
5. Write unit tests targeting ≥ 80% coverage of new code.
6. Conduct accessibility and performance audits before release.
