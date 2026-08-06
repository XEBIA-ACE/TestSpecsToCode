import React, { useState } from 'react';

const ProfileEdit = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);

  const handleProfileUpdate = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        setMessage('Profile updated successfully.');
        // Clear message after a delay.
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage('Failed to update profile. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div>
      <h1>Edit Profile</h1>
      <form onSubmit={handleProfileUpdate}>
        <div>
          <label>Name: </label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label>Email: </label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label>Password: </label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit">Save Changes</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ProfileEdit;
```

### Explanation:
- We added a `message` state to display feedback to the user.
- The `handleProfileUpdate` method handles the form submission, sending the update request to a presumed backend endpoint (`/api/profile/update`).
- On success, a confirmation message "Profile updated successfully." is shown.
- On failure, an error message is shown.
- The message is cleared automatically after 3 seconds for unobtrusiveness. 

These changes ensure that the user receives clear feedback after attempting to update their profile, aligning with the task requirements.