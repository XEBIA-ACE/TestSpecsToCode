# Design Principles and Quality Standards

- All facts and file attributions are traceable to CAST query results (see Research Appendix).
- No undocumented configuration or code changes — all updates to explicitly discovered files/objects only.
- Code/test all changes for complete Java 17 compatibility, including Maven wrapper and plugin configuration.
- Compliance with security/quality fixes as indicated by CAST structural findings when impacted by Java 17 upgrade.
- Seek SME clarification/approval for Jenkins/CI updates, since no config found in repo.
- Maintain backward compatibility unless prohibited by Java 17 incompatibility.
- Document all upgrade-related decisions for developer onboarding and operational support.
