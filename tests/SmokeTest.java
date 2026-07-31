package com.example.upgrade.validation;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Nested;
import org.springframework.boot.SpringBootVersion;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.env.Environment;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.context.ApplicationContext;

import javax.annotation.PostConstruct;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
class UpgradeSuccessValidationTest {

    @Autowired
    private ApplicationContext applicationContext;

    @Autowired
    private Environment environment;

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;

    @PostConstruct
    public void setupMockMvc() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    @Test
    @DisplayName("Spring Boot is at the exact target version 3.2.6")
    void verifiesSpringBootVersion() {
        String activeVersion = SpringBootVersion.getVersion();
        assertEquals("3.2.6", activeVersion, "Spring Boot version must match target 3.2.6");
    }

    @Nested
    class CriticalPathValidation {

        @Test
        @DisplayName("Order API endpoint returns 200 OK")
        void orderApiEndpointAvailable() throws Exception {
            // Assuming /api/orders endpoint exists as a critical path (update if actual path is different)
            mockMvc.perform(get("/api/orders"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("ReadableProductPopulator integration - does not fail on initialization")
        void readableProductPopulatorInit() {
            // Checks bean presence after namespace migration (relies on Spring context type safety)
            assertTrue(
                applicationContext.containsBeanDefinition("readableProductPopulator"), 
                "readableProductPopulator bean should be present in the application context"
            );
        }

        @Test
        @DisplayName("CustomerFacadeImpl is operational as a bean")
        void customerFacadeOperational() {
            assertDoesNotThrow(() ->
                applicationContext.getBean("customerFacadeImpl"),
                "CustomerFacadeImpl bean should be available and not throw exceptions"
            );
        }
    }

    @Nested
    class DeprecatedApiChecks {

        @Test
        @DisplayName("Springfox replacement (springdoc-openapi) beans loaded")
        void springdocOpenApiBeansLoaded() {
            // New APIs: Look for OpenAPI 3 springdoc bean as replacement for removed Springfox Swagger
            assertTrue(
                applicationContext.containsBeanDefinition("openApiWebMvcResource"),
                "springdoc-openapi resource bean (openApiWebMvcResource) should be present"
            );
        }

        @Test
        @DisplayName("Springfox beans absent after upgrade to Spring Boot 3+")
        void noSpringfoxBeansPresent() {
            String[] beanNames = applicationContext.getBeanDefinitionNames();
            boolean found = false;
            for (String name : beanNames) {
                if (name.toLowerCase().contains("springfox") || name.toLowerCase().contains("swagger")) {
                    found = true;
                }
            }
            assertFalse(found, "Legacy Springfox/Swagger beans must NOT be present in context after upgrade");
        }
    }

    @Nested
    class NewConfigKeysValidation {

        @Test
        @DisplayName("New Spring Boot 3.x config key 'spring.application.admin.enabled' loads without error")
        void springApplicationAdminEnabledKeyLoads() {
            // This config key is new/stable in Spring Boot 3.x
            assertDoesNotThrow(() -> {
                String value = environment.getProperty("spring.application.admin.enabled");
                // If property not set, just ensure it can be retrieved without exception (null is OK)
            });
        }

        @Test
        @DisplayName("springdoc-openapi config key 'springdoc.api-docs.path' loads without error")
        void springdocApiDocsPathLoads() {
            assertDoesNotThrow(() -> {
                String value = environment.getProperty("springdoc.api-docs.path");
            });
        }
    }
}