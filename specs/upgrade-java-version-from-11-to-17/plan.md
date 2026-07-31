# PLAN: Java Version Upgrade (11 → 17)

## Overview

**Migration Strategy:**  
Big-bang approach. The main risk in upgrading the Java runtime is moderate, as per the upgrade option "moderate", but overall upgrade effort is manageable when performed in a single, coordinated release. This approach ensures that all team members and CI/CD steps are aligned and compatibility issues are surfaced quickly. Parallel environments or feature flags are unnecessary for a language upgrade of medium risk and moderate effort, provided strong testing and a clear rollback path.

## Phases

| Phase              | Description                                              | Dependencies         | Estimated Effort |
|--------------------|---------------------------------------------------------|----------------------|------------------|
| 1. Preparation     | Update build tools, test in Java 17 locally             | None                 | 1 person-day     |
| 2. Code Upgrade    | Refactor code for Java 17 compatibility (if needed)     | Phase 1              | 2 person-days    |
| 3. CI/CD Update    | Update CI/CD, Docker, infrastructure configs to Java 17 | Phase 2              | 1 person-day     |
| 4. Testing         | Run test suites, fix discovered issues                  | Phase 3              | 2 person-days    |
| 5. Release         | Deploy to production                                   | Phase 4              | 1 person-day     |

*Effort is based on "moderate" upgrade option; adjust if more definitive info is obtained.*

## Component Changes

- **Structural Changes:**  
  - Source code files: Update `pom.xml`/`build.gradle` `sourceCompatibility`/`targetCompatibility` from 11 to 17 (file names inferred from standard Java project structures — adjust as needed).
  - Investigate usage of deprecated/removed APIs incompatible with Java 17.
- **Affected Files:**  
  - All `.java` source files (possible language feature usage).
  - Build configuration files (`pom.xml`, `build.gradle`, or equivalent).
  - Any scripts referencing the Java version (`Dockerfile`, shell scripts).
- **APIs Modified:**  
  - N/A — language upgrade, not specific API changes, but must update code making use of removed/deprecated Java SE APIs.

## Dependency Upgrade Plan

| Dependency      | Current Version | Target Version | Breaking Changes                                              | Migration Notes                                    |
|-----------------|----------------|---------------|--------------------------------------------------------------|----------------------------------------------------|
| Java Runtime    | 11             | 17            | Several deprecated APIs removed; stricter module encapsulation| See [Oracle Java 17 migration guide](https://docs.oracle.com/en/java/javase/17/migrate/)           |

## Infrastructure Changes

- **Docker Base Image:**  
  - Update any `Dockerfile` specifying `FROM openjdk:11` (or equivalent) to `FROM openjdk:17`.
- **Kubernetes Manifest:**  
  - TODO — not specified in context.
- **CI/CD Pipeline:**  
  - Update build agents/runners to use Java 17.
  - Update config files (e.g., `.github/workflows/*`, `.gitlab-ci.yml`) to reference Java 17.
- **IaC Updates:**  
  - TODO — not specified in context.

## Rollback Strategy

- **Phase 1:** Revert build config files and developer instructions to reference Java 11.
- **Phase 2:** Revert any code changes strictly required for Java 17 compatibility.
- **Phase 3:** Update CI/CD and Dockerfiles back to Java 11.
- **Phase 4:** Re-run tests in Java 11 environment, confirm all tests pass.
- **Phase 5:** Redeploy production using previous stable Java 11 artifacts/images.

Each phase can be independently reversed by restoring prior versions from version control.

## Testing Strategy

- **Unit Tests:**  
  - Run all existing unit tests with Java 17.
  - Coverage target: ≥90% (if coverage tool in place; otherwise, ensure routine coverage).
  - Tooling: `JUnit` or project default.
- **Integration Tests:**  
  - Run all integration tests in Java 17 environment.
  - Triggered in CI after build.
- **Regression Tests:**  
  - End-to-end functional validation using existing regression test packs.
  - Compare results between Java 11 and Java 17 to catch subtle changes.
- **Performance Tests:**  
  - Optional: Run smoke performance tests to detect regressions.
- **CI Gates:**  
  - All test suites must pass on Java 17 before merging to `main`.

## Timeline

| Milestone            | Phase          | Estimated Completion     | Owner           |
|----------------------|---------------|-------------------------|-----------------|
| Upgrade Preparation  | Phase 1       | +1 day from project start| TODO            |
| Code Refactoring     | Phase 2       | +3 days                  | TODO            |
| Infra/CI Migration   | Phase 3       | +4 days                  | TODO            |
| Validation & Testing | Phase 4       | +6 days                  | TODO            |
| Production Release   | Phase 5       | +7 days                  | TODO            |

## Additional Notes

- If additional libraries/binaries are found to be incompatible, raise as blockers to the upgrade.
- If technology stack detail (framework/build tool/runtime) emerges, update the plan with specifics.

*For all sections not addressed above:*  
**N/A — not applicable to this task**