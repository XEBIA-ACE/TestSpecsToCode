```typescript
import React from 'react';
import { CurrencyProvider } from '../state/currencyState';
import CurrencySelector from '../components/CurrencySelector';

const App: React.FC = () => {
  return (
    <CurrencyProvider>
      <div>
        <h1>Product Pricing</h1>
        <CurrencySelector />
        {/* Rest of the application components */}
      </div>
    </CurrencyProvider>
  );
};

export default App;
```