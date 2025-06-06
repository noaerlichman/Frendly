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

/**
 * @route GET /api/chat/:userId/:otherUserId
 * @desc Get chat messages between two users
 * @access Private
 */
router.get('/:userId/:otherUserId', getChatMessages);

/**
 * @route POST /api/chat
 * @desc Send a chat message
 * @access Private
 */
router.post('/', sendMessage);

/**
 * @route PUT /api/chat/read
 * @desc Mark messages as read
 * @access Private
 */
router.put('/read', markMessagesAsRead);

export default router; 