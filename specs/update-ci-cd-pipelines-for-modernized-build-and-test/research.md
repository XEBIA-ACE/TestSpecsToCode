# Technical Appendix (CAST-Derived Facts & Query Log)

## Summary
- Application "Shopizer" confirmed as target (Query 1).
- CAST Imaging MCP session revealed no modeled objects representing CI/CD, pipeline, workflow, or automation scripts, nor were any build scripts or build configuration files returned in the `.github` or root directories (Queries 4–14).
- Language, runtime, and build tool inferred from code presence (Java, Spring, JPA, Hibernate, AWS/GCP integrations); however, **no CI/CD automation or pipeline structure is available in the current CAST model** (✅, see search results).

## CAST-Derived Facts (All facts marked ✅ direct CAST result, unless otherwise noted)

- Shopizer application exists with major tech: Java, Spring, JPA, Hibernate, cloud SDK integrations (Source: CAST MCP — stats: Shopizer / [no ID] / 1).
- No modeled `.github/workflows`, Jenkinsfiles, or YAML pipeline definitions found (Source: CAST MCP — objects: various pipeline/ci/build filters, see log).
- No objects named or annotated for "ci", "build", "pipeline", "workflow" found in Shopizer project directories (Source: CAST MCP — objects: multiple filters, see log).
- Online endpoints discovered, but no automation for CI/CD modeled (Source: CAST MCP — transactions/api_inventory: Shopizer / [multiple IDs] / many).

## Query Log

- [1] applications — (scope: all) — 7 found — run-returned (Shopizer, CardDemo, SuperApp, ACE, EC_Airflow, CarePay, User_Management)
- [2] stats (Shopizer) — 1 found — run-returned (Shopizer)
- [3] transactions (Shopizer) — run-returned (IDs returned, endpoint count ~100+)
- [4] api_inventory (Shopizer) — run-returned (IDs returned, REST endpoint names)
- [5] objects (filters: name:contains:ci,filepath:contains:.github) — 0 found — run-empty
- [6] objects (filters: name:contains:build,filepath:contains:.github) — 0 found — run-empty
- [7] objects (filters: name:contains:workflow,filepath:contains:.github) — 0 found — run-empty
- [8] objects (filters: name:contains:ci,filepath:contains:jenkins) — 0 found — run-empty
- [9] objects (filters: name:contains:build,filepath:contains:jenkins) — 0 found — run-empty
- [10] objects (filters: name:contains:pipeline) — 0 found — run-empty
- [11] objects (filters: name:contains:ci) — 50+ found — run-returned, none are CI/CD pipeline objects (list available on request)
- [12] objects (filters: name:contains:build) — 50+ found — run-returned, all unrelated to CI process (Java/Crypto/Cloud utils)
- [13] objects (filters: name:contains:test) — 17 found — run-returned, all Java fields/enums (test data etc), not build/test scripts
- [14] objects (filters: name:contains:git) — 33 found — run-returned, none are build/CI-related
- [15] objects (filters: name:contains:ci,filepath:contains:.github) — duplicate of 5; see above.

- **CAST snapshot ID/date**: Not available in CAST MCP — [query attempted: no ID returned].

## Compliance

- No modeling of pipeline code/automation in CAST MCP — app-wide queries required due to BCM scope absence (persistent GR-08 gap).
- Everything beyond code presence and primary app technologies is a proposal (⚠️).
