## Summary

This spec outlines the required changes to upgrade SQLAlchemy from version 1.3 to version 2.x within the application. The goal is to ensure full compatibility with SQLAlchemy 2.x, remove deprecated patterns and APIs, resolve breaking changes, and maintain existing application functionality following the upgrade.

## Motivation

The main drivers for this modernization are:
- **End-of-life (EOL)**: SQLAlchemy 1.3 is no longer actively maintained, introducing risks of unpatched vulnerabilities and lack of support.
- **Security and Compliance**: Continued use of an unmaintained ORM creates compliance concerns and exposes the application to Common Vulnerabilities and Exposures (CVEs) once 1.3 reaches EOL.
- **Technical Debt**: Relying on dated SQLAlchemy APIs increases effort for future maintenance and limits feature adoption.
- **Performance and Features**: SQLAlchemy 2.x includes performance enhancements, new APIs, and modern Python compatibility.
- **Upgrade urgency**: Medium, as determined by tech analysis.

## Current State

- **ORM Layer**: The codebase makes use of SQLAlchemy 1.3 across its data access layer. APIs, patterns, and behaviors directly related to version 1.3 are present.
- **Interface Usage**: Usage of SQLAlchemy 1.3 conventions in session management, model declaration, query construction, and transaction handling.
- **Config Keys and Schema Elements**: Some configuration parameters and types may reference 1.3-era settings (e.g., options for `create_engine`, `sessionmaker` behaviors).
- **Affected Behaviors**:
  - Implicit query execution
  - Legacy execution/connection patterns
  - Use of deprecated APIs in 2.x (TODO: List specific APIs once full code inventory is available)

## Proposed Changes

| Component              | Before: SQLAlchemy 1.3 Usage                 | After: SQLAlchemy 2.x Usage                  | Breaking? |
|------------------------|----------------------------------------------|----------------------------------------------|-----------|
| ORM Layer              | 1.3 syntax and API patterns                  | 2.x syntax, e.g., new-style engine/session   | Y         |
| Query Construction     | Legacy query composition and execution       | Explicit connection management in 2.x        | Y         |
| Session Management     | `session.execute()`, sometimes implicit      | Explicit context-managed session usage       | Y         |
| Deprecated APIs        | Uses removed in 2.x (e.g., `session.query()`) | Replaced per 2.x migration guide             | Y         |
| Config/Initialization  | 1.3 options in engine, session configuration | Updated config for 2.x compatibility         | Y         |

## Compatibility & Breaking Changes

| Breaking Change                        | Migration Path                                                         |
|-----------------------------------------|------------------------------------------------------------------------|
| Implicit execution API removal          | Refactor to explicit execution patterns per SQLAlchemy 2.x docs        |
| Deprecated API removal                  | Replace removed/deprecated methods with recommended 2.x alternatives   |
| Changed session and engine config       | Update instantiation/configuration to 2.x-compatible patterns          |
| Query composition and execution changes | Refactor query logic to adopt 2.x patterns                            |
| TODO: Further incompatibilities        | TODO: Inventory complete API uses for additional breaking changes      |

## Acceptance Criteria

1. Given a working branch on latest main, when SQLAlchemy 1.3 is removed and 2.x is installed, then all automated CI and test suite runs must pass with no errors.
2. Given all references to SQLAlchemy APIs across the codebase, when audited for deprecated or removed usage, then no SQLAlchemy 1.3-only APIs remain.
3. Given database CRUD operations via ORM models, when executed in the application runtime environment, then all actions succeed with expected results under SQLAlchemy 2.x.
4. Given the database configuration, when the application is started and initializes the ORM layer, then no runtime warnings or errors related to 2.x migration occur.
5. Given explicit breaking change migrations documented above, when reviewed, then documentation reflects all adopted SQLAlchemy 2.x patterns with no outdated references.

## Open Questions

| #  | Question                                                                    | Owner (or TODO) | Due Date (or TODO) |
|----|-----------------------------------------------------------------------------|-----------------|--------------------|
| 1  | Are there any custom extensions or plugins relying on SQLAlchemy 1.3 internals? | TODO            | TODO               |
| 2  | What is the test coverage of the ORM layer and does it cover all usages?    | TODO            | TODO               |
| 3  | Are there production data migration or backup implications with upgrade?     | TODO            | TODO               |
| 4  | Do any downstream consumers import or subclass our ORM models directly?     | TODO            | TODO               |