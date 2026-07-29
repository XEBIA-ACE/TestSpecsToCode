# Constitution: SQLAlchemy ORM and Model Modernization

## Project Identity

**Name:** SQLAlchemy 2.x ORM & Model Upgrade

**Purpose:**  
Migrate existing ORM and model usage to be fully compatible with SQLAlchemy 2.x.

**High-Level Goal:**  
Ensure project ORM code is modernized to comply with SQLAlchemy 2.x standards, addressing deprecations and leveraging new APIs where relevant.

---

## Guiding Principles

1. **Prefer compliance with SQLAlchemy 2.x APIs over legacy usage:**  
   Because ongoing 2.x changes will remove deprecated patterns, modern code minimizes technical debt and future upgrade risk.

2. **Prefer automated refactoring over manual edits where possible:**  
   To reduce human error and maintain consistency across large codebases impacted by API changes.

3. **Prefer minimal diffs (no-op and nonfunctional changes) when possible:**  
   To facilitate easier code review, regression detection, and if necessary, rollback.

4. **Prefer clear mappings between old and new ORM patterns:**  
   To ensure maintainers can trace how previous logic is preserved, reducing onboarding and support complexity during and after the upgrade.

---

## Constraints

- **Timeline / Effort Ceiling:**  
  Must be achievable within the budget and schedule of option 'moderate'; actual person-days not specified, so scope creep is prohibited.  
- **Technology Mandates:**  
  - All ORM/model code must be compatible with SQLAlchemy 2.x.  
- **Budget or Scope Freeze:**  
  - No expansion beyond ORM and model code upgrade for SQLAlchemy 2.x compatibility.  
  - No unrelated refactors or feature work permitted.  
- **Other Mandates:**  
  - N/A — not applicable to this task.

---

## Quality Standards

- **Testing:**  
  - All upgraded ORM/model paths must be exercised by existing or new automated tests, achieving 100% coverage on affected lines.
- **Code Review:**  
  - Every change must be reviewed by at least one engineer with SQLAlchemy experience.
- **Documentation:**  
  - All non-obvious changes or new idioms must be documented inline as code comments.
  - Upgrade rationale and migration notes must be appended to the project's CHANGELOG or migration guide.
- **Deployment Gates:**  
  - No deployment unless all affected tests pass and a code reviewer has explicitly approved the upgrade pull request.

---

## Decision Log

| ID   | Decision                                                   | Rationale                                      | Status     |
|------|------------------------------------------------------------|------------------------------------------------|------------|
| 1    | Target SQLAlchemy 2.x as compatibility baseline            | Upgrade goal mandates 2.x compliance           | accepted   |
| 2    | Limit scope to ORM/model code; exclude non-ORM refactors   | Option only authorizes SQLAlchemy ORM upgrade  | accepted   |
| 3    | Testing coverage for affected code must be 100%            | Ensure regression-free migration               | accepted   |

---

_Note: All other context (language, runtime, build tool) is unknown. TODOs to be addressed as discovered._