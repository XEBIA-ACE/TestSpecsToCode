## Quality Standards and Design Principles

- **Version Declaration Consistency:** All version-setting artifacts (`package.json`, `.nvmrc`, `.node-version`) must consistently specify Node.js and TypeScript versions.
- **Source of Truth:** `package.json` remains the authoritative dependency/config record.
- **Backward Compatibility:** When dependencies are updated, downstream or transitive dependencies must be validated for compatibility with TypeScript 5.4 and Node.js LTS.
- **Test Coverage:** No environment upgrade is complete without a successful regression-test run (unit, CI, E2E if present).
- **Traceability and Documentation:** All technical changes must be linked to file locations and facts as resolved from CAST; proposals or inferred tasks must be marked as such per the compliance rules.
- **BCM Compliance:** Flag all app-wide queries/changes as a GR-08 compliance gap until BCM mapping is supplied.
