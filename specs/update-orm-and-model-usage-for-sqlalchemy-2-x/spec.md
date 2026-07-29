## Summary

This spec covers the update of Object-Relational Mapping (ORM) and model usage to be compatible with SQLAlchemy 2.x. The expected outcome is that the codebase uses supported SQLAlchemy 2.x APIs and patterns, removing any reliance on deprecated or removed features from prior versions. This ensures continued maintainability and compatibility with upstream releases.

## Motivation

- **Business Drivers**: Ongoing support and maintainability require the codebase to remain compatible with vendor-supported SQLAlchemy versions.
- **Technical Drivers**:
  - **SQLAlchemy 1.x End-of-Life**: Ensures compliance with maintenance and security policies.
  - **Deprecations/Removals in 2.x**: Outdated APIs and behaviors that are no longer supported.
  - **Medium Upgrade Urgency**: As per the tech analysis, this is not immediately blocking, but delay increases future migration cost and risk.

## Current State

- **Interfaces and APIs**:
  - Usage of SQLAlchemy ORM models is present.
  - Code patterns may include:
    - Implicit session usage
    - Legacy query patterns
    - Non-explicit engine binding
  - Model definitions may leverage APIs or patterns flagged as deprecated in SQLAlchemy 2.x.

- **Configuration**: 
  - Unknown; TODO to confirm concrete config keys and files in context.

- **Data Models**:
  - Defined with SQLAlchemy ORM.
  - Potential use of constructs removed in 2.x.

- **Key Behaviors**:
  - ORM interactions, session lifecycle, and model instantiation.

## Proposed Changes

| Component          | Before                                      | After                                               | Breaking? |
|--------------------|---------------------------------------------|-----------------------------------------------------|-----------|
| ORM Model Classes  | Defined using SQLAlchemy 1.x conventions, possibly with implicit bindings | Refactored for SQLAlchemy 2.x explicit patterns and APIs | Y         |
| Session Handling   | Implicit session management; potentially removed patterns | Explicit session usage as per 2.x documentation      | Y         |
| Query API Usage    | Legacy Query patterns (e.g., `.get()`, chaining) | 2.x compliant query patterns and syntax              | Y         |
| Import Statements  | Old SQLAlchemy import paths                  | Updated to match 2.x module structure                | Y         |
| Deprecated Features| Use of features removed in 2.x (e.g., `Session.query`, automap APIs) | All deprecated/removed features eliminated           | Y         |

## Compatibility & Breaking Changes

| Breaking Change                               | Migration Path                    |
|------------------------------------------------|-----------------------------------|
| Implicit session handling                     | Refactor code to use explicit session scope as required by SQLAlchemy 2.x |
| Legacy Query API usage (e.g., `Query.get`, chaining) | Update to explicit, 2.x-compatible query syntax and methods |
| Removed automap/legacy base features          | Replace with recommended 2.x alternatives; migrate model definitions |
| Changed import structure                      | Update imports to match 2.x organization |
| TODO: Additional changes pending code review  | TODO                              |

## Acceptance Criteria

1. Given a clean checkout on the target branch, when running the test suite with SQLAlchemy 2.x installed, then all tests pass without any deprecation or removal warnings.
2. Given the existing applications using the ORM models, when performing previously supported create/read/update/delete operations through the API, then the data is correctly persisted and retrieved using SQLAlchemy 2.x.
3. Given a static code analysis for banned/deprecated SQLAlchemy APIs, when run on the codebase, then no usage of removed or deprecated (post-2.x) APIs is detected.
4. Given a manual review of model definitions, when inspecting for removed or disallowed SQLAlchemy 2.x constructs, then no such constructs are present in the codebase.
5. Given that explicit session usage is now required, when applications attempt to use ORM models, then session lifecycles are appropriately opened and closed as per SQLAlchemy 2.x best practices.

## Open Questions

| # | Question                                                              | Owner or TODO | Due Date |
|---|----------------------------------------------------------------------|---------------|----------|
| 1 | Which language/runtime/build tool is in use for integration testing?  | TODO          | TODO     |
| 2 | What database backends are officially supported and must be validated?| TODO          | TODO     |
| 3 | Are any community or third-party plugins tied to legacy SQLAlchemy APIs?| TODO        | TODO     |
| 4 | Is there a comprehensive inventory of model and session usage?        | TODO          | TODO     |