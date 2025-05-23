import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import postRoutes from './routes/posts';
import friendRoutes from './routes/friends';
import groupRoutes from './routes/groups';
import notificationRoutes from './routes/notifications';

// Initialize Express app
const app: Application = express();
const PORT: number = parseInt(process.env.PORT || '5001', 10);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/notifications', notificationRoutes);
// Basic route
app.get('/', (req: Request, res: Response): void => {
  res.send('Frendly API is running...');
});

// Start server
app.listen(PORT, (): void => {
  console.log(`Server running on port ${PORT}`);
}); 