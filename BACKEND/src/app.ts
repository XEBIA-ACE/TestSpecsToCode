import express from 'express';
import cors from 'cors';
import userProfileRouter from './routes/user-profile.routes';

const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/users', userProfileRouter);

export default app;
