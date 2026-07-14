# Submit OTP to Complete Login

| | |
|---|---|
| **ID** | US-010 |
| **Feature** | F-02 — OTP Verification |
| **Epic** | EP-002 — OTP Input and Verification |
| **Status** | Draft |
| **Date** | 2026-07-14 |

## Background

Part of feature *OTP Verification*.

## Acceptance Criteria

### Story

- [ ] Given a compliance officer is authenticated and authorized, When they request a deletion compliance report, Then they can specify a date range for the report
- [ ] Given a compliance report has been generated, When the officer views the report, Then it includes total deletions, successful completions, and any failures
- [ ] Given a compliance report has been generated, When the officer views the report, Then it shows third-party notification compliance rate against the 24-hour SLA
- [ ] Given a compliance officer needs the report for auditor review, When they request an export, Then the report can be generated in an exportable format
- [ ] Given a compliance report has been generated, When the officer views the report, Then it includes summary statistics and a detailed breakdown
- [ ] Given a compliance officer generates a report, When the report generation completes, Then the action is logged in the audit trail

### Epic

- [ ] Given a user requests account deletion, then all their personal data is removed from the system
- [ ] Given a user account is deleted, then all third-party services are notified within 24 hours
- [ ] Given an audit, then the system provides a complete log of all data deletion activities

## Proposed Solution

### Functional Specification

## S-001

### Purpose
This specification details the features required for the User Management Service to generate and manage compliance reports related to account deletions and third-party notifications for audit preparation and regulatory monitoring.

### Scope
This specification focuses on the capabilities required within the User Management Service to generate, view, and export compliance reports for account deletion activities.

### Non-Goals
1. Implementation of user authentication processes.
2. Design of UI components for report interaction.
3. Backend infrastructure decisions for data storage.
4. API endpoint design and implementation.
5. Management of compliance obligations outside deletion activities.

### Key Entities
- **ComplianceReport**: Attributes include `reportId` (string), `dateRange` (date), `totalDeletions` (integer), `successfulCompletions` (integer), `failures` (integer), `notificationComplianceRate` (float), `summaryStatistics` (string).
- **ComplianceOfficer**: Attributes include `userId` (string), `role` (string), related to ComplianceReport (one-to-many).

### Functional Requirements
- **FR-001**: User Management Service SHALL allow compliance officers to specify a date range when requesting a compliance report.
- **FR-002**: User Management Service MUST generate a report that includes total deletions, successful completions, and failures.
- **FR-003**: User Management Service SHALL present notification compliance rates against a 24-hour SLA in the report.
- **FR-004**: User Management Service MUST allow exports of compliance reports into an exportable format for auditor review.
- **FR-005**: User Management Service SHALL provide both summary statistics and a detailed breakdown in generated reports.
- **FR-006**: User Management Service MUST log the completion of report generation into the audit trail.

### Assumptions Propagation
- **A-001**: Compliance Officer is authenticated and authorized before requesting reports. (FR-001, FR-006)
- **A-002**: Analytics data required for reports is accessible and up-to-date. (FR-002, FR-003, FR-005)
- **A-003**: Exportable format implies compatibility with common reporting standards (CSV, PDF). (FR-004)

### Success Criteria
- **SC-001**: Percentage of compliance reports including correct data equals 100%.
- **SC-002**: Compliance reports generated with correct data within the specified date range equals 100%.
- **SC-003**: Reporting of notification compliance rate greater than 95% accuracy.

### Priority Levels
- **P1**: FR-001, FR-002, FR-005
- **P2**: FR-003, FR-004, FR-006

### Edge Cases
- **EC-001**: Given invalid date range, When a report is requested, Then notify user of input error.
- **EC-002**: Given a large data set, When generating report, Then ensure performance does not degrade significantly.
- **EC-003**: Given incomplete data, When generating report, Then highlight missing sections.

### Independent Testability
- **Preconditions**: Valid user is authenticated; Compliance data is available; Report generation functionality is active.
- **User Action**: Request report generation with valid date range.
- **Outcome**: Valid report includes required data and is logged successfully.

### Separation of Concerns
Behavior descriptions focus on what the system accomplishes through its features, prioritizing user benefits and compliance monitoring needs, whilst separating technical implementations like API specifics. This specification outlines capabilities pertinent to the User Management Service, allowing effective testing and integration into compliance workflows.

### Technical Design

## S-001

### Contracts & Interfaces

#### API Contract
- **New Endpoint**: `GET /api/v1/compliance/reports`
  - **Parameters**:
    - `startDate` (required): Must be a date string in `YYYY-MM-DD` format
    - `endDate` (required): Must be a date string in `YYYY-MM-DD` format
  - **Response**:
    - `200 OK`: Returns JSON object containing compliance report
    - `400 Bad Request`: Returned if date range is invalid
    - `500 Internal Server Error`: Returned if an unexpected error occurs

#### Data Model Changes
- **New Table**: `ComplianceReport`
  - `reportId`: `VARCHAR(36)` primary key
  - `dateRange`: `DATE[]`
  - `totalDeletions`: `INTEGER`
  - `successfulCompletions`: `INTEGER`
  - `failures`: `INTEGER`
  - `notificationComplianceRate`: `FLOAT`
  - `summaryStatistics`: `TEXT`
  - Index: Composite index on `dateRange`

- **Updated Table**: `AuditTrail`
  - Add column `actionType`: `VARCHAR(50)`, indexed

### Test Strategy
#### Test Cases
1. **Report Generation Validity**
   - Validate correct report data for a valid date range (`startDate`, `endDate`).
   - Expected outcome: `response.totalDeletions > 0`

2. **Invalid Date Range Handling**
   - Submit request with `endDate` prior to `startDate`.
   - Expected outcome: `400 Bad Request`

3. **Export Functionality**
   - Ensure reports can be exported to CSV and PDF.
   - Expected outcome: File content matches report data.

4. **Performance for Large Data Sets**
   - Validate performance does not degrade for large datasets.
   - Expected outcome: Report generation time < 500ms

5. **Audit Logging**
   - Confirm report generation logs are created in the `AuditTrail`.
   - Expected outcome: New entry with `actionType` = "ReportGenerated"

### Implementation Approach

#### Core Implementation Logic
- **Class**: `ComplianceReportService`
  - **Method**: `generateReport(startDate, endDate)`
    - **Algorithm**:
      1. Validate date range
      2. Aggregate data from deletion logs
      3. Calculate `notificationComplianceRate`
      4. Populate `ComplianceReport` object and save to the database
      5. Log action in `AuditTrail`

- **Class**: `ReportExporter`
  - **Method**: `exportToFormat(reportId, format)`
    - Supports CSV and PDF file generation for compliance audits

#### Inter-Service Calls
- Utilize **async REST requests** to fetch data from `DeletionLogService` and `NotificationService` for accurate real-time report generation.

### Architectural Decision Records (ADRs)
- **ADR-001**: Title: Use of Composite Index for Date Range Queries
  - **Context**: Improve lookup efficiency for report generation.
  - **Decision**: Implement composite index on `dateRange`.
  - **Rationale**: Faster retrieval for reports spanning specific date ranges.
  - **Alternative**: Simple index on start date, but rejected due to inefficiencies.

- **ADR-002**: Title: Report Export Formats
  - **Context**: Need for standardized compliance report export.
  - **Decision**: Support CSV and PDF for export.
  - **Rationale**: Industry-standard formats; wide acceptance.
  - **Alternative**: JSON export, rejected due to lower audit-readiness.

### Simplicity Gate Assessment
- **Assessment**: `appropriate`
  - All technical elements correspond directly to functional requirements, serving clear audit and compliance objectives.

### Affected Services and API Changes
- **Affected Service**: User Management Service
- **API Change**:
  - Introduced `GET /api/v1/compliance/reports` for report generation and export.

## Affected Services

- `S-001`

## API Changes

| Service | Endpoint | Method | Change |
|---------|----------|--------|--------|
| `S-001` | `/api/v1/reports/deletion-compliance` | POST | new |
| `S-001` | `/api/v1/reports/deletion-compliance` | GET | new |

## Open Questions / Gaps

_No gaps identified._