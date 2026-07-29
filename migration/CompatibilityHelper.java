package com.shopizer.migration;

import java.util.Map;
import java.util.HashMap;
import java.util.Properties;

// PACKAGE RENAMES/ALIASES
// Springfox (Swagger) classes have been replaced by springdoc-openapi equivalents.
// Re-export old classes/interfaces where feasible and map to new ones.
import org.springdoc.core.models.GroupedOpenApi;
import io.swagger.v3.oas.models.OpenAPI;

// CONFIG FORMAT CHANGES
// Spring Boot 3.x uses a different config structure than 2.x in some areas.
public class MigrationCompat {

    /**
     * Shim for deprecated org.springframework.boot.web.servlet.ServletRegistrationBean.
     * This method wraps the new org.springframework.boot.web.servlet.ServletRegistrationBean API.
     * TODO: Manual intervention may be required if custom behavior was implemented with the old API.
     */
    @Deprecated
    public static org.springframework.boot.web.servlet.ServletRegistrationBean<?> createServletRegistration(
            javax.servlet.Servlet servlet, String... urlMappings) {
        // Spring Boot 3.x API is backwards compatible for constructor usage.
        return new org.springframework.boot.web.servlet.ServletRegistrationBean<>(servlet, urlMappings);
    }

    /**
     * Shim for replaced Swagger (Springfox) config via springdoc-openapi.
     * TODO: Manual migration of Docket bean definitions to GroupedOpenApi is required.
     * This method provides a basic mapping helper.
     */
    @Deprecated
    public static GroupedOpenApi swaggerDocketToGroupedOpenApi(String groupName, String... packagesToScan) {
        // Only basic transformation is automated.
        return GroupedOpenApi.builder().group(groupName).packagesToScan(packagesToScan).build();
    }

    /**
     * Shim for deprecated org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter.
     * Direct inheritance is no longer supported; use the interface instead.
     * This method returns a lambda-based WebMvcConfigurer.
     * TODO: Manual refactoring is required for any subclass usage.
     */
    @Deprecated
    public static org.springframework.web.servlet.config.annotation.WebMvcConfigurer getWebMvcConfigurer(
            Runnable addCorsMappings,
            Runnable addInterceptors) {
        // Provide a lambda-based adapter to satisfy immediate compilation.
        return new org.springframework.web.servlet.config.annotation.WebMvcConfigurer() {
            @Override
            public void addCorsMappings(org.springframework.web.servlet.config.annotation.CorsRegistry registry) {
                if (addCorsMappings != null) addCorsMappings.run();
            }
            @Override
            public void addInterceptors(org.springframework.web.servlet.config.annotation.InterceptorRegistry registry) {
                if (addInterceptors != null) addInterceptors.run();
            }
            // TODO: Manually port other overridden methods as needed.
        };
    }

    /**
     * Shim for deprecated springfox.documentation.swagger2.annotations.EnableSwagger2.
     * In Springdoc-OpenAPI, use @OpenAPIDefinition and related annotations instead.
     * This class acts as a marker for migration.
     * TODO: Replace all @EnableSwagger2 annotations with @OpenAPIDefinition manually.
     */
    @Deprecated
    public @interface EnableSwagger2MigrationShim {}

    /**
     * Migrates old Spring Boot 2.x style config Properties to Boot 3.x compatible Properties.
     * Handles common property changes known from upgrade context.
     * 
     * @param oldProps old Properties object (from application.properties or yaml flattening)
     * @return new Properties object with migrated keys/values
     */
    public static Properties migrateSpringBootConfig(Properties oldProps) {
        Properties newProps = new Properties();
        for (Map.Entry<Object, Object> entry : oldProps.entrySet()) {
            String key = String.valueOf(entry.getKey());
            String value = String.valueOf(entry.getValue());

            // Spring Boot 3.x: management.endpoints.web.exposure.include replaces management.endpoints.web.expose
            if ("management.endpoints.web.expose".equals(key)) {
                newProps.setProperty("management.endpoints.web.exposure.include", value);
                continue;
            }
            // Spring Boot 3.x: server.servlet.context-path replaces server.contextPath
            if ("server.contextPath".equals(key)) {
                newProps.setProperty("server.servlet.context-path", value);
                continue;
            }
            // Spring Boot 3.x: spring.web.resources.static-locations replaces spring.resources.static-locations
            if ("spring.resources.static-locations".equals(key)) {
                newProps.setProperty("spring.web.resources.static-locations", value);
                continue;
            }
            // Add more property migrations as required by Shopizer upgrade context

            // By default, copy unchanged
            newProps.setProperty(key, value);
        }
        return newProps;
    }

    /**
     * Shim for commons-collections API.
     * As these libraries are scheduled for upgrade/removal due to CVEs,
     * usage should be migrated to java.util equivalents.
     * TODO: Manually refactor usages of org.apache.commons.collections.* to java.util.* or safer alternatives.
     */

    /**
     * Shim for commons-fileupload API.
     * See upgrade documentation for secure alternatives.
     * TODO: Manually replace usages of org.apache.commons.fileupload.* with recommended secure alternatives.
     */

    /**
     * TODO: For full migration to Spring Framework 6.1.x, ensure all javax.* imports (especially javax.persistence, javax.validation) 
     * are changed to their jakarta.* equivalents.
     * This cannot be reliably shimmed—search for all 'javax.' imports and update them to 'jakarta.' as per the upgrade guide.
     */
}