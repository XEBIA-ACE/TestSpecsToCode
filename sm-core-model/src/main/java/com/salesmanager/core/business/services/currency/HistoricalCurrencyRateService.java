package com.salesmanager.core.business.services.currency;

import com.salesmanager.core.model.currency.HistoricalCurrencyRate;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Service contract for historical currency rate operations.
 *
 * <p>Implementations are responsible for:
 * <ul>
 *   <li>Retrieving stored rates from the persistence layer.</li>
 *   <li>Persisting new or updated rate records.</li>
 *   <li>Providing convenience look-ups used by the transaction-history UI.</li>
 * </ul>
 *
 * <p>All currency codes must conform to ISO 4217 (three uppercase letters).
 */
public interface HistoricalCurrencyRateService {

    /**
     * Retrieves the exchange rate for a specific currency pair on a given date.
     *
     * @param fromCurrency ISO 4217 source currency code (e.g. "USD")
     * @param toCurrency   ISO 4217 target currency code (e.g. "EUR")
     * @param date         the exact calendar date for the rate
     * @return an {@link Optional} containing the rate record, or empty if not found
     */
    Optional<HistoricalCurrencyRate> getRate(String fromCurrency,
                                             String toCurrency,
                                             LocalDate date);

    /**
     * Retrieves all exchange rates for a currency pair within an inclusive
     * date range, ordered chronologically (oldest first).
     *
     * @param fromCurrency ISO 4217 source currency code
     * @param toCurrency   ISO 4217 target currency code
     * @param startDate    range start (inclusive)
     * @param endDate      range end   (inclusive)
     * @return list of {@link HistoricalCurrencyRate} records; never {@code null}
     * @throws IllegalArgumentException if {@code startDate} is after {@code endDate}
     */
    List<HistoricalCurrencyRate> getRatesInRange(String fromCurrency,
                                                 String toCurrency,
                                                 LocalDate startDate,
                                                 LocalDate endDate);

    /**
     * Retrieves all stored rates for a given source currency, ordered by date
     * descending (most-recent first).
     *
     * @param fromCurrency ISO 4217 source currency code
     * @return list of {@link HistoricalCurrencyRate} records; never {@code null}
     */
    List<HistoricalCurrencyRate> getRatesBySourceCurrency(String fromCurrency);

    /**
     * Persists a new or updated {@link HistoricalCurrencyRate} record.
     *
     * @param rate the rate entity to save; must not be {@code null}
     * @return the saved (and potentially ID-populated) entity
     */
    HistoricalCurrencyRate saveRate(HistoricalCurrencyRate rate);
}
