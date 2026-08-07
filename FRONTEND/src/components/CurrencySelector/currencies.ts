/**
 * currencies.ts
 *
 * Master list of supported currencies (>10 as required by spec US-001).
 * Each entry follows the Currency interface defined in ./types.ts.
 *
 * Currency conversion rates are intentionally out-of-scope (see spec.md).
 * This file only provides the static metadata needed to render the dropdown.
 */

import type { Currency } from './types';

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar',          symbol: '$'  },
  { code: 'EUR', name: 'Euro',               symbol: '€'  },
  { code: 'GBP', name: 'British Pound',      symbol: '£'  },
  { code: 'JPY', name: 'Japanese Yen',       symbol: '¥'  },
  { code: 'CAD', name: 'Canadian Dollar',    symbol: 'CA$'},
  { code: 'AUD', name: 'Australian Dollar',  symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc',        symbol: 'Fr' },
  { code: 'CNY', name: 'Chinese Yuan',       symbol: '¥'  },
  { code: 'INR', name: 'Indian Rupee',       symbol: '₹'  },
  { code: 'BRL', name: 'Brazilian Real',     symbol: 'R$' },
  { code: 'MXN', name: 'Mexican Peso',       symbol: 'MX$'},
  { code: 'SGD', name: 'Singapore Dollar',   symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar',   symbol: 'HK$'},
  { code: 'NOK', name: 'Norwegian Krone',    symbol: 'kr' },
  { code: 'SEK', name: 'Swedish Krona',      symbol: 'kr' },
];

/** Convenience map: code → Currency for O(1) lookups. */
export const CURRENCY_MAP: Record<string, Currency> = Object.fromEntries(
  SUPPORTED_CURRENCIES.map((c) => [c.code, c]),
);
