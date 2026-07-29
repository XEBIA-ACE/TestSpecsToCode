# Quality Standards and Guiding Principles

- All pipeline changes must be peer-reviewed.
- Pipeline scripts must be version-controlled and auditable.
- Build/test steps must halt the deployment on error or test failure.
- Sensitive values (secrets, tokens) must be secured using the platform's vault/secrets features.
- Pipeline definition and changes must be clearly documented for developers.
- Where possible, ensure pipelines are idempotent, fast, and minimize redundant work using cache/artifact actions.
- Clearly log and flag all compliance gaps, including persistent absence of BCM scoping (per GR-08).
- Backward compatibility must be maintained with current code workflow unless explicitly sunset.
- No changes are to be merged without observed pipeline pass and sign-off by at least one project SME.
