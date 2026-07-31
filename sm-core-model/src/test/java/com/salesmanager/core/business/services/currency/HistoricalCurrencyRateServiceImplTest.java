package com.salesmanager.core.business.services.currency;

import com.salesmanager.core.business.repositories.currency.HistoricalCurrencyRateRepository;
import com.salesmanager.core.model.currency.HistoricalCurrencyRate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link HistoricalCurrencyRateServiceImpl}.
 *
 * <p>All repository interactions are mocked so these tests run without a
 * database and execute in milliseconds.
 */
@ExtendWith(MockitoExtension.class)
class HistoricalCurrencyRateServiceImplTest {

    @Mock
    private HistoricalCurrencyRateRepository repository;

    @InjectMocks
    private HistoricalCurrencyRateServiceImpl service;

    private static final LocalDate DATE       = LocalDate.of(2024, 1, 15);
    private static final LocalDate START_DATE = LocalDate.of(2024, 1, 1);
    private static final LocalDate END_DATE   = LocalDate.of(2024, 1, 31);

    private HistoricalCurrencyRate sampleRate;

    @BeforeEach
    void setUp() {
        sampleRate = new HistoricalCurrencyRate(DATE, "USD", "EUR", new BigDecimal("0.9200000000"));
        sampleRate.setId(1L);
    }

    // ------------------------------------------------------------------ //
    //  getRate
    // ------------------------------------------------------------------ //

    @Test
    @DisplayName("getRate returns present Optional when repository finds a record")
    void getRate_found() {
        when(repository.findByFromCurrencyAndToCurrencyAndRateDate("USD", "EUR", DATE))
                .thenReturn(Optional.of(sampleRate));

        Optional<HistoricalCurrencyRate> result = service.getRate("USD", "EUR", DATE);

        assertThat(result).isPresent();
        assertThat(result.get().getRate()).isEqualByComparingTo("0.9200000000");
    }

    @Test
    @DisplayName("getRate returns empty Optional when no record exists")
    void getRate_notFound() {
        when(repository.findByFromCurrencyAndToCurrencyAndRateDate("USD", "EUR", DATE))
                .thenReturn(Optional.empty());

        Optional<HistoricalCurrencyRate> result = service.getRate("USD", "EUR", DATE);

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("getRate normalises currency codes to uppercase")
    void getRate_normalisesCase() {
        when(repository.findByFromCurrencyAndToCurrencyAndRateDate("USD", "EUR", DATE))
                .thenReturn(Optional.of(sampleRate));

        service.getRate("usd", "eur", DATE);

        verify(repository).findByFromCurrencyAndToCurrencyAndRateDate("USD", "EUR", DATE);
    }

    @Test
    @DisplayName("getRate throws when fromCurrency is blank")
    void getRate_blankFromCurrency() {
        assertThatIllegalArgumentException()
                .isThrownBy(() -> service.getRate("", "EUR", DATE));
    }

    @Test
    @DisplayName("getRate throws when date is null")
    void getRate_nullDate() {
        assertThatIllegalArgumentException()
                .isThrownBy(() -> service.getRate("USD", "EUR", null));
    }

    // ------------------------------------------------------------------ //
    //  getRatesInRange
    // ------------------------------------------------------------------ //

    @Test
    @DisplayName("getRatesInRange returns list from repository")
    void getRatesInRange_success() {
        when(repository.findRatesInRange("USD", "EUR", START_DATE, END_DATE))
                .thenReturn(List.of(sampleRate));

        List<HistoricalCurrencyRate> result =
                service.getRatesInRange("USD", "EUR", START_DATE, END_DATE);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getRateDate()).isEqualTo(DATE);
    }

    @Test
    @DisplayName("getRatesInRange throws when startDate is after endDate")
    void getRatesInRange_invalidRange() {
        assertThatIllegalArgumentException()
                .isThrownBy(() -> service.getRatesInRange("USD", "EUR", END_DATE, START_DATE));
    }

    // ------------------------------------------------------------------ //
    //  getRatesBySourceCurrency
    // ------------------------------------------------------------------ //

    @Test
    @DisplayName("getRatesBySourceCurrency delegates to repository and returns results")
    void getRatesBySourceCurrency_success() {
        when(repository.findByFromCurrencyOrderByRateDateDesc("USD"))
                .thenReturn(List.of(sampleRate));

        List<HistoricalCurrencyRate> result = service.getRatesBySourceCurrency("USD");

        assertThat(result).hasSize(1);
        verify(repository).findByFromCurrencyOrderByRateDateDesc("USD");
    }

    // ------------------------------------------------------------------ //
    //  saveRate
    // ------------------------------------------------------------------ //

    @Test
    @DisplayName("saveRate persists and returns the saved entity")
    void saveRate_success() {
        when(repository.save(sampleRate)).thenReturn(sampleRate);

        HistoricalCurrencyRate saved = service.saveRate(sampleRate);

        assertThat(saved.getId()).isEqualTo(1L);
        verify(repository).save(sampleRate);
    }

    @Test
    @DisplayName("saveRate normalises currency codes to uppercase before persisting")
    void saveRate_normalisesCase() {
        HistoricalCurrencyRate rate =
                new HistoricalCurrencyRate(DATE, "usd", "eur", new BigDecimal("0.92"));
        when(repository.save(rate)).thenReturn(rate);

        service.saveRate(rate);

        assertThat(rate.getFromCurrency()).isEqualTo("USD");
        assertThat(rate.getToCurrency()).isEqualTo("EUR");
    }

    @Test
    @DisplayName("saveRate throws when rate entity is null")
    void saveRate_nullRate() {
        assertThatIllegalArgumentException()
                .isThrownBy(() -> service.saveRate(null));
    }
}
