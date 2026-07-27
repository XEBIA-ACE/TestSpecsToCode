# SPEC: Upgrade SQLAlchemy from 1.3 to 2.0.29

## Summary

This specification covers the upgrade of SQLAlchemy from version 1.3 to 2.0.29 as part of our ongoing software modernization objectives. The expected outcome is a production codebase that is fully compatible with and takes advantage of SQLAlchemy 2.0.29, including elimination of deprecated APIs and removal of backward compatibility shims.

## Motivation

- **Business Drivers**: Align with supported libraries for long-term maintainability and to reduce tech debt.
- **Technical Drivers**:
    - **EOL/Support**: SQLAlchemy 1.3 is beyond its official maintenance window and will not receive fixes for bugs or vulnerabilities. Immediate priority is medium.
    - **Compliance/Security**: Dependency on an unsupported ORM version can prevent security audits from passing; 2.0.29 is current and maintained.
    - **Features/Performance**: New capabilities, improved async support, and performance improvements in 2.x series.
    - **Reference**: Tech analysis lists upgrade urgency as medium, requiring modernization as soon as feasible.

## Current State

- **Interfaces/APIs**: 
    - Usage of SQLAlchemy 1.3 across the codebase.
    - Code potentially uses 1.x style session management, Query objects, and legacy ORM query patterns.
- **Data Models**: 
    - Active use of SQLAlchemy 1.3 declarative models and relationships.
- **Config Keys**: 
    - Reliance on `sqlalchemy.*` configuration in application settings or environment variables.
- **Behaviours**:
    - Assumes synchronous query execution.
    - Compatibility with 1.3 API signatures and behaviors.
- **Named Entities**: 
    - TODO — Specific class names, custom types, and model files are not provided in the context.

## Proposed Changes

| Component                | Before (SQLAlchemy 1.3)                      | After (SQLAlchemy 2.0.29)                               | Breaking? |
|--------------------------|----------------------------------------------|---------------------------------------------------------|-----------|
| ORM API usage            | 1.3-style Query, session, imports            | 2.0-style usage with explicit engine/session APIs        | Y         |
| Deprecated methods       | Legacy API calls (e.g., `session.query`)     | Updated calls, type-safe and explicit patterns           | Y         |
| Configuration            | 1.3-specific config keys                     | 2.0-compatible config keys                              | Y         |
| Declarative base         | 1.3-style `declarative_base` usage           | 2.0-style, potentially with updated import paths         | Y         |
| Relationship handling    | 1.3 idioms                                   | Updated 2.0 idioms and APIs                             | Y         |
| Async features           | Not available or preliminary/incubating      | Fully supported in 2.0 (if enabled)                     | N         |
| Type annotations         | Optional or missing                          | 2.0 supports improved type hints, optional to adopt     | N         |

## Compatibility & Breaking Changes

| Breaking Change Description                      | Migration Path |
|--------------------------------------------------|---------------|
| Legacy `session.query` patterns                  | Refactor to new select/Session API (TODO: code specifics) |
| Deprecated config keys no longer recognized      | Update to supported 2.0 config keys (TODO: identify keys) |
| Deprecated or removed ORM methods/classes        | Update to supported equivalents in 2.0 (TODO: enumerate classes/methods) |
| Changes in relationship configuration behavior   | Update model definitions to match new requirements (TODO: affected models) |
| Import path changes (e.g., declarative_base)     | Update imports to 2.0 locations (TODO: list affected modules) |

## Acceptance Criteria

1. Given the application codebase dependent on SQLAlchemy 1.3, when all dependencies are upgraded to SQLAlchemy 2.0.29, then all unit, integration, and acceptance tests must pass without error under CI.
2. Given the test suite targeting database models and queries, when the suite is executed with SQLAlchemy 2.0.29, then any usage of removed or deprecated 1.3 APIs must be absent from the codebase (verifiable by code search or linter).
3. Given a configured application environment, when migration scripts for the database are run under SQLAlchemy 2.0.29, then all migrations complete successfully and the schema is correct as validated by test queries.
4. Given review of all configuration files, when inspected after the upgrade, then no 1.3-only `sqlalchemy.*` config options are present and all are compatible with 2.0.29.
5. Given manual QA of the most common data operations (CRUD via ORM), when exercised via the application UI and/or CLI, then observed behaviors match pre-upgrade behaviors with no regressions.

## Open Questions

| # | Question                                                        | Owner           | Due Date |
|---|-----------------------------------------------------------------|-----------------|----------|
| 1 | Which specific ORM patterns/classes are in use and need changes?| TODO            | TODO     |
| 2 | Are any third-party or custom extensions/plugins impacted?      | TODO            | TODO     |
| 3 | Are async features targeted for adoption as part of this upgrade?| TODO           | TODO     |
| 4 | What is the plan for rollout and rollback in prod?               | TODO           | TODO     |
| 5 | Are there any integration points with services that rely on SQLAlchemy internals? | TODO | TODO   |
