/**
 * index.ts — public barrel for the CurrencySelector feature module.
 *
 * Consumers import from this single entry-point:
 *
 *   import CurrencySelector, {
 *     CurrencyProvider,
 *     useCurrency,
 *     SUPPORTED_CURRENCIES,
 *     CURRENCY_MAP,
 *   } from '@/components/CurrencySelector';
 */

export { default } from './CurrencySelector';
export { CurrencyProvider, useCurrency } from './CurrencyContext';
export { SUPPORTED_CURRENCIES, CURRENCY_MAP } from './currencies';
export type { Currency, CurrencySelectorProps } from './types';
