# Constitution: SQLAlchemy 1.3 to 2.0.29 Upgrade

## Project Identity

**Name:** SQLAlchemy Modernization Project  
**Purpose:** Update the application's ORM layer by upgrading SQLAlchemy from version 1.3 to 2.0.29.  
**High-Level Goal:** Ensure continued maintainability, support, and access to recent SQLAlchemy features and fixes, while reducing risk linked to legacy library usage.

## Guiding Principles

1. **Prefer compatibility with SQLAlchemy 2.0 syntax and APIs over legacy patterns because version 1.3 is no longer maintained and poses tech debt.**
2. **Prefer minimal breaking changes in application code over aggressive refactoring because the upgrade urgency is only medium and deeper refactoring is out of scope.**
3. **Prefer timely upgrade execution over exhaustive unrelated improvements because the project's goal is strictly the SQLAlchemy upgrade.**
4. **Prefer addressing deprecation warnings early over deferring corrections because this prevents latent runtime errors post-upgrade.**

## Constraints

- **Timeline and Effort Ceiling:**  
  Must not exceed the "moderate" estimate indicated in the upgrade option. (Exact person-days: TODO)
- **Technology Mandates:**  
  - Must upgrade only SQLAlchemy from 1.3 to 2.0.29.  
  - Language, runtime, and build tool constraints: TODO — unknown.
- **Budget or Scope Freezes:**  
  - Out of scope: Any technology or feature upgrades not necessary for the SQLAlchemy transition.
  - No changes to unrelated frameworks, libraries, runtimes, or cloud providers.

## Quality Standards

- **Testing Coverage Floor:**  
  All critical code paths using SQLAlchemy must have test coverage. (Threshold: 80% of ORM interaction logic—subject to existing test base. TODO: confirm with codebase.)
- **Code Review Requirements:**  
  At least one reviewer with SQLAlchemy upgrade experience must approve all changes.
- **Documentation Must-Haves:**  
  Migration notes and updated developer instructions covering incompatibilities and required code pattern updates.
- **Deployment Gates:**  
  Upgrade must pass all current CI workflows, including all unit, integration, and (if present) regression tests.

## Decision Log

| ID     | Decision                                         | Rationale                                         | Status     |
|--------|--------------------------------------------------|---------------------------------------------------|------------|
| ADR-01 | Target SQLAlchemy 2.0.29 specifically            | Maintenance, security, and support concerns        | accepted   |
| ADR-02 | Scope freeze on non-SQLAlchemy dependencies      | Avoid cost and risk from unnecessary upgrades      | accepted   |
| ADR-03 | Timeline set as "moderate" per option estimate   | Fit upgrade within resource and risk constraints   | accepted   |
| ADR-04 | Testing focus on ORM interaction code paths      | Lower likelihood of regression in data layer       | accepted   |