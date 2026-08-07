/**
 * currencies.ts
 *
 * Static list of supported currencies (>10 per acceptance criteria).
 * Currency conversion rates are intentionally out of scope (see spec.md).
 */

import type { Currency } from './currencyTypes';

export const AVAILABLE_CURRENCIES: Currency[] = [
  { code: 'USD', label: 'US Dollar',          symbol: '$'  },
  { code: 'EUR', label: 'Euro',               symbol: '€'  },
  { code: 'GBP', label: 'British Pound',      symbol: '£'  },
  { code: 'JPY', label: 'Japanese Yen',       symbol: '¥'  },
  { code: 'CAD', label: 'Canadian Dollar',    symbol: 'CA$'},
  { code: 'AUD', label: 'Australian Dollar',  symbol: 'A$' },
  { code: 'CHF', label: 'Swiss Franc',        symbol: 'Fr' },
  { code: 'CNY', label: 'Chinese Yuan',       symbol: '¥'  },
  { code: 'INR', label: 'Indian Rupee',       symbol: '₹'  },
  { code: 'BRL', label: 'Brazilian Real',     symbol: 'R$' },
  { code: 'MXN', label: 'Mexican Peso',       symbol: 'MX$'},
  { code: 'KRW', label: 'South Korean Won',   symbol: '₩'  },
  { code: 'SGD', label: 'Singapore Dollar',   symbol: 'S$' },
  { code: 'NOK', label: 'Norwegian Krone',    symbol: 'kr' },
  { code: 'SEK', label: 'Swedish Krona',      symbol: 'kr' },
];

/** Default currency used on first load. */
export const DEFAULT_CURRENCY: Currency = AVAILABLE_CURRENCIES[0]; // USD
