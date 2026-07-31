```java
package com.salesmanager.core.model.tax.taxclass;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

public class HistoricalCurrencyRatesTest {

    private HistoricalCurrencyRatesService ratesService;

    @BeforeEach
    public void setUp() {
        // Assuming HistoricalCurrencyRatesService is a service that fetches historical currency rates
        ratesService = new HistoricalCurrencyRatesService();
    }

    @Test
    public void testHistoricalRatesAccuracy() {
        // Suppose this is a mock or a fixture for historical rates data
        Map<String, BigDecimal> expectedRates = new HashMap<>();
        expectedRates.put("USD_EUR", new BigDecimal("0.85"));
        expectedRates.put("USD_GBP", new BigDecimal("0.75"));

        // The date provided needs to match the format and dates used in historical context
        Map<String, BigDecimal> actualRates = ratesService.getHistoricalRates("2023-09-10");

        for (String currencyPair : expectedRates.keySet()) {
            BigDecimal expectedRate = expectedRates.get(currencyPair);
            BigDecimal actualRate = actualRates.get(currencyPair);

            BigDecimal marginOfError = new BigDecimal("0.01"); // assuming a 1% margin of error is acceptable
            BigDecimal lowerBound = expectedRate.subtract(marginOfError).max(BigDecimal.ZERO);
            BigDecimal upperBound = expectedRate.add(marginOfError);

            assertNotNull(actualRate, "Actual rate for " + currencyPair + " should not be null");
            assertTrue(actualRate.compareTo(lowerBound) >= 0 && actualRate.compareTo(upperBound) <= 0,
                    "Rate for " + currencyPair + " is outside acceptable range");
        }
    }

    // Additional tests can be added for different dates and more currency pairs
}
```

This file introduces a simple test class, `HistoricalCurrencyRatesTest`, for ensuring the accuracy of historical currency rates retrieved by the backend. The rates are checked against expected values with an acceptable margin of error.