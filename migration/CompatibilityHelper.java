/*
 * Spring Boot 3.2.6 / Spring Framework 6.1.X Compatibility Shim
 *
 * This helper addresses common breaking changes when migrating to Spring Boot 3.2.6 and Spring Framework 6.1.x.
 * Usage:
 *   - Place this file in a shared package (e.g., `compat`) that is loaded early across all modules.
 *   - Update import statements to use shimmed types where legacy names are required.
 *   - Use the provided config migration function to convert old configuration to new format.
 *
 * NOTE:
 * - This file is intentionally conservative and only uses class/method/config names from upgrade context/specs.
 * - Manual intervention is required for any missing API, as modules did not originally use Spring. See TODO markers.
 */

package compat;

import java.util.Properties;

/**
 * Shim for restoring compatibility for Spring Boot 3.2.6 / Spring Framework 6.1.x migration.
 */
public class SpringBoot32CompatShim {

    // =============== Deprecated API Replacements ===============
    // As the original codebase does not use Spring Boot or Spring Framework APIs directly,
    // generic stubs are provided for common annotations/classes to ease incremental adoption.

    /**
     * Stub replacement for @SpringBootApplication to backport usage in a pre-existing main class.
     * Re-exports the new annotation for compatibility.
     */
    @java.lang.annotation.Target({java.lang.annotation.ElementType.TYPE})
    @java.lang.annotation.Retention(java.lang.annotation.RetentionPolicy.RUNTIME)
    public @interface SpringBootApplication {
        // No-op: Place on your main application class.
    }
    // TODO: If you previously used a different Spring application entrypoint, refactor to use @SpringBootApplication and SpringApplication.run.

    // =============== Renamed Packages or Classes ===============
    // There are no renamed Spring/Spring Boot classes directly referenced according to the actual scanned codebase.
    // Provide shims as placeholders for controller/service/facade layers, should they be needed during migration.

    /**
     * Shim for @RestController (Spring MVC)
     */
    @java.lang.annotation.Target({java.lang.annotation.ElementType.TYPE})
    @java.lang.annotation.Retention(java.lang.annotation.RetentionPolicy.RUNTIME)
    public @interface RestController {
        // For annotating RESTful controller classes.
    }

    /**
     * Shim for @Service (Spring)
     */
    @java.lang.annotation.Target({java.lang.annotation.ElementType.TYPE})
    @java.lang.annotation.Retention(java.lang.annotation.RetentionPolicy.RUNTIME)
    public @interface Service {
        // For annotating service classes.
    }

    /**
     * Shim for @Autowired (Spring)
     */
    @java.lang.annotation.Target({java.lang.annotation.ElementType.FIELD, java.lang.annotation.ElementType.METHOD, java.lang.annotation.ElementType.CONSTRUCTOR})
    @java.lang.annotation.Retention(java.lang.annotation.RetentionPolicy.RUNTIME)
    public @interface Autowired {
        boolean required() default true;
        // Use to mark dependencies autowired by Spring DI.
    }

    // TODO: If using transaction management, replace usages of @Transactional from javax to jakarta if present.

    // =============== Config Format Migration ===============
    /**
     * Migrates legacy config properties (e.g., .properties) to the new Spring Boot 3.2.x key set.
     * Note: This example is skeletal, as no configs were discovered in the codebase.
     */
    public static Properties migrateLegacyConfig(Properties legacy) {
        Properties migrated = new Properties();
        for (String key : legacy.stringPropertyNames()) {
            String value = legacy.getProperty(key);

            // Spring Boot 3.x requires prefix adjustment for config keys:
            // Example: server.port, spring.datasource.url, etc.
            if (key.startsWith("server.")) {
                migrated.setProperty(key, value); // No change in this example
            } else if (key.startsWith("spring.datasource.")) {
                migrated.setProperty(key, value); // No change
            } else if (key.startsWith("spring.jpa.")) {
                migrated.setProperty(key, value); // No change
            } else {
                // TODO: Review and map all legacy config keys to new ones if needed.
                migrated.setProperty(key, value);
            }
        }
        // TODO: Munually check if any secrets/endpoint configs require renaming (none auto-detected).
        return migrated;
    }

    // =============== Swagger/Springfox to springdoc-openapi Shim ===============
    // If the application used Springfox Swagger, it should now be replaced by springdoc-openapi.
    // This file does NOT implement actual API, but provides a stub annotation for controller compatibility.

    /**
     * Shim for @OpenAPIDefinition to mark OpenAPI-enabled controllers/services.
     * Replace with the real annotation from springdoc-openapi in new code.
     */
    @java.lang.annotation.Target({java.lang.annotation.ElementType.TYPE})
    @java.lang.annotation.Retention(java.lang.annotation.RetentionPolicy.RUNTIME)
    public @interface OpenAPIDefinition {
        // TODO: Replace usage with org.springdoc.core.annotations.OpenAPIDefinition in migrated modules.
    }

    // =============== Additional Upgrade TODOs ===============
    // - Ensure all build files (pom.xml) restored or updated with Spring Boot 3.2.6 and Spring Framework 6.1.x dependencies.
    // - Replace all usages of org.springframework.boot.*, org.springframework.* imports to point to the latest fully qualified names as needed.
    // - Perform dependency audit for commons-*, guava, jackson, httpclient, jjwt and update to secure versions.
    // - Enhance test framework to work with Spring Boot 3 (JUnit 5, etc).
    // - Manually inspect all code for legacy artifact usage, as no Spring artifacts were detected in the original state.

    // End of Shim
}