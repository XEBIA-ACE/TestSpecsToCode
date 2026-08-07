/**
 * CurrencySelector.tsx
 *
 * Dropdown component that lets users choose from a list of supported
 * currencies (>10 entries). When a selection is made the parent is
 * notified via `onCurrencyChange` so it can update displayed prices.
 *
 * Design decisions
 * ────────────────
 * • Uses a native <select> element for maximum accessibility and
 *   keyboard support without additional dependencies.
 * • Fully controlled — the parent owns `selectedCurrency`.
 * • Falls back to SUPPORTED_CURRENCIES when no `currencies` prop is
 *   supplied, satisfying the ">10 currencies" acceptance criterion.
 * • Forwards an optional `className` so it can be positioned anywhere
 *   in the existing layout without style conflicts.
 *
 * Integration notes
 * ─────────────────
 * Wrap the app (or the relevant subtree) with CurrencyProvider
 * (see CurrencyContext.tsx) to share the selected currency across
 * components without prop-drilling.
 */

import React, { useId } from 'react';
import type { CurrencySelectorProps } from './types';
import { SUPPORTED_CURRENCIES } from './currencies';

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  selectedCurrency,
  onCurrencyChange,
  currencies = SUPPORTED_CURRENCIES,
  label = 'Select currency',
  className = '',
  disabled = false,
}) => {
  const selectId = useId();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const chosen = currencies.find((c) => c.code === event.target.value);
    if (chosen) {
      onCurrencyChange(chosen);
    }
  };

  return (
    <div className={`currency-selector ${className}`.trim()}>
      <label htmlFor={selectId} className="currency-selector__label">
        {label}
      </label>

      <select
        id={selectId}
        value={selectedCurrency}
        onChange={handleChange}
        disabled={disabled}
        aria-label={label}
        className="currency-selector__select"
      >
        {currencies.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.symbol} — {currency.code} ({currency.name})
          </option>
        ))}
      </select>
    </div>
  );
};

export default CurrencySelector;
