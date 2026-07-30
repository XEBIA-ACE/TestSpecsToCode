import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Assertions;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import shopizer.ShopizerApplication;

@SpringBootApplication
public class VersionUpgradeValidationTest {

    private ConfigurableApplicationContext context;
    private RestTemplate restTemplate;
    private ObjectMapper objectMapper;

    @BeforeEach
    public void setUp() {
        this.context = SpringApplication.run(ShopizerApplication.class);
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    @AfterEach
    public void tearDown() {
        if (this.context != null) {
            this.context.close();
        }
    }

    @Test
    public void testSpringBootVersion() {
        Environment env = context.getEnvironment();
        String springBootVersion = env.getProperty("spring-boot.version");
        Assertions.assertEquals("3.2.0", springBootVersion, "Spring Boot version should be 3.2.0");
    }

    @Test
    public void testCriticalApplicationPath() {
        ResponseEntity<String> response = restTemplate.getForEntity("http://localhost:8080/api/products", String.class);
        Assertions.assertEquals(200, response.getStatusCodeValue(), "Expected HTTP response status 200");
    }

    @Test
    public void testJacksonDatabindVersion() {
        String version = objectMapper.getClass().getPackage().getImplementationVersion();
        Assertions.assertNotNull(version, "Jackson Databind version should not be null");
    }

    @Test
    public void testDeprecatedApiNotPresent() throws ClassNotFoundException {
        Assertions.assertThrows(ClassNotFoundException.class, () -> {
            Class.forName("com.fasterxml.jackson.databind.deser.std.DateDeserializer");
        }, "Deprecated DateDeserializer should not be present");
    }

    @Test
    public void testNewSpringConfigurationKey() {
        String newKey = context.getEnvironment().getProperty("spring.new.config.property");
        Assertions.assertNotNull(newKey, "New Spring configuration key should be present and not null");
    }
}