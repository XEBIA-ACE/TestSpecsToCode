package com.salesmanager.core.business.services.currency;

import com.salesmanager.core.model.currency.HistoricalCurrencyRate;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Client interface for fetching historical currency rates from an external provider.
 *
 * <h2>Data Retrieval Pathway — External API</h2>
 * <pre>
 *   HistoricalCurrencyRateService
 *       └─► ExternalCurrencyRateClient  (this interface)
 *               └─► HTTP GET to external exchange-rate API
 *                       e.g. https://api.exchangeratesapi.io/v1/{date}
 *                            https://openexchangerates.org/api/historical/{date}.json
 * </pre>
 *
 * <p>Implementations must:
 * <ul>
 *   <li>Handle HTTP errors and timeouts gracefully, throwing a checked
 *       {@link CurrencyRateRetrievalException} on unrecoverable failures.</li>
 *   <li>Map the external JSON response to {@link HistoricalCurrencyRate} domain objects.</li>
 *   <li>Respect API rate limits (cache responses locally via the repository).</li>
 * </ul>
 */
public interface ExternalCurrencyRateClient {

    /**
     * Fetch the exchange rate for a specific currency pair on a given date.
     *
     * @param baseCurrency   ISO 4217 base currency code
     * @param targetCurrency ISO 4217 target currency code
     * @param date           the historical date to query
     * @return an {@link Optional} containing the rate if the provider has data, empty otherwise
     * @throws CurrencyRateRetrievalException if the external call fails
     */
    Optional<HistoricalCurrencyRate> fetchRate(String baseCurrency,
                                                String targetCurrency,
                                                LocalDate date) throws CurrencyRateRetrievalException;

    /**
     * Fetch all available rates for a base currency on a given date.
     *
     * @param baseCurrency ISO 4217 base currency code
     * @param date         the historical date to query
     * @return list of rates for all target currencies returned by the provider
     * @throws CurrencyRateRetrievalException if the external call fails
     */
    List<HistoricalCurrencyRate> fetchAllRatesForDate(String baseCurrency,
                                                       LocalDate date) throws CurrencyRateRetrievalException;
}
