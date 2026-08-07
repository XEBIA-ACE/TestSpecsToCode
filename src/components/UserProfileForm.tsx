```tsx
import React from 'react';
import * as Radix from '@radix-ui/react'; // Assuming general radix import pattern
import { useForm } from 'react-hook-form';

interface UserProfileFormData {
  username: string;
  email: string;
  password: string;
}

const UserProfileForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<UserProfileFormData>();

  const onSubmit = (data: UserProfileFormData) => {
    console.log(data);
    // Handle form submission logic
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Radix.Fieldset>
        <Radix.Label htmlFor="username">Username</Radix.Label>
        <Radix.Input
          id="username"
          {...register('username', { required: 'Username is required' })}
        />
        {errors.username && <Radix.Error>{errors.username.message}</Radix.Error>}
      </Radix.Fieldset>

      <Radix.Fieldset>
        <Radix.Label htmlFor="email">Email</Radix.Label>
        <Radix.Input
          id="email"
          type="email"
          {...register('email', { required: 'Email is required' })}
        />
        {errors.email && <Radix.Error>{errors.email.message}</Radix.Error>}
      </Radix.Fieldset>

      <Radix.Fieldset>
        <Radix.Label htmlFor="password">Password</Radix.Label>
        <Radix.Input
          id="password"
          type="password"
          {...register('password', { required: 'Password is required' })}
        />
        {errors.password && <Radix.Error>{errors.password.message}</Radix.Error>}
      </Radix.Fieldset>

      <Radix.Button type="submit">
        Create Profile
      </Radix.Button>
    </form>
  );
};

export default UserProfileForm;
```