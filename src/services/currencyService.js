```javascript
export const fetchHistoricalCurrencyRates = async () => {
  // Placeholder for service request. Use the right endpoint and implementation.
  const response = await fetch('/api/currency/historical-rates');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  return data.rates;
};
```