# CAST Appendix

## Application/Discovery
- Shopizer-3.2.5 discovered as application (Source: CAST MCP — structural: applications / Shopizer-3.2.5 / 1)

## Build/Config Files
- Detected maven-wrapper.properties files:
    - sm-shop/.mvn/wrapper/maven-wrapper.properties (ID: 8497)
    - sm-shop-model/.mvn/wrapper/maven-wrapper.properties (ID: 8528)
    - sm-core/.mvn/wrapper/maven-wrapper.properties (ID: 12906)
    - sm-core-modules/.mvn/wrapper/maven-wrapper.properties (ID: 13264)
    - sm-core-model/.mvn/wrapper/maven-wrapper.properties (ID: 13347)
  (Source: CAST MCP — structural: object_details / name:contains:maven-wrapper.properties,type:contains:file / 5)
- Detected pom.xml files (not addressable as objects): root + submodules (Source: CAST MCP — structural: source_files / pom.xml / 6)
- No Jenkinsfiles, Github Actions, or other CI/CD scripts found as source code or objects (multiple 'source_files' and 'object_details' queries on "jenkins", "github", etc.; all empty per query log).
- 12 explicit shopizer-core.properties or shopizer-properties.properties and 6+ application.properties discovered (Source: CAST MCP — structural: object_details / name:contains:shopizer,type:contains:properties / 12); none reference Java version (manual check recommended).

## Quality Issues (CAST Structural Flaws)
- "Avoid empty catch blocks for methods with high fan-in" — 2 occurrences.
- "Avoid reflected cross-site scripting (non persistent)" — 2 occurrences.
- "Avoid cross-site scripting through API requests" — 73 occurrences.
(Source: CAST MCP — structural: quality_insights / nature:structural-flaws / 3 rules surfaced)

## Query Log
- All queries, attempts, and result counts recorded inline by query (see above for references; all queries either run-returned or run-empty, no omission).
- BCM scope not provided; all queries ran app-wide—compliance gap logged (GR-08).
- GR-12/13 batch/boundaries: N/A for this upgrade.
- CAST snapshot ID not exposed (GR-03 compliance statement present).

# Confidence/Compliance Flags
- All object/file assertions directly tied to CAST query log; anything outside (like Jenkins/CI) must be validated by SME/owner. All findings above are tiered as ✅ direct CAST results or ⚠️ SME/owner validation required.
