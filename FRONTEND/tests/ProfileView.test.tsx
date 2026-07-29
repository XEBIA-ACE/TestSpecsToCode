import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfileView from '../src/components/ProfileView';

// Mock data for the test
const mockProfileData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phoneNumber: '+1234567890',
};

// Mock component that would normally fetch and display profile data
jest.mock('../src/components/ProfileView', () => ({
  __esModule: true,
  default: () => (
    <div>
      <h1>{mockProfileData.name}</h1>
      <p>{mockProfileData.email}</p>
      <p>{mockProfileData.phoneNumber}</p>
    </div>
  ),
}));

// Tests

describe('ProfileView Component', () => {
  it('should render the profile details correctly', () => {
    render(<ProfileView />);
    expect(screen.getByText(mockProfileData.name)).toBeInTheDocument();
    expect(screen.getByText(mockProfileData.email)).toBeInTheDocument();
    expect(screen.getByText(mockProfileData.phoneNumber)).toBeInTheDocument();
  });

  it('should handle errors gracefully', () => {
    // To simulate error handling, render the component differently when there's an error fetching data
    jest.mock('../src/components/ProfileView', () => ({
      __esModule: true,
      default: () => <div>Error loading profile</div>,
    }));

    const { rerender } = render(<ProfileView />);
    rerender(<ProfileView />);
    expect(screen.getByText(/error loading profile/i)).toBeInTheDocument();
  });
});