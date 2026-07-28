# Resend OTP for Account Verification

| | |
|---|---|
| **ID** | US-006 |
| **Feature** | F-02 — OTP Verification |
| **Epic** | EP-001 — OTP Generation and Sending |
| **Status** | Draft |
| **Date** | 2026-07-28 |

## Background

Part of feature *OTP Verification*.

## Acceptance Criteria

### Story

- [ ] Given a user is on the verification screen, When they request a new OTP, Then the system processes the resend request
- [ ] Given a user requests a new OTP, When the new OTP is generated, Then any previously issued OTP for that user is invalidated
- [ ] Given a new OTP is generated, When the system processes the request, Then the OTP is sent via email following the standard delivery process
- [ ] Given a user requests a new OTP, When the delivery succeeds or fails, Then the user is informed of the outcome
- [ ] Given a user has made 5 resend requests within the last hour, When they attempt another resend, Then the request is rejected due to rate limiting
- [ ] Given any resend request is made, When the request is processed, Then the attempt is logged for auditing purposes

### Epic

- [ ] Given a user requests an OTP, when the request is valid, then the system generates and sends a unique OTP
- [ ] Given an OTP is sent, when it is entered by the user within 5 minutes, then the system should validate and authenticate the user
- [ ] Given an OTP request, when the OTP delivery fails, then the system retries up to 3 times
- [ ] Given a user requests an OTP, when the OTP exceed expiry time, then the system should reject the OTP with an error message

## Proposed Solution

### Functional Specification

## S-001

### Purpose

To facilitate users in resending an OTP to complete account verification through the User Management Service.

### Scope

This specification covers functionality for resending OTPs, including generating new OTPs, invalidating old ones, delivering OTPs, informing users of delivery outcomes, and audit logging within the User Management Service.

### Non-Goals

1. Implementing delivery mechanisms other than email
2. Handling user authentication 
3. Managing user session or login-related functionalities
4. Designing email content or templates
5. Verifying user identity beyond OTP
6. Handling non-OTP related notifications
7. Managing any OTP related to payments
8. Providing analytics on OTP usage
9. Allowing OTP resend through means other than the verification screen

### Key Entities

- **User**: (userId: String)
- **OTP**: (value: String, expiration: DateTime, status: String)
- **RequestLog**: (requestId: String, userId: String, timestamp: DateTime, action: String)

### Functional Requirements

- **FR-001**: User Management Service SHALL allow users to request a new OTP from the verification screen.
- **FR-002**: User Management Service MUST generate and send a new OTP via email when a request is made.
- **FR-003**: User Management Service MUST invalidate any previously issued OTP upon generation of a new OTP.
- **FR-004**: User Management Service SHALL inform users about the success or failure of the OTP email delivery.
- **FR-005**: User Management Service MUST reject OTP resend requests after five attempts in the last hour.
- **FR-006**: User Management Service SHALL log each OTP resend request for auditing purposes.

### Assumptions

- **A-001**: Users have provided a valid email address. (FR-002, FR-004)
- **A-002**: Email delivery processes comply with the standard delivery methods established. (FR-002, FR-004)
- **A-003**: All users requesting OTPs are authenticated users on the verification screen. (FR-001, FR-005)
- **A-004**: 5-resend limit is measured within a rolling one-hour window. (FR-005)

### Success Criteria

- **SC-001**: The ratio of successful OTP deliveries should be greater than 95%.
- **SC-002**: Rate limiting should reject at least 99% of requests exceeding the threshold.
- **SC-003**: 100% of attempts must be logged for audit purposes.

### Priority Levels

- **P1**: FR-001, FR-002, FR-003
- **P2**: FR-004, FR-005, FR-006
- **P3**: None identified

### Edge Cases

- **EC-001**: Given incorrect userId, When an OTP resend is requested, Then the request is rejected.
- **EC-002**: Given network failure during email delivery, When OTP is sent, Then the user is informed of the failure.
- **EC-003**: Given a user changes their email, When a new OTP is requested, Then it MUST be sent to the updated email.

### Independent Testability

Preconditions:
1. User exists and email is valid
2. User is on the verification screen
3. Previous OTP expired

User Action:
- User requests a new OTP

Observable Outcome:
- User receives OTP via email successfully

### Separation of Concerns

This specification defines capabilities and does not detail underlying implementations like HTTP codes or dataframe structures. Error conditions are described by user outcomes. Integration with external systems is noted, without specific product details.

### Technical Design

## S-001

### Contracts & Interfaces

1. **Endpoint Changes**  
   - **Method**: POST  
   - **Path**: `/users/{userId}/otp/resend`  
   - **Description**: This endpoint SHALL handle requests to resend OTPs.  
   - **Request Payload**: Empty. The userId SHALL be fetched from the path.
   - **Response Codes**: 
     - `200 OK`: OTP sent successfully.
     - `400 Bad Request`: Exceeded resend attempts or invalid/missing parameters.
     - `500 Internal Server Error`: General failure in OTP generation or sending.
   - **Response Payload**: 
     - On success: `{ "message": "OTP sent successfully" }`
     - On failure: `{ "error": "Detailed error message" }`

2. **Data Model Changes**
   - **User** Table  
     - No changes required.
   - **OTP** Table  
     - Columns: `value: VARCHAR(6), expiration: TIMESTAMP, status: ENUM('ACTIVE', 'INACTIVE')`
     - Add index on `(userId, status)` for quick invalidation queries.
   - **RequestLog** Table  
     - Columns: `requestId: UUID, userId: UUID, timestamp: TIMESTAMP, action: VARCHAR(50)`
     - The action column SHALL include 'OTP_RESEND'.

### Test Strategy

1. **Test Case: Valid Resend Request**  
   - **Objective**: Validate FR-001, FR-002.  
   - **Setup**: User exists, OTPs previously expired.  
   - **Execution**: Call `/users/{userId}/otp/resend`.  
   - **Validation**: Response is `200 OK`, OTP entry has `status = 'ACTIVE'`.

2. **Test Case: Invalid Request Exceeding Limit**  
   - **Objective**: Validate FR-005.  
   - **Setup**: User has made 5 resend requests within the last hour.  
   - **Execution**: Call `/users/{userId}/otp/resend`.  
   - **Validation**: Response is `400 Bad Request`, error message states limit exceeded.

3. **Test Case: OTP Email Delivery Failure**  
   - **Objective**: Validate FR-004.  
   - **Setup**: Simulate email service downtime.  
   - **Execution**: Call `/users/{userId}/otp/resend`.  
   - **Validation**: Response contains appropriate error message about delivery failure.

4. **Test Case: Audit Logging**  
   - **Objective**: Validate FR-006.  
   - **Setup**: Prepare database audit trail.  
   - **Execution**: Call `/users/{userId}/otp/resend`.  
   - **Validation**: Verify `RequestLog` contains new 'OTP_RESEND' record.

### Implementation Approach

1. **Core Implementation Logic**
   - **ResendOtpService** Class
     - **Method**: `resendOtp(String userId)`
     - Invalidate existing OTP: Update OTP table, set `status = 'INACTIVE'` where `userId` is the target.
     - Generate new OTP: Create a new entry in OTP table with `status = 'ACTIVE'`.
     - Rate limiting check: Review RequestLog for past hour OTP_RESEND entries.
     - Utilize `EmailService` to send OTP to user's email.
     - On success or failure, update the RequestLog table.

2. **Inter-service Calls**
   - **EmailService**: Asynchronous call pattern using retry mechanism for handling temporary email sending failures.

3. **Testing Approach**
   - Unit tests SHALL mock `Database` and `EmailService` responses.
   - Integration tests SHALL deploy the service in an isolated test environment with a mock email server to simulate delivery conditions.

### Architectural Decision Records

1. **ADR-001**: Use Asynchronous Email Delivery
   - **Context**: Email delivery must handle network delays and ensure high availability.
   - **Decision**: Adopt asynchronous email sending with retries.
   - **Rationale**: Increases resilience against temporary network issues.
   - **Alternative Considered**: Synchronous email sending; rejected due to potential blocking delays.

2. **ADR-002**: Centralized Rate Limiting Mechanism
   - **Context**: Prevent abuse by users repeatedly resending OTPs.
   - **Decision**: Implement rate limiting using the existing database audit log.
   - **Rationale**: Simple integration with existing logging infrastructure.
   - **Alternative Considered**: Third-party rate limiter service; rejected due to unnecessary complexity and cost.

### Simplicity Gate Assessment
- **Appropriate**: All technical elements map directly to specific functional requirements. Each API method and database operation is traceable to single or multiple functional criteria (e.g., rate limiting logic directly supports FR-005).

## Affected Services

- `S-001`

## API Changes

| Service | Endpoint | Method | Change |
|---------|----------|--------|--------|
| `S-001` | `/users/{userId}/otp/resend` | POST | modify |
| `S-001` | `/otp/audit` | GET | modify |

## Open Questions / Gaps

_No gaps identified._