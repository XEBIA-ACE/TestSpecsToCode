/**
 * CurrencySelector — Type Definitions
 *
 * Defines the data shapes and prop interfaces for the CurrencySelector
 * dropdown component. These types are the authoritative contract between
 * the component and its consumers.
 */

/** ISO 4217 currency entry displayed in the dropdown. */
export interface Currency {
  /** ISO 4217 three-letter code, e.g. "USD". */
  code: string;
  /** Human-readable name, e.g. "US Dollar". */
  name: string;
  /** Unicode currency symbol, e.g. "$". */
  symbol: string;
}

/** Props accepted by the <CurrencySelector /> component. */
export interface CurrencySelectorProps {
  /**
   * The currently selected currency code (ISO 4217).
   * Controlled — the parent owns this value.
   */
  selectedCurrency: string;

  /**
   * Callback fired when the user picks a different currency.
   * Receives the full Currency object so the parent can update
   * prices without a second lookup.
   */
  onCurrencyChange: (currency: Currency) => void;

  /**
   * Optional override list of currencies to display.
   * Defaults to the built-in SUPPORTED_CURRENCIES list (>10 entries).
   */
  currencies?: Currency[];

  /**
   * Accessible label for the select element.
   * Defaults to "Select currency".
   */
  label?: string;

  /** Additional CSS class names forwarded to the root element. */
  className?: string;

  /** Disables the selector when true. */
  disabled?: boolean;
}
