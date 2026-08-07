```typescript
import request from 'supertest';
import express from 'express';
import { validateProfile } from '../src/middleware/validation.middleware';

const app = express();
app.use(express.json());
app.post('/fake-profile-route', validateProfile, (req, res) => res.status(200).send({ message: 'Success' }));

describe('Profile Validation Middleware', () => {
  it('should return 422 if name is missing', async () => {
    const res = await request(app).post('/fake-profile-route').send({ email: 'test@test.com', password: 'abc123' });
    expect(res.status).toBe(422);
    expect(res.body.errors[0].param).toBe('name');
  });

  it('should return 422 if email is invalid', async () => {
    const res = await request(app).post('/fake-profile-route').send({ name: 'Test', email: 'invalidemail', password: 'abc123' });
    expect(res.status).toBe(422);
    expect(res.body.errors[0].param).toBe('email');
  });

  it('should return 422 if password is too short', async () => {
    const res = await request(app).post('/fake-profile-route').send({ name: 'Test', email: 'test@test.com', password: '123' });
    expect(res.status).toBe(422);
    expect(res.body.errors[0].param).toBe('password');
  });

  it('should pass validation with valid data', async () => {
    const res = await request(app).post('/fake-profile-route').send({ name: 'Test', email: 'test@test.com', password: 'abc123456' });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Success');
  });
});
```