import React, { useState } from 'react';
import axios from 'axios';

const UserProfileForm = () => {
  const [profile, setProfile] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('/api/v1/users/profile', profile);
      if (response.status === 200) {
        setMessage('Profile updated successfully.');
      } else {
        setMessage('Failed to update profile.');
      }
    } catch (error) {
      setMessage('An error occurred while updating the profile.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name:
        <input type="text" name="name" value={profile.name} onChange={handleChange} />
      </label>
      <label>
        Email:
        <input type="email" name="email" value={profile.email} onChange={handleChange} />
      </label>
      <label>
        Password:
        <input type="password" name="password" value={profile.password} onChange={handleChange} />
      </label>
      <button type="submit">Save</button>
      <p>{message}</p>
    </form>
  );
};

export default UserProfileForm;
