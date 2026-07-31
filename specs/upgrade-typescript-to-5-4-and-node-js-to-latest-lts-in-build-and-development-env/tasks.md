## Implementation Tasks

1. Confirm and document absence of `tsconfig.json`, `.nvmrc`, and `.node-version` (see research.md).
2. Edit `§{main_sources}§/package.json`:
    - Update TypeScript version to 5.4.
    - Update Node.js field (if present) to latest LTS.
    - If "engines" key missing, propose and add `"engines": {"node": "<latest LTS>"}`. ⚠️
3. Inventory/annotate JavaScript/TypeScript packages (see Appendix).
    - Manually check for TypeScript 5.4 & Node.js LTS compatibility in each (SME validation).
4. Create or update environmental version files (propose adding `.nvmrc`, `.node-version` for local developer clarity). ⚠️
5. Run all project tests; regression check and flag issues.
6. Peer review of changes and SME signoff before deployment.
