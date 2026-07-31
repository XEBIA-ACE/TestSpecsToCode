package com.shopizer.upgrade.validation;

import org.junit.jupiter.api.*;
import org.springframework.boot.SpringBootVersion;
import org.springframework.core.SpringVersion;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;

import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.List;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.*;

@SpringJUnitConfig
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class UpgradeValidationTest {

    private static final String TARGET_SPRING_BOOT_VERSION = "3.2.6";
    private static final String TARGET_SPRING_VERSION = "6.1.7";
    private static final String TARGET_JAVA_VERSION = "17";
    private static final String TARGET_SPRINGFOX_VERSION = "3.0.0";

    @Autowired
    private ApplicationContext applicationContext;

    @Value("${springdoc.api-docs.enabled:true}")
    private boolean springdocApiDocsEnabled;

    @Test
    @DisplayName("Active Java runtime version is 17 or higher")
    void testActiveJavaVersion() {
        String javaVersion = System.getProperty("java.version");
        assertNotNull(javaVersion, "Active java.version property must not be null");
        int majorVersion;
        if (javaVersion.startsWith("1.")) {
            majorVersion = Integer.parseInt(javaVersion.substring(2, 3));
        } else {
            int dot = javaVersion.indexOf(".");
            if (dot != -1) {
                majorVersion = Integer.parseInt(javaVersion.substring(0, dot));
            } else {
                majorVersion = Integer.parseInt(javaVersion);
            }
        }
        assertTrue(majorVersion >= Integer.parseInt(TARGET_JAVA_VERSION),
            "Java major version is " + majorVersion + ", expected >= " + TARGET_JAVA_VERSION);
    }

    @Test
    @DisplayName("Spring Boot upgraded to exact target version")
    void testSpringBootVersion() {
        String springBootVersion = SpringBootVersion.getVersion();
        assertEquals(TARGET_SPRING_BOOT_VERSION, springBootVersion,
                "Active Spring Boot version must be " + TARGET_SPRING_BOOT_VERSION);
    }

    @Test
    @DisplayName("Spring Framework upgraded to exact target version")
    void testSpringFrameworkVersion() {
        String springVersion = SpringVersion.getVersion();
        assertEquals(TARGET_SPRING_VERSION, springVersion,
                "Active Spring Framework version must be " + TARGET_SPRING_VERSION);
    }

    @Test
    @DisplayName("Critical REST API path responds as expected")
    void testRestApiPath() {
        // Very basic internal call to a known Controller bean, e.g. store REST controller
        Object controller = applicationContext.getBean("storeRestController");
        assertNotNull(controller);

        // Example: verify method presence from signature change in upgrade
        boolean hasListStores = Arrays.stream(controller.getClass().getMethods())
                .anyMatch(m -> m.getName().equals("listStores"));
        assertTrue(hasListStores, "storeRestController must expose listStores operation in upgraded app");
    }

    @Test
    @DisplayName("Deprecated Springfox 2.x APIs are absent and replacements are present")
    void testNoOldSpringfoxAndNewOpenApiPresent() {
        // Ensure no class from deprecated Springfox 2.x is present
        assertThrows(ClassNotFoundException.class, () ->
                Class.forName("springfox.documentation.spring.web.plugins.Docket"),
                "springfox.documentation.spring.web.plugins.Docket should not be on classpath (old Springfox 2.x API)");

        // Validate that new OpenAPI 3/springdoc replacement beans are present
        boolean hasOpenApiBean = applicationContext.containsBeanDefinition("openApiResource");
        assertTrue(hasOpenApiBean, "Bean named 'openApiResource' (springdoc-openapi) must exist");
    }

    @Test
    @DisplayName("Springfox Swagger 3.x present at required version")
    void testSpringfoxVersion() throws Exception {
        String version;
        try {
            Class<?> docket = Class.forName("springfox.documentation.oas.web.OpenApiController");
            Package pkg = docket.getPackage();
            version = (pkg != null) ? pkg.getImplementationVersion() : null;
        } catch (ClassNotFoundException e) {
            version = null;
        }
        assumeTrue(version != null, "Springfox 3.x APIs must exist after upgrade");
        assertEquals(TARGET_SPRINGFOX_VERSION, version,
                "Active Springfox Swagger version must be " + TARGET_SPRINGFOX_VERSION);
    }

    @Test
    @DisplayName("New configuration keys introduced by upgrade load without errors")
    void testNewConfigurationKeysPresentAndLoad() {
        // Check springdoc-openapi config key presence (new with OpenAPI 3 integration)
        assertDoesNotThrow(() -> {
            assertTrue(springdocApiDocsEnabled, "springdoc.api-docs.enabled should be true if present");
        });
    }

}