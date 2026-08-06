```javascript
import React, { useEffect, useState } from 'react';
import currencyService from '../services/currencyService';

const CurrencyRateDisplay = () => {
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrencyRates = async () => {
      try {
        const response = await currencyService.getRates();
        setRates(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching currency rates: ", error);
        setLoading(false);
      }
    };

    fetchCurrencyRates();

    const interval = setInterval(() => {
      fetchCurrencyRates();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading currency rates...</div>;

  return (
    <div className="currency-rate-display">
      <h2>Real-time Currency Rates</h2>
      <ul>
        {Object.keys(rates).map((currency) => (
          <li key={currency}>
            <div>{currency}: {rates[currency].toFixed(2)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CurrencyRateDisplay;
```