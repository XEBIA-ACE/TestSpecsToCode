```java
package com.salesmanager.core.business.services.reference.currency;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.mockito.Mockito.when;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
public class CurrencyServiceUnitTest {

    @Mock
    private CurrencyAPIClient currencyAPIClient;

    @InjectMocks
    @Autowired
    private CurrencyServiceImpl currencyService;

    @BeforeEach
    public void init() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testFetchCurrencyRates() {
        // Given
        CurrencyRate expectedRate = new CurrencyRate("USD", "EUR", 0.85);
        when(currencyAPIClient.getCurrencyRate("USD", "EUR")).thenReturn(expectedRate);

        // When
        CurrencyRate actualRate = currencyService.getCurrencyRate("USD", "EUR");

        // Then
        assertNotNull(actualRate);
        assertEquals(expectedRate.getRate(), actualRate.getRate());
        assertEquals(expectedRate.getSource(), actualRate.getSource());
        assertEquals(expectedRate.getTarget(), actualRate.getTarget());
    }
}
```