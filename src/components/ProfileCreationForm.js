```javascript
import React, { useState } from 'react';
import { TextField, Button, FormHelperText } from '@radix-ui/react';

// Validation function for email using regular expression
const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Validation function for password with basic criteria
const validatePassword = (password) => {
  return password.length >= 8;
};

function ProfileCreationForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });

  const handleSubmit = (event) => {
    event.preventDefault();

    const emailError = validateEmail(email) ? '' : 'Invalid email address';
    const passwordError = validatePassword(password) ? '' : 'Password must be at least 8 characters long';

    setErrors({
      email: emailError,
      password: passwordError
    });

    if (!emailError && !passwordError) {
      // Proceed with form submission logic
      console.log("Form submitted successfully.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <TextField 
          placeholder="Email Address" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={errors.email ? "true" : "false"}
        />
        {errors.email && <FormHelperText>{errors.email}</FormHelperText>}
      </div>

      <div>
        <TextField 
          type="password"
          placeholder="Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={errors.password ? "true" : "false"}
        />
        {errors.password && <FormHelperText>{errors.password}</FormHelperText>}
      </div>

      <Button type="submit">Create Profile</Button>
    </form>
  );
}

export default ProfileCreationForm;
```