import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, getDoc, updateDoc, orderBy, deleteDoc } from 'firebase/firestore';
import { Notification, ErrorResponse } from '../types';

// Utility function to create a notification
export const createNotification = async (notificationData: Omit<Notification, 'id' | 'createdAt'>) => {
  // Create a reference to the user's notifications subcollection
  const userNotificationsRef = collection(db, 'Users', notificationData.recipientId, 'Notifications');
  const notification = {
    ...notificationData,
    createdAt: serverTimestamp()
  };
  return await addDoc(userNotificationsRef, notification);
};

// Send friend request notification
export const sendFriendRequestNotification = async (senderId: string, recipientId: string) => {
  try {
    // Get sender's display name
    const senderRef = doc(db, 'Users', senderId);
    const senderDoc = await getDoc(senderRef);
    const senderName = senderDoc.data()?.fullName || 'Someone';

    await createNotification({
      recipientId,
      type: 'friend_request',
      senderId,
      message: `${senderName} sent you a friend request`,
      isRead: false
    });
  } catch (error) {
    console.error('Error sending friend request notification:', error);
  }
};

// Send group join request notification
export const sendGroupJoinRequestNotification = async (senderId: string, adminId: string, groupId: string) => {
  try {
    // Get sender's display name and group name
    const [senderRef, groupRef] = [
      doc(db, 'Users', senderId),
      doc(db, 'Groups', groupId)
    ];
    
    const [senderDoc, groupDoc] = await Promise.all([
      getDoc(senderRef),
      getDoc(groupRef)
    ]);
    
    console.log(senderDoc.data());
    const senderName = senderDoc.data()?.fullName || 'Someone';
    const groupName = groupDoc.data()?.name || 'a group';

    await createNotification({
      recipientId: adminId,
      type: 'group_join_request',
      senderId,
      groupId,
      message: `${senderName} wants to join your group: ${groupName}`,
      isRead: false
    });
  } catch (error) {
    console.error('Error sending group join request notification:', error);
  }
};

// Send post like notification
export const sendPostLikeNotification = async (senderId: string, postOwnerId: string, postId: string) => {
  try {
    // Get sender's display name
    const senderRef = doc(db, 'Users', senderId);
    const senderDoc = await getDoc(senderRef);
    const senderName = senderDoc.data()?.fullName || 'Someone';

    await createNotification({
      recipientId: postOwnerId,
      type: 'post_like',
      senderId,
      postId,
      message: `${senderName} liked your post`,
      isRead: false
    });
  } catch (error) {
    console.error('Error sending post like notification:', error);
  }
};

// Get user's notifications
export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Query the user's notifications subcollection
    const userNotificationsRef = collection(db, 'Users', userId, 'Notifications');
    const q = query(
      userNotificationsRef,
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Notification));

    res.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const { userId, notificationId } = req.params;

    if (!notificationId) {
      return res.status(400).json({ message: 'Notification ID is required' } as ErrorResponse);
    }

    // Update the notification in the user's notifications subcollection
    const notificationRef = doc(db, 'Users', userId, 'Notifications', notificationId);
    await updateDoc(notificationRef, {
      isRead: true
    });

    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Failed to mark notification as read' } as ErrorResponse);
  }
};

// Delete notification
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { userId, notificationId } = req.params;

    if (!notificationId) {
      return res.status(400).json({ message: 'Notification ID is required' } as ErrorResponse);
    }

    // Delete the notification from the user's notifications subcollection
    const notificationRef = doc(db, 'Users', userId, 'Notifications', notificationId);
    await deleteDoc(notificationRef);

    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Failed to delete notification' } as ErrorResponse);
  }
}; 