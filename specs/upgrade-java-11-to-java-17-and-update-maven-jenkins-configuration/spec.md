# Upgrade Java 11 to Java 17 and Update Maven/Jenkins Configuration

## Business Requirement

This feature upgrades the Shopizer-3.2.5 application to use Java 17 (from Java 11) for both build and runtime, including updating all Maven wrapper configurations (maven-wrapper.properties) and ensuring all project-level pom.xml files are compatible. Jenkins configuration/scripts should be reviewed if present, but no Jenkinsfiles or workflow definitions were surfaced in CAST. This requirement and scope comes from a non-CAST source. All technical CAST assertions are cited separately.

## Scope Limitations
- Target application: Shopizer-3.2.5 (CAST: "Shopizer-3.2.5")
- No Business Capability Model (BCM) scoping provided (GR-08 standing compliance gap).
- No explicit Jenkinsfile/CI/CD found, so Jenkins-specific instructions may require SME validation.
- No property or config file captured in CAST directly referencing Java version.

## Out of Scope
- Batch, job, or message-listener entry points (not required/queried).
- Upgrades outside repo/project files scanned by CAST (e.g., external Jenkins or CI infra).
- N/A for fine-grained or batch boundaries (see GR-12/13).

## Compliance/Validation Flags
- Application-wide queries due to missing BCM (GR-08).
- SME validation required for Jenkins/CI—may exist outside CAST scan.

## Boundaries
- GR-12/13: Not applicable for upgrade (no split required).
