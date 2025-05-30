import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection,
  getDocs,
  arrayUnion, 
  updateDoc, 
  arrayRemove,
  addDoc,
  query,
  where,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { Friend, UserProfile, ErrorResponse } from '../types/index';
import { createNotification } from './notificationController';

/**
 * Get all users for friend suggestions
 * @route GET /api/friends/suggestions
 * @access Private
 */
export const getUserSuggestions = async (req: Request, res: Response): Promise<void> => {
  const { uid } = req.query;

  if (!uid) {
    res.status(400).json({ message: 'User ID is required' } as ErrorResponse);
    return;
  }

  try {
    // Get all user profiles
    const profilesRef = collection(db, 'Users');
    const querySnapshot = await getDocs(profilesRef);
    
    // Get current user's friends
    const userFriendsRef = doc(db, 'Friends', uid as string);
    const friendsDoc = await getDoc(userFriendsRef);
    
    let friendIds: string[] = [];
    if (friendsDoc.exists()) {
      const friendsData = friendsDoc.data();
      friendIds = friendsData.friends.map((friend: Friend) => friend.uid);
    }
    
    // Format profiles and exclude current user and friends
    const users: Friend[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as UserProfile;
      const docId = doc.id; // Get the document ID
      
      // Skip if this is the current user or already a friend
      if (docId === uid || friendIds.includes(docId)) {
        return;
      }
      
      users.push({
        uid: docId, // Use the document ID as uid
        fullName: data.fullName,
        profilePicture: data.profilePicture
      });
    });
    
    res.status(200).json({
      message: 'User suggestions retrieved successfully',
      users
    });
  } catch (error) {
    console.error('User suggestions error:', error);
    res.status(500).json({ message: 'Server error getting user suggestions' } as ErrorResponse);
  }
};

/**
 * Add a friend (called after friend request is approved)
 * @route POST /api/friends
 * @access Private
 */
export const addFriend = async (req: Request, res: Response): Promise<void> => {
  const { senderId, receiverId } = req.body;

  if (!senderId || !receiverId) {
    res.status(400).json({ message: 'Sender ID and receiver ID are required' } as ErrorResponse);
    return;
  }

  try {
    // Get both users' profiles
    const [senderProfile, receiverProfile] = await Promise.all([
      getDoc(doc(db, 'Users', senderId)),
      getDoc(doc(db, 'Users', receiverId))
    ]);
    
    if (!senderProfile.exists() || !receiverProfile.exists()) {
      res.status(404).json({ message: 'User profile not found' } as ErrorResponse);
      return;
    }
    
    const senderData = senderProfile.data() as UserProfile;
    const receiverData = receiverProfile.data() as UserProfile;

    // Create friend objects for both users
    const senderFriend: Friend = {
      uid: receiverId,
      fullName: receiverData.fullName,
      profilePicture: receiverData.profilePicture
    };

    const receiverFriend: Friend = {
      uid: senderId,
      fullName: senderData.fullName,
      profilePicture: senderData.profilePicture
    };

    // Update sender's friends list
    const senderFriendsRef = doc(db, 'Friends', senderId);
    const senderFriendsDoc = await getDoc(senderFriendsRef);
    if (senderFriendsDoc.exists()) {
      await updateDoc(senderFriendsRef, {
        friends: arrayUnion(senderFriend)
      });
    } else {
      await setDoc(senderFriendsRef, {
        friends: [senderFriend]
      });
    }

    // Update receiver's friends list
    const receiverFriendsRef = doc(db, 'Friends', receiverId);
    const receiverFriendsDoc = await getDoc(receiverFriendsRef);
    if (receiverFriendsDoc.exists()) {
      await updateDoc(receiverFriendsRef, {
        friends: arrayUnion(receiverFriend)
      });
    } else {
      await setDoc(receiverFriendsRef, {
        friends: [receiverFriend]
      });
    }

    res.status(201).json({
      message: 'Friends added successfully',
      sender: senderFriend,
      receiver: receiverFriend
    });
  } catch (error) {
    console.error('Add friend error:', error);
    res.status(500).json({ message: 'Server error during add friend' } as ErrorResponse);
  }
};

/**
 * Remove a friend
 * @route DELETE /api/friends/:friendId
 * @access Private
 */
export const removeFriend = async (req: Request, res: Response): Promise<void> => {
  const { friendId } = req.params;
  const { uid } = req.body;

  if (!uid || !friendId) {
    res.status(400).json({ message: 'User ID and friend ID are required' } as ErrorResponse);
    return;
  }

  try {
    // Get the user's friends document
    const userFriendsRef = doc(db, 'Friends', uid);
    const docSnap = await getDoc(userFriendsRef);
    
    if (!docSnap.exists()) {
      res.status(404).json({ message: 'No friends found for this user' } as ErrorResponse);
      return;
    }
    
    const data = docSnap.data();
    const friends = data.friends || [];
    
    // Find the friend to remove
    const friendToRemove = friends.find((friend: Friend) => friend.uid === friendId);
    
    if (!friendToRemove) {
      res.status(404).json({ message: 'Friend not found' } as ErrorResponse);
      return;
    }
    
    // Remove the friend
    await updateDoc(userFriendsRef, {
      friends: arrayRemove(friendToRemove)
    });
    
    res.status(200).json({
      message: 'Friend removed successfully',
      uid: friendId
    });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ message: 'Server error during friend removal' } as ErrorResponse);
  }
};

/**
 * Get user's friends
 * @route GET /api/friends/user/:uid
 * @access Private
 */
export const getUserFriends = async (req: Request, res: Response): Promise<void> => {
  const { uid } = req.params;

  if (!uid) {
    res.status(400).json({ message: 'User ID is required' } as ErrorResponse);
    return;
  }

  try {
    // Get the user's friends document
    const userFriendsRef = doc(db, 'Friends', uid);
    const docSnap = await getDoc(userFriendsRef);
    
    if (!docSnap.exists()) {
      // No friends yet, return empty array
      res.status(200).json({
        message: 'Friends retrieved successfully',
        friends: []
      });
      return;
    }
    
    const data = docSnap.data();
    const friends = data.friends || [];

    // Fetch additional user data for each friend
    const friendsWithDetails = await Promise.all(
      friends.map(async (friend: Friend) => {
        // Get friend's full profile from Users collection
        const userRef = doc(db, 'Users', friend.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          return {
            ...friend,
            dateOfBirth: userData.dateOfBirth || null,
            profilePicture: userData.profilePicture || null,
          };
        }
        return friend;
      })
    );
    
    res.status(200).json({
      message: 'Friends retrieved successfully',
      friends: friendsWithDetails
    });
  } catch (error) {
    console.error('Friends retrieval error:', error);
    res.status(500).json({ message: 'Server error during friends retrieval' } as ErrorResponse);
  }
};

/**
 * Send a friend request
 * @route POST /api/friends/request
 * @access Private
 */
export const sendFriendRequest = async (req: Request, res: Response): Promise<void> => {
  const { senderId, receiverId } = req.body;

  if (!senderId || !receiverId) {
    res.status(400).json({ message: 'Sender ID and receiver ID are required' } as ErrorResponse);
    return;
  }

  try {
    // Get sender's and receiver's profiles
    const senderProfileRef = doc(db, 'Users', senderId);
    const receiverProfileRef = doc(db, 'Users', receiverId);
    
    const [senderDoc, receiverDoc] = await Promise.all([
      getDoc(senderProfileRef),
      getDoc(receiverProfileRef)
    ]);
    
    if (!senderDoc.exists() || !receiverDoc.exists()) {
      res.status(404).json({ message: 'User profile not found' } as ErrorResponse);
      return;
    }

    const senderProfile = senderDoc.data() as UserProfile;
    const receiverProfile = receiverDoc.data() as UserProfile;

    // Create friend request object
    const friendRequest = {
      senderId,
      receiverId,
      senderName: senderProfile.fullName,
      receiverName: receiverProfile.fullName,
      status: 'pending',
      createdAt: serverTimestamp()
    };

    // Add request to sender's FriendRequest subcollection
    const senderRequestsRef = collection(db, 'Users', senderId, 'FriendRequest');
    const requestDoc = await addDoc(senderRequestsRef, friendRequest);

    // Create notification for the receiver
    await createNotification({
      recipientId: receiverId,
      senderId: senderId,
      type: 'friend_request',
      message: `${senderProfile.fullName} sent you a friend request`,
      isRead: false
    });

    res.status(201).json({
      message: 'Friend request sent successfully',
      request: {
        id: requestDoc.id,
        ...friendRequest
      }
    });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ message: 'Server error during send friend request' } as ErrorResponse);
  }
};

/**
 * Handle friend request (approve/reject)
 * @route PUT /api/friends/request
 * @access Private
 */
export const handleFriendRequest = async (req: Request, res: Response): Promise<void> => {
  const { userId, senderId, action } = req.body;

  if (!userId || !senderId || !action) {
    res.status(400).json({ message: 'User ID, sender ID, and action are required' } as ErrorResponse);
    return;
  }

  if (action !== 'approve' && action !== 'reject') {
    res.status(400).json({ message: 'Invalid action. Must be either approve or reject' } as ErrorResponse);
    return;
  }

  try {
    // Get the request from receiver's FriendRequest subcollection
    const receiverRequestsRef = collection(db, 'Users', senderId, 'FriendRequest');
    const requestQuery = query(
      receiverRequestsRef,
      where('receiverId', '==', userId)
    );
    const requestSnapshot = await getDocs(requestQuery);

    if (requestSnapshot.empty) {
      res.status(404).json({ message: 'Friend request not found' } as ErrorResponse);
      return;
    }

    const requestDoc = requestSnapshot.docs[0];
    const requestData = requestDoc.data();

    // Update status in both users' FriendRequest subcollections
    const newStatus = action === 'approve' ? 'accepted' : 'rejected';
    
    // Update sender's request
    const senderRequestsRef = collection(db, 'Users', senderId, 'FriendRequest');
    const senderRequestQuery = query(
      senderRequestsRef,
      where('receiverId', '==', userId)
    );
    const senderRequestSnapshot = await getDocs(senderRequestQuery);
    
    if (!senderRequestSnapshot.empty) {
      await updateDoc(senderRequestSnapshot.docs[0].ref, { status: newStatus });
    }

    // Update receiver's request
    await updateDoc(requestDoc.ref, { status: newStatus });

    if (action === 'approve') {
      // Get both users' profiles
      const [senderProfile, receiverProfile] = await Promise.all([
        getDoc(doc(db, 'Users', senderId)),
        getDoc(doc(db, 'Users', userId))
      ]);

      if (!senderProfile.exists() || !receiverProfile.exists()) {
        res.status(404).json({ message: 'User profile not found' } as ErrorResponse);
        return;
      }

      const senderData = senderProfile.data() as UserProfile;
      const receiverData = receiverProfile.data() as UserProfile;

      // Add each user to the other's friends list
      const senderFriend: Friend = {
        uid: userId,
        fullName: receiverData.fullName,
        profilePicture: receiverData.profilePicture
      };

      const receiverFriend: Friend = {
        uid: senderId,
        fullName: senderData.fullName,
        profilePicture: senderData.profilePicture
      };

      // Update sender's friends list
      const senderFriendsRef = doc(db, 'Friends', senderId);
      const senderFriendsDoc = await getDoc(senderFriendsRef);
      if (senderFriendsDoc.exists()) {
        await updateDoc(senderFriendsRef, {
          friends: arrayUnion(senderFriend)
        });
      } else {
        await setDoc(senderFriendsRef, {
          friends: [senderFriend]
        });
      }

      // Update receiver's friends list
      const receiverFriendsRef = doc(db, 'Friends', userId);
      const receiverFriendsDoc = await getDoc(receiverFriendsRef);
      if (receiverFriendsDoc.exists()) {
        await updateDoc(receiverFriendsRef, {
          friends: arrayUnion(receiverFriend)
        });
      } else {
        await setDoc(receiverFriendsRef, {
          friends: [receiverFriend]
        });
      }

      // Create notification for the sender
      await createNotification({
        recipientId: senderId,
        senderId: userId,
        type: 'friend_request',
        message: `${receiverData.fullName} accepted your friend request`,
        isRead: false
      });
    } else {
      // Delete the friend request document from sender's FriendRequest subcollection
      const senderRequestsRef = collection(db, 'Users', senderId, 'FriendRequest');
      const senderRequestQuery = query(
        senderRequestsRef,
        where('receiverId', '==', userId)
      );
      
      const senderRequestSnapshot = await getDocs(senderRequestQuery);
      
      if (!senderRequestSnapshot.empty) {
        await deleteDoc(senderRequestSnapshot.docs[0].ref);
      }
    }

    res.status(200).json({
      message: `Friend request ${action}ed successfully`,
      status: newStatus
    });
  } catch (error) {
    console.error('Handle friend request error:', error);
    res.status(500).json({ message: 'Server error during friend request handling' } as ErrorResponse);
  }
};

/**
 * Check friend request status between two users
 * @route GET /api/friends/request/status
 * @access Private
 */
export const checkFriendRequestStatus = async (req: Request, res: Response) => {
  try {
    const { senderId, receiverId } = req.query;

    if (!senderId || !receiverId) {
      return res.status(400).json({ message: 'Sender ID and receiver ID are required' });
    }

    // Check in sender's FriendRequest subcollection
    const senderRequestsRef = collection(db, 'Users', senderId as string, 'FriendRequest');
    const q = query(senderRequestsRef, where('receiverId', '==', receiverId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(200).json({ status: 'none' });
    }

    const requestDoc = querySnapshot.docs[0];
    const requestData = requestDoc.data();

    return res.status(200).json({ status: requestData.status });
  } catch (error) {
    console.error('Error checking friend request status:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 