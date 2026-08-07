```markdown
# Frontend Application

## Currency Selector Component

### Overview
The Currency Selector component allows users to choose their preferred currency from a dropdown list, which updates the display of product prices accordingly.

### Implementation Details
- **Component Location**: `src/components/CurrencySelector.tsx`
- **State Management**: Utilizes React's Context API to manage and propagate currency state throughout the application.
- **Testing**: Includes unit tests in `src/tests/CurrencySelector.test.tsx`.

### Adding New Currencies
To add new currencies to the selection list, modify the `currencies` array inside `CurrencySelector.tsx`.

### Deployment
Follow the standard deployment process to ensure that the updated frontend application, including the currency selector component, is deployed without errors.

### Notes
- Ensure that any backend functionality related to currency conversion is correctly interfaced with this component.
- Monitor for any issues post-deployment in the production environment to ensure that no existing functionalities are disrupted.
```