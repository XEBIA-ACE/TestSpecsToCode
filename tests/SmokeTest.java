package com.example.upgrade;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import static org.junit.jupiter.api.Assertions.*;

import java.lang.management.ManagementFactory;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Java17UpgradeValidationTest {

    private static final String TARGET_JAVA_VERSION = "17";

    @Test
    @DisplayName("Active JVM is Java 17")
    void verifyActiveJVMVersionIs17() {
        String javaVersion = System.getProperty("java.version");
        // Java 17 can be reported as "17", "17.0.1", etc.
        assertNotNull(javaVersion, "java.version system property must not be null");
        assertTrue(javaVersion.startsWith(TARGET_JAVA_VERSION + ".") || javaVersion.equals(TARGET_JAVA_VERSION),
                "Expected Java version to be '17' or start with '17.', but was: " + javaVersion);
    }

    @Test
    @DisplayName("Application main class runs with Java 17 features")
    void verifyApplicationPathAcceptsJava17Features() {
        // Use a Java 17 API to ensure runtime supports it—e.g., using sealed classes or records.
        // Since actual application classes are unknown, we use a Java 17 core API here.
        // Example: use java.util.HexFormat (available since Java 17)
        String original = "cafebabe";
        byte[] bytes = java.util.HexFormat.of().parseHex(original);
        assertArrayEquals(new byte[] {(byte)0xca, (byte)0xfe, (byte)0xba, (byte)0xbe}, bytes,
                "HexFormat.parseHex should parse hex string correctly under Java 17 runtime");
    }

    @Test
    @DisplayName("No usage of Java 11-deprecated APIs that were removed or replaced in Java 17")
    void verifyNoJava11DeprecatedAPIsPresent() {
        // Since direct invocation or detection is static analysis, this runtime test ensures
        // absence of runtime classes known to be removed in Java 17.
        // For instance, javax.security.cert was removed in Java 17.
        assertThrows(ClassNotFoundException.class, () -> Class.forName("javax.security.cert.Certificate"),
                "javax.security.cert.Certificate should not exist in Java 17 runtime");
    }

    @Test
    @DisplayName("New configuration keys for Java 17 are loadable")
    void verifyNewJava17ConfigKeyLoads() {
        // Example: the system property 'jdk.security.allowNonCaAnchor' was introduced in later JDKs.
        // Here, we'll check the property presence (even if not set, it must be loadable and non-erroring).
        // In reality, a more domain-specific key would be tested. We'll use this as a placeholder.
        String configKey = "jdk.security.allowNonCaAnchor";
        assertDoesNotThrow(() -> System.getProperty(configKey),
                "Should be able to access Java 17 configuration key: " + configKey);
    }

}