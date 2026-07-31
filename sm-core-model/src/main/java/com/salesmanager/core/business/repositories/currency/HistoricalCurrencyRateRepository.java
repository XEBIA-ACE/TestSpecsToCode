package com.salesmanager.core.business.repositories.currency;

import com.salesmanager.core.model.currency.HistoricalCurrencyRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for {@link HistoricalCurrencyRate}.
 *
 * <p>All query methods follow the naming conventions already used in the
 * Shopizer codebase (e.g. {@code findBy…}, {@code findAll…}) so that the
 * service layer can remain thin and declarative.
 */
@Repository
public interface HistoricalCurrencyRateRepository
        extends JpaRepository<HistoricalCurrencyRate, Long> {

    /**
     * Returns the rate for a specific currency pair on an exact date.
     *
     * @param fromCurrency ISO 4217 source currency code
     * @param toCurrency   ISO 4217 target currency code
     * @param rateDate     the exact calendar date
     * @return an {@link Optional} containing the rate if present
     */
    Optional<HistoricalCurrencyRate> findByFromCurrencyAndToCurrencyAndRateDate(
            String fromCurrency,
            String toCurrency,
            LocalDate rateDate);

    /**
     * Returns all rates for a currency pair within an inclusive date range,
     * ordered chronologically (oldest first).
     *
     * @param fromCurrency ISO 4217 source currency code
     * @param toCurrency   ISO 4217 target currency code
     * @param startDate    range start (inclusive)
     * @param endDate      range end   (inclusive)
     * @return list of matching {@link HistoricalCurrencyRate} records
     */
    @Query("SELECT r FROM HistoricalCurrencyRate r "
         + "WHERE r.fromCurrency = :fromCurrency "
         + "  AND r.toCurrency   = :toCurrency "
         + "  AND r.rateDate    >= :startDate "
         + "  AND r.rateDate    <= :endDate "
         + "ORDER BY r.rateDate ASC")
    List<HistoricalCurrencyRate> findRatesInRange(
            @Param("fromCurrency") String fromCurrency,
            @Param("toCurrency")   String toCurrency,
            @Param("startDate")    LocalDate startDate,
            @Param("endDate")      LocalDate endDate);

    /**
     * Returns all rates for a given source currency ordered by date descending
     * (most-recent first).  Useful for populating a transaction-history page
     * where the latest rates are most relevant.
     *
     * @param fromCurrency ISO 4217 source currency code
     * @return list of {@link HistoricalCurrencyRate} records
     */
    List<HistoricalCurrencyRate> findByFromCurrencyOrderByRateDateDesc(
            String fromCurrency);
}
