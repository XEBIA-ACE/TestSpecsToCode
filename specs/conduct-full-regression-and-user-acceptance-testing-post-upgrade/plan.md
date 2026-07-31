### Modernization & Testing Plan

1. **Apply Upgrades:** Update dependencies/platform as planned.
2. **Test Inventory:** Enumerate all `src/test/java` files for available test coverage, using file/module evidence where code graph is incomplete.
3. **Targeted Regression:** Run all tests, prioritizing complexity/module-coupled code (per cyclomatic_complexity and module_dependency_graph outputs).
4. **UAT Execution:** Coordinate manual UAT, focusing on user-facing facades/controllers (see module_dependency_graph for key files).
5. **Dead Code Review:** Audit and, if safe, remove flagged dead code (via find_dead_code).
6. **Reporting:** Document outcomes (pass/fail, coverage, cleanup actions).
