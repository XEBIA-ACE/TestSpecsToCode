```javascript
import axios from 'axios';

/**
 * Fetches the user profile data from the backend.
 * @returns {Promise<Object>} The user profile data.
 * @throws Will throw an error if the request fails.
 */
export async function fetchUserProfile() {
  try {
    const response = await axios.get('/api/v1/user/profile');
    return response.data;
  } catch (error) {
    if (error.response) {
      // Request made and server responded
      console.error('Error fetching profile data:', error.response.data);
      throw new Error('Failed to fetch profile data');
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      throw new Error('No response from server');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error during request setup:', error.message);
      throw new Error('Request setup error');
    }
  }
}
```