# Constitution: Python/Flask/SQLAlchemy Stabilization & Regression

## Project Identity

**Name**  
Python 3.12 / Flask 3.x / SQLAlchemy 2.x Stabilization

**Purpose**  
Stabilize the existing application on the target runtime and framework stack (Python 3.12, Flask 3.x, SQLAlchemy 2.x) with full regression testing.

**High-Level Goal**  
Ensure the application runs correctly and reliably on:
- Python 3.12
- Flask 3.x
- SQLAlchemy 2.x

with no known regressions relative to current behavior.

---

## Guiding Principles

1. **Prefer compatibility-preserving changes over refactors because the primary goal is stabilization, not redesign.**  
2. **Prefer updating dependencies to supported versions over pinning legacy versions because we must stabilize specifically on Python 3.12, Flask 3.x, and SQLAlchemy 2.x.**  
3. **Prefer fixing test suites and environments over bypassing or disabling tests because we must run full regression testing.**  
4. **Prefer API-compatible adaptation (e.g., migration shims) over feature removal because we aim to preserve existing behavior while adjusting to framework/runtime changes.**  
5. **Prefer deterministic, automated test runs over manual verification because regression coverage must be repeatable and reliable.**

---

## Constraints

**Timeline and Effort Ceiling**  
- TODO — person-days for Option ID `moderate` are not provided.

**Technology Mandates**

- **Runtime**:  
  - MUST run on Python 3.12.
- **Web Framework**:  
  - MUST run on Flask 3.x.
- **ORM / DB Layer**:  
  - MUST run on SQLAlchemy 2.x.

**Cloud / Hosting / Compliance**

- TODO — cloud provider unknown.  
- TODO — compliance requirements unknown.

**Budget / Scope**

- Scope is LIMITED to:  
  - Achieving correct operation on Python 3.12, Flask 3.x, SQLAlchemy 2.x.  
  - Running and passing a full regression test suite.  
- Out of scope for this task:  
  - New features.  
  - Large-scale architectural changes not strictly required to achieve compatibility and test pass.  
- Budget: TODO — no explicit budget given for Option `moderate`.

---

## Quality Standards

All standards below apply only insofar as they relate to this task (stabilization and regression testing).

1. **Test Coverage & Execution**
   - 1.1. A **full regression test suite MUST exist and be runnable** against the target stack (Python 3.12, Flask 3.x, SQLAlchemy 2.x).  
   - 1.2. **100% of existing automated tests MUST be executed** at least once on the target stack before sign-off.  
   - 1.3. Any **disabled or skipped tests MUST be explicitly justified** (e.g., documented known issue or intentionally unsupported behavior).

2. **Regression Acceptance**
   - 2.1. The release is **not acceptable** if it introduces **known functional regressions** compared to baseline behavior, unless:
     - The regression is explicitly documented, and  
     - Product/owner explicitly accepts it as a trade-off.  
   - 2.2. All **previously passing high-severity tests MUST pass** before completion.

3. **Code Review**
   - 3.1. Every change required for compatibility or test stabilization MUST be reviewed by **at least one other engineer**.  
   - 3.2. Changes that alter public API behavior or database interaction MUST include an accompanying test or explicit justification for why no new test is required.

4. **Documentation**
   - 4.1. A short **“Runtime & Framework Support” note MUST be updated** to state support for Python 3.12, Flask 3.x, SQLAlchemy 2.x.  
   - 4.2. A **“Migration Notes” or “Compatibility Notes” section MUST exist** summarizing:
     - Any intentionally changed behaviors, and  
     - Any tests permanently disabled with rationale.  

5. **Deployment Gates**
   - 5.1. A candidate build MUST:  
     - Install and run on Python 3.12 with Flask 3.x and SQLAlchemy 2.x, and  
     - Pass the full regression test suite (subject to documented, accepted exceptions).  
   - 5.2. No deployment to production-like environments is permitted without **a green automated test run** on the target stack.

---

## Decision Log

| ID | Decision | Rationale | Status |
|----|----------|-----------|--------|
| ADR-001 | Target runtime set to **Python 3.12** | Modernization goal explicitly requires stabilization on Python 3.12. | accepted |
| ADR-002 | Target web framework version set to **Flask 3.x** | Modernization goal explicitly requires stabilization on Flask 3.x. | accepted |
| ADR-003 | Target ORM version set to **SQLAlchemy 2.x** | Modernization goal explicitly requires stabilization on SQLAlchemy 2.x. | accepted |
| ADR-004 | **Full regression test suite** is mandatory before completion | Task explicitly requires “Run full regression testing and stabilize…”. | accepted |

For all other architectural or technology choices: **N/A — not applicable to this task** or **TODO where unknown** and must be resolved in subsequent specs or plans.