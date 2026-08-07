/**
 * CurrencyContext.test.tsx
 *
 * Unit tests for the currency state management module.
 *
 * Covers all acceptance criteria:
 *   1. Selected currency is stored in application state
 *   2. UI reflects changes in currency selection immediately
 *   3. Integration does not disrupt current state management
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CurrencyProvider, useCurrency } from './CurrencyContext';
import { AVAILABLE_CURRENCIES, DEFAULT_CURRENCY } from './currencies';

// ---------------------------------------------------------------------------
// Helper component — renders current state and exposes a selector button
// ---------------------------------------------------------------------------
function TestConsumer({ targetCode }: { targetCode: string }) {
  const { selectedCurrency, availableCurrencies, selectCurrency } = useCurrency();
  return (
    <div>
      <span data-testid="selected-code">{selectedCurrency.code}</span>
      <span data-testid="selected-symbol">{selectedCurrency.symbol}</span>
      <span data-testid="available-count">{availableCurrencies.length}</span>
      <button
        data-testid="select-btn"
        onClick={() => selectCurrency(targetCode)}
      >
        Select {targetCode}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CurrencyProvider / useCurrency', () => {
  it('provides the default currency (USD) on first render', () => {
    render(
      <CurrencyProvider>
        <TestConsumer targetCode="EUR" />
      </CurrencyProvider>,
    );

    expect(screen.getByTestId('selected-code').textContent).toBe(DEFAULT_CURRENCY.code);
  });

  it('exposes more than 10 available currencies', () => {
    render(
      <CurrencyProvider>
        <TestConsumer targetCode="EUR" />
      </CurrencyProvider>,
    );

    const count = parseInt(screen.getByTestId('available-count').textContent ?? '0', 10);
    expect(count).toBeGreaterThan(10);
    expect(count).toBe(AVAILABLE_CURRENCIES.length);
  });

  it('updates selected currency immediately when selectCurrency is called', () => {
    render(
      <CurrencyProvider>
        <TestConsumer targetCode="EUR" />
      </CurrencyProvider>,
    );

    // Before selection
    expect(screen.getByTestId('selected-code').textContent).toBe('USD');

    // Trigger selection
    fireEvent.click(screen.getByTestId('select-btn'));

    // After selection — UI must reflect the change immediately
    expect(screen.getByTestId('selected-code').textContent).toBe('EUR');
    expect(screen.getByTestId('selected-symbol').textContent).toBe('€');
  });

  it('accepts an initialCurrency override (useful for testing)', () => {
    const gbp = AVAILABLE_CURRENCIES.find((c) => c.code === 'GBP')!;
    render(
      <CurrencyProvider initialCurrency={gbp}>
        <TestConsumer targetCode="JPY" />
      </CurrencyProvider>,
    );

    expect(screen.getByTestId('selected-code').textContent).toBe('GBP');
  });

  it('silently ignores unknown currency codes', () => {
    render(
      <CurrencyProvider>
        <TestConsumer targetCode="XYZ" />
      </CurrencyProvider>,
    );

    fireEvent.click(screen.getByTestId('select-btn'));

    // State must remain unchanged
    expect(screen.getByTestId('selected-code').textContent).toBe('USD');
  });

  it('throws when useCurrency is used outside a provider', () => {
    // Suppress React's error boundary console output during this test
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    function Bare() {
      useCurrency();
      return null;
    }
    expect(() => render(<Bare />)).toThrow(
      'useCurrency must be used within a <CurrencyProvider>',
    );
    spy.mockRestore();
  });
});
