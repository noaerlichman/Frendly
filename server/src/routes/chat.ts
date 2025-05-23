import express from 'express';
import { getChatMessages, sendMessage, markMessagesAsRead } from '../controllers/chatController';

const router = express.Router();

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