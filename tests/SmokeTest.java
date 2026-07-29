package com.shopizer.upgrade;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.boot.SpringBootVersion;
import org.springframework.core.SpringVersion;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.context.ApplicationContext;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestPropertySource(properties = {
        "shopizer.feature.toggle.new-api=true",
        "springdoc.swagger-ui.enabled=true",
        "spring.main.allow-bean-definition-overriding=true"
})
class UpgradeValidationTest {

    @Autowired
    private ApplicationContext context;

    @Value("${shopizer.feature.toggle.new-api}")
    private boolean newApiToggle;

    @Test
    @DisplayName("Validate Spring Boot is upgraded to 3.2.7")
    void testSpringBootVersionIsTarget() {
        assertEquals("3.2.7", SpringBootVersion.getVersion(),
                "Spring Boot version must be exactly 3.2.7");
    }

    @Test
    @DisplayName("Validate Spring Framework is upgraded to 6.1.7")
    void testSpringFrameworkVersionIsTarget() {
        assertEquals("6.1.7", SpringVersion.getVersion(),
                "Spring Framework version must be exactly 6.1.7");
    }

    @Test
    @DisplayName("Validate OpenAPI/Swagger (springdoc-openapi) 3.x is present and Springfox is not")
    void testOpenApiIsPresentAndSpringfoxGone() {
        // Validate @OpenAPIDefinition is present, indicating migration from Springfox
        boolean openApiPresent = context.getBeansWithAnnotation(OpenAPIDefinition.class).size() >= 0
                || context.getBeanNamesForAnnotation(OpenAPIDefinition.class).length >= 0;
        assertDoesNotThrow(
                () -> Class.forName("io.swagger.v3.oas.annotations.OpenAPIDefinition"),
                "springdoc-openapi 3.x must be present"
        );
        // Assert that Springfox' main class is absent
        assertThrows(ClassNotFoundException.class,
                () -> Class.forName("springfox.documentation.spring.web.plugins.Docket"),
                "Springfox should be removed in the target version");
        assertThat(openApiPresent).isTrue();
    }

    @Test
    @DisplayName("Critical application path: /api/v1/health responds after upgrade")
    void testCriticalHealthEndpointAvailable() {
        org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
        String url = "http://localhost:8080/api/v1/health";
        assertDoesNotThrow(() -> {
            String response = restTemplate.getForObject(url, String.class);
            assertThat(response).contains("UP");
        }, "Health endpoint must respond and signal application is running after upgrade.");
    }

    @Test
    @DisplayName("New configuration keys from upgrade are loaded")
    void testNewConfigKeysLoaded() {
        assertTrue(newApiToggle, "Property 'shopizer.feature.toggle.new-api' must be loaded and true");
        assertEquals("true", context.getEnvironment().getProperty("springdoc.swagger-ui.enabled"),
                "Property 'springdoc.swagger-ui.enabled' must be loaded");
        assertEquals("true", context.getEnvironment().getProperty("spring.main.allow-bean-definition-overriding"),
                "Property 'spring.main.allow-bean-definition-overriding' must be loaded");
    }

    @Test
    @DisplayName("Deprecated Commons Collections/FileUpload classes are not on classpath")
    void testDeprecatedCommonsClassesAbsent() {
        assertThrows(ClassNotFoundException.class,
                () -> Class.forName("org.apache.commons.collections.Bag"),
                "commons-collections deprecated classes should not be present");
        assertThrows(ClassNotFoundException.class,
                () -> Class.forName("org.apache.commons.fileupload.FileUpload"),
                "commons-fileupload deprecated classes should not be present");
    }
}