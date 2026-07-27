# SQLAlchemy 1.3 → 2.0.29 Upgrade — Tasks

## Prerequisites

- [ ] [XS] Verify developer access permissions to repository and branch protection rules.
- [ ] [XS] Install SQLAlchemy 2.0.29 locally for test runs (`pip install SQLAlchemy==2.0.29`).
- [ ] [XS] Confirm Python environment supports SQLAlchemy 2.x (Python ≥3.7).
- [ ] [XS] Ensure access to database instance used for local development and test execution.
- [ ] [XS] Check access to CI configuration files (e.g., `.github/workflows/`, `Jenkinsfile`) for updating dependency pinning.

## Phase 1 — Preparation

- [ ] [S] Audit SQLAlchemy usage and version definition in all requirements files (`requirements.txt`, `setup.py`, `Pipfile`, or `pyproject.toml`).
- [ ] [S] Create `feature/sqlalchemy-2-upgrade` branch from main branch.
- [ ] [S] Capture current test run and database migration output for baseline (`pytest`, `tox`, etc. logfiles).
- [ ] [S] Review and document third-party libraries accessing SQLAlchemy for compatibility.

## Phase 2 — Core Upgrade

- [ ] [XS] Update SQLAlchemy version pin to `2.0.29` in all dependency files (`requirements.txt`, `setup.py`, etc.).
- [ ] [M] Refactor deprecated `session.query(Model).get(id)` usages to `session.get(Model, id)` in all models and data access layers.
- [ ] [M] Replace legacy `from sqlalchemy.ext.declarative import declarative_base` with `from sqlalchemy.orm import declarative_base` in all ORM base definitions.
- [ ] [M] Migrate legacy `engine.execute()` and `connection.execute()` patterns to use `Connection.execute()` per SQLAlchemy 2.x API across data access code.
- [ ] [M] Update direct SQL expressions to use `text("...")` for string SQL across all data access functions.
- [ ] [S] Remove or update any usage of `sqlalchemy.util.deprecations` now unsupported in 2.x, in utility/helper modules.
- [ ] [M] Refactor custom session/context management code to comply with `Session` usage patterns required by SQLAlchemy 2.x (e.g., no implicit autoflush).
- [ ] [S] Replace `Query.select()` patterns (removed) with `select()` SQL expression in repository layer.
- [ ] [S] Update raising and handling of SQLAlchemy exceptions to correspond to new 2.x hierarchy where necessary.
- [ ] [S] Refactor imports for any other ORM or Core APIs noted as changed between 1.3 and 2.0.29.

## Phase 3 — Testing & Validation

- [ ] [M] Run full test suite post-migration (e.g., `pytest`, `tox`) and resolve SQLAlchemy 2.x-induced test failures.
- [ ] [S] Compare pre/post-upgrade test log and query count for regression detection.
- [ ] [XS] Ensure all custom alembic (if used) or database migration scripts remain operable under SQLAlchemy 2.0.29.
- [ ] [S] Validate core database CRUD operations against a test database to confirm no regression.
- [ ] [S] Check integration tests if present for all services using SQLAlchemy.

## Phase 4 — CI/CD & Infrastructure

- [ ] [XS] Update CI pipeline dependency installation steps to use `SQLAlchemy==2.0.29` (`.github/workflows/`, `Jenkinsfile`, etc.).
- [ ] [XS] Update container or Docker build files (e.g., `Dockerfile`) to pin SQLAlchemy 2.0.29.
- [ ] [XS] Validate CI job execution ensuring all steps using SQLAlchemy are compatible after upgrade.

## Phase 5 — Documentation & Rollout

- [ ] [XS] Update `CHANGELOG.md` to reflect SQLAlchemy upgrade and breaking changes.
- [ ] [XS] Review and update any team runbooks with new SQLAlchemy usage patterns.
- [ ] [S] Stage rollout to non-production environments, monitor for runtime errors related to SQLAlchemy.
- [ ] [S] Monitor application logging/error tracking for new database or ORM exceptions post-deployment.

---

_Note: All file/module references must be replaced by actual project paths as discovered during step execution. No unrelated task is included per the input scope._