import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.info.BuildProperties;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.env.Environment;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.client.RestTemplate;

@SpringBootTest
@ActiveProfiles("test")
public class UpgradeValidationTests {

    @Autowired
    private Environment environment;

    @Autowired
    private BuildProperties buildProperties;

    private static RestTemplate restTemplate;

    @BeforeAll
    public static void setUp() {
        restTemplate = new RestTemplate();
    }

    @Test
    public void testFrameworkVersion() {
        // Verify Spring Boot Version
        String activeVersion = buildProperties.getVersion();
        String targetVersion = "3.2.1";
        assertEquals(targetVersion, activeVersion, "Spring Boot Version should be " + targetVersion);
    }

    @Test
    public void testCriticalApplicationPaths() {
        // Example REST endpoint check
        String url = "http://localhost:8080/api/v1/example";
        String response = restTemplate.getForObject(url, String.class);
        assertNotNull(response, "Critical application path should return a response");
    }

    @Test
    public void testDeprecatedApisNotPresent() {
        // Ensure the old deprecated API does not exist
        Class<?> deprecatedClass;
        try {
            deprecatedClass = Class.forName("com.example.deprecated.OldApi");
        } catch (ClassNotFoundException e) {
            deprecatedClass = null;
        }
        assertEquals(null, deprecatedClass, "Deprecated API should not be present");
    }

    @Test
    public void testNewConfigurationKeysLoad() {
        // Verify new configuration keys exist
        String newConfigKey = environment.getProperty("spring.new.config.key");
        assertNotNull(newConfigKey, "New configuration key should be loaded without errors");

        // Check for handling of missing or legacy properties
        assertThrows(IllegalArgumentException.class, () -> {
            environment.getRequiredProperty("spring.legacy.config.key");
        }, "Legacy configuration keys should not exist");
    }

    @Test
    public void testApplicationStartsUpCorrectly() {
        // Validate application startup based on specific configurations
        String isDevelopment = environment.getProperty("app.development");
        assertEquals("true", isDevelopment, "The application should be running in development mode for tests");
    }
}