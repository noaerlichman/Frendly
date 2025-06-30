import express from 'express';
import { getChatMessages, sendMessage, markMessagesAsRead } from '../controllers/chatController';
import { Server } from 'socket.io';

const router = express.Router();

// Socket.io setup
let io: Server;

export const initializeSocket = (socketIo: Server) => {
  io = socketIo;

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinChat', ({ chatId, userId, friendId }) => {
      console.log(`User ${userId} joining chat ${chatId}`);
      socket.join(chatId);
    });

    socket.on('sendMessage', (message) => {
      console.log('Message received:', message);
      // Broadcast to all users in the chat room
      io.to(message.chatId).emit('newMessage', message);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};


// get chat messages /api/chat/:userId/:otherUserId
router.get('/:userId/:otherUserId', getChatMessages);

// send new message /api/chat
router.post('/', sendMessage);

// mark message as read /api/chat/read
router.put('/read', markMessagesAsRead);

export default router; 