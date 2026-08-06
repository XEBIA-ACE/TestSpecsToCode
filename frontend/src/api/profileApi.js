/**
 * profileApi.js
 * Frontend API client for profile-related requests.
 * Sends profile changes to PUT /api/profile and returns the response.
 */

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

/**
 * Update the current user's profile.
 *
 * @param {{ name?: string, email?: string, password?: string }} profileData
 * @param {string} authToken - JWT Bearer token for the authenticated user.
 * @returns {Promise<{ success: boolean, message: string, user?: object }>}
 */
export async function updateProfile(profileData, authToken) {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(profileData),
  });

  const data = await response.json();

  if (!response.ok) {
    // Normalise error shape so callers always get { success, message }
    throw Object.assign(new Error(data.message || 'Profile update failed.'), {
      status: response.status,
      data,
    });
  }

  return data; // { success: true, message: '...', user: { id, name, email } }
}
