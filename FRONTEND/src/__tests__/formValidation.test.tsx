```typescript
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfileForm from '../components/ProfileForm';

describe('Profile Form Validation', () => {
    beforeEach(() => {
        render(<ProfileForm />);
    });

    test('shows error message if mandatory fields are left empty', async () => {
        fireEvent.click(screen.getByRole('button', { name: /submit/i }));
        
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });

    test('validates email format correctly', () => {
        fireEvent.input(screen.getByLabelText(/email/i), { target: { value: 'invalid-email' } });
        fireEvent.blur(screen.getByLabelText(/email/i));

        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });

    test('allows form submission when all fields are valid', () => {
        fireEvent.input(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
        fireEvent.input(screen.getByLabelText(/email/i), { target: { value: 'john.doe@example.com' } });
        fireEvent.input(screen.getByLabelText(/password/i), { target: { value: 'SecurePassword123' } });

        fireEvent.click(screen.getByRole('button', { name: /submit/i }));

        expect(screen.queryByText(/is required/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/invalid email format/i)).not.toBeInTheDocument();
    });

    test('corrects validation errors dynamically', () => {
        fireEvent.click(screen.getByRole('button', { name: /submit/i }));

        expect(screen.getByText(/name is required/i)).toBeInTheDocument();

        fireEvent.input(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
        fireEvent.blur(screen.getByLabelText(/name/i));

        expect(screen.queryByText(/name is required/i)).not.toBeInTheDocument();
    });
});
```