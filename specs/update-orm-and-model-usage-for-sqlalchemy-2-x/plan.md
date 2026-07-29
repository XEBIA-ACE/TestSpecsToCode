# PLAN: Update ORM and Model Usage for SQLAlchemy 2.x

## Overview

**Migration Strategy:**  
Strangler-fig pattern is recommended for updating ORM and model usage to SQLAlchemy 2.x. This approach allows incremental migration of models and queries, minimizing risk of regressions by running legacy and updated components side by side. Given the "medium" upgrade urgency and a moderate effort estimate, this strategy balances low risk with steady progress, reduces outage windows, and supports easier rollback if issues are detected.

## Phases

| Phase           | Description                                                      | Dependencies         | Estimated Effort    |
|-----------------|------------------------------------------------------------------|----------------------|---------------------|
| Analysis        | Audit model and ORM usage to identify all SQLAlchemy integration | None                 | 3 person-days       |
| Model Refactor  | Incrementally refactor models and major queries for 2.x API      | Analysis complete    | 6 person-days       |
| Query Upgrades  | Migrate all query usage to 2.x style                             | Model Refactor       | 5 person-days       |
| API Adaptation  | Update any ORM-dependent APIs for compatibility                  | Query Upgrades       | 3 person-days       |
| Final Cutover   | Remove legacy usage and finalize migration                       | All prior phases     | 2 person-days       |

**Total Effort:** 19 person-days (derived from "moderate" upgrade option)

## Component Changes

- **Models:**  
  - Refactor model classes to use SQLAlchemy 2.x style (e.g., explicit typing, declarative base changes).  
  - Affected files: All files defining models, typically in `models.py`, `database/models.py`, or similar locations.
  - Update references to `declarative_base()`, Table and Column definitions per 2.x recommendations.

- **ORM Usage:**  
  - Update all session/query usage to the 2.x API, replacing deprecated and legacy patterns.
  - Affected files: Code interacting with data access; often includes `repository.py`, `services/orm.py`, or similar.

- **APIs:**  
  - Update controller or API-layer function signatures/implementations that depend on updated ORM calls.
  - Affected files: All endpoints or services using the affected models or queries directly.

## Dependency Upgrade Plan

| Dependency                 | Current Version | Target Version | Breaking Changes                                             | Migration Notes                                  |
|----------------------------|----------------|----------------|-------------------------------------------------------------|--------------------------------------------------|
| **SQLAlchemy**             | (not specified) | 2.x           | Significant ORM API changes, deprecated patterns removed     | Refactor all model, session, and query code.     |

*(All version numbers are placeholders since the tech analysis did not specify current version; follow actual version records during implementation.)*

## Infrastructure Changes

N/A — not applicable to this task

## Rollback Strategy

- **Per Phase:**
    - *Analysis:* No changes performed; rollback not needed.
    - *Model Refactor:* Restore model files from version control to pre-refactor state if errors found.
    - *Query Upgrades:* Revert updated query files to last known-good commit.
    - *API Adaptation:* Roll back controller/service files to pre-modified state.
    - *Final Cutover:* Re-add legacy compatibility code if post-cutover problems arise.

- **General:**  
  Each phase is independently reversible via version control (git), ensuring previous patterns can be restored without impacting other components.

## Testing Strategy

- **Unit Tests:**
  - Add/expand unit tests covering model instantiation, serialization, and field access.
  - Tool: pytest (or stack default)
  - Coverage: ≥85% on model and query layers
- **Integration Tests:**
  - Validate ORM queries and session logic with a test database.
  - Ensure compatibility with API endpoints making database changes.
- **Regression Tests:**
  - Run full regression suite to catch unintended behavior changes in business logic.
- **Performance Tests:**
  - Compare pre-/post-migration CRUD operation timings to check for regressions.
- **CI Gates:**
  - Block merges if unit/integration tests fail or coverage drops below target.

## Timeline

| Milestone        | Phase             | Estimated Completion | Owner      |
|------------------|-------------------|---------------------|------------|
| Audit Complete   | Analysis          | Day 3               | TODO       |
| Models Updated   | Model Refactor    | Day 9               | TODO       |
| Queries Migrated | Query Upgrades    | Day 14              | TODO       |
| APIs Adapted     | API Adaptation    | Day 17              | TODO       |
| Cutover Finalized| Final Cutover     | Day 19              | TODO       |

---

*Only items directly relevant to the described ORM/SQLAlchemy 2.x migration are included. All other concerns marked as not applicable per instructions.*