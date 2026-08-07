```tsx
import React from 'react';
import ProfileForm from '../components/ProfileForm/ProfileForm';

const App: React.FC = () => {
  const handleProfileSubmit = (data: any) => {
    console.log('Profile data submitted:', data);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>User Profile</h1>
      </header>
      <main>
        <ProfileForm onSubmit={handleProfileSubmit} />
      </main>
    </div>
  );
};

export default App;
```