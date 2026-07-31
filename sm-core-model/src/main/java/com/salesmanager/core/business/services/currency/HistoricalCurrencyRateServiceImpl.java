package com.salesmanager.core.business.services.currency;

import com.salesmanager.core.business.repositories.currency.HistoricalCurrencyRateRepository;
import com.salesmanager.core.model.currency.HistoricalCurrencyRate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Default implementation of {@link HistoricalCurrencyRateService}.
 *
 * <p>Delegates all persistence operations to
 * {@link HistoricalCurrencyRateRepository} and adds input validation,
 * logging, and transaction demarcation consistent with the rest of the
 * Shopizer service layer.
 */
@Service
@Transactional(readOnly = true)
public class HistoricalCurrencyRateServiceImpl implements HistoricalCurrencyRateService {

    private static final Logger LOG =
            LoggerFactory.getLogger(HistoricalCurrencyRateServiceImpl.class);

    private final HistoricalCurrencyRateRepository repository;

    public HistoricalCurrencyRateServiceImpl(HistoricalCurrencyRateRepository repository) {
        this.repository = repository;
    }

    // ------------------------------------------------------------------ //
    //  Read operations (readOnly = true inherited from class-level)
    // ------------------------------------------------------------------ //

    /**
     * {@inheritDoc}
     *
     * <p>Performs a single indexed look-up by (fromCurrency, toCurrency, date).
     * Returns {@link Optional#empty()} when no record exists rather than
     * throwing, so callers can decide how to handle missing data gracefully.
     */
    @Override
    public Optional<HistoricalCurrencyRate> getRate(String fromCurrency,
                                                    String toCurrency,
                                                    LocalDate date) {
        Assert.hasText(fromCurrency, "fromCurrency must not be blank");
        Assert.hasText(toCurrency,   "toCurrency must not be blank");
        Assert.notNull(date,         "date must not be null");

        LOG.debug("Retrieving historical rate: {} -> {} on {}", fromCurrency, toCurrency, date);

        return repository.findByFromCurrencyAndToCurrencyAndRateDate(
                fromCurrency.toUpperCase(),
                toCurrency.toUpperCase(),
                date);
    }

    /**
     * {@inheritDoc}
     *
     * <p>Validates that {@code startDate} is not after {@code endDate} before
     * delegating to the repository range query.  Results are ordered
     * chronologically (oldest first) to match typical chart/table rendering.
     */
    @Override
    public List<HistoricalCurrencyRate> getRatesInRange(String fromCurrency,
                                                        String toCurrency,
                                                        LocalDate startDate,
                                                        LocalDate endDate) {
        Assert.hasText(fromCurrency, "fromCurrency must not be blank");
        Assert.hasText(toCurrency,   "toCurrency must not be blank");
        Assert.notNull(startDate,    "startDate must not be null");
        Assert.notNull(endDate,      "endDate must not be null");

        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException(
                    "startDate [" + startDate + "] must not be after endDate [" + endDate + "]");
        }

        LOG.debug("Retrieving historical rates: {} -> {} from {} to {}",
                fromCurrency, toCurrency, startDate, endDate);

        return repository.findRatesInRange(
                fromCurrency.toUpperCase(),
                toCurrency.toUpperCase(),
                startDate,
                endDate);
    }

    /**
     * {@inheritDoc}
     *
     * <p>Returns rates ordered by date descending so that the most-recent
     * entries appear first — matching the default sort order of the
     * transaction-history page.
     */
    @Override
    public List<HistoricalCurrencyRate> getRatesBySourceCurrency(String fromCurrency) {
        Assert.hasText(fromCurrency, "fromCurrency must not be blank");

        LOG.debug("Retrieving all historical rates for source currency: {}", fromCurrency);

        return repository.findByFromCurrencyOrderByRateDateDesc(
                fromCurrency.toUpperCase());
    }

    // ------------------------------------------------------------------ //
    //  Write operations
    // ------------------------------------------------------------------ //

    /**
     * {@inheritDoc}
     *
     * <p>Marked {@code @Transactional} (read-write) to override the
     * class-level read-only transaction.
     */
    @Override
    @Transactional
    public HistoricalCurrencyRate saveRate(HistoricalCurrencyRate rate) {
        Assert.notNull(rate, "rate must not be null");
        Assert.notNull(rate.getRateDate(),     "rate.rateDate must not be null");
        Assert.hasText(rate.getFromCurrency(), "rate.fromCurrency must not be blank");
        Assert.hasText(rate.getToCurrency(),   "rate.toCurrency must not be blank");
        Assert.notNull(rate.getRate(),         "rate.rate must not be null");

        // Normalise currency codes to uppercase before persisting
        rate.setFromCurrency(rate.getFromCurrency().toUpperCase());
        rate.setToCurrency(rate.getToCurrency().toUpperCase());

        LOG.debug("Saving historical rate: {}", rate);
        return repository.save(rate);
    }
}
