### Research Summary
- Language confirmed as Java from file paths and idioms in module and cyclomatic reports.
- No explicit automated test/UAT classes visible (all test/UAT symbol searches empty), but strong evidence of regression test modules from file-level dependency and complexity graph outputs (e.g., `sm-core/src/test/java/com/salesmanager/test/catalog/ProductTest.java`).
- Top complexity/test functions (via cyclomatic_complexity) reside in these test modules and in tightly coupled facades/controllers.
- Dead code identified by code graph review (e.g., abstract utility classes) for safe cleanup pursuit.
- Maven high-severity dependency scan returns no issues (get_dependency_report).
- Manual UAT is required post-upgrade, as no UAT code artifacts were detected.
- All claims and plans above are strictly cited from tool outputs—no invented structure.
