```java
package com.salesmanager.core.business.services.reference.currency;

import java.util.Map;
import java.util.concurrent.TimeUnit;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class CurrencyRateService {

    private final RestTemplate restTemplate;
    private final String apiUrl = "https://api.exchangeratesapi.io/latest";
    private Map<String, Double> currencyRatesCache;

    public CurrencyRateService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
        refreshCurrencyRates();
    }

    @Scheduled(fixedRate = TimeUnit.HOURS.toMillis(1))
    public void refreshCurrencyRates() {
        String response = restTemplate.getForObject(apiUrl, String.class);
        // Parse the response and update the cache
        this.currencyRatesCache = parseRates(response);
    }

    public Map<String, Double> getCurrencyRates() {
        return currencyRatesCache;
    }

    private Map<String, Double> parseRates(String response) {
        // Logic to parse JSON and extract rates
        // Example: Use ObjectMapper to parse the string and extract rates
        // This is a placeholder for the actual implementation
        return Map.of("USD", 1.0, "EUR", 0.85); // Dummy data
    }
}
```