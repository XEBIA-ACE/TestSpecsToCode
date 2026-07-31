```javascript
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import TransactionHistoryPage from '../TransactionHistoryPage';
import * as currencyService from '../../services/currencyService';

jest.mock('../../services/currencyService');

describe('TransactionHistoryPage', () => {
  test('displays loading state initially', () => {
    currencyService.fetchHistoricalCurrencyRates.mockResolvedValueOnce([]);
    render(<TransactionHistoryPage />);
    expect(screen.getByText(/loading currency rates/i)).toBeInTheDocument();
  });

  test('displays currency rates after loading', async () => {
    const mockRates = [
      { date: '2023-10-01', currency: 'USD', rate: '1.0' },
      { date: '2023-10-01', currency: 'EUR', rate: '0.85' },
    ];
    currencyService.fetchHistoricalCurrencyRates.mockResolvedValueOnce(mockRates);

    render(<TransactionHistoryPage />);

    await waitFor(() => expect(screen.getByText(/usd/i)).toBeInTheDocument());
    expect(screen.getByText(/eur/i)).toBeInTheDocument();
    expect(screen.getByText(/1.0/i)).toBeInTheDocument();
    expect(screen.getByText(/0.85/i)).toBeInTheDocument();
  });

  test('handles errors in fetching data', async () => {
    currencyService.fetchHistoricalCurrencyRates.mockRejectedValueOnce(
      new Error('Failed to fetch')
    );

    render(<TransactionHistoryPage />);

    await waitFor(() =>
      expect(screen.queryByText(/loading currency rates/i)).not.toBeInTheDocument()
    );
    expect(console.error).toHaveBeenCalledWith(
      'Failed to fetch historical currency rates:',
      expect.any(Error)
    );
  });
});
```