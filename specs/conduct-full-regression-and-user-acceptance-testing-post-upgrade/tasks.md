### Tasks
1. Upgrade Java dependencies/platform.
2. Inventory all test modules and files under `src/test/java`.
3. Use complexity and dependency graph reports to target explicit test runs:
   - Prioritize regression and integration tests in `OrderTest.java`, `ReadableProductPopulator.java`, and functions with high fan-out.
4. Run the full regression test suite.
5. Execute UAT through defined business/user pathways—since no code artifact UAT present, coordinate manually.
6. Review dead code (
`AbstractUserConnection`, `ApplicationSearchConfiguration`, etc.) and, if genuinely unused, delete/refactor.
7. Document and report: map issues, actions, and ensure all steps are repeatable for review/audit.
