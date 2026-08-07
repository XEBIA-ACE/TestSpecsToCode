/**
 * CurrencyContext.tsx
 *
 * React Context + Provider for sharing the selected currency across the
 * component tree without prop-drilling.
 *
 * Usage
 * ─────
 *   // Wrap the app (or a subtree) once:
 *   <CurrencyProvider defaultCurrency="USD">
 *     <App />
 *   </CurrencyProvider>
 *
 *   // Consume anywhere inside the tree:
 *   const { selectedCurrency, setSelectedCurrency } = useCurrency();
 */

import React, { createContext, useContext, useState } from 'react';
import type { Currency } from './types';
import { CURRENCY_MAP, SUPPORTED_CURRENCIES } from './currencies';

interface CurrencyContextValue {
  /** The currently active Currency object. */
  selectedCurrency: Currency;
  /** Update the active currency. */
  setSelectedCurrency: (currency: Currency) => void;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

interface CurrencyProviderProps {
  /** ISO 4217 code for the initial currency. Defaults to "USD". */
  defaultCurrency?: string;
  children: React.ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({
  defaultCurrency = 'USD',
  children,
}) => {
  const initial = CURRENCY_MAP[defaultCurrency] ?? SUPPORTED_CURRENCIES[0];
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(initial);

  return (
    <CurrencyContext.Provider value={{ selectedCurrency, setSelectedCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

/**
 * Hook to access the currency context.
 * Must be used inside a <CurrencyProvider>.
 */
export const useCurrency = (): CurrencyContextValue => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error('useCurrency must be used within a <CurrencyProvider>');
  }
  return ctx;
};
