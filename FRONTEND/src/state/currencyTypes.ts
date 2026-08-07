/**
 * currencyTypes.ts
 *
 * Shared TypeScript types for the currency selection state management.
 * Keeps the type definitions decoupled from the context implementation so
 * they can be imported by any consumer without pulling in React.
 */

/** ISO 4217 currency code, e.g. "USD", "EUR". */
export type CurrencyCode = string;

export interface Currency {
  /** ISO 4217 code */
  code: CurrencyCode;
  /** Human-readable label shown in the selector */
  label: string;
  /** Unicode currency symbol */
  symbol: string;
}

export interface CurrencyState {
  /** The currently selected currency */
  selectedCurrency: Currency;
  /** Full list of available currencies (>10 per spec) */
  availableCurrencies: Currency[];
}

export interface CurrencyContextValue extends CurrencyState {
  /**
   * Update the selected currency.
   * Triggers an immediate re-render of all subscribed consumers.
   */
  selectCurrency: (code: CurrencyCode) => void;
}
