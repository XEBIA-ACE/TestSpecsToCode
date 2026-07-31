package com.salesmanager.core.business.services.currency;

import com.salesmanager.core.model.currency.HistoricalCurrencyRate;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * HTTP-based implementation of {@link ExternalCurrencyRateClient}.
 *
 * <h2>Data Retrieval Pathway — External API Detail</h2>
 * <pre>
 *   HistoricalCurrencyRateServiceImpl
 *       └─► HttpExternalCurrencyRateClient  (this class)
 *               └─► HTTP GET {baseUrl}/{date}?base={baseCurrency}&symbols={targetCurrency}
 *                       └─► JSON response parsed into HistoricalCurrencyRate
 * </pre>
 *
 * <p>The default base URL targets the Open Exchange Rates / exchangeratesapi.io
 * compatible endpoint format. Override {@code baseUrl} via constructor to point
 * at any compatible provider.
 *
 * <p>Expected JSON response shape (exchangeratesapi.io v1 compatible):
 * <pre>
 * {
 *   "base": "USD",
 *   "date": "2023-06-15",
 *   "rates": {
 *     "EUR": 0.92,
 *     "GBP": 0.79,
 *     ...
 *   }
 * }
 * </pre>
 *
 * <p><b>Note:</b> JSON parsing here uses a minimal hand-rolled approach to avoid
 * mandatory third-party dependencies. Replace with Jackson / Gson as appropriate
 * for the project's existing dependency set.
 *
 * <p>TODO: inject API key via configuration property (e.g. Spring {@code @Value}).
 * TODO: replace hand-rolled JSON parsing with Jackson ObjectMapper.
 */
public class HttpExternalCurrencyRateClient implements ExternalCurrencyRateClient {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final String SOURCE_NAME = "ExternalAPI";

    private final String baseUrl;
    private final String apiKey;
    private final HttpClient httpClient;

    /**
     * @param baseUrl   base URL of the exchange-rate API, e.g.
     *                  {@code "https://api.exchangeratesapi.io/v1"}
     * @param apiKey    API access key (appended as {@code ?access_key=...})
     * @param httpClient shared {@link HttpClient} instance
     */
    public HttpExternalCurrencyRateClient(String baseUrl, String apiKey, HttpClient httpClient) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
        this.httpClient = httpClient;
    }

    // -------------------------------------------------------------------------
    // ExternalCurrencyRateClient implementation
    // -------------------------------------------------------------------------

    @Override
    public Optional<HistoricalCurrencyRate> fetchRate(String baseCurrency,
                                                       String targetCurrency,
                                                       LocalDate date)
            throws CurrencyRateRetrievalException {

        String url = buildUrl(date, baseCurrency, targetCurrency);
        String responseBody = executeGet(url);

        // Parse the single target rate from the response
        BigDecimal rate = extractRate(responseBody, targetCurrency);
        if (rate == null) {
            return Optional.empty();
        }

        return Optional.of(new HistoricalCurrencyRate(baseCurrency, targetCurrency,
                rate, date, SOURCE_NAME));
    }

    @Override
    public List<HistoricalCurrencyRate> fetchAllRatesForDate(String baseCurrency,
                                                              LocalDate date)
            throws CurrencyRateRetrievalException {

        // Request all symbols by omitting the symbols filter
        String url = buildUrl(date, baseCurrency, null);
        String responseBody = executeGet(url);

        return parseAllRates(responseBody, baseCurrency, date);
    }

    // -------------------------------------------------------------------------
    // Internal helpers
    // -------------------------------------------------------------------------

    private String buildUrl(LocalDate date, String baseCurrency, String targetCurrency) {
        StringBuilder sb = new StringBuilder(baseUrl)
                .append("/").append(DATE_FMT.format(date))
                .append("?access_key=").append(apiKey)
                .append("&base=").append(baseCurrency);
        if (targetCurrency != null && !targetCurrency.isEmpty()) {
            sb.append("&symbols=").append(targetCurrency);
        }
        return sb.toString();
    }

    private String executeGet(String url) throws CurrencyRateRetrievalException {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .GET()
                    .build();
            HttpResponse<String> response =
                    httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new CurrencyRateRetrievalException(
                        "External API returned HTTP " + response.statusCode() + " for URL: " + url);
            }
            return response.body();
        } catch (CurrencyRateRetrievalException e) {
            throw e;
        } catch (Exception e) {
            throw new CurrencyRateRetrievalException(
                    "Failed to call external currency rate API: " + e.getMessage(), e);
        }
    }

    /**
     * Minimal JSON extraction for a single currency rate value.
     * TODO: replace with Jackson / Gson for robustness.
     *
     * @param json           raw JSON response body
     * @param targetCurrency the currency code to look up in the "rates" object
     * @return parsed {@link BigDecimal} rate, or {@code null} if not found
     */
    private BigDecimal extractRate(String json, String targetCurrency) {
        // Look for pattern: "EUR": 0.92  or  "EUR":0.92
        String key = "\"" + targetCurrency + "\"";
        int keyIdx = json.indexOf(key);
        if (keyIdx < 0) {
            return null;
        }
        int colonIdx = json.indexOf(':', keyIdx + key.length());
        if (colonIdx < 0) {
            return null;
        }
        // Read until comma, closing brace, or whitespace
        int start = colonIdx + 1;
        while (start < json.length() && Character.isWhitespace(json.charAt(start))) {
            start++;
        }
        int end = start;
        while (end < json.length()
                && json.charAt(end) != ','
                && json.charAt(end) != '}'
                && !Character.isWhitespace(json.charAt(end))) {
            end++;
        }
        String rateStr = json.substring(start, end).trim();
        try {
            return new BigDecimal(rateStr);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /**
     * Parse all currency rates from the "rates" block of the JSON response.
     * TODO: replace with Jackson / Gson for robustness.
     */
    private List<HistoricalCurrencyRate> parseAllRates(String json,
                                                        String baseCurrency,
                                                        LocalDate date) {
        List<HistoricalCurrencyRate> results = new ArrayList<>();

        int ratesIdx = json.indexOf("\"rates\"");
        if (ratesIdx < 0) {
            return results;
        }
        int braceOpen = json.indexOf('{', ratesIdx);
        int braceClose = json.indexOf('}', braceOpen);
        if (braceOpen < 0 || braceClose < 0) {
            return results;
        }

        String ratesBlock = json.substring(braceOpen + 1, braceClose);
        // Each entry looks like: "EUR": 0.92
        String[] entries = ratesBlock.split(",");
        for (String entry : entries) {
            String[] parts = entry.split(":");
            if (parts.length != 2) {
                continue;
            }
            String currency = parts[0].trim().replace("\"", "");
            String rateStr = parts[1].trim();
            try {
                BigDecimal rate = new BigDecimal(rateStr);
                results.add(new HistoricalCurrencyRate(baseCurrency, currency,
                        rate, date, SOURCE_NAME));
            } catch (NumberFormatException ignored) {
                // skip malformed entries
            }
        }
        return results;
    }
}
