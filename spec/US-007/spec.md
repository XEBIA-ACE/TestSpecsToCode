# Request Account Deletion

| | |
|---|---|
| **ID** | US-007 |
| **Feature** | F-04 — Delete User Account |
| **Epic** | EP-002 — Account Deletion Data Handling and Privacy Compliance |
| **Status** | Draft |
| **Date** | 2026-07-15 |

## Background

Part of feature *Delete User Account*.

## Acceptance Criteria

### Story

- [ ] Given an authenticated user is on their account dashboard, When they initiate an account deletion request, Then the system displays a confirmation prompt warning that deletion is irreversible
- [ ] Given the user has initiated a deletion request and sees the confirmation prompt, When they confirm the deletion, Then all user personal data (name, email, account records) is permanently removed from the PostgreSQL database
- [ ] Given the user's data has been successfully deleted, When the deletion process completes, Then the user receives a confirmation message that their account and data have been deleted
- [ ] Given a user's account has been deleted, When the former user attempts to authenticate, Then the system denies access and the user cannot access the system
- [ ] Given an account deletion has been completed, When the deletion process finishes, Then an audit log entry is created capturing the deletion timestamp, anonymized reference, and completion status

### Epic

- [ ] Given a user requests account deletion, then all their personal data is removed from the system
- [ ] Given a user account is deleted, then all third-party services are notified within 24 hours
- [ ] Given an audit, then the system provides a complete log of all data deletion activities

## Proposed Solution

### Functional Specification

## S-001

### Purpose
This specification details the functionality required for the User Management Service to allow users to request and confirm account deletion, ensuring compliance with GDPR/CCPA rights.

### Scope
This spec covers the deletion of user accounts within the User Management Service, including user-initiated requests, deletion confirmation, data removal, audit logging, and handling login attempts post-deletion.

### Non-Goals
1. Modify unrelated user data.
2. Handle external notifications post-deletion.
3. Provide data backup functionalities before deletion.
4. Retain user data for recovery purposes.
5. Implement any authentication service changes.
6. Change data privacy policies.
7. Integration with external compliance tracking services.
8. Alter database infrastructure.
9. Implementing archival solutions.
10. Adjust non-deletion user account functionalities.

### Key Entities
- **UserAccount**: Attributes - `userId` (String), `name` (String), `email` (String), `isDeleted` (Boolean)
- **AuditLog**: Attributes - `logId` (String), `userRef` (String), `timestamp` (DateTime), `status` (String)

### Functional Requirements
- FR-001: The system SHALL display a confirmation prompt warning the user that account deletion is irreversible.
- FR-002: The system MUST delete all user personal data when a deletion request is confirmed.
- FR-003: The system MUST display a confirmation message once the account and data are deleted.
- FR-004: The system SHALL deny login attempts from a deleted account.
- FR-005: The system MUST create an audit log entry after account deletion capturing necessary details.

### Assumptions Propagation
- A-001: User MUST be authenticated before initiating a deletion request. (FR-001, FR-002)
- A-002: Data deletion applies only to the PostgreSQL database. (FR-002)
- A-003: Anonymized reference used in audit logs does not breach privacy standards. (FR-005)

### Success Criteria
- SC-001: Successful deletion confirmation prompts occur in 99% of requests.
- SC-002: User data is removed within one hour following confirmation, 95% of the time.
- SC-003: Audit logs are captured for 100% of completed deletions.

### Priority Levels
- P1: Acceptance Criterion 1 and 3 (FR-001, FR-003)
- P2: Acceptance Criterion 2 and 4 (FR-002, FR-004)
- P3: Acceptance Criterion 5 (FR-005)

### Edge Cases
- EC-001: Given a network failure, When the user confirms deletion, Then the system SHOULD retry deletion up to three times before failing.
- EC-002: Given a database is inaccessible, When attempting deletion, Then the system MUST log the error and notify the user.
- EC-003: Given a user initiates deletion without confirmation, When they logout, Then the request SHOULD NOT proceed further.

### Independent Testability
Minimum viable test scenario: 
- Preconditions: User is authenticated, available internet connection.
- User Action: Initiate and confirm account deletion.
- Observable Outcome: User is logged out and receives a deletion confirmation email.

### Technical Design

## S-001

## Contracts & Interfaces

### API Changes

**Endpoint Addition:**
- POST `/user/deleteRequest`: Initiates account deletion. Request body SHALL include token verifying user identity. Response MUST include deletion prompt confirmation message.
- POST `/user/confirmDeletion`: Confirms account deletion. Request body SHALL include token and user confirmation. Responds with deletion confirmation message and logs the user out.

**Endpoint Updates:**
- The existing POST `/user/login` endpoint logic SHALL be updated to check user account's `isDeleted` status. If `true`, response code 403 Forbidden SHALL be returned with an error message.

### Data Model Changes

**UserAccount Table:**
- Columns:
  - `userId` (Primary Key)
  - `name`
  - `email`
  - `isDeleted` (Boolean, default: `false`)

**AuditLog Table:**
- Columns:
  - `logId` (Primary Key)
  - `userRef` (Foreign Key to UserAccount.userId)
  - `timestamp` (auto-generated upon entry creation)
  - `status`
  - Add index: `userRef`, `timestamp`

## Test Strategy

### Test Cases

- **Test Case 1:** Verify API contract for `POST /user/deleteRequest`.
  - Validate error response on missing or invalid token.
  - Validate success response with a deletion prompt confirmation.

- **Test Case 2:** Verify processing of the `POST /user/confirmDeletion`.
  - Validate error response on missing/incomplete user confirmation.
  - Validate success response with a confirmation message and ensure logout.

- **Test Case 3:** Confirm the `isDeleted` check during login attempts.
  - Ensure deleted users receive a 403 Forbidden response.

- **Test Case 4:** Validate data removal utility for cascading deletes.
  - Ensure user data is no longer accessible within one hour post-confirmation.

- **Test Case 5:** Confirm audit logging correctness upon each deletion action.
  - Validate that log entries contain all necessary data and conform to the schema.

- **Test Case 6:** Handling of network failures with retries.
  - Validate system retries deletion requests up to three times on failure.

## Implementation Approach

### Core Implementation Logic

- **Class**: `UserDeletionService`
  - **Method**: `initiateDeletionRequest(User user)` MAY trigger notification for extra security verification.
  - **Method**: `confirmDeletion(String token, boolean userConfirmed)` SHALL:
    - Validate and decode token.
    - Set `isDeleted` = `true` in `UserAccount`.
    - Trigger `removeUserData(String userId)` for data removal.
    - Record audit log in `AuditLog` table.
  
- **Class**: `LoginService`
  - **Method**: `authenticate(User user)` SHALL include `isDeleted` check.
  
- **Class**: `AuditLoggingService`
  - **Method**: `logDeletion(String userId, Timestamp timestamp, String status)`: records user deletion in `AuditLog`.

### Inter-Service Calls

- **Asynchronous Messaging**: Implement message queue (e.g., Kafka) to handle failure retries for deletion processing.

## Architectural Decision Records (ADRs)

- **ADR-001: Use Asynchronous Messaging for Retry Mechanism**
  - **Context**: Ensure robustness against intermittent network failures.
  - **Decision**: Implement a delay and retry mechanism using Kafka.
  - **Rationale**: Simplifies handling of transient issues.
  - **Alternatives**: Direct attempt without retry (rejected due to lack of resiliency).

- **ADR-002: Audit Logging in Same Database**
  - **Context**: Log user deletions.
  - **Decision**: Store audit logs in the same PostgreSQL instance.
  - **Rationale**: Simplifies querying and correlating logs with user data.
  - **Alternatives**: Separate logging service (rejected due to unnecessary complexity).

## Simplicity Gate Assessment

- **Appropriate**: All technical elements map directly to functional requirements.
- No over-engineering detected as every decision supports compliance and operational requirements.

## Affected Services and API Changes

- **Service Affected**: User Management Service
- **API Endpoints Changed**:
  - `POST /user/login` (Addition of `isDeleted` check)
- **New Endpoints**:
  - `POST /user/deleteRequest`
  - `POST /user/confirmDeletion`

The design succinctly ties back to functional specs ensuring comprehensive coverage and regulatory compliance.

## Affected Services

- `S-001`

## API Changes

| Service | Endpoint | Method | Change |
|---------|----------|--------|--------|
| `S-001` | `/users/{id}/delete` | POST | new |

## Open Questions / Gaps

_No gaps identified._