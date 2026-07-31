package com.example.migration;

import java.util.Properties;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.IOException;

// Shim for breaking changes introduced in upgrade to Spring Boot 3.2.6

// --- PACKAGE NAMESPACE COMPATIBILITY (javax → jakarta) ---
// Jakarta EE: auto-reexport selected javax namespaces as jakarta for legacy code.
//
// TODO: Review for lingering javax imports in hand-written code (esp. javax.servlet.*, javax.validation.*).
//       Example: javax.servlet.* → jakarta.servlet.*
//       For interfaces/classes used, create delegates as needed.

import jakarta.servlet.http.HttpServletRequest; // renamed from javax.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse; // renamed from javax.servlet.http.HttpServletResponse

// Deprecated API Wrappers
public class SpringBootCompatibilityShim {

    // --- DEPRECATED API REPLACEMENTS ---

    /**
     * Shim for org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter (removed in SB3+)
     * Usage: extend this class instead of the removed Adapter.
     *
     * TODO: Replace inheritance with direct implementation of WebMvcConfigurer.
     */
    @Deprecated
    public static abstract class WebMvcConfigurerAdapterShim implements org.springframework.web.servlet.config.annotation.WebMvcConfigurer {
        // All methods have default signatures in the interface since Spring 5.
    }

    // --- SPRINGFOX → SPRINGDOC MIGRATION SHIMS ---
    /**
     * Swagger 2.x (Springfox) classes are not compatible with Spring Boot 3.x.
     * For compatibility, export an empty stub to avoid compilation errors during migration.
     *
     * TODO: Fully migrate configurations to springdoc-openapi.
     */
    @Deprecated
    public static class Docket {
        // No-op: present for transitional compile-time compatibility only.
        public static Docket swagger2() { return new Docket(); }
    }

    /**
     * Shim for commonly used springfox annotation.
     * TODO: Replace @ApiOperation, @ApiModel annotations with springdoc-openapi equivalents.
     */
    @Deprecated
    public @interface ApiOperation {
        String value() default "";
        String notes() default "";
    }

    // --- CONFIG FORMAT MIGRATION ---

    /**
     * Migrates legacy application.properties format to new Spring Boot 3.2.x compatible format.
     * - Renames any property keys with changed names.
     * - Removes obsolete properties.
     * - Optionally writes to an output stream.
     *
     * TODO: Extend mapping for project-specific property changes not listed here.
     */
    public static Properties migrateProperties(Properties legacyProperties) {
        Properties migrated = new Properties();

        // Example property key change: server.servlet.context-path (unchanged in SB3 but add as pattern)
        // Example obsolete key: security.basic.enabled (removed in SB2+)
        for (String key : legacyProperties.stringPropertyNames()) {
            String value = legacyProperties.getProperty(key);

            switch (key) {
                // Obsolete property example (must be removed)
                case "security.basic.enabled":
                    // Removed property; skip
                    break;
                // Example: Rename (pattern only, update as needed)
                // case "old.property.name": migrated.setProperty("new.property.name", value); break;
                default:
                    // No migration needed; copy as is
                    migrated.setProperty(key, value);
            }
        }

        return migrated;
    }

    /**
     * Loads a legacy properties file, migrates it, and writes to output.
     * @param in InputStream of legacy config
     * @param out OutputStream for migrated config
     */
    public static void migrateConfigFile(InputStream in, OutputStream out) throws IOException {
        Properties oldProps = new Properties();
        oldProps.load(in);

        Properties newProps = migrateProperties(oldProps);
        newProps.store(out, "Migrated to Spring Boot 3.2.x compatible format");
    }


    // --- DEPRECATED APACHE COMMONS DEPS REMINDER ---
    // TODO: Replace usage of (or transitively exclude) commons-collections, commons-fileupload with maintained alternatives.
    //       This requires manual dependency and import update.

    // --- DEAD CODE AUDIT REMINDER ---
    // TODO: Review flagged dead code classes:
    //         - AbstractUserConnection
    //         - ApplicationSearchConfiguration
    //       for manual removal once regression tests pass.

    // --- REGRESSION HOTSPOTS REMINDER ---
    // TODO: Run extended tests on:
    //         - OrderTest.java
    //         - ReadableProductPopulator.java
    //       to confirm fan-out code is stable.

    // --- JAKARTA NAME MIGRATION: SERVLET REQUEST/RESPONSE SHIM EXAMPLES ---
    // Example: Re-export for legacy compatibility.
    public static class HttpServletRequestShim extends jakarta.servlet.http.HttpServletRequestWrapper {
        public HttpServletRequestShim(HttpServletRequest request) {
            super(request);
        }
    }

    public static class HttpServletResponseShim extends jakarta.servlet.http.HttpServletResponseWrapper {
        public HttpServletResponseShim(HttpServletResponse response) {
            super(response);
        }
    }

    // TODO: Add further shims for renamed classes as they are discovered in codebase during upgrade.
}