# CurrencySelector — UI Component Interface Documentation

> **Location**: `FRONTEND/src/components/CurrencySelector/`  
> **User Story**: US-001 — Currency Selection User Interface  
> **Status**: Design complete, ready for implementation review

---

## Overview

`CurrencySelector` is a controlled dropdown component that lets users choose
from a list of **15 supported currencies** (satisfying the ">10 currencies"
acceptance criterion). When a selection is made the parent component is
notified via a callback so it can update displayed prices immediately.

---

## File Structure

```
FRONTEND/src/components/CurrencySelector/
├── CurrencySelector.tsx   # React component (dropdown UI)
├── CurrencySelector.css   # Scoped BEM styles
├── CurrencyContext.tsx    # Context + Provider + useCurrency hook
├── currencies.ts          # Static list of 15 supported currencies
├── types.ts               # TypeScript interfaces (Currency, CurrencySelectorProps)
└── index.ts               # Public barrel export
```

---

## Component Interface

### `<CurrencySelector />`

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `selectedCurrency` | `string` | ✅ | — | ISO 4217 code of the active currency (e.g. `"USD"`) |
| `onCurrencyChange` | `(currency: Currency) => void` | ✅ | — | Fired when the user picks a new currency |
| `currencies` | `Currency[]` | ❌ | `SUPPORTED_CURRENCIES` | Override the displayed list |
| `label` | `string` | ❌ | `"Select currency"` | Accessible label text |
| `className` | `string` | ❌ | `""` | Extra CSS classes on the root element |
| `disabled` | `boolean` | ❌ | `false` | Disables the dropdown |

### `Currency` data shape

```ts
interface Currency {
  code:   string;  // ISO 4217 — e.g. "EUR"
  name:   string;  // Human-readable — e.g. "Euro"
  symbol: string;  // Unicode symbol — e.g. "€"
}
```

---

## Supported Currencies (default list)

| Code | Name | Symbol |
|------|------|--------|
| USD | US Dollar | $ |
| EUR | Euro | € |
| GBP | British Pound | £ |
| JPY | Japanese Yen | ¥ |
| CAD | Canadian Dollar | CA$ |
| AUD | Australian Dollar | A$ |
| CHF | Swiss Franc | Fr |
| CNY | Chinese Yuan | ¥ |
| INR | Indian Rupee | ₹ |
| BRL | Brazilian Real | R$ |
| MXN | Mexican Peso | MX$ |
| SGD | Singapore Dollar | S$ |
| HKD | Hong Kong Dollar | HK$ |
| NOK | Norwegian Krone | kr |
| SEK | Swedish Krona | kr |

---

## Design: Dropdown Mechanism

The component renders a native HTML `<select>` element for the following reasons:

- **Accessibility** — keyboard navigation, screen-reader support, and focus
  management are handled by the browser with no extra dependencies.
- **Performance** — no third-party dropdown library is required.
- **Composability** — the `className` prop and BEM CSS classes allow the host
  app to restyle the element to match any design system (Tailwind, shadcn, etc.).

The dropdown option format is:

```
{symbol} — {code} ({name})
```

Example: `$ — USD (US Dollar)`

---

## Integration Guide

### 1. Standalone (local state)

```tsx
import { useState } from 'react';
import CurrencySelector from '@/components/CurrencySelector';
import type { Currency } from '@/components/CurrencySelector';

function PriceDisplay() {
  const [currency, setCurrency] = useState<Currency>({ code: 'USD', name: 'US Dollar', symbol: '$' });

  return (
    <>
      <CurrencySelector
        selectedCurrency={currency.code}
        onCurrencyChange={setCurrency}
      />
      <p>Price: {currency.symbol}99.99</p>
    </>
  );
}
```

### 2. Shared state via Context (recommended for multi-component trees)

```tsx
// main.tsx — wrap the app once
import { CurrencyProvider } from '@/components/CurrencySelector';

createRoot(document.getElementById('root')!).render(
  <CurrencyProvider defaultCurrency="USD">
    <App />
  </CurrencyProvider>
);

// Any descendant component
import CurrencySelector, { useCurrency } from '@/components/CurrencySelector';

function Header() {
  const { selectedCurrency, setSelectedCurrency } = useCurrency();
  return (
    <CurrencySelector
      selectedCurrency={selectedCurrency.code}
      onCurrencyChange={setSelectedCurrency}
    />
  );
}
```

---

## Non-functional Considerations

- **No breaking changes** — the component is additive; it does not modify any
  existing file in `FRONTEND/src/`.
- **Tree-shakeable** — unused exports (e.g. `CURRENCY_MAP`) are eliminated by
  Vite's bundler.
- **Out of scope** — currency conversion rates, backend storage, and session
  persistence of the selected currency are explicitly excluded (see `spec.md`).

---

## Review Checklist

- [ ] Frontend team code review
- [ ] UI/UX designer sign-off on dropdown layout and option format
- [ ] Accessibility audit (keyboard + screen reader)
- [ ] Integration test with price-display components
