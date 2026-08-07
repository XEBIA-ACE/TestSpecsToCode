```typescript
import { Request, Response } from 'express';
import { UserProfileService } from '../services/UserProfileService';

export class UserProfileController {
  private userProfileService: UserProfileService;

  constructor(userProfileService: UserProfileService) {
    this.userProfileService = userProfileService;
  }

  public async createProfile(req: Request, res: Response): Promise<void> {
    try {
      const userProfileData = req.body;
      const createdProfile = await this.userProfileService.createUserProfile(userProfileData);
      res.status(201).json(createdProfile);
    } catch (error) {
      res.status(400).json({ error: 'Failed to create user profile' });
    }
  }

  // Additional methods for managing user profiles can be implemented here
}
```