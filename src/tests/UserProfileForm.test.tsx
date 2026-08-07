```tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserProfileForm from '../components/UserProfileForm';

describe('UserProfileForm Component', () => {
  test('renders the form fields correctly', () => {
    render(<UserProfileForm />);
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  test('displays validation messages on submit with empty fields', async () => {
    render(<UserProfileForm />);
    fireEvent.click(screen.getByRole('button', { name: /create profile/i }));

    expect(await screen.findAllByText(/is required/i)).toHaveLength(3);
  });

  test('submits the form with valid data', async () => {
    render(<UserProfileForm />);
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /create profile/i }));

    // Assuming console.log is the side effect for demonstration
    expect(console.log).toHaveBeenCalledWith({
      username: 'testuser',
      email: 'user@test.com',
      password: 'password123',
    });
  });
});
```