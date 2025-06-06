import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import postRoutes from './routes/posts';
import friendRoutes from './routes/friends';
import groupRoutes from './routes/groups';
import notificationRoutes from './routes/notifications';
import chatRoutes from './routes/chat';

// Initialize Express app
const app: Application = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Socket.IO connection handling
io.on('connection', (socket) => {
  // Handle joining a chat room
  socket.on('joinChat', ({ chatId, userId }) => {
    socket.join(chatId);
  });

  // Handle sending a message
  socket.on('sendMessage', (message) => {
    const chatId = message.chatId;
    if (chatId) {
      io.to(chatId).emit('newMessage', message);
    }
  });

  socket.on('disconnect', () => {});
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);

// Basic route
app.get('/', (req: Request, res: Response): void => {
  res.send('Frendly API is running...');
});

// Start server
httpServer.listen(process.env.PORT || 5001, (): void => {
  console.log(`Server is running on port ${process.env.PORT || 5001}`);
}); 