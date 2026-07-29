```typescript
import request from 'supertest';
import { Application } from 'express';
import { createApp } from '../src/app';
import { createDb } from '../src/db/connection';
import { UserRepository } from '../src/repositories/user.repository';

// Mock data
const mockUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  createdAt: new Date('2024-01-01T10:00:00Z'),
  updatedAt: new Date('2024-01-01T10:00:00Z')
};

// Setup Express app for testing
let app: Application;
let userRepository: UserRepository;

beforeAll(() => {
  const db = createDb(':memory:'); // Using in-memory SQLite for testing
  userRepository = new UserRepository(db);
  app = createApp(db, {}, {}, {});
  // Seed the mock user into the in-memory database
  userRepository.add(mockUser);
});

describe('GET /api/v1/user/profile', () => {
  let token: string;

  beforeEach(() => {
    token = 'valid-jwt-token'; // Assume we have a way to generate a valid JWT
  });

  it('should return 200 and user profile data for authenticated users', async () => {
    const response = await request(app)
      .get('/api/v1/user/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toEqual({
      id: mockUser.id,
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
      email: mockUser.email,
      createdAt: mockUser.createdAt.toISOString(),
      updatedAt: mockUser.updatedAt.toISOString(),
    });
  });

  it('should return 401 when no JWT is provided', async () => {
    await request(app)
      .get('/api/v1/user/profile')
      .expect(401);
  });

  it('should return 403 when an invalid JWT is provided', async () => {
    await request(app)
      .get('/api/v1/user/profile')
      .set('Authorization', 'Bearer invalid-jwt-token')
      .expect(403);
  });
});
```