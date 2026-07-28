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