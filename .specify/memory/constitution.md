# Constitution: SQLAlchemy 2.x Modernization

## Project Identity

**Name**: SQLAlchemy 2.x Upgrade  
**Purpose**: Modernize the current codebase by upgrading SQLAlchemy from version 1.3 to 2.x.  
**High-Level Goal**: Achieve compatibility with SQLAlchemy 2.x APIs and remove dependencies on deprecated 1.3 patterns.

---

## Guiding Principles

1. **Prefer Compatibility Over Feature Adoption** because the primary goal is to ensure the codebase operates correctly under SQLAlchemy 2.x, not to immediately leverage new 2.x features.
2. **Prefer Direct Migration Over Incremental Polyfills** because ongoing maintenance effort of compatibility layers is not justified given the medium upgrade urgency and lack of explicit legacy constraints in tech analysis.
3. **Prefer Addressing EOL Risks Over Maintaining Deprecated APIs** because 1.3 is no longer supported, increasing risk of unpatched vulnerabilities and missing compliance updates.

---

## Constraints

- **Timeline/Effort Ceiling**:  
  Effort must not exceed the guideline for "moderate" upgrade options as stated (person-days estimate: N/A — not given in provided context).

- **Technology Mandates**:  
  - SQLAlchemy version: Must upgrade all code, dependencies, and migration scripts to be compatible with SQLAlchemy 2.x.
  - Language, runtime, and cloud provider: TODO — not specified and must be determined before implementation.

- **Budget and Scope**:  
  - Scope is strictly limited to changes required for a successful upgrade to SQLAlchemy 2.x.  
  - No additional tech debt remediation or feature development outside of breaking changes from SQLAlchemy 1.3 -> 2.x.

---

## Quality Standards

- **Testing Coverage Floor**:  
  All code paths migrated for SQLAlchemy 2.x must be exercised by automated tests (unit or integration). No area affected by the upgrade may have <70% line coverage.  
- **Code Review Requirements**:  
  Every change must be reviewed and approved by at least one developer not authoring the patch.
- **Documentation Must-Haves**:  
  Update all user-facing and internal developer documentation sections impacted by SQLAlchemy 2.x breaking changes.
- **Deployment Gates**:  
  All automated tests covering SQLAlchemy code must pass on final upgrade branch before merging.

---

## Decision Log

| ID  | Decision                                                            | Rationale                                                                                  | Status      |
|-----|---------------------------------------------------------------------|--------------------------------------------------------------------------------------------|-------------|
| 1   | Target SQLAlchemy 2.x as the minimum supported version              | 1.3 is end-of-life, and the project goal is migration off 1.3                              | accepted    |
| 2   | Do not introduce compatibility shims for 1.3                        | Reduces maintenance burden and aligns with principle to prefer direct migration             | accepted    |
| 3   | Scope is strictly the SQLAlchemy upgrade, not surrounding tech stack | Upgrade option and tech analysis do not identify supporting upgrades as part of project     | accepted    |
| 4   | All SQLAlchemy-related tests must be updated to pass post-upgrade    | Ensures continued functional correctness after migration                                    | accepted    |

---

**Sections not applicable:**

- Language, runtime, build tool, frameworks, cloud provider:  
  N/A — not applicable to this task (unknown, requires future clarification).
- Budget:  
  N/A — not specified for this task.  
- Any additional modernization/feature-scoped work:  
  N/A — not applicable for this task.