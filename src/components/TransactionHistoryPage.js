```javascript
import React, { useEffect, useState } from 'react';
import { fetchHistoricalCurrencyRates } from '../services/currencyService';

const TransactionHistoryPage = () => {
  const [currencyRates, setCurrencyRates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCurrencyRates = async () => {
      try {
        const rates = await fetchHistoricalCurrencyRates();
        setCurrencyRates(rates);
      } catch (error) {
        console.error('Failed to fetch historical currency rates:', error);
      } finally {
        setLoading(false);
      }
    };
    
    getCurrencyRates();
  }, []);

  return (
    <div className="transaction-history">
      <h1>Transaction History</h1>
      {loading ? (
        <p>Loading currency rates...</p>
      ) : (
        <CurrencyRatesTable rates={currencyRates} />
      )}
    </div>
  );
};

const CurrencyRatesTable = ({ rates }) => (
  <table className="currency-rates-table">
    <thead>
      <tr>
        <th>Date</th>
        <th>Currency</th>
        <th>Rate</th>
      </tr>
    </thead>
    <tbody>
      {rates.map((rate, index) => (
        <tr key={index}>
          <td>{rate.date}</td>
          <td>{rate.currency}</td>
          <td>{rate.rate}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default TransactionHistoryPage;
```