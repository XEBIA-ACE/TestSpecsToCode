```tsx
import React from 'react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <p className="text-red-500 text-xs italic">{message}</p>
  );
};

export default ErrorMessage;
```