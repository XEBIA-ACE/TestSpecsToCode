## Prerequisites

- [ ] [XS] Confirm Python 3.12 is installed and set as default interpreter in `.python-version` or environment tooling (e.g., `pyenv`, `venv` activation script in `scripts/activate.sh`)
- [ ] [XS] Identify and document current Flask and SQLAlchemy versions from `requirements.txt` or `pyproject.toml`
- [ ] [S] Ensure access to application source repository, including protected branches used for releases (e.g., `main`, `release/*`)
- [ ] [S] Ensure access to CI system configuration (e.g., `.github/workflows/*.yml` or `.gitlab-ci.yml`) for running test suites on Python 3.12
- [ ] [S] Ensure access to test databases and configuration in `config.py` or `.env` used for integration and regression tests
- [ ] [S] Ensure application secrets and test credentials are available via existing secret management (e.g., environment variables referenced in `config.py`)

## Phase 1 — Preparation

- [ ] [S] Pin Python runtime to 3.12 in project configuration (`runtime.txt`, `.python-version`, or CI matrix configuration files)
- [ ] [S] Pin Flask to 3.x and SQLAlchemy to 2.x in `requirements.txt` or `pyproject.toml` without upgrading yet (add constraints only)
- [ ] [M] Create a dedicated stabilization branch (e.g., `stabilize-py312-flask3-sqlalchemy2`) from the current release branch in the repository root
- [ ] [M] Capture current test baseline by running the full test suite on existing runtime and dependencies and store results in `tests/reports/baseline-current-runtime.md`
- [ ] [S] Document current test coverage summary from existing CI artifacts into `tests/reports/coverage-baseline.md`
- [ ] [S] Inventory all test entry points and commands in `tests/README.md` (e.g., `pytest` flags, integration test scripts)

## Phase 2 — Core Upgrade

- [ ] [M] Upgrade Python runtime to 3.12 in CI configuration files (e.g., `.github/workflows/ci.yml` or equivalent) and ensure tests run against 3.12
- [ ] [M] Upgrade Flask dependency to the targeted 3.x version in `requirements.txt` or `pyproject.toml` and regenerate the lock file if present
- [ ] [M] Upgrade SQLAlchemy dependency to the targeted 2.x version in `requirements.txt` or `pyproject.toml` and regenerate the lock file if present
- [ ] [M] Resolve Python 3.12 compatibility issues in application modules imported by the test suite as reported by initial test runs, documenting changes in `docs/py312-compat-notes.md`
- [ ] [M] Resolve Flask 3.x compatibility issues in application modules that define routes, blueprints, or app initialization, documenting changes in `docs/flask3-migration-notes.md`
- [ ] [M] Resolve SQLAlchemy 2.x compatibility issues in application modules that define ORM models, sessions, and queries, documenting changes in `docs/sqlalchemy2-migration-notes.md`

## Phase 3 — Testing & Validation

- [ ] [M] Run full unit test suite with Python 3.12, Flask 3.x, and SQLAlchemy 2.x using the standard test command (e.g., `pytest`) and store results in `tests/reports/unit-py312-flask3-sqlalchemy2.md`
- [ ] [M] Run full integration test suite with Python 3.12, Flask 3.x, and SQLAlchemy 2.x against the test database configuration in `config.py` and store results in `tests/reports/integration-py312-flask3-sqlalchemy2.md`
- [ ] [M] Run full regression test suite (including end-to-end or API tests, if present) and store results in `tests/reports/regression-py312-flask3-sqlalchemy2.md`
- [ ] [S] Compare new unit, integration, and regression test results to the baseline in `tests/reports/baseline-current-runtime.md` and summarize differences in `tests/reports/regression-diff-summary.md`
- [ ] [S] Generate updated test coverage report on Python 3.12 and store it in `tests/reports/coverage-py312-flask3-sqlalchemy2.md`
- [ ] [M] Triage and fix test failures caused by the runtime and framework upgrades in the affected test modules under `tests/` and update `tests/reports/regression-diff-summary.md` with resolutions
- [ ] [S] Re-run only previously failing tests to confirm stabilization and append verification notes to `tests/reports/regression-py312-flask3-sqlalchemy2.md`

## Phase 4 — CI/CD & Infrastructure

- [ ] [S] Update CI job matrices in `.github/workflows/ci.yml` (or equivalent) to run the full test suite only on Python 3.12 as the primary supported version
- [ ] [S] Ensure CI caching configuration for dependencies (e.g., `pip` cache) is compatible with Python 3.12 in the CI configuration file
- [ ] [S] Add or update CI step to publish coverage artifacts from Python 3.12 runs, ensuring output paths match `tests/reports/coverage-py312-flask3-sqlalchemy2.md`
- [ ] [M] If a Dockerfile exists, update the base image to a Python 3.12 variant and ensure it installs Flask 3.x and SQLAlchemy 2.x as specified in `requirements.txt` or `pyproject.toml`

## Phase 5 — Documentation & Rollout

- [ ] [S] Update `CHANGELOG.md` with an entry describing stabilization on Python 3.12, Flask 3.x, and SQLAlchemy 2.x and referencing the regression test reports in `tests/reports/`
- [ ] [S] Update `README.md` and any setup instructions to specify Python 3.12 as the required runtime and list Flask 3.x and SQLAlchemy 2.x as core dependencies
- [ ] [S] Update or create an operations/runbook document (e.g., `docs/runbook.md`) to note any operational changes due to Python 3.12, Flask 3.x, or SQLAlchemy 2.x (startup commands, migrations, or config changes)
- [ ] [S] Define a staged rollout plan in `docs/rollout-plan-py312-flask3-sqlalchemy2.md`, including sequence (e.g., canary, partial, full), rollback criteria, and regression monitoring checkpoints
- [ ] [S] Document a post-migration monitoring checklist in `docs/post-migration-checklist.md` focused on runtime errors, performance regressions, and database access patterns under SQLAlchemy 2.x

