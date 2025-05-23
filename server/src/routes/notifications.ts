import express from 'express';
import { getUserNotifications, markNotificationAsRead, deleteNotification } from '../controllers/notificationController';

const router = express.Router();

// Get user's notifications from their subcollection
router.get('/user/:userId', getUserNotifications);

// Mark notification as read in user's subcollection
router.post('/:userId/:notificationId/read', markNotificationAsRead);

// Delete notification from user's subcollection
router.delete('/:userId/:notificationId', deleteNotification);

export default router; 