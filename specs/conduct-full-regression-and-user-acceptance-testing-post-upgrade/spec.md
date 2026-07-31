### Modernization & Testing Specification

#### Scope
- Conduct a **full regression test suite run** and **user acceptance test (UAT)** after all upgrade activities (dependency or platform changes).
- Ensure all previously passing tests, including those for highly dependent and high-fan-out code, still pass post-upgrade.
- Identify and document any dead code segments for potential cleanup.

#### Structural Observations
- **Language**: Java (inferred from file paths like `*.java` and conventions).
- **Test Locations & Artifacts**: No explicit test framework classes found, but substantial modules exist in `src/test/java/`, referenced in both the module dependency graph and cyclomatic complexity tool outputs (e.g., `OrderTest.java`).
- **Regression Hotspots**: Functions in files such as `OrderTest.java` and `ReadableProductPopulator.java` have high call fan-out (cyclomatic_complexity), and are regression priorities.
- **Dead Code Opportunities**: Several abstract/utility classes (e.g., `AbstractUserConnection`, `ApplicationSearchConfiguration`) are flagged for review.
- **No Detected UAT Code**: Searches for UAT- or acceptance-named symbols returned empty; UAT is likely a manual process for this repo.
- **Dependency Security**: No high/critical CVEs found for Maven dependencies (get_dependency_report results).
- **Module Coupling**: Controllers and facades (e.g., `CustomerFacadeImpl`) are tightly coupled to data models; strong focus on these for regression/UAT.

#### Technical Risks
- Lack of explicit test or UAT symbols means some verification is manual.
- Dead code confidence is partial; cleanup must be careful and confirmed.

---

