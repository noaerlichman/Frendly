import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, getDoc, orderBy, updateDoc, arrayUnion, setDoc, arrayRemove, deleteDoc } from 'firebase/firestore';
import { Group, ErrorResponse } from '../types';
import { Timestamp } from 'firebase/firestore';
import cloudinary from '../config/cloudinary';
import { sendGroupJoinRequestNotification } from './notificationController';

/**
 * Create a new group
 * @route POST /api/groups
 * @access Private
 */
export const createGroup = async (req: Request, res: Response): Promise<void> => {
  const { name, description, tags, isPublic, adminId, members } = req.body;

  // Validate required fields
  if (!name || !adminId) {
    res.status(400).json({ message: 'Group name and admin ID are required' } as ErrorResponse);
    return;
  }
  
  console.log('Creating group with data:', req.body);

  try {
    // Create group data
    const groupData: Group = {
      name,
      description: description || '',
      tags: tags || [],
      isPublic: isPublic ?? true,
      adminId,
      members: members || [adminId], // Initially only the admin is a member
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Add the group to Firestore
    const groupRef = await addDoc(collection(db, 'Groups'), groupData);

    res.status(201).json({
      message: 'Group created successfully',
      groupId: groupRef.id,
      group: {
        id: groupRef.id,
        ...groupData
      }
    });
  } catch (error) {
    console.error('Group creation error:', error);
    res.status(500).json({ message: 'Server error during group creation' } as ErrorResponse);
  }
};

export const getUserGroups = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Query all groups where the user is a member
    const groupsRef = collection(db, 'Groups');
    const q = query(groupsRef, where('members', 'array-contains', userId));
    const querySnapshot = await getDocs(q);

    const groups: Group[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      groups.push({
        id: doc.id,
        name: data.name,
        description: data.description,
        tags: data.tags,
        isPublic: data.isPublic,
        adminId: data.adminId,
        members: data.members,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      });
    });

    return res.status(200).json({ groups });
  } catch (error) {
    console.error('Error fetching user groups:', error);
    return res.status(500).json({ message: 'Failed to fetch user groups' });
  }
};

export const getGroupById = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;

    if (!groupId) {
      return res.status(400).json({ message: 'Group ID is required' });
    }

    const groupRef = doc(db, 'Groups', groupId);
    const groupDoc = await getDoc(groupRef);

    if (!groupDoc.exists()) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const groupData = groupDoc.data();
    return res.status(200).json({
      group: {
        id: groupDoc.id,
        ...groupData
      }
    });
  } catch (error) {
    console.error('Error fetching group:', error);
    return res.status(500).json({ message: 'Failed to fetch group' });
  }
};

export const getGroupPosts = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;

    if (!groupId) {
      return res.status(400).json({ message: 'Group ID is required' });
    }

    const postsRef = collection(db, 'Groups', groupId, 'Posts');
    const q = query(postsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const posts: Array<{
      id: string;
      text: string;
      userId: string;
      createdAt: any;
      updatedAt: any;
      imageUrl: string | null;
    }> = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      posts.push({
        id: doc.id,
        text: data.text,
        userId: data.userId,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        imageUrl: data.imageUrl || null
      });
    });

    return res.status(200).json({ posts });
  } catch (error) {
    console.error('Error fetching group posts:', error);
    return res.status(500).json({ message: 'Failed to fetch group posts' });
  }
};

/**
 * Upload group post image to Cloudinary
 * @route POST /api/groups/:groupId/posts/:userId/image
 * @access Private
 */
export const uploadGroupPostImage = async (req: Request, res: Response): Promise<void> => {
  const { groupId, userId } = req.params;
  const file = req.file;

  console.log('=== Starting Group Post Image Upload Process ===');
  console.log('Group ID:', groupId);
  console.log('User ID:', userId);

  if (!file) {
    console.log('Error: No file received in request');
    res.status(400).json({ message: 'No file uploaded' } as ErrorResponse);
    return;
  }

  if (!groupId || !userId) {
    console.log('Error: Missing required parameters');
    res.status(400).json({ message: 'Group ID and User ID are required' } as ErrorResponse);
    return;
  }

  try {
    console.log('File details:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      buffer: file.buffer ? 'Buffer present' : 'No buffer'
    });

    // Convert buffer to base64
    console.log('Converting file to base64...');
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${file.mimetype};base64,${b64}`;
    console.log('Base64 conversion complete. Data URI length:', dataURI.length);

    // Upload to Cloudinary
    console.log('Starting Cloudinary upload...');
    console.log('Upload parameters:', {
      folder: `GroupPosts/${groupId}/${userId}`,
      public_id: `post_${Date.now()}`,
      resource_type: 'image'
    });

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: `GroupPosts/${groupId}/${userId}`,
      public_id: `post_${Date.now()}`,
      resource_type: 'image'
    });

    console.log('Cloudinary upload successful!');
    console.log('Cloudinary response:', {
      url: result.secure_url,
      public_id: result.public_id,
      folder: result.folder,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes
    });

    res.status(200).json({
      message: 'Group post image uploaded successfully',
      imageUrl: result.secure_url
    });
  } catch (error: any) {
    console.error('=== Group Post Image Upload Error ===');
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: 'Failed to upload group post image' } as ErrorResponse);
  }
};

export const createGroupPost = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const { text, userId, imageUrl } = req.body;

    if (!groupId || !text || !userId) {
      return res.status(400).json({ message: 'Group ID, text, and user ID are required' });
    }

    // Verify user is a member of the group
    const groupRef = doc(db, 'Groups', groupId);
    const groupDoc = await getDoc(groupRef);

    if (!groupDoc.exists()) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const groupData = groupDoc.data();
    if (!groupData.members.includes(userId)) {
      return res.status(403).json({ message: 'User is not a member of this group' });
    }

    const postsRef = collection(db, 'Groups', groupId, 'Posts');
    const newPost = {
      text,
      userId,
      imageUrl: imageUrl || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const postRef = await addDoc(postsRef, newPost);
    const postDoc = await getDoc(postRef);

    return res.status(201).json({
      post: {
        id: postDoc.id,
        ...newPost
      }
    });
  } catch (error) {
    console.error('Error creating group post:', error);
    return res.status(500).json({ message: 'Failed to create group post' });
  }
};

export const editGroupPost = async (req: Request, res: Response) => {
  try {
    const { groupId, postId } = req.params;
    const { text, userId } = req.body;

    if (!text || !userId) {
      return res.status(400).json({ message: 'Text and user ID are required' });
    }

    const groupRef = doc(db, 'Groups', groupId);
    const groupDoc = await getDoc(groupRef);

    if (!groupDoc.exists()) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const groupData = groupDoc.data();
    const postRef = doc(db, 'Groups', groupId, 'Posts', postId);
    const postDoc = await getDoc(postRef);

    if (!postDoc.exists()) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const postData = postDoc.data();

    // Check if user is admin or post author
    if (groupData.adminId !== userId && postData.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to edit this post' });
    }

    await updateDoc(postRef, {
      text,
      updatedAt: serverTimestamp()
    });

    const updatedPost = {
      id: postId,
      ...postData,
      text,
      updatedAt: new Date()
    };

    res.json({ post: updatedPost });
  } catch (error) {
    console.error('Error editing group post:', error);
    res.status(500).json({ message: 'Failed to edit post' });
  }
};

export const deleteGroupPost = async (req: Request, res: Response) => {
  try {
    const { groupId, postId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const groupRef = doc(db, 'Groups', groupId);
    const groupDoc = await getDoc(groupRef);

    if (!groupDoc.exists()) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const groupData = groupDoc.data();
    const postRef = doc(db, 'Groups', groupId, 'Posts', postId);
    const postDoc = await getDoc(postRef);

    if (!postDoc.exists()) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const postData = postDoc.data();

    // Check if user is admin or post author
    if (groupData.adminId !== userId && postData.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await deleteDoc(postRef);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting group post:', error);
    res.status(500).json({ message: 'Failed to delete post' });
  }
};

export const searchGroups = async (req: Request, res: Response) => {
  try {
    const { query: searchQuery } = req.query as { query: string };
    const { userId } = req.query as { userId?: string };

    if (!searchQuery) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Get groups based on whether userId is provided
    const groupsRef = collection(db, 'Groups');
    let querySnapshot;

    if (userId) {
      // If userId is provided, only search in user's groups
      const userGroupsQuery = query(groupsRef, where('members', 'array-contains', userId));
      querySnapshot = await getDocs(userGroupsQuery);
    } else {
      // If no userId, search all groups
      querySnapshot = await getDocs(groupsRef);
    }

    const groups: Group[] = [];
    const searchTerm = searchQuery.toLowerCase();

    querySnapshot.forEach((doc) => {
      const data = doc.data() as Group;
      // Check if the group matches the search query in name or tags
      if (
        data.name.toLowerCase().includes(searchTerm) ||
        (data.tags && data.tags.some(tag => 
          tag.toLowerCase().includes(searchTerm)
        ))
      ) {
        groups.push({
          id: doc.id,
          name: data.name,
          description: data.description,
          tags: data.tags,
          isPublic: data.isPublic,
          adminId: data.adminId,
          members: data.members,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        });
      }
    });

    return res.status(200).json({ groups });
  } catch (error) {
    console.error('Error searching groups:', error);
    return res.status(500).json({ message: 'Failed to search groups' });
  }
};

export const getAllGroups = async (req: Request, res: Response) => {
  try {
    const groupsRef = collection(db, 'Groups');
    const querySnapshot = await getDocs(groupsRef);
    
    const groups: Group[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Group;
      groups.push({
        id: doc.id,
        ...data
      });
    });

    res.json({ groups });
  } catch (error) {
    console.error('Error fetching all groups:', error);
    res.status(500).json({ message: 'Failed to fetch groups' });
  }
};

export const joinGroup = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    if (!groupId || !userId) {
      return res.status(400).json({ message: 'Group ID and user ID are required' });
    }

    // Get the group document
    const groupRef = doc(db, 'Groups', groupId);
    const groupDoc = await getDoc(groupRef);

    if (!groupDoc.exists()) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const groupData = groupDoc.data() as Group;

    // Check if user is already a member
    if (groupData.members.includes(userId)) {
      return res.status(400).json({ message: 'User is already a member of this group' });
    }

    // Check if user already has a pending request
    if (groupData.pendingRequests?.includes(userId)) {
      return res.status(400).json({ message: 'User already has a pending request' });
    }

    if (groupData.isPublic) {
      // For public groups, add user directly to members
      await updateDoc(groupRef, {
        members: arrayUnion(userId),
        updatedAt: serverTimestamp()
      });
    } else {
      // For private groups, add to pending requests
      await updateDoc(groupRef, {
        pendingRequests: arrayUnion(userId),
        updatedAt: serverTimestamp()
      });

      // Create join request document in subcollection
      const joinRequestRef = doc(db, 'Groups', groupId, 'joinRequests', userId);
      await setDoc(joinRequestRef, {
        status: 'pending',
        requestedAt: serverTimestamp()
      });

      // Send notification to group admin using the notification service
      await sendGroupJoinRequestNotification(userId, groupData.adminId, groupId);
    }

    res.status(200).json({
      message: groupData.isPublic ? 'Successfully joined group' : 'Join request sent',
      isPublic: groupData.isPublic,
      group: {
        id: groupDoc.id,
        ...groupData,
        members: groupData.isPublic ? [...groupData.members, userId] : groupData.members,
        pendingRequests: !groupData.isPublic ? [...(groupData.pendingRequests || []), userId] : groupData.pendingRequests
      }
    });
  } catch (error) {
    console.error('Error joining group:', error);
    res.status(500).json({ message: 'Failed to join group' });
  }
};

export const approveGroupRequest = async (req: Request, res: Response) => {
  try {
    const { groupId, userId } = req.params;

    if (!groupId || !userId) {
      return res.status(400).json({ message: 'Group ID and user ID are required' });
    }

    const groupRef = doc(db, 'Groups', groupId);
    const groupDoc = await getDoc(groupRef);

    if (!groupDoc.exists()) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const groupData = groupDoc.data() as Group;

    // Check if user is in pendingRequests
    if (!groupData.pendingRequests?.includes(userId)) {
      return res.status(400).json({ message: 'No pending request found for this user' });
    }

    // Update join request status to "Joined"
    const joinRequestRef = doc(db, 'Groups', groupId, 'joinRequests', userId);
    await updateDoc(joinRequestRef, {
      status: 'Joined',
      joinedAt: serverTimestamp()
    });

    // Remove from pendingRequests and add to members
    await updateDoc(groupRef, {
      pendingRequests: arrayRemove(userId),
      members: arrayUnion(userId),
      updatedAt: serverTimestamp()
    });

    // Find and delete the join request notification
    const notificationsRef = collection(db, 'Notifications');
    const q = query(
      notificationsRef,
      where('type', '==', 'group_join_request'),
      where('groupId', '==', groupId),
      where('senderId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    // Delete all matching notifications
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // Send notification to the user that their request was approved
    const userRef = doc(db, 'Users', userId);
    const userDoc = await getDoc(userRef);
    const userName = userDoc.data()?.fullName || 'Someone';

    // Create notification in user's notifications subcollection
    const userNotificationsRef = collection(db, 'Users', userId, 'Notifications');
    await addDoc(userNotificationsRef, {
      type: "group_join_approved",
      recipientId: userId,
      senderId: groupData.adminId,
      groupId: groupId,
      message: `Your request to join ${groupData.name} has been approved`,
      isRead: false,
      createdAt: serverTimestamp()
    });

    res.status(200).json({ message: 'User approved and added to group members' });
  } catch (error) {
    console.error('Error approving group request:', error);
    res.status(500).json({ message: 'Failed to approve group request' });
  }
};

export const rejectGroupRequest = async (req: Request, res: Response) => {
  try {
    const { groupId, userId } = req.params;

    if (!groupId || !userId) {
      return res.status(400).json({ message: 'Group ID and user ID are required' });
    }

    const groupRef = doc(db, 'Groups', groupId);
    const groupDoc = await getDoc(groupRef);

    if (!groupDoc.exists()) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const groupData = groupDoc.data() as Group;

    // Check if user is in pendingRequests
    if (!groupData.pendingRequests?.includes(userId)) {
      return res.status(400).json({ message: 'No pending request found for this user' });
    }

    // Delete the join request document
    const joinRequestRef = doc(db, 'Groups', groupId, 'joinRequests', userId);
    await deleteDoc(joinRequestRef);

    // Remove from pendingRequests
    await updateDoc(groupRef, {
      pendingRequests: arrayRemove(userId),
      updatedAt: serverTimestamp()
    });

    // Find and delete the join request notification
    const notificationsRef = collection(db, 'Notifications');
    const q = query(
      notificationsRef,
      where('type', '==', 'group_join_request'),
      where('groupId', '==', groupId),
      where('senderId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    // Delete all matching notifications
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // Send notification to the user that their request was rejected
    const userRef = doc(db, 'Users', userId);
    const userDoc = await getDoc(userRef);
    const userName = userDoc.data()?.fullName || 'Someone';

    await addDoc(collection(db, 'Notifications'), {
      type: "group_join_rejected",
      recipientId: userId,
      senderId: groupData.adminId,
      groupId: groupId,
      message: `Your request to join ${groupData.name} has been rejected`,
      isRead: false,
      createdAt: Timestamp.fromDate(new Date())
    });

    res.status(200).json({ message: 'User removed from pending requests' });
  } catch (error) {
    console.error('Error rejecting group request:', error);
    res.status(500).json({ message: 'Failed to reject group request' });
  }
};

export const getGroupStats = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.query;

    if (!groupId || !userId) {
      return res.status(400).json({ message: 'Group ID and user ID are required' });
    }

    // Get the group document
    const groupRef = doc(db, 'Groups', groupId);
    const groupDoc = await getDoc(groupRef);

    if (!groupDoc.exists()) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const groupData = groupDoc.data() as Group;

    // Check if user is admin
    if (groupData.adminId !== userId) {
      return res.status(403).json({ message: 'Only group admin can view statistics' });
    }

    // Get all posts for the group
    const postsRef = collection(db, 'Groups', groupId, 'Posts');
    const postsSnapshot = await getDocs(postsRef);

    // Count posts per member
    const memberPostCounts = new Map<string, number>();
    const memberNames = new Map<string, string>();

    // Initialize counts for all members
    for (const memberId of groupData.members) {
      memberPostCounts.set(memberId, 0);
    }

    // Count posts
    postsSnapshot.forEach((doc) => {
      const postData = doc.data();
      const currentCount = memberPostCounts.get(postData.userId) || 0;
      memberPostCounts.set(postData.userId, currentCount + 1);
    });

    // Get member names
    const memberPromises = groupData.members.map(async (memberId) => {
      const userRef = doc(db, 'Users', memberId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        memberNames.set(memberId, userDoc.data().fullName);
      }
    });

    await Promise.all(memberPromises);

    // Format data for response
    const memberActivity = Array.from(memberPostCounts.entries()).map(([memberId, postCount]) => ({
      memberId,
      memberName: memberNames.get(memberId) || 'Unknown User',
      postCount
    }));

    // Sort by post count in descending order
    memberActivity.sort((a, b) => b.postCount - a.postCount);

    res.status(200).json({
      stats: {
        memberActivity,
        totalPosts: postsSnapshot.size,
        totalMembers: groupData.members.length
      }
    });
  } catch (error) {
    console.error('Error getting group statistics:', error);
    res.status(500).json({ message: 'Failed to get group statistics' });
  }
}; 