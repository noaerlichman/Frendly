// services/socket.ts
import { Server } from 'socket.io';

let io: Server | null = null;

export const initSocket = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.handshake.auth?.userId;
    console.log(`Socket connected: ${userId || 'unknown'} (${socket.id})`);

    socket.on('joinChat', ({ chatId }) => {
      console.log(`User ${userId} joined chat: ${chatId}`);
      socket.join(chatId);
    });

    socket.on('sendMessage', (message) => {
      console.log(`Relaying message to chat ${message.chatId}`);
      io?.to(message.chatId).emit('newMessage', message);
    });

    socket.on('disconnect', () => {
      console.log(`Disconnected: ${socket.id}`);
    });
  });

  console.log('Socket.IO initialized');
};

export const getIO = (): Server => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};
