package com.salesmanager.core.business.services.currency;

import com.salesmanager.core.model.currency.HistoricalCurrencyRate;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Service interface for historical currency rate lookups.
 *
 * <h2>Defined Data Retrieval Pathways</h2>
 *
 * <p>This service orchestrates two complementary pathways:
 *
 * <h3>Pathway 1 — Local Database (Primary)</h3>
 * <pre>
 *   Caller (REST / UI)
 *       └─► HistoricalCurrencyRateService
 *               └─► HistoricalCurrencyRateRepository
 *                       └─► Relational DB (currency_historical_rate table)
 * </pre>
 * <p>Used when the requested rate has already been fetched and persisted.
 * Provides low-latency, offline-capable access.
 *
 * <h3>Pathway 2 — External Exchange-Rate API (Fallback)</h3>
 * <pre>
 *   Caller (REST / UI)
 *       └─► HistoricalCurrencyRateService
 *               └─► ExternalCurrencyRateClient
 *                       └─► HTTPS GET to exchange-rate provider
 *                               (e.g. exchangeratesapi.io, openexchangerates.org)
 *               └─► HistoricalCurrencyRateRepository.save(...)  [cache result]
 * </pre>
 * <p>Invoked when the local DB has no record for the requested pair/date.
 * The fetched rate is persisted to avoid repeated external calls.
 *
 * <h3>Selection Logic (implemented in {@link HistoricalCurrencyRateServiceImpl})</h3>
 * <ol>
 *   <li>Query local DB via repository.</li>
 *   <li>If found → return immediately (Pathway 1).</li>
 *   <li>If not found → call external API (Pathway 2), persist result, return.</li>
 *   <li>If external API also fails → propagate {@link CurrencyRateRetrievalException}.</li>
 * </ol>
 */
public interface HistoricalCurrencyRateService {

    /**
     * Retrieve the exchange rate for a specific currency pair on a given date.
     * Follows the DB-first, API-fallback pathway described above.
     *
     * @param baseCurrency   ISO 4217 base currency code (e.g. "USD")
     * @param targetCurrency ISO 4217 target currency code (e.g. "EUR")
     * @param date           the historical date
     * @return an {@link Optional} containing the rate, or empty if unavailable
     * @throws CurrencyRateRetrievalException if the external API call fails
     */
    Optional<HistoricalCurrencyRate> getRate(String baseCurrency,
                                              String targetCurrency,
                                              LocalDate date) throws CurrencyRateRetrievalException;

    /**
     * Retrieve all available exchange rates for a base currency on a given date.
     *
     * @param baseCurrency ISO 4217 base currency code
     * @param date         the historical date
     * @return list of rates for all available target currencies
     * @throws CurrencyRateRetrievalException if the external API call fails
     */
    List<HistoricalCurrencyRate> getAllRatesForDate(String baseCurrency,
                                                    LocalDate date) throws CurrencyRateRetrievalException;

    /**
     * Retrieve rates for a currency pair over a date range.
     * Each date in the range is resolved via the DB-first, API-fallback pathway.
     *
     * @param baseCurrency   ISO 4217 base currency code
     * @param targetCurrency ISO 4217 target currency code
     * @param from           start date (inclusive)
     * @param to             end date (inclusive)
     * @return list of rates ordered by date ascending
     * @throws CurrencyRateRetrievalException if any external API call fails
     */
    List<HistoricalCurrencyRate> getRatesForDateRange(String baseCurrency,
                                                       String targetCurrency,
                                                       LocalDate from,
                                                       LocalDate to) throws CurrencyRateRetrievalException;
}
