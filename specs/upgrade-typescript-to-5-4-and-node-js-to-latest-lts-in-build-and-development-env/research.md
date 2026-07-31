## CAST Research & Technical Appendix

**App targeted:** `JHipster-7.9.3`  
**BCM Scope:** Not supplied (standing GR-08 compliance gap; app-wide queries)

### Key CAST Queries and Results

**Q1. Application Discovery**  
- Tool: `run_structural_search_function:applications`
- Result: Found application `JHipster-7.9.3` (no ID presented).
- Disposition: run-returned

**Q2. Application Stats**  
- Tool: `run_structural_search_function:stats(application='JHipster-7.9.3')`
- Result:  
    - Language/types identified: TypeScript, JavaScript, Java, shell/cli, html, Angular
    - Technologies: "angular","html","html templates","java","java properties","javascript","jpa","node.js","shell","shell/cli","spring","typescript","web"
    - Element types listed include: Typescript Method, Typescript Module, Typescript Class, Typescript Function, Typescript Built-in Object
    - No explicit Node.js or TypeScript version info.
- Disposition: run-returned

**Q3. Package Inventory**  
- Tool: `run_structural_search_function:packages(application='JHipster-7.9.3')`
- Result: (see Appendix for all)  
    - Many front-end JS/TS packages, no explicit "typescript" or "node" package found.
    - Sample:  
      - @angular/core.npm v14.2.0, rxjs.npm v7.5.6, ts-jest.npm v28.0.8, zone.js.npm v0.11.6, etc.
    - No explicit Node.js or TypeScript versions, engines fields not present in inventory.
- Disposition: run-returned

**Q4. `package.json` File Presence**  
- Tool: `run_structural_search_function:source_files(application='JHipster-7.9.3', file_path='package.json')`
- Result: File present: `§{main_sources}§/package.json`
- Disposition: run-returned

**Q5. `tsconfig.json`, `.nvmrc`, `.node-version`, other version/engine files**  
- Tools: `source_files` for each
- Result: No matching files found (`tsconfig.json`, `.nvmrc`, `.node-version`, `package-lock.json`, `yarn.lock`, `build.gradle`, `pom.xml`, `Dockerfile`, `Makefile`)
- Disposition: run-returned

**Q6. `package.json` Content Detail**  
- Tool: `run_structural_search_function:source_file_details(application='JHipster-7.9.3', file_path='§{main_sources}§/package.json')`
- Result: 2 elements reported (`package.json`, `jhipster-sample-application`). No version breakdown.
- Disposition: run-returned

### Appendix (GR-04–06 Evidence Table)

| Name/ID or File Path                  | Type                       | Query Type           | Source |  
|---------------------------------------|----------------------------|----------------------|--------|  
| `JHipster-7.9.3` (no ID returned)     | Application                | applications         | CAST   |  
| `Typescript Built-in Objects` (448)   | Typescript Built-in Object | objects              | CAST   |  
| `setupNodeEvents` (518)               | Typescript Method          | objects              | CAST   |  
| `@angular/core` (411)                 | JavaScript Files           | objects/packages     | CAST   |  
| `rxjs` (no ID; v7.5.6)                | JavaScript Files           | packages             | CAST   |  
| `ts-jest` (no ID; v28.0.8)            | JavaScript Files           | packages             | CAST   |  
| `§{main_sources}§/package.json`       | File                       | source_files         | CAST   |  
| `.nvmrc`                              | (not found)                | source_files         | CAST   |  
| `.node-version`                       | (not found)                | source_files         | CAST   |  
| `tsconfig.json`                       | (not found)                | source_files         | CAST   |  
| (Others – see raw log above/available if needed)            |                        |                     |        |

### Query Log

- Q1: applications (all) → 9 apps incl. JHipster-7.9.3 (run-returned)
- Q2: stats (JHipster-7.9.3) → technologies, element types (run-returned)
- Q3: packages (JHipster-7.9.3) → all NPM packages (run-returned)
- Q4: source_files (`package.json`) → present, 1 file (run-returned)
- Q5: source_files (`tsconfig.json`, `.nvmrc`, `.node-version`, others) → not found (run-empty)
- Q6: source_file_details (`package.json`) → basic element list (run-returned)

### Compliance Disposition
- No BCM scope: all queries/app-wide, GR-08 compliance gap flagged in each deliverable.
- No evidence of engines/node/tsconfig lockfiles: flagged as proposal where relevant.
- GR-12/13 N/A; see above.

### Confidence Tiers
- Presence/absence of files: ✅
- Content/compatibility assessment: ⚠️ SME validation required

---
