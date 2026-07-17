# Functional Specification — US-001: View Account Information from Dashboard

> **Implementation note (2026-07-17)**: this requirement is satisfied by extending
> `BACKEND`'s existing `GET /api/v1/users/me` endpoint (session-token auth,
> `better-sqlite3`) rather than the separate `GET /api/v1/users/me/account`
> (JWT + PostgreSQL) endpoint originally prototyped in the standalone `app/`
> service below. `BACKEND`'s response already carries the same profile fields
> the FRONTEND dashboard consumes; audit logging (`ACCOUNT_INFO_VIEW`) and
> no-cache headers were added to that endpoint instead of standing up a
> second, near-duplicate route. The `app/` service and the API contract/task
> list below are kept as the original design record but are not the shipped
> implementation.

## User Story Narrative

**As an** authenticated user  
**I want to** view my account information from the dashboard  
**So that** I can verify my personal details and account status are correct

## Overview

This feature enables authenticated users to access a dedicated account information page from their dashboard. The page displays core profile data in a read-only format, ensuring users can review but not modify their information through this interface. Every access to this page generates an audit trail for compliance and security monitoring.

## Functional Requirements

### FR-1: Dashboard Navigation Link
- The user dashboard must display a clearly labeled link/button to access account information
- The link must be keyboard accessible and have appropriate ARIA labels
- Link text: "Account Information" or equivalent descriptive text

### FR-2: Session Validation
- Before displaying any account data, the system must validate the user's session
- Valid session: proceed to load account information
- Expired/invalid session: redirect user to login page with a re-authentication prompt
- Session validation must occur server-side via JWT verification

### FR-3: Account Information Display
The page must display the following fields in read-only format:

| Field | Description | Format |
|-------|-------------|--------|
| Name | User's full name (firstName + lastName) | Text |
| Email | User's registered email address | Text |
| Registration Date | Date the account was created | Localized date format |
| Account Status | Current verification status | "Verified" or "Pending Verification" |

### FR-4: Performance Requirement
- The account information page must load and display data within 1 second of the user clicking the navigation link
- This includes network round-trip, server processing, and client rendering

### FR-5: Audit Logging
- Each successful page access must create an audit log entry containing:
  - Timestamp (ISO 8601 format)
  - User ID (UUID)
  - Action type: "ACCOUNT_INFO_VIEW"
  - Client IP address (optional, if available)
- Audit logging must not block the response to the user

### FR-6: HTTPS Requirement
- All data transmission between client and server must occur over HTTPS
- The API endpoint must reject non-HTTPS requests in production

## Acceptance Criteria

1. **AC-1**: Given an authenticated user on the dashboard, when they click the account information link, then the account information page displays within 1 second

2. **AC-2**: Given the account information page loads, then it displays Name, Email, Registration Date, and Account Status in read-only format

3. **AC-3**: Given the page loads successfully, then an audit log entry is created containing timestamp and user ID

4. **AC-4**: Given a user with an expired session attempts to access the page, then they are prompted to re-authenticate

5. **AC-5**: Given the account information page, then it meets WCAG 2.1 Level AA compliance including proper contrast, keyboard navigation, and screen reader support

6. **AC-6**: Given any data transmission, then it occurs exclusively over HTTPS

## Out of Scope

- Editing or updating account information (separate story)
- Password change functionality
- Account deletion from this page
- Profile picture or avatar display
- Two-factor authentication settings
- Notification preferences
- Linked accounts or social login management
- Account activity history beyond the current audit log entry

## Cross-Service Dependencies

| Dependency | Type | Description |
|------------|------|-------------|
| User Management Service | Internal | Source of user profile data via `userService.getUserById()` |
| PostgreSQL Database | Infrastructure | Users table for profile data storage |
| Authentication Middleware | Internal | JWT validation for session verification |
| Audit Log Service | Internal (New) | Audit log persistence (may use existing logger or new table) |

## Error Handling

| Scenario | Expected Behavior |
|----------|-------------------|
| Invalid/expired JWT | Return 401 Unauthorized, redirect to login |
| User not found (edge case) | Return 404 Not Found with generic message |
| Database unavailable | Return 503 Service Unavailable |
| Internal server error | Return 500 with logged details, generic user message |

## API Contract

**Endpoint**: `GET /api/v1/users/me/account`

**Headers**:
- `Authorization: Bearer <JWT>` (required)

**Success Response** (200 OK):
```json
{
  "data": {
    "name": "Alice Smith",
    "email": "alice@example.com",
    "registrationDate": "2024-01-15T10:30:00Z",
    "accountStatus": "Verified"
  }
}
```

**Error Responses**:
- 401 Unauthorized: `{"error": "Session expired. Please log in again."}`
- 404 Not Found: `{"error": "Account not found"}`
- 500 Internal Server Error: `{"error": "An unexpected error occurred"}`