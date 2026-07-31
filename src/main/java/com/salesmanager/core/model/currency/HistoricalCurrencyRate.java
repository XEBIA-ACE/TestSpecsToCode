package com.salesmanager.core.model.currency;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Model representing a historical currency exchange rate entry.
 *
 * <p>Data retrieval pathway: this entity is the canonical domain object populated by
 * {@link com.salesmanager.core.business.services.currency.HistoricalCurrencyRateService}.
 * It can be sourced from:
 *   1. A local database table (via {@link com.salesmanager.core.business.repositories.currency.HistoricalCurrencyRateRepository})
 *   2. An external exchange-rate API (e.g. exchangeratesapi.io / Open Exchange Rates)
 *      when local data is absent or stale.
 */
public class HistoricalCurrencyRate {

    /** ISO 4217 base currency code, e.g. "USD". */
    private String baseCurrency;

    /** ISO 4217 target currency code, e.g. "EUR". */
    private String targetCurrency;

    /**
     * The exchange rate: 1 unit of {@code baseCurrency} expressed in {@code targetCurrency}.
     * Example: baseCurrency=USD, targetCurrency=EUR, rate=0.92 means 1 USD = 0.92 EUR.
     */
    private BigDecimal rate;

    /** The calendar date for which this rate is valid. */
    private LocalDate rateDate;

    /** Optional: name of the data source that provided this rate (e.g. "DB", "ExchangeRatesAPI"). */
    private String source;

    // -------------------------------------------------------------------------
    // Constructors
    // -------------------------------------------------------------------------

    public HistoricalCurrencyRate() {
    }

    public HistoricalCurrencyRate(String baseCurrency, String targetCurrency,
                                   BigDecimal rate, LocalDate rateDate, String source) {
        this.baseCurrency = baseCurrency;
        this.targetCurrency = targetCurrency;
        this.rate = rate;
        this.rateDate = rateDate;
        this.source = source;
    }

    // -------------------------------------------------------------------------
    // Getters & Setters
    // -------------------------------------------------------------------------

    public String getBaseCurrency() {
        return baseCurrency;
    }

    public void setBaseCurrency(String baseCurrency) {
        this.baseCurrency = baseCurrency;
    }

    public String getTargetCurrency() {
        return targetCurrency;
    }

    public void setTargetCurrency(String targetCurrency) {
        this.targetCurrency = targetCurrency;
    }

    public BigDecimal getRate() {
        return rate;
    }

    public void setRate(BigDecimal rate) {
        this.rate = rate;
    }

    public LocalDate getRateDate() {
        return rateDate;
    }

    public void setRateDate(LocalDate rateDate) {
        this.rateDate = rateDate;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    @Override
    public String toString() {
        return "HistoricalCurrencyRate{"
                + "baseCurrency='" + baseCurrency + '\''
                + ", targetCurrency='" + targetCurrency + '\''
                + ", rate=" + rate
                + ", rateDate=" + rateDate
                + ", source='" + source + '\''
                + '}';
    }
}
