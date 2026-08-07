```typescript
import request from 'supertest';
import express, { Express } from 'express';
import { UserProfileController } from './UserProfileController';
import { UserProfileService } from '../services/UserProfileService';

jest.mock('../services/UserProfileService');

describe('UserProfileController', () => {
  let app: Express;
  let userProfileService: jest.Mocked<UserProfileService>;
  let userProfileController: UserProfileController;

  beforeEach(() => {
    userProfileService = new UserProfileService() as jest.Mocked<UserProfileService>;
    userProfileController = new UserProfileController(userProfileService);

    app = express();
    app.use(express.json());
    app.post('/profiles', (req, res) => userProfileController.createProfile(req, res));
  });

  it('should create a user profile successfully', async () => {
    userProfileService.createUserProfile.mockResolvedValue({ id: '123', name: 'John Doe' });

    const response = await request(app)
      .post('/profiles')
      .send({ name: 'John Doe' })
      .expect(201);

    expect(response.body).toEqual({ id: '123', name: 'John Doe' });
    expect(userProfileService.createUserProfile).toHaveBeenCalledWith({ name: 'John Doe' });
  });

  it('should handle errors during profile creation', async () => {
    userProfileService.createUserProfile.mockRejectedValue(new Error('Failed to create user profile'));

    await request(app)
      .post('/profiles')
      .send({ name: 'Jane Doe' })
      .expect(400);
  });
});
```