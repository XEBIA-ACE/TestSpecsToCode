package com.shopizer.upgrade;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringBootVersion;
import org.springframework.core.SpringVersion;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.reactive.server.WebTestClient;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class UpgradeValidationTests {

    @Autowired
    private ApplicationContext applicationContext;

    @Autowired
    private WebTestClient webTestClient;

    @Test
    @DisplayName("Spring Boot version is exactly 3.2.6")
    void springBootVersionIsTarget() {
        String version = SpringBootVersion.getVersion();
        assertThat(version)
                .withFailMessage("Spring Boot version is not 3.2.6 but is %s", version)
                .isEqualTo("3.2.6");
    }

    @Test
    @DisplayName("Spring Framework version is exactly 6.1.7")
    void springFrameworkVersionIsTarget() {
        String version = SpringVersion.getVersion();
        assertThat(version)
                .withFailMessage("Spring Framework version is not 6.1.7 but is %s", version)
                .isEqualTo("6.1.7");
    }

    @Test
    @DisplayName("Critical application REST paths function correctly after upgrade")
    void criticalRestEndpointsFunctionality() {
        // Example: test GET /api/orders, POST /api/orders (adapt endpoints as per the actual routes)
        webTestClient.get()
            .uri("/api/orders")
            .exchange()
            .expectStatus().isOk();

        webTestClient.post()
            .uri("/api/orders")
            .bodyValue("{ \"customerId\": 1, \"products\": [1,2] }")
            .header("Content-Type", "application/json")
            .exchange()
            .expectStatus().isCreated();

        webTestClient.get()
            .uri("/api/customers")
            .exchange()
            .expectStatus().isOk();
    }

    @Test
    @DisplayName("No usage of deprecated Spring Boot 2.x/Framework 5.x APIs")
    void deprecatedSpringApisAbsent() {
        Set<String> beanNames = Set.of(applicationContext.getBeanDefinitionNames());
        // Example: Ensure @EnableWebMvc is not present (replaced by auto-configuration);
        // further checks can be added as needed for replaced/removed beans.
        assertThat(beanNames)
            .doesNotContain("org.springframework.boot.autoconfigure.web.servlet.WebMvcAutoConfiguration$EnableWebMvcConfiguration");
    }

    @Test
    @DisplayName("Replaced Swagger/Springfox APIs are functional at 3.0.0 or newer")
    void swaggerApiReplacedAndWorks() {
        // Springfox 3.0.0 enables OpenAPI/Swagger2 by default at /v3/api-docs or /swagger-ui
        webTestClient.get()
            .uri("/swagger-ui/index.html")
            .exchange()
            .expectStatus().isOk();

        webTestClient.get()
            .uri("/v3/api-docs")
            .exchange()
            .expectStatus().isOk();
    }

    @Test
    @DisplayName("New Spring Boot 3.x configuration keys load without errors")
    void newSpringBoot3ConfigKeysLoad() {
        // Example new property: 'spring.config.activate.on-profile'
        String[] propertySources = applicationContext.getEnvironment().getPropertySources()
                .stream()
                .map(ps -> ps.getName())
                .toArray(String[]::new);

        assertThat(applicationContext.getEnvironment().containsProperty("spring.config.activate.on-profile"))
                .as("Property 'spring.config.activate.on-profile' should be recognized as valid in Spring Boot 3.x+")
                .isTrue();
    }
}