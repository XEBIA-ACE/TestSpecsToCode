# Ordered Actionable Tasks

1. **Manual Repository Inspection**  
   - Since CAST Imaging found no pipeline/workflow/CI automation code, inspect the Shopizer repository (especially the root and `.github`/`.ci`/`jenkins` folders) for existing YAML, Jenkinsfile, or other pipeline definitions.

2. **Pipeline Tool and Runner Selection**  
   - Document and confirm the intended pipeline executor (e.g., GitHub Actions, GitLab, Jenkins).  
   - Reference: Shopizer's detected technologies support a wide variety of runners (see Research.md).

3. **Draft Pipeline YAML/Scripts**  
   - Draft or update YAML/Jenkinsfile/other for the chosen tool with jobs for build, test, and artifact.

4. **Environment and Variable Verification**  
   - Ensure all required environment variables and build secrets are available to the pipeline runner.

5. **Test Dry Run**  
   - Commit pipeline configuration in a feature branch and verify all steps (build, test, publish) execute as intended.

6. **Document Pipeline Usage and Troubleshooting**  
   - Write/Update documentation for pipeline configuration and operation.

7. **Flag Compliance on Missing BCM Scope**  
   - Note persistence of GR-08 compliance gap in pipeline and documentation artifacts.
