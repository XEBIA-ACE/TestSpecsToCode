# PLAN: SQLAlchemy Upgrade from 1.3 to 2.0.29

## Overview

**Migration Strategy:**  
_Strangler-fig pattern_ will be used for this upgrade.

**Justification:**  
- **Risk:** Medium (as per upgrade option).
- **Effort Estimate:** Moderate (details not provided; assumed moderate person-days).
- SQLAlchemy 2.x introduces significant breaking changes compared to 1.3, especially in API and ORM usage. A big-bang migration would have high risk of undetected regressions and extensive downtime.  
- The strangler-fig approach allows incremental isolation and refactoring of database-related code, promoting safer rollout and easier rollback.  
- Parallel running is not feasible due to database state coupling; feature-flag gating does not add value for core ORM upgrades.

---

## Phases

| Phase         | Description                                           | Dependencies                  | Estimated Effort        |
|---------------|------------------------------------------------------|-------------------------------|------------------------|
| Phase 1       | Update dependencies and pin SQLAlchemy to 2.0.29     | None                          | 10% (moderate effort)  |
| Phase 2       | Identify and refactor incompatible queries/models     | Phase 1                       | 50% (moderate effort)  |
| Phase 3       | Update session/connection patterns as per 2.x API    | Phase 2                       | 20% (moderate effort)  |
| Phase 4       | Integration & regression testing; clean-up           | Phase 3                       | 15% (moderate effort)  |
| Phase 5       | Production rollout and monitoring                    | Phase 4                       | 5% (moderate effort)   |

_Total Person-days: moderate (align with upgrade option; break down by ratio above)._

---

## Component Changes

### ORM Models and Query Logic

- **Files Affected:** All files importing or referencing `sqlalchemy`, e.g.: `models.py`, `db_utils.py`, `repository/*.py`
- **Structural Changes:**  
  - Refactor import statements:  
    - (`from sqlalchemy.ext.declarative import declarative_base` → `from sqlalchemy.orm import declarative_base`)
  - `Query` patterns refactored for SQLAlchemy 2.0 style:
    - Replace legacy query API (`session.query(Model)`) with 2.0 style (`select(Model)`, `session.execute()`).
    - Update all filter, join, and relationship syntax to explicit expressions.
  - Update deprecated or removed ORM configurations.
- **API Changes:**  
  - Update all session creation to use `Session(engine)` as per 2.x.
  - Replace `session.commit()` patterns if transactional semantics differ.

### Session and Engine Management

- **Files Affected:** Eg: `app.py`, `database.py`, `db_session.py`
- **Structural Changes:**
  - Update engine creation for compatibility with SQLAlchemy 2.x.
  - Adopt new session scoping practices as documented for 2.0.
  - Update `autocommit`, `autoflush` usage as needed.

### Migration Scripts

- **Files Affected:** All migration files and Alembic scripts if present, e.g., `migrations/versions/*.py`
- **Structural Changes:**  
  - Refactor any migration logic using legacy SQLAlchemy API.

---

## Dependency Upgrade Plan

| Dependency    | Current Version | Target Version | Breaking Changes                                   | Migration Notes                                                  |
|---------------|----------------|---------------|----------------------------------------------------|------------------------------------------------------------------|
| SQLAlchemy    | 1.3            | 2.0.29        | - Query API rewrite<br> - Deprecated imports<br> - Session changes<br> - Removal of implicit binds | - See SQLAlchemy 2.x migration guide for details.<br> - Incrementally refactor codebase.<br> - Test compatibility of all third-party SQLA extensions. |

---

## Infrastructure Changes

N/A — not applicable to this task

---

## Rollback Strategy

- **Phase 1:**  
  - Revert dependency pin in requirements file to SQLAlchemy 1.3.
  - `pip install -r requirements.txt`
- **Phase 2 - 3:**  
  - Revert refactored modules (`models.py`, `db_utils.py`, etc.) via git or version control.
  - Ensure only successfully tested code is merged.
- **Phase 4:**  
  - If tests fail, roll back database to previous snapshot.
- **Phase 5 (Production Rollout):**  
  - Roll back application to previous release.
  - Redeploy using last stable artifact/container.
 
Each rollback is independently actionable via version control and dependency management.

---

## Testing Strategy

- **Unit testing:**  
  - Cover all models and repository logic.
  - _Tool:_ Pytest (or stack’s standard).
  - _Coverage target:_ ≥90% for DB logic.
- **Integration testing:**  
  - All endpoints/flows involving DB access.
  - Use real or in-memory DB backend.
- **Regression testing:**  
  - Full end-to-end suite for user-facing flows.
  - Validate historical behaviors are preserved post-migration.
- **Performance testing:**  
  - Benchmark DB-heavy functions before and after migration.

- **CI Gates:**  
  - Code changes MUST pass all tests in CI before merging.
  - No deploy to production unless all critical/major regressions are cleared.

---

## Timeline

| Milestone               | Phase    | Estimated Completion | Owner (or TODO)         |
|-------------------------|----------|---------------------|-------------------------|
| Dependency Pin/Upgrade  | Phase 1  | Week 1              | TODO                    |
| Code API Refactoring    | Phase 2  | Week 3              | TODO                    |
| Session Refactor        | Phase 3  | Week 4              | TODO                    |
| QA/Full Regression      | Phase 4  | Week 5              | TODO                    |
| Production Rollout      | Phase 5  | Week 6              | TODO                    |

*(Weeks are placeholders based on moderate effort; assign owners before execution).*