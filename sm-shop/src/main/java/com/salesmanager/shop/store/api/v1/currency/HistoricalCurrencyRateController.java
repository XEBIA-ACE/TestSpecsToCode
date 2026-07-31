package com.salesmanager.shop.store.api.v1.currency;

import com.salesmanager.core.business.services.currency.HistoricalCurrencyRateService;
import com.salesmanager.core.model.currency.HistoricalCurrencyRate;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * REST controller exposing historical currency rate look-up endpoints.
 *
 * <p>Base path: {@code /api/v1/currency/rates}
 *
 * <p>Endpoints are intentionally read-only (GET) for the initial release.
 * A POST endpoint for seeding/updating rates is included for admin use.
 */
@RestController
@RequestMapping(
    value = "/api/v1/currency/rates",
    produces = MediaType.APPLICATION_JSON_VALUE
)
@Api(tags = "Historical Currency Rates")
public class HistoricalCurrencyRateController {

    private final HistoricalCurrencyRateService rateService;

    public HistoricalCurrencyRateController(HistoricalCurrencyRateService rateService) {
        this.rateService = rateService;
    }

    // ------------------------------------------------------------------ //
    //  GET /api/v1/currency/rates/{from}/{to}?date=YYYY-MM-DD
    // ------------------------------------------------------------------ //

    /**
     * Returns the exchange rate for a specific currency pair on a given date.
     *
     * <p>Example: {@code GET /api/v1/currency/rates/USD/EUR?date=2024-01-15}
     *
     * @param from source currency code (ISO 4217)
     * @param to   target currency code (ISO 4217)
     * @param date the exact date (ISO-8601 format: YYYY-MM-DD)
     * @return 200 with the rate record, or 404 if not found
     */
    @GetMapping("/{from}/{to}")
    @ApiOperation(value = "Get exchange rate for a currency pair on a specific date")
    public ResponseEntity<HistoricalCurrencyRate> getRate(
            @ApiParam(value = "ISO 4217 source currency code", example = "USD")
            @PathVariable("from") String from,

            @ApiParam(value = "ISO 4217 target currency code", example = "EUR")
            @PathVariable("to") String to,

            @ApiParam(value = "Date in ISO-8601 format (YYYY-MM-DD)", example = "2024-01-15")
            @RequestParam("date")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        Optional<HistoricalCurrencyRate> result = rateService.getRate(from, to, date);
        return result.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }

    // ------------------------------------------------------------------ //
    //  GET /api/v1/currency/rates/{from}/{to}/range
    //      ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
    // ------------------------------------------------------------------ //

    /**
     * Returns all exchange rates for a currency pair within an inclusive date range.
     *
     * <p>Example:
     * {@code GET /api/v1/currency/rates/USD/EUR/range?startDate=2024-01-01&endDate=2024-01-31}
     *
     * @param from      source currency code (ISO 4217)
     * @param to        target currency code (ISO 4217)
     * @param startDate range start (inclusive, ISO-8601)
     * @param endDate   range end   (inclusive, ISO-8601)
     * @return 200 with a (possibly empty) list of rate records
     */
    @GetMapping("/{from}/{to}/range")
    @ApiOperation(value = "Get exchange rates for a currency pair within a date range")
    public ResponseEntity<List<HistoricalCurrencyRate>> getRatesInRange(
            @ApiParam(value = "ISO 4217 source currency code", example = "USD")
            @PathVariable("from") String from,

            @ApiParam(value = "ISO 4217 target currency code", example = "EUR")
            @PathVariable("to") String to,

            @ApiParam(value = "Range start date (YYYY-MM-DD)", example = "2024-01-01")
            @RequestParam("startDate")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,

            @ApiParam(value = "Range end date (YYYY-MM-DD)", example = "2024-01-31")
            @RequestParam("endDate")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<HistoricalCurrencyRate> rates =
                rateService.getRatesInRange(from, to, startDate, endDate);
        return ResponseEntity.ok(rates);
    }

    // ------------------------------------------------------------------ //
    //  GET /api/v1/currency/rates/{from}
    // ------------------------------------------------------------------ //

    /**
     * Returns all stored rates for a given source currency, ordered by date
     * descending (most-recent first).
     *
     * <p>Example: {@code GET /api/v1/currency/rates/USD}
     *
     * @param from source currency code (ISO 4217)
     * @return 200 with a (possibly empty) list of rate records
     */
    @GetMapping("/{from}")
    @ApiOperation(value = "Get all historical rates for a source currency")
    public ResponseEntity<List<HistoricalCurrencyRate>> getRatesBySourceCurrency(
            @ApiParam(value = "ISO 4217 source currency code", example = "USD")
            @PathVariable("from") String from) {

        List<HistoricalCurrencyRate> rates = rateService.getRatesBySourceCurrency(from);
        return ResponseEntity.ok(rates);
    }

    // ------------------------------------------------------------------ //
    //  POST /api/v1/currency/rates  (admin — seed / update a rate record)
    // ------------------------------------------------------------------ //

    /**
     * Creates or updates a historical currency rate record.
     *
     * <p>Intended for administrative use (e.g. batch import of rate data).
     *
     * @param rate the rate entity to persist
     * @return 200 with the saved entity
     */
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @ApiOperation(value = "Create or update a historical currency rate record")
    public ResponseEntity<HistoricalCurrencyRate> saveRate(
            @RequestBody HistoricalCurrencyRate rate) {

        HistoricalCurrencyRate saved = rateService.saveRate(rate);
        return ResponseEntity.ok(saved);
    }
}
