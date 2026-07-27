## Prerequisites

- [ ] [XS] Ensure access to project repository with rights to create branches and open PRs
- [ ] [XS] Install Python 3.8+ (minimum required for Flask 3.x)
- [ ] [XS] Install pip 23.0.1 or newer
- [ ] [XS] Confirm presence of requirements.txt specifying Flask dependency
- [ ] [XS] Set up local virtualenv using venv or poetry with recreated environment

## Phase 1 — Preparation

- [ ] [XS] Create upgrade/upgrade-flask-3 branch from main
- [ ] [S] Audit Flask-related dependencies in requirements.txt for direct and indirect imports
- [ ] [XS] Capture current test baseline by running pytest and archiving results in tests/baseline.json
- [ ] [XS] Verify presence of basic CI gates for tests (e.g., .github/workflows/ci.yml contains pytest step)

## Phase 2 — Core Upgrade

- [ ] [XS] Upgrade Flask from 1.x to 3.x in requirements.txt
- [ ] [M] Refactor usage of deprecated Flask APIs (e.g., flask.ext, old @app.errorhandler signatures) in app.py, routes.py, and relevant endpoints
- [ ] [S] Update imports and references for blueprint registration if legacy patterns found in app/__init__.py
- [ ] [S] Resolve deprecations in flask.json usage in utils.py and views.py

## Phase 3 — Testing & Validation

- [ ] [XS] Reinstall dependencies with pip install -r requirements.txt in fresh virtualenv
- [ ] [S] Run pytest on full test suite and compare output to tests/baseline.json
- [ ] [S] Address test failures due to Flask 3.x changes in test_app.py, test_routes.py, and test_utils.py
- [ ] [XS] Confirm code coverage meets or exceeds pre-upgrade baseline using pytest-cov output

## Phase 4 — CI/CD & Infrastructure

- [ ] [XS] Update python-version in .github/workflows/ci.yml to 3.8 or newer if required
- [ ] [XS] Add caching or install steps for updated requirements.txt in .github/workflows/ci.yml
- [ ] [S] Update Dockerfile to use python:3.8-slim (minimum supported for Flask 3.x) if present

## Phase 5 — Documentation & Rollout

- [ ] [XS] Add upgrade details to CHANGELOG.md with summary of Flask migration
- [ ] [XS] Update README.md to reference Flask 3.x usage if mentioned
- [ ] [S] Review and update operational runbook.md for Flask 3.x process adjustments
- [ ] [S] Enable error monitoring integration (if present) for post-deploy observation

---

Sections not relevant:
- Language, runtime, and build tool configuration details not provided in source context.
- No database, static asset, or other tech stack migrations present.
- No infra-as-code files mentioned beyond Docker/CI.