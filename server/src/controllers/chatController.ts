import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  serverTimestamp,
  doc,
  getDoc,
  writeBatch,
  setDoc,
  collectionGroup
} from 'firebase/firestore';
import { ErrorResponse, Chat, ChatMessage } from '../types/types';
import { getIO } from '../services/socket'; 
import { sendChatMessageNotification } from './notificationController'


// get or create chat between 2 users by: GET /api/chat/:userId/:otherUserId
export const getChatMessages = async (req: Request, res: Response): Promise<void> => {
  const { userId, otherUserId } = req.params;

  if (!userId || !otherUserId) {
    res.status(400).json({ message: 'Both user IDs are required' } as ErrorResponse);
    return;
  }

  try {
    // Sort participant IDs to ensure consistent chat ID
    const participants = [userId, otherUserId].sort();
    
    // Check if chat already exists
    const chatsRef = collection(db, 'Chats');
    const q = query(
      chatsRef,
      where('participants', '==', participants)
    );

    const querySnapshot = await getDocs(q);
    let chatId: string;
    let chatData: any;

    if (querySnapshot.empty) {
      // Create new chat
      const newChat: Omit<Chat, 'id'> = {
        participants,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const chatDoc = await addDoc(chatsRef, newChat);
      chatId = chatDoc.id;
      chatData = newChat;
    } else {
      const doc = querySnapshot.docs[0];
      chatId = doc.id;
      chatData = doc.data();
    }

    // Get messages for this chat
    const messagesRef = collection(db, 'Chats', chatId, 'Messages');
    const messagesQuery = query(
      messagesRef,
      orderBy('createdAt', 'asc')
    );

    const messagesSnapshot = await getDocs(messagesQuery);
    const messages: ChatMessage[] = [];

    messagesSnapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        senderId: data.senderId,
        text: data.text,
        createdAt: data.createdAt,
        isRead: data.isRead
      });
    });

    res.status(200).json({
      message: 'Chat messages retrieved successfully',
      chatId,
      messages,
      participants: chatData.participants,
      lastMessage: chatData.lastMessage
    });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ message: 'Server error getting chat messages' } as ErrorResponse);
  }
};


// send message by: POST /api/chat
export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  const { senderId, receiverId, text, chatId } = req.body;

  if (!senderId || !receiverId || !text) {
    res.status(400).json({ message: 'Sender ID, receiver ID, and message text are required' } as ErrorResponse);
    return;
  }

  try {
    const participants = [senderId, receiverId].sort();
    let currentChatId = chatId;

    // Find or create chat
    if (!currentChatId) {
      const chatsRef = collection(db, 'Chats');
      const q = query(chatsRef, where('participants', '==', participants));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        const newChat = {
          participants,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        const chatDoc = await addDoc(chatsRef, newChat);
        currentChatId = chatDoc.id;
      } else {
        currentChatId = querySnapshot.docs[0].id;
      }
    }

    // Create message
    const messageData = {
      senderId,
      text,
      createdAt: serverTimestamp(),
      isRead: false
    };

    const messagesRef = collection(db, 'Chats', currentChatId, 'Messages');
    const messageDoc = await addDoc(messagesRef, messageData);

    // Update last message in chat
    const chatRef = doc(db, 'Chats', currentChatId);
    await setDoc(chatRef, {
      lastMessage: {
        text,
        senderId,
        createdAt: serverTimestamp()
      },
      updatedAt: serverTimestamp()
    }, { merge: true });

    sendChatMessageNotification(currentChatId, receiverId, senderId);

    // Emit newMessage to other socket clients
    const io = getIO();
    const payload = {
      id: messageDoc.id,
      senderId,
      receiverId,
      text,
      createdAt: new Date(), 
      chatId: currentChatId
    };
    io.to(currentChatId).emit('newMessage', payload);

    res.status(201).json({
      message: 'Message sent successfully',
      chatId: currentChatId,
      chatMessage: payload
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error sending message' } as ErrorResponse);
  }
};


// mark message as read by: PUT /api/chat/read
export const markMessagesAsRead = async (req: Request, res: Response): Promise<void> => {
  const { userId, chatId } = req.body;

  if (!userId || !chatId) {
    res.status(400).json({ message: 'User ID and chat ID are required' } as ErrorResponse);
    return;
  }

  try {
    const messagesRef = collection(db, 'Chats', chatId, 'Messages');
    const q = query(
      messagesRef,
      where('senderId', '!=', userId),
      where('isRead', '==', false)
    );

    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);

    querySnapshot.forEach((doc) => {
      batch.update(doc.ref, { isRead: true });
    });

    await batch.commit();

    res.status(200).json({
      message: 'Messages marked as read successfully'
    });
  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({ message: 'Server error marking messages as read' } as ErrorResponse);
  }
}; 