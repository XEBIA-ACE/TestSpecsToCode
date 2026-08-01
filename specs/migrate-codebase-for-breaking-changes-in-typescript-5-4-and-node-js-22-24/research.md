# Research and CAST Traceability — Appendix

## Query Log Summary (see object citations below for compliance tier)
**CAST Snapshot:** No snapshot ID returned (standard for current Imaging configuration).

1. applications (run-returned): Found JHipster-7.9.3 (id not shown)
2. stats (run-returned): Application statistics for JHipster-7.9.3; confirmed presence of types [Typescript, JavaScript, Angular, etc.]
3. packages (run-returned): Package inventory for JHipster-7.9.3, 18 line items (see below)
4. objects type:contains:typescript (run-returned): Large set of Typescript Classes/Interfaces/Modules/etc. (example, AccountService (2627))
5. objects type:contains:node.js (run-empty): No objects of this type found in MCP
6. objects type:contains:javascript (run-returned): JavaScript source/functions found; package objects and file-based JS code (see object list)
7. objects name:contains:webpack (run-empty): No matches, flagged
8. objects name:contains:package.json (run-empty): No matches, flagged
9. objects name:contains:tsconfig (run-empty): No matches, flagged
10. objects name:contains:test (run-returned): Found Typescript test modules and related files
11. objects name:contains:node (run-returned): Setup/config methods, e.g., setupNodeEvents (518) in cypress.config.ts
12. objects name:contains:angular (run-returned): Angular package bindings and exposed functions (see list)
13. objects name:contains:types (run-returned): Typescript Built-in Objects present (see list)
14. objects name:contains:main (run-returned): MainComponent (1231, 2673), main.ts (1121), main.component.ts (1092) and Java server main classes
15. objects name:contains:config (run-returned): Typescript and Java config/service/module/component/artifacts; no build configs surfaced
16. objects name:contains:build (run-returned): Java build/configuration classes only; no Node/TS/JS build system found

## Object/Artifact Appendix

### Key Packages/Versions (run-returned, see Query #3)
- @angular/common (406), version 14.2.0
- @angular/core (411), version 14.2.0
- @angular/forms (405), version 14.2.0
- @angular/platform-browser (415), version 14.2.0
- @angular/platform-browser-dynamic (410), version 14.2.0
- @angular/router (416), version 14.2.0
- @angular/service-worker (418), version 14.2.0
- @fortawesome/angular-fontawesome (408), 0.11.1
- @fortawesome/free-solid-svg-icons (407), 6.2.0
- @ng-bootstrap/ng-bootstrap (404), 13.0.0
- @ngx-translate/core (402), 14.0.0
- @ngx-translate/http-loader (414), 7.0.0
- cypress (417), 10.7.0
- ngx-infinite-scroll (403), 14.0.0
- ngx-webstorage (401), 10.0.1
- rxjs (409), 7.5.6
- ts-jest (413), 28.0.8
- zone.js (412), 0.11.6

### Key Typescript/Angular Classes (partial, run-returned, see Query #4)
- Account (2626), AccountModule (2575), AccountService (2627), ActivateComponent (2576), AppModule (447), AppRoutingModule (2622)
- MainComponent (2673, 1231), ConfigurationComponent (2590, 1193), ConfigurationModule (2591), ConfigurationService (2592)
- setupNodeEvents (518), StateStorageService (2629), HomeComponent (2669), BankAccountService (2646), etc.

### JavaScript Functions/Files (run-returned, see Query #6)
- environment.js (512), jest.conf.js (449), index.html.onload/showError (1124/1123), proxy.conf.js (513/setupProxy 1125), etc.

### Config/Build/Test Files in MCP (run-empty or run-returned)
- cypress.config.ts (953), testcontainers.properties (14577), *.test-samples.ts (1051, 1066, ...), translation.config.ts (1028), uib-pagination.config.ts (1029)

## Not Available (❌ queries)
- Node.js application/server entrypoints and runtime files: Not available in CAST MCP — [objects type:contains:node.js]
- package.json, tsconfig.json, webpack: Not available in CAST MCP — [objects name:contains:package.json, tsconfig, webpack]

## Confidence Tier Key
- ✅ direct CAST result
- ⚠️ structurally inferred/SME validation required
- ❌ ran and empty/no result

## Compliance Gaps
- All queries run at app-wide level per absence of BCM/subsystem scope — compliance gap noted as required by GR-08.
