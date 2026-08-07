/**
 * index.ts
 *
 * Public barrel export for the currency state management module.
 * Import everything consumers need from this single entry point:
 *
 *   import { CurrencyProvider, useCurrency } from '@/state';
 *   import type { Currency, CurrencyCode } from '@/state';
 */

export { CurrencyProvider, useCurrency, CurrencyContext } from './CurrencyContext';
export { AVAILABLE_CURRENCIES, DEFAULT_CURRENCY } from './currencies';
export type { Currency, CurrencyCode, CurrencyState, CurrencyContextValue } from './currencyTypes';
