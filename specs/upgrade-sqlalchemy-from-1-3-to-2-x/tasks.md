## Prerequisites

- [ ] [XS] Verify write access to the repository and permissions to create branches and PRs
- [ ] [XS] Ensure Python 3.8+ is available in the development environment
- [ ] [XS] Install/upgrade `pip` to at least 20.3.4
- [ ] [XS] Install/confirm access to virtual environment tooling (`venv` or `virtualenv`)
- [ ] [XS] Ensure CI pipeline secrets (DB connection, etc.) are up to date for test execution

## Phase 1 — Preparation

- [ ] [XS] Create branch `sqlalchemy-2-upgrade` from latest `main`
- [ ] [S] Inspect and document current SQLAlchemy usage in all `*.py` files
- [ ] [XS] Record current test results as a baseline: execute all tests and save results in `tests/baseline_sqlalchemy13.log`
- [ ] [XS] Confirm CI runs on the new branch with no modifications (validate green baseline)

## Phase 2 — Core Upgrade

- [ ] [XS] Update SQLAlchemy dependency from `==1.3.*` to `^2.0.0` in `requirements.txt`
- [ ] [S] Refactor all `import sqlalchemy.*` statements in `*.py` files for API changes if needed
- [ ] [M] Update ORM session instantiations to use SQLAlchemy 2.x style in affected modules
- [ ] [M] Refactor query execution patterns (e.g., `session.query()`) to SQLAlchemy 2.x idioms in all model or access layers
- [ ] [M] Update engine creation and connection management for 2.x API in database module(s)
- [ ] [M] Migrate all `MetaData`, `declarative_base`, and Table definitions to be compatible with 2.x in models modules
- [ ] [S] Replace deprecated utilities (e.g. `from sqlalchemy.ext.declarative import declarative_base`) in affected files
- [ ] [S] Update exception handling for SQLAlchemy 2.x changes in repository/data access classes

## Phase 3 — Testing & Validation

- [ ] [XS] Rebuild the test environment with upgraded dependencies via `pip install -r requirements.txt`
- [ ] [M] Run full test suite and capture results in `tests/sqlalchemy2_upgrade.log`
- [ ] [S] Compare `tests/baseline_sqlalchemy13.log` and `tests/sqlalchemy2_upgrade.log` for regressions
- [ ] [XS] Check code coverage delta before and after upgrade using existing tool (e.g., `coverage.py`)
- [ ] [S] Manually test all endpoints or workflows that exercise database access (as documented in tech analysis, if any)

## Phase 4 — CI/CD & Infrastructure

- [ ] [XS] Pin SQLAlchemy 2.x in CI pipeline environment file(s) (e.g., `.github/workflows/python-tests.yml`)
- [ ] [XS] Update Dockerfile or container build script to install SQLAlchemy 2.x if present
- [ ] [XS] Validate database migration/initialization steps in CI/CD deploy scripts are compatible with SQLAlchemy 2.x

## Phase 5 — Documentation & Rollout

- [ ] [XS] Update `CHANGELOG.md` with details of SQLAlchemy 2.x upgrade and code-level migration notes
- [ ] [XS] Edit any relevant runbooks or onboarding docs referring to SQLAlchemy 1.x APIs or idiosyncrasies
- [ ] [XS] Announce upgrade plan and expected changes on project communication channel
- [ ] [S] Monitor application error logs (post-deploy) for SQLAlchemy migration-related issues during phased rollout

---

*All tasks are grounded in the available context. Components and dependencies not mentioned in tech analysis or upgrade option are omitted. No scope expansion beyond SQLAlchemy 1.3 → 2.x upgrade.*