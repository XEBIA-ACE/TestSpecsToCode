```javascript
const request = require('supertest');
const app = require('../app');  // Assuming app is the Express app

describe('PUT /profile', () => {
  it('should update the user profile with valid data', async () => {
    // Mock user authentication here

    const response = await request(app)
      .put('/profile')
      .send({
        name: 'New Name',
        email: 'newemail@example.com',
        password: 'newpassword123'
      });

    expect(response.status).toBe(200);
    expect(response.body.msg).toBe('Profile updated successfully');
  });

  it('should return 400 for invalid email', async () => {
    // Mock user authentication here

    const response = await request(app)
      .put('/profile')
      .send({
        email: 'invalidemail'
      });

    expect(response.status).toBe(400);
    expect(response.body.errors[0].msg).toBe('Must be a valid email');
  });

  it('should return 404 for non-existent user', async () => {
    // Mock user authentication here to simulate a non-existent user

    const response = await request(app)
      .put('/profile')
      .send({
        name: 'Name'
      });

    expect(response.status).toBe(404);
    expect(response.body.msg).toBe('User not found');
  });
});
```