package com.salesmanager.core.business.repositories.currency;

import com.salesmanager.core.model.currency.HistoricalCurrencyRate;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Data-access interface for persisted historical currency rates.
 *
 * <h2>Data Retrieval Pathway — Local Database</h2>
 * <pre>
 *   UI / REST Controller
 *       └─► HistoricalCurrencyRateService
 *               └─► HistoricalCurrencyRateRepository  (this interface)
 *                       └─► Relational DB table: currency_historical_rate
 * </pre>
 *
 * <p>Implementations should map to a persistence store (JPA, JDBC, etc.).
 * When no record is found locally the service layer falls back to the
 * external-API pathway (see {@link com.salesmanager.core.business.services.currency.ExternalCurrencyRateClient}).
 */
public interface HistoricalCurrencyRateRepository {

    /**
     * Persist or update a historical rate record.
     *
     * @param rate the rate entity to save
     * @return the saved entity (may include generated ID / audit fields)
     */
    HistoricalCurrencyRate save(HistoricalCurrencyRate rate);

    /**
     * Look up the rate for a specific currency pair on a specific date.
     *
     * @param baseCurrency   ISO 4217 base currency code
     * @param targetCurrency ISO 4217 target currency code
     * @param date           the exact calendar date
     * @return an {@link Optional} containing the rate if found, empty otherwise
     */
    Optional<HistoricalCurrencyRate> findByPairAndDate(String baseCurrency,
                                                        String targetCurrency,
                                                        LocalDate date);

    /**
     * Retrieve all rates for a currency pair within an inclusive date range.
     *
     * @param baseCurrency   ISO 4217 base currency code
     * @param targetCurrency ISO 4217 target currency code
     * @param from           start date (inclusive)
     * @param to             end date (inclusive)
     * @return list of matching rate records, ordered by date ascending
     */
    List<HistoricalCurrencyRate> findByPairAndDateRange(String baseCurrency,
                                                         String targetCurrency,
                                                         LocalDate from,
                                                         LocalDate to);

    /**
     * Retrieve all rates recorded for a given base currency on a specific date
     * (i.e. all target currencies available for that date).
     *
     * @param baseCurrency ISO 4217 base currency code
     * @param date         the calendar date
     * @return list of rate records for all available target currencies
     */
    List<HistoricalCurrencyRate> findAllByBaseCurrencyAndDate(String baseCurrency,
                                                               LocalDate date);
}
