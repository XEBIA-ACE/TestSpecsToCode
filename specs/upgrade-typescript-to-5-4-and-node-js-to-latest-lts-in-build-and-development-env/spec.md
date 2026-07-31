## Upgrade TypeScript to 5.4 and Node.js to Latest LTS in Build and Development Environments

**Source:** This feature specification is based on the requirement provided above (not from CAST; see research.md for CAST analysis). All technical details or file locations with CAST traceability are documented in the Technical Appendix.

### Background & Goals
- Upgrade the project's TypeScript version to 5.4.
- Upgrade the project's Node.js version to the latest LTS.
- Ensure upgrades in both build and development environments.
- Flag missing BCM (business capability model) as a standing compliance gap (see constitution).

### Compliance
- BCM scope was not provided (see research.md); app-wide queries were run, and all outputs flag GR-08 as a standing gap.

### Boundaries
- This feature affects the build and execution environment, not functional/batch/message boundaries (GR-12/13 N/A for this spec).

### Requirements
- Update all locations where TypeScript and Node.js versions are referenced for build and dev usage.
- Ensure updated version numbers in `package.json`.
- No evidence found in CAST for the presence of common engine descriptor files (e.g., `.nvmrc`, `.node-version`, `tsconfig.json`); proposal: review/re-add these as needed. ⚠️
- Review usage of dependencies associated with TypeScript and Node.js; see research.md (CAST package inventory).
- Validate that the application and its dependencies remain compatible with the new versions post-upgrade (manual/code review/testing required).

### Out of Scope
- Application logic, transaction flows, and runtime API boundaries are not changed by this feature.
- No changes to Java/JPA/spring-backend or Angular-specific logic unless directly impacted by the TypeScript or Node.js runtime upgrade.
