```java
package com.salesmanager.core.business.services.reference.currency;

import com.salesmanager.core.business.repositories.currency.CurrencyRepository;
import com.salesmanager.core.model.reference.currency.CurrencyRate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.jdbc.Sql;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
public class CurrencyServiceIntegrationTest {

    @Autowired
    private CurrencyService currencyService;

    @Autowired
    private CurrencyRepository currencyRepository;

    @Test
    @Sql(scripts = "/test-data/currency-data.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void testCurrencyDataFlow() {
        // Given
        String sourceCurrency = "USD";
        String targetCurrency = "EUR";

        // When
        CurrencyRate currencyRate = currencyService.getCurrencyRate(sourceCurrency, targetCurrency);

        // Then
        assertNotNull(currencyRate);
        assertEquals("USD", currencyRate.getSource());
        assertEquals("EUR", currencyRate.getTarget());
        assertEquals(0.85, currencyRate.getRate());
    }
}
```