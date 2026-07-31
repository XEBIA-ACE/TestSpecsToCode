# Constitution: Quality Standards and Design Principles

- **Zero Hallucination (GR-01):** Only implement improvements or migrations where CAST data shows a concrete artifact or dependency. Flag all inferred or missing items for SME/manual validation.
- **Traceability (GR-05/06):** All technical changes must be traceable to specific code object IDs or CAST findings.
- **Coding Practices:**
  - Code must build and pass current test coverage before and after migration.
  - Use only supported, compatible language and library versions as confirmed against the supplied object/package list.
  - No unaudited dependencies or build tools/scripts should remain after migration.
- **Backward Compatibility:**
  - No functional regression or feature loss permitted during upgrade/migration until verified by complete regression testing.
- **Documentation & Gaps:**
  - Maintain documentation of all code and build system changes, including rationale where artifacts were not visible in CAST MCP.
  - Explicitly record compliance gaps (build/process files not found in CAST MCP). SME review required for gap closure.
- **Testing:**
  - All automated and manual tests must pass post-upgrade.

---