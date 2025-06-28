import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { initSocket } from './services/socket';

dotenv.config();

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import postRoutes from './routes/posts';
import friendRoutes from './routes/friends';
import groupRoutes from './routes/groups';
import notificationRoutes from './routes/notifications';
import chatRoutes from './routes/chat';

const app: Application = express();
const httpServer = createServer(app);

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
app.use('/api/chat', chatRoutes);

app.get('/', (req: Request, res: Response): void => {
  res.send('Frendly API is running...');
});

// Initialize socket after all routes
initSocket(httpServer);

httpServer.listen(process.env.PORT || 5001, (): void => {
  console.log(`Server is running on port ${process.env.PORT || 5001}`);
});
