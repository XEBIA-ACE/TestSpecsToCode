# PLAN: Upgrade SQLAlchemy from 1.3 to 2.x

## Overview

**Migration Strategy:**  
A phased (strangler-fig) migration approach is recommended. SQLAlchemy 2.x introduces multiple breaking changes from 1.3, especially in session usage, query APIs, and connection methods. A big-bang migration risks substantial downtime and hard-to-debug regressions, given the moderate effort/medium urgency assessment and likely pervasiveness of SQLAlchemy throughout the codebase. By incrementally porting components or modules, we can identify, contain, and address incompatibilities with less risk, leveraging feature-flag gating or API-level toggling for major subsystem transitions.

**Justification:**  
The effort required is moderate, and the risk is non-trivial due to extensive breaking changes outlined in the SQLAlchemy 2.x release notes. A phased migration enables targeted rewrites, thorough compatibility testing, and faster incremental value delivery without stalling the mainline development.

## Phases

| Phase  | Description                                       | Dependencies          | Estimated Effort |
|--------|---------------------------------------------------|----------------------|------------------|
| 1      | Codebase audit: identify SQLAlchemy usages        | None                 | 1 person-day     |
| 2      | Refactor deprecated APIs (sessions, queries, engine) for 2.x compatibility | Phase 1              | 3 person-days    |
| 3      | Upgrade SQLAlchemy dependency to 2.x              | Phase 2              | 1 person-day     |
| 4      | Regression and integration testing                | Phase 3              | 2 person-days    |
| 5      | Production rollout                                | Phase 4              | 1 person-day     |

_Total: 8 person-days (per upgrade option’s “moderate” effort range)._

## Component Changes

- **Files Affected:**  
  Any file importing `sqlalchemy`, e.g., files with `from sqlalchemy import ...` or using `Session`, `query`, `engine`.

- **Structural/API Changes:**  
  - Replace usage of the legacy `session.query` interface with the new-style `select`/`update`/`delete` constructs.
  - Update connection/transaction usage patterns to leverage context managers (`with engine.connect()`).
  - Remove or update any deprecated API calls (e.g., `engine.execute`, `MetaData.bind`, etc.).
  - Update ORM mapping and model code where the 2.x API has diverged.
  - Migrate any custom type decorators or user-defined compile rules if present.
  - Files: All modules/classes/functions where SQLAlchemy sessions, queries, table definitions, or engines are referenced.  
    _(Specific filenames/classes are unknown from context; enumerate in Phase 1.)_

## Dependency Upgrade Plan

| Dependency  | Current Version | Target Version | Breaking Changes | Migration Notes                                              |
|-------------|----------------|---------------|------------------|--------------------------------------------------------------|
| SQLAlchemy  | 1.3            | 2.x           | Yes              | Major API changes: remove legacy queries, session API updates, engine execution model, some imports moved; see https://docs.sqlalchemy.org/en/20/changelog/changelog_20.html |

## Infrastructure Changes

N/A — not applicable to this task.

## Rollback Strategy

Rollback is phase-specific and relies on incrementally-tested migration stages:

- **Phase 1/2:**  
  Restore previous working branch if refactoring introduces blocking regressions.
- **Phase 3:**  
  Revert to requirements file or dependency lockfile specifying SQLAlchemy 1.3; roll back code changes related to 2.x API updates.
- **Phase 4:**  
  If major integration failures detected, pin SQLAlchemy version back to 1.3, revert affected code, re-run tests.
- **Phase 5:**  
  If post-rollout failures, quick revert to previous deployed build with SQLAlchemy 1.3.

Each rollback should be a simple reversion of the code and dependency state of the preceding phase, validated by the pre-existing test suite.

## Testing Strategy

- **Unit Tests:**  
  All existing and new model/database-interacting logic must be covered by automated unit tests.  
  _Coverage target: 90% of SQLAlchemy-interfacing code._

- **Integration Tests:**  
  All database transactions and queries, especially those with new session or query patterns, to be tested against a real or local database.

- **Regression Tests:**  
  Automated regression test suite must pass before each phase transitions; specifically, existing behaviors and data/ORM edge cases.

- **Performance Tests:**  
  Run query timing and load tests before and after the upgrade to catch silent slowdowns.  
  _Tools:_ pytest, tox or equivalent.

- **CI/CD Gates:**  
  All SQLAlchemy-related test suites must pass green in CI before advancing to rollout.

## Timeline

| Milestone           | Phase           | Estimated Completion | Owner       |
|---------------------|-----------------|---------------------|-------------|
| Audit codebase      | Phase 1         | Day 1               | TODO        |
| Refactor API usage  | Phase 2         | Day 4               | TODO        |
| Upgrade dependency  | Phase 3         | Day 5               | TODO        |
| Complete testing    | Phase 4         | Day 7               | TODO        |
| Rollout             | Phase 5         | Day 8               | TODO        |
