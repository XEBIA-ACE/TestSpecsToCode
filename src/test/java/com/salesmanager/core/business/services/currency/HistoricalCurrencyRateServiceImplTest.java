package com.salesmanager.core.business.services.currency;

import com.salesmanager.core.business.repositories.currency.HistoricalCurrencyRateRepository;
import com.salesmanager.core.model.currency.HistoricalCurrencyRate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for {@link HistoricalCurrencyRateServiceImpl}.
 *
 * <p>Verifies both data retrieval pathways:
 * <ul>
 *   <li>Pathway 1 (DB hit): repository returns a result → external client NOT called.</li>
 *   <li>Pathway 2 (DB miss): repository returns empty → external client called and result cached.</li>
 * </ul>
 */
class HistoricalCurrencyRateServiceImplTest {

    // -------------------------------------------------------------------------
    // Minimal in-memory stubs (no Mockito dependency required)
    // -------------------------------------------------------------------------

    /** Stub repository that always returns empty (simulates DB miss). */
    private static class EmptyRepository implements HistoricalCurrencyRateRepository {
        @Override public HistoricalCurrencyRate save(HistoricalCurrencyRate r) { return r; }
        @Override public Optional<HistoricalCurrencyRate> findByPairAndDate(String b, String t, LocalDate d) { return Optional.empty(); }
        @Override public List<HistoricalCurrencyRate> findByPairAndDateRange(String b, String t, LocalDate f, LocalDate to) { return List.of(); }
        @Override public List<HistoricalCurrencyRate> findAllByBaseCurrencyAndDate(String b, LocalDate d) { return List.of(); }
    }

    /** Stub repository that always returns a pre-loaded rate (simulates DB hit). */
    private static class PreloadedRepository implements HistoricalCurrencyRateRepository {
        private final HistoricalCurrencyRate stored;
        PreloadedRepository(HistoricalCurrencyRate stored) { this.stored = stored; }
        @Override public HistoricalCurrencyRate save(HistoricalCurrencyRate r) { return r; }
        @Override public Optional<HistoricalCurrencyRate> findByPairAndDate(String b, String t, LocalDate d) { return Optional.of(stored); }
        @Override public List<HistoricalCurrencyRate> findByPairAndDateRange(String b, String t, LocalDate f, LocalDate to) { return List.of(stored); }
        @Override public List<HistoricalCurrencyRate> findAllByBaseCurrencyAndDate(String b, LocalDate d) { return List.of(stored); }
    }

    /** Stub external client that returns a fixed rate. */
    private static class FixedExternalClient implements ExternalCurrencyRateClient {
        private final HistoricalCurrencyRate rate;
        boolean wasCalled = false;
        FixedExternalClient(HistoricalCurrencyRate rate) { this.rate = rate; }
        @Override public Optional<HistoricalCurrencyRate> fetchRate(String b, String t, LocalDate d) throws CurrencyRateRetrievalException {
            wasCalled = true;
            return Optional.of(rate);
        }
        @Override public List<HistoricalCurrencyRate> fetchAllRatesForDate(String b, LocalDate d) throws CurrencyRateRetrievalException {
            wasCalled = true;
            return List.of(rate);
        }
    }

    /** Stub external client that always throws. */
    private static class FailingExternalClient implements ExternalCurrencyRateClient {
        @Override public Optional<HistoricalCurrencyRate> fetchRate(String b, String t, LocalDate d) throws CurrencyRateRetrievalException {
            throw new CurrencyRateRetrievalException("API unavailable");
        }
        @Override public List<HistoricalCurrencyRate> fetchAllRatesForDate(String b, LocalDate d) throws CurrencyRateRetrievalException {
            throw new CurrencyRateRetrievalException("API unavailable");
        }
    }

    // -------------------------------------------------------------------------
    // Test fixtures
    // -------------------------------------------------------------------------

    private static final LocalDate TEST_DATE = LocalDate.of(2023, 6, 15);
    private static final HistoricalCurrencyRate SAMPLE_RATE =
            new HistoricalCurrencyRate("USD", "EUR", new BigDecimal("0.92"), TEST_DATE, "DB");

    // -------------------------------------------------------------------------
    // Tests — Pathway 1 (DB hit)
    // -------------------------------------------------------------------------

    @Test
    void getRate_returnsDbResult_whenRepositoryHasData() throws Exception {
        // Arrange: DB has the rate
        HistoricalCurrencyRateService service =
                new HistoricalCurrencyRateServiceImpl(
                        new PreloadedRepository(SAMPLE_RATE),
                        new FailingExternalClient()); // external client must NOT be called

        // Act
        Optional<HistoricalCurrencyRate> result = service.getRate("USD", "EUR", TEST_DATE);

        // Assert
        assertTrue(result.isPresent(), "Expected a rate to be returned from DB");
        assertEquals(new BigDecimal("0.92"), result.get().getRate());
        assertEquals("DB", result.get().getSource());
    }

    @Test
    void getAllRatesForDate_returnsDbResults_whenRepositoryHasData() throws Exception {
        HistoricalCurrencyRateService service =
                new HistoricalCurrencyRateServiceImpl(
                        new PreloadedRepository(SAMPLE_RATE),
                        new FailingExternalClient());

        List<HistoricalCurrencyRate> results = service.getAllRatesForDate("USD", TEST_DATE);

        assertFalse(results.isEmpty(), "Expected rates from DB");
        assertEquals(1, results.size());
    }

    // -------------------------------------------------------------------------
    // Tests — Pathway 2 (DB miss → external API)
    // -------------------------------------------------------------------------

    @Test
    void getRate_callsExternalClient_whenRepositoryIsEmpty() throws Exception {
        HistoricalCurrencyRate apiRate =
                new HistoricalCurrencyRate("USD", "EUR", new BigDecimal("0.91"), TEST_DATE, "ExternalAPI");
        FixedExternalClient externalClient = new FixedExternalClient(apiRate);

        HistoricalCurrencyRateService service =
                new HistoricalCurrencyRateServiceImpl(new EmptyRepository(), externalClient);

        Optional<HistoricalCurrencyRate> result = service.getRate("USD", "EUR", TEST_DATE);

        assertTrue(result.isPresent(), "Expected rate from external API");
        assertEquals(new BigDecimal("0.91"), result.get().getRate());
        assertTrue(externalClient.wasCalled, "External client should have been called on DB miss");
    }

    @Test
    void getRate_propagatesException_whenExternalClientFails() {
        HistoricalCurrencyRateService service =
                new HistoricalCurrencyRateServiceImpl(new EmptyRepository(), new FailingExternalClient());

        assertThrows(CurrencyRateRetrievalException.class,
                () -> service.getRate("USD", "EUR", TEST_DATE),
                "Expected CurrencyRateRetrievalException when external API fails");
    }

    @Test
    void getRatesForDateRange_returnsCombinedResults() throws Exception {
        // DB has rate for TEST_DATE; external API provides rate for TEST_DATE+1
        LocalDate nextDay = TEST_DATE.plusDays(1);
        HistoricalCurrencyRate apiRate =
                new HistoricalCurrencyRate("USD", "EUR", new BigDecimal("0.91"), nextDay, "ExternalAPI");

        HistoricalCurrencyRateRepository repo = new PreloadedRepository(SAMPLE_RATE) {
            @Override
            public List<HistoricalCurrencyRate> findByPairAndDateRange(String b, String t, LocalDate f, LocalDate to) {
                return List.of(SAMPLE_RATE); // only covers TEST_DATE
            }
        };

        FixedExternalClient externalClient = new FixedExternalClient(apiRate);
        HistoricalCurrencyRateService service =
                new HistoricalCurrencyRateServiceImpl(repo, externalClient);

        List<HistoricalCurrencyRate> results =
                service.getRatesForDateRange("USD", "EUR", TEST_DATE, nextDay);

        assertEquals(2, results.size(), "Expected one DB result + one API result");
        assertTrue(externalClient.wasCalled, "External client should fill the gap for the missing date");
    }
}
