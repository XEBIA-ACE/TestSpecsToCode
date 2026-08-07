```typescript
import React, { useState } from 'react';

interface Currency {
  code: string;
  name: string;
}

const currencies: Currency[] = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'SEK', name: 'Swedish Krona' },
  { code: 'NZD', name: 'New Zealand Dollar' },
  // Add more currencies as needed
];

const CurrencySelector: React.FC = () => {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currencies[0]);

  const handleCurrencyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCode = event.target.value;
    const currency = currencies.find((c) => c.code === selectedCode);
    if (currency) {
      setSelectedCurrency(currency);
      // Here you would also update app state or make an API call to update prices
    }
  };

  return (
    <div>
      <label htmlFor="currency-select">Select Currency: </label>
      <select id="currency-select" value={selectedCurrency.code} onChange={handleCurrencyChange}>
        {currencies.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CurrencySelector;
```