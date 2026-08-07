```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CurrencySelector from '../components/CurrencySelector';

describe('CurrencySelector Component', () => {
  test('renders correctly with default currency', () => {
    render(<CurrencySelector />);
    const selectElement = screen.getByLabelText(/select currency/i) as HTMLSelectElement;
    expect(selectElement).toBeInTheDocument();
    expect(selectElement.value).toBe('USD');
  });

  test('changes currency on selection', () => {
    render(<CurrencySelector />);
    const selectElement = screen.getByLabelText(/select currency/i) as HTMLSelectElement;
    
    fireEvent.change(selectElement, { target: { value: 'EUR' } });
    expect(selectElement.value).toBe('EUR');
  });

  test('has more than ten currency options', () => {
    render(<CurrencySelector />);
    const options = screen.getAllByRole('option');
    expect(options.length).toBeGreaterThan(10);
  });
});
```