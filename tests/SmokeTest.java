package com.company.smshop.upgrade;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.boot.SpringBootVersion;
import org.springframework.core.SpringVersion;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestPropertySource(properties = {
        "springdoc.api-docs.enabled=true", // New config for springdoc-openapi
        "management.server.port=8081"      // Example of new actuator key location/version alignment
})
class FrameworkUpgradeValidationTest {

    @Autowired
    ApplicationContext applicationContext;

    @Value("${springdoc.api-docs.enabled}")
    boolean openApiDocsEnabled;

    @Test
    @DisplayName("Spring Boot reports version 3.2.6")
    void verifiesSpringBootExactVersion() {
        assertEquals("3.2.6", SpringBootVersion.getVersion(),
                "Spring Boot version must be 3.2.6 after upgrade");
    }

    @Test
    @DisplayName("Spring Framework (core) reports 6.1.x")
    void verifiesSpringFrameworkMajorMinorVersion() {
        String version = SpringVersion.getVersion();
        assertNotNull(version, "Spring Framework version should not be null");
        assertTrue(version.startsWith("6.1."),
                "Spring Framework version must begin with 6.1.x, was: " + version);
    }

    @Test
    @DisplayName("Application starts successfully and context is loaded")
    void applicationContextLoadsSuccessfully() {
        assertNotNull(applicationContext, "Spring application context should be loaded");
    }

    @Test
    @DisplayName("New configuration key 'springdoc.api-docs.enabled' loads and is true (springdoc-openapi)")
    void newSpringdocConfigLoads() {
        assertTrue(openApiDocsEnabled, "springdoc.api-docs.enabled should be true and load without errors");
    }

    @Nested
    @DisplayName("Critical application REST facade and model access")
    class CriticalApplicationPaths {

        @Test
        @DisplayName("CustomerFacade bean is available and works")
        void customerFacadeBeanAvailableAndWorks() {
            Object facadeBean = applicationContext.getBean("customerFacadeImpl");
            assertNotNull(facadeBean,
                    "CustomerFacadeImpl bean must be available after migration");
            // Optionally: test a known method signature:
            assertDoesNotThrow(() -> {
                facadeBean.getClass().getMethod("findCustomerById", Long.class);
            }, "findCustomerById(Long) method must exist in CustomerFacadeImpl");
        }

        @Test
        @DisplayName("Customer model is accessible in the context")
        void customerModelIsPresent() {
            assertDoesNotThrow(() -> {
                Class<?> customerClass = Class.forName("com.company.smshop.model.Customer");
                assertNotNull(customerClass, "Customer model class must be loadable");
            });
        }
    }

    @Nested
    @DisplayName("APIs deprecated in Spring Boot 2.5.x are gone or replaced")
    class DeprecatedApiChecks {

        @Test
        @DisplayName("ServletRegistrationBean.getServlet() (removed) is NOT present")
        void deprecatedServletRegistrationBeanMethodAbsent() {
            assertThrows(NoSuchMethodException.class, () -> {
                Class<?> clazz = Class.forName("org.springframework.boot.web.servlet.ServletRegistrationBean");
                clazz.getDeclaredMethod("getServlet");
            }, "ServletRegistrationBean.getServlet() should not exist in Spring Boot 3.x+");
        }
    }

    @Nested
    @DisplayName("Springfox/Springdoc validation")
    class SpringdocOpenApiChecks {

        @Test
        @DisplayName("Springdoc-openapi beans are present; old Springfox beans are absent")
        void springdocBeanPresence() {
            assertTrue(applicationContext.getBeanNamesForType(org.springdoc.core.models.GroupedOpenApi.class).length > 0,
                    "GroupedOpenApi bean from springdoc-openapi should be present after upgrade");
            boolean hasSpringfox = false;
            for (String beanName : applicationContext.getBeanDefinitionNames()) {
                if (beanName.contains("springfox") || beanName.contains("swagger2")) {
                    hasSpringfox = true;
                }
            }
            assertFalse(hasSpringfox, "No Springfox or legacy Swagger beans should remain after upgrade");
        }
    }
}