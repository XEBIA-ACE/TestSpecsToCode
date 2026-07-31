### Upgrade Project Task List

**A. Inventory and Analysis**
1. Review all Spring Beans (`OrderTotalService (21201)` and others — see Appendix) for upgrade impact.
2. Review all listed Spring MVC Operations (`Spring MVC Get Operation`, `Spring MVC Post Operation`, `Spring MVC Put Operation`, `Spring MVC Delete Operation`, etc.) as detailed in the Appendix.

**B. Build and Configuration**
3. Locate build files (paths from Appendix or source repository) and change Spring Boot/Spring Framework dependency versions to 3.2.6/6.1.7.

**C. Code Migration**
4. Refactor Java source files for Spring upgrade compatibility:
   - Search for deprecated Spring Boot/Spring annotations, classes, or patterns.
   - Adapt code to comply with Spring 3.x/6.x requirements.

**D. Testing**
5. Re-test all endpoints (CRUD, REST, etc.; see object list in Appendix) to ensure behavior is unchanged after the upgrade.

**E. Documentation and Signoff**
6. Document code changes and configuration updates performed.
7. Record and flag the lack of BCM scope as a compliance gap per GR-08.
