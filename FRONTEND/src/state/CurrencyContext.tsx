/**
 * CurrencyContext.tsx
 *
 * React Context + Provider for currency selection state management.
 *
 * Usage:
 *   // Wrap the app (or a subtree) with the provider:
 *   <CurrencyProvider>
 *     <App />
 *   </CurrencyProvider>
 *
 *   // Consume in any child component:
 *   const { selectedCurrency, availableCurrencies, selectCurrency } = useCurrency();
 *
 * Acceptance criteria addressed:
 *   ✓ Selected currency is stored in application state (useState inside provider)
 *   ✓ UI reflects changes immediately (React state update triggers re-render)
 *   ✓ Integration does not disrupt current state management (additive context,
 *     no modifications to existing providers)
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { AVAILABLE_CURRENCIES, DEFAULT_CURRENCY } from './currencies';
import type { Currency, CurrencyCode, CurrencyContextValue } from './currencyTypes';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);
CurrencyContext.displayName = 'CurrencyContext';

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface CurrencyProviderProps {
  children: ReactNode;
  /** Optional override for the initial currency (useful in tests). */
  initialCurrency?: Currency;
}

export function CurrencyProvider({
  children,
  initialCurrency = DEFAULT_CURRENCY,
}: CurrencyProviderProps): JSX.Element {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(initialCurrency);

  /**
   * selectCurrency — looks up the currency by code and updates state.
   * Unknown codes are silently ignored to avoid breaking the UI.
   */
  const selectCurrency = useCallback((code: CurrencyCode): void => {
    const found = AVAILABLE_CURRENCIES.find((c) => c.code === code);
    if (found) {
      setSelectedCurrency(found);
    }
  }, []);

  // Memoised so consumers only re-render when selectedCurrency actually changes.
  const value = useMemo<CurrencyContextValue>(
    () => ({
      selectedCurrency,
      availableCurrencies: AVAILABLE_CURRENCIES,
      selectCurrency,
    }),
    [selectedCurrency, selectCurrency],
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * useCurrency — convenience hook that returns the full CurrencyContextValue.
 * Must be called inside a <CurrencyProvider> tree.
 */
export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (ctx === undefined) {
    throw new Error('useCurrency must be used within a <CurrencyProvider>');
  }
  return ctx;
}

export { CurrencyContext };
