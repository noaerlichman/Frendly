import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { initializeSocket } from './services/socketService';
import notificationsRouter from './routes/notifications';
import authRouter from './routes/auth';
import postsRouter from './routes/posts';
import friendsRouter from './routes/friends';
import groupsRouter from './routes/groups';
import chatRoutes from './routes/chat';

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
initializeSocket(httpServer);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);
app.use('/api/friends', friendsRouter);
app.use('/api/groups', groupsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/chat', chatRoutes);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});