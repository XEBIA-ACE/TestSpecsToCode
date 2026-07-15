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