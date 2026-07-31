package com.salesmanager.core.model.currency;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Persistent entity representing a historical exchange rate snapshot
 * between a source currency and a target currency on a given date.
 *
 * <p>This entity is the data-layer foundation for the Historical Currency
 * Rates Lookup feature (US-003).  It is intentionally lightweight so that
 * it can be extended later (e.g. to track the data-source provider).
 */
@Entity
@Table(
    name = "HISTORICAL_CURRENCY_RATE",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "UQ_HIST_RATE_DATE_PAIR",
            columnNames = {"RATE_DATE", "FROM_CURRENCY", "TO_CURRENCY"}
        )
    },
    indexes = {
        @Index(name = "IDX_HIST_RATE_DATE",          columnList = "RATE_DATE"),
        @Index(name = "IDX_HIST_RATE_FROM_CURRENCY", columnList = "FROM_CURRENCY"),
        @Index(name = "IDX_HIST_RATE_TO_CURRENCY",   columnList = "TO_CURRENCY")
    }
)
public class HistoricalCurrencyRate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    /** Calendar date for which this rate was recorded (UTC). */
    @Column(name = "RATE_DATE", nullable = false)
    private LocalDate rateDate;

    /** ISO 4217 code of the source currency (e.g. "USD"). */
    @Column(name = "FROM_CURRENCY", nullable = false, length = 3)
    private String fromCurrency;

    /** ISO 4217 code of the target currency (e.g. "EUR"). */
    @Column(name = "TO_CURRENCY", nullable = false, length = 3)
    private String toCurrency;

    /**
     * Exchange rate: 1 unit of {@code fromCurrency} expressed in
     * {@code toCurrency}.  Stored with up to 10 decimal places to
     * preserve precision for exotic pairs.
     */
    @Column(name = "RATE", nullable = false, precision = 19, scale = 10)
    private BigDecimal rate;

    // ------------------------------------------------------------------ //
    //  Constructors
    // ------------------------------------------------------------------ //

    public HistoricalCurrencyRate() {}

    public HistoricalCurrencyRate(LocalDate rateDate,
                                  String fromCurrency,
                                  String toCurrency,
                                  BigDecimal rate) {
        this.rateDate     = rateDate;
        this.fromCurrency = fromCurrency;
        this.toCurrency   = toCurrency;
        this.rate         = rate;
    }

    // ------------------------------------------------------------------ //
    //  Accessors
    // ------------------------------------------------------------------ //

    public Long getId()                  { return id; }
    public void setId(Long id)           { this.id = id; }

    public LocalDate getRateDate()                   { return rateDate; }
    public void      setRateDate(LocalDate rateDate) { this.rateDate = rateDate; }

    public String getFromCurrency()                      { return fromCurrency; }
    public void   setFromCurrency(String fromCurrency)   { this.fromCurrency = fromCurrency; }

    public String getToCurrency()                    { return toCurrency; }
    public void   setToCurrency(String toCurrency)   { this.toCurrency = toCurrency; }

    public BigDecimal getRate()                { return rate; }
    public void       setRate(BigDecimal rate) { this.rate = rate; }

    @Override
    public String toString() {
        return "HistoricalCurrencyRate{"
            + "id=" + id
            + ", rateDate=" + rateDate
            + ", fromCurrency='" + fromCurrency + '\''
            + ", toCurrency='" + toCurrency + '\''
            + ", rate=" + rate
            + '}';
    }
}
