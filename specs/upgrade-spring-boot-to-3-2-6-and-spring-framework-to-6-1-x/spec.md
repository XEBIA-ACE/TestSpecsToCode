## Modernization Specification: Spring Boot 3.2.6 & Spring Framework 6.1.x

### Scope
Upgrade codebase dependencies to:
- Spring Boot version 3.2.6
- Spring Framework version 6.1.x

### Current State (tool-based findings)
- **No Spring Boot, Spring Framework, or their build files (pom.xml/build.gradle) were detected** using find_symbol, fulltext_search, search_code, or iac_index. No `@SpringBootApplication` annotation or import found.
- **Dependency analysis:** SBOM scan (get_dependency_report) found no dependencies or manifests in the repo.
- **Structural analysis:** Core logic is implemented as Java classes under modules like `facade`, `model`, and `service` (see module_dependency_graph). Controllers/facades interact with models via strong coupling (e.g., between `CustomerFacadeImpl.java` and `Customer.java`).
- **Complexity hotspots:** High fan-out in populators, mappers, and facade classes, as shown by cyclomatic_complexity report.
- **Dead code:** No substantial dead code was detected.

### Required Modernization Actions
1. **Build Artifacts:**
   - Restore or introduce `pom.xml` or `build.gradle`. Set Spring dependencies to target versions.
2. **Framework Upgrade:**
   - Refactor main modules (likely in `sm-shop` and `sm-core`) to use/refresh Spring Boot idioms, add `@SpringBootApplication` if absent.
   - Update any API usages to be compatible with Spring Boot 3/Spring Framework 6 APIs.
3. **Address Hotspots:**
   - Prioritize testing and review for complexity hotspots listed in the cyclomatic_complexity results.
4. **Testing:**
   - Restore or enhance test frameworks for upgrade, given current high coupling and lack of spring artifacts detected.
5. **Documentation:**
   - Record all dependency, API, and configuration changes for onboarding and ops reference.

### Limitations
- With build files missing, infer requirements from module and file structure only (see research log entries and module_dependency_graph). No spring-specific build/plugin configuration could be located in the codebase at this time.