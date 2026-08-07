```javascript
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ProfileCreationForm from '../components/ProfileCreationForm';

test('renders without crashing', () => {
  const { getByPlaceholderText } = render(<ProfileCreationForm />);
  expect(getByPlaceholderText('Email Address')).toBeInTheDocument();
  expect(getByPlaceholderText('Password')).toBeInTheDocument();
});

test('displays validation messages on submit with invalid input', () => {
  const { getByPlaceholderText, getByText, findByText } = render(<ProfileCreationForm />);
  fireEvent.click(getByText('Create Profile'));

  findByText('Invalid email address').then((element) => {
    expect(element).toBeInTheDocument();
  });

  findByText('Password must be at least 8 characters long').then((element) => {
    expect(element).toBeInTheDocument();
  });
});

test('allows form submission with valid inputs', () => {
  const { getByPlaceholderText, getByText } = render(<ProfileCreationForm />);
  const emailInput = getByPlaceholderText('Email Address');
  const passwordInput = getByPlaceholderText('Password');

  fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
  fireEvent.change(passwordInput, { target: { value: 'validpassword' } });
  fireEvent.click(getByText('Create Profile'));

  expect(emailInput.value).toBe('test@example.com');
  expect(passwordInput.value).toBe('validpassword');
  expect(() => getByText('Invalid email address')).toThrow();
  expect(() => getByText('Password must be at least 8 characters long')).toThrow();
});
```