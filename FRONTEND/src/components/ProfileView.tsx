import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ProfileView.css';

interface UserProfile {
  name: string;
  email: string;
  registrationDate: string;
  accountStatus: string;
}

const ProfileView: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/v1/users/me/account');
        setProfile(response.data.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, []);

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-view">
      <h1>User Profile</h1>
      <p><strong>Name:</strong> {profile.name}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Registered on:</strong> {new Date(profile.registrationDate).toLocaleDateString()}</p>
      <p><strong>Account Status:</strong> {profile.accountStatus}</p>
    </div>
  );
};

export default ProfileView;
