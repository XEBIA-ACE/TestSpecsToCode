```javascript
const request = require('supertest');
const express = require('express');
const createUserProfileRouter = require('../../src/routes/createUserProfileRouter');

const app = express();
app.use(express.json());
app.use('/profile', createUserProfileRouter);

describe('POST /profile/create', () => {
  it('should create a user profile and return 201 status', async () => {
    const response = await request(app)
      .post('/profile/create')
      .send({ name: 'John Doe', email: 'john.doe@example.com' });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ name: 'John Doe', email: 'john.doe@example.com' });
  });

  it('should return 400 status on invalid input', async () => {
    const response = await request(app)
      .post('/profile/create')
      .send({}); // Sending empty data

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid user profile data provided');
  });
});
```