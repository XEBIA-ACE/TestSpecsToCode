package com.salesmanager.core.business.services.currency;

/**
 * Checked exception thrown when a historical currency rate cannot be retrieved
 * from an external provider due to network errors, API limits, or unexpected responses.
 */
public class CurrencyRateRetrievalException extends Exception {

    public CurrencyRateRetrievalException(String message) {
        super(message);
    }

    public CurrencyRateRetrievalException(String message, Throwable cause) {
        super(message, cause);
    }
}
