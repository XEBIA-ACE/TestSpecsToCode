package com.salesmanager.core.business.services.currency;

import com.salesmanager.core.business.repositories.currency.HistoricalCurrencyRateRepository;
import com.salesmanager.core.model.currency.HistoricalCurrencyRate;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Default implementation of {@link HistoricalCurrencyRateService}.
 *
 * <p>Implements the two-pathway retrieval strategy:
 * <ol>
 *   <li><b>Pathway 1 (DB)</b>: query {@link HistoricalCurrencyRateRepository} first.</li>
 *   <li><b>Pathway 2 (API)</b>: on cache miss, delegate to {@link ExternalCurrencyRateClient},
 *       then persist the result for future requests.</li>
 * </ol>
 *
 * <p>This class is intentionally framework-agnostic so it can be wired via Spring
 * {@code @Service} / constructor injection or any other DI mechanism.
 */
public class HistoricalCurrencyRateServiceImpl implements HistoricalCurrencyRateService {

    private final HistoricalCurrencyRateRepository repository;
    private final ExternalCurrencyRateClient externalClient;

    /**
     * Constructor injection — preferred over field injection for testability.
     *
     * @param repository     local persistence layer
     * @param externalClient external API client (fallback pathway)
     */
    public HistoricalCurrencyRateServiceImpl(HistoricalCurrencyRateRepository repository,
                                              ExternalCurrencyRateClient externalClient) {
        this.repository = repository;
        this.externalClient = externalClient;
    }

    // -------------------------------------------------------------------------
    // HistoricalCurrencyRateService implementation
    // -------------------------------------------------------------------------

    /**
     * {@inheritDoc}
     *
     * <p><b>Pathway selection:</b>
     * <ol>
     *   <li>Query local DB → return if found (Pathway 1).</li>
     *   <li>Call external API → persist and return if found (Pathway 2).</li>
     *   <li>Return {@link Optional#empty()} if neither source has data.</li>
     * </ol>
     */
    @Override
    public Optional<HistoricalCurrencyRate> getRate(String baseCurrency,
                                                     String targetCurrency,
                                                     LocalDate date)
            throws CurrencyRateRetrievalException {

        // --- Pathway 1: local database ---
        Optional<HistoricalCurrencyRate> cached =
                repository.findByPairAndDate(baseCurrency, targetCurrency, date);
        if (cached.isPresent()) {
            return cached;
        }

        // --- Pathway 2: external API (fallback) ---
        Optional<HistoricalCurrencyRate> fetched =
                externalClient.fetchRate(baseCurrency, targetCurrency, date);
        fetched.ifPresent(repository::save); // cache for future requests
        return fetched;
    }

    /**
     * {@inheritDoc}
     *
     * <p>Checks local DB first; if the DB already has records for this base/date
     * combination they are returned directly. Otherwise the external API is called
     * and all returned rates are persisted.
     */
    @Override
    public List<HistoricalCurrencyRate> getAllRatesForDate(String baseCurrency,
                                                           LocalDate date)
            throws CurrencyRateRetrievalException {

        // --- Pathway 1: local database ---
        List<HistoricalCurrencyRate> cached =
                repository.findAllByBaseCurrencyAndDate(baseCurrency, date);
        if (!cached.isEmpty()) {
            return cached;
        }

        // --- Pathway 2: external API (fallback) ---
        List<HistoricalCurrencyRate> fetched =
                externalClient.fetchAllRatesForDate(baseCurrency, date);
        fetched.forEach(repository::save); // cache each rate
        return fetched;
    }

    /**
     * {@inheritDoc}
     *
     * <p>Iterates each date in the range and applies the DB-first / API-fallback
     * pathway per date. Dates already present in the DB are served locally;
     * missing dates trigger an external API call.
     *
     * <p>TODO: optimise by batching DB queries and API calls for large date ranges.
     */
    @Override
    public List<HistoricalCurrencyRate> getRatesForDateRange(String baseCurrency,
                                                              String targetCurrency,
                                                              LocalDate from,
                                                              LocalDate to)
            throws CurrencyRateRetrievalException {

        // --- Pathway 1: attempt bulk DB retrieval first ---
        List<HistoricalCurrencyRate> dbResults =
                repository.findByPairAndDateRange(baseCurrency, targetCurrency, from, to);

        // Build a set of dates already covered by the DB
        java.util.Set<LocalDate> coveredDates = new java.util.HashSet<>();
        for (HistoricalCurrencyRate r : dbResults) {
            coveredDates.add(r.getRateDate());
        }

        List<HistoricalCurrencyRate> combined = new ArrayList<>(dbResults);

        // --- Pathway 2: fill gaps via external API ---
        LocalDate cursor = from;
        while (!cursor.isAfter(to)) {
            if (!coveredDates.contains(cursor)) {
                Optional<HistoricalCurrencyRate> fetched =
                        externalClient.fetchRate(baseCurrency, targetCurrency, cursor);
                if (fetched.isPresent()) {
                    repository.save(fetched.get()); // cache
                    combined.add(fetched.get());
                }
            }
            cursor = cursor.plusDays(1);
        }

        // Sort by date ascending before returning
        combined.sort(java.util.Comparator.comparing(HistoricalCurrencyRate::getRateDate));
        return combined;
    }
}
