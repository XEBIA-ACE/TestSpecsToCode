# TASKS: Update ORM and Model Usage for SQLAlchemy 2.x

## Prerequisites

- [ ] [XS] Verify access to source repository and all affected model files.
- [ ] [XS] Install SQLAlchemy 2.x (latest stable, e.g., 2.0.30) in local environment.
- [ ] [XS] Ensure ability to run existing test suite (unit/integration).
- [ ] [XS] Confirm write access to CI configuration files.
- [ ] [XS] Confirm local environment Python version is compatible with SQLAlchemy 2.x.

## Phase 1 — Preparation

- [ ] [S] Audit requirements.txt (or pyproject.toml) for existing SQLAlchemy version pin.
- [ ] [XS] Create branch `feature/sqlalchemy-2-upgrade` from `main`.
- [ ] [XS] Capture current ORM model test suite results (save output in `tests/baseline_pre_sqlalchemy2.txt`).
- [ ] [S] Identify all source files importing `sqlalchemy` or using ORM base classes.

## Phase 2 — Core Upgrade

- [ ] [M] Upgrade SQLAlchemy to >=2.0 in requirements.txt (or pyproject.toml).
- [ ] [M] Refactor use of `declarative_base()` import in all model files to `from sqlalchemy.orm import declarative_base`.
- [ ] [L] Replace all legacy ORM query patterns (e.g., `session.query(Model)`, use `select(Model)`) in repository and service layers.
- [ ] [M] Update model class definitions and relationships to adhere to SQLAlchemy 2.x constructor and syntax.
- [ ] [M] Address any explicit deprecation warnings (identified via test run) impacting ORM or model usage in affected modules.
- [ ] [S] Remove any now-unsupported `Session` configuration parameters in affected instantiation points.

## Phase 3 — Testing & Validation

- [ ] [S] Execute full test suite with SQLAlchemy 2.x and capture results in `tests/baseline_post_sqlalchemy2.txt`.
- [ ] [S] Compare `tests/baseline_pre_sqlalchemy2.txt` and `tests/baseline_post_sqlalchemy2.txt` for unexpected regressions.
- [ ] [S] Increase/restore ORM-model test coverage where failing or incomplete due to upgrade.

## Phase 4 — CI/CD & Infrastructure

- [ ] [XS] Update CI build scripts (`.github/workflows/ci.yml` or similar) to use SQLAlchemy 2.x in installation steps.
- [ ] [XS] Ensure Dockerfile and any devcontainer.json reference updated dependency constraints for SQLAlchemy.

## Phase 5 — Documentation & Rollout

- [ ] [XS] Update CHANGELOG.md with summary of SQLAlchemy 2.x ORM/model migration, referencing major breakage points.
- [ ] [XS] Review and update any runbooks referencing legacy query/model patterns.
- [ ] [S] Announce staged rollout plan on team channel and monitor error reporting post-deployment.

---

Sections not relevant to the above scope:

- N/A — not applicable to this task