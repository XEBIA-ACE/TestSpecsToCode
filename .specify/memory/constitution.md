# Constitution: Java 11 → 17 Upgrade

## Project Identity

**Name:** Java 11 to 17 Upgrade  
**Purpose:** Migrate all code and systems running Java 11 to Java 17.  
**High-level Goal:** Ensure the application stack operates on Java 17 to address medium-term upgrade urgency and minimize tech debt associated with end-of-life Java versions.

---

## Guiding Principles

1. **Prefer supported runtimes over legacy ones because of EOL risk.**
2. **Prefer minimizing disruption to existing functionality over introducing new features because the primary concern is compatibility during the upgrade.**
3. **Prefer automated testing over manual verification because Java runtime changes can introduce subtle regressions.**

---

## Constraints

- **Timeline and Effort Ceiling:**  
  N/A — not applicable to this task (Upgrade option person-day estimate not provided.)

- **Technology Mandates:**  
  - Target runtime: Java 17  
  - Source runtime (current state): Java 11  
  - All components must be upgraded to use Java 17 in non-development and production environments.

- **Cloud Provider:**  
  N/A — not applicable to this task.

- **Compliance Requirements:**  
  N/A — not applicable to this task.

- **Budget or Scope Freezes:**  
  N/A — not applicable to this task (upgrade option does not specify budget or scope caps).

---

## Quality Standards

- **Testing Coverage Floor:**  
  All critical user flows and system integration points impacted by the Java runtime must have automated regression tests in place.

- **Code-Review Requirements:**  
  All code or configuration changes required for Java 17 compatibility must be peer-reviewed (minimum: 1 reviewer not the author).

- **Documentation Must-Haves:**  
  Upgrade summary and required changes documented in project README or a dedicated UPGRADE.md.

- **Deployment Gates:**  
  Java 17 runtime must be present and validated in staging before release to production.

---

## Decision Log

| ID  | Decision                                  | Rationale                                           | Status   |
|-----|-------------------------------------------|-----------------------------------------------------|----------|
| 1   | Adopt Java 17 as new runtime (from 11)    | Addresses tech debt and reduces EOL risk            | Accepted |

---