import express from 'express';
import multer from 'multer';
import { createGroup, getUserGroups, getGroupById, getGroupPosts, createGroupPost, editGroupPost, deleteGroupPost, searchGroups, getAllGroups, joinGroup, approveGroupRequest, rejectGroupRequest, uploadGroupPostImage } from '../controllers/groupController';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Create a new group
router.post('/', createGroup);

// Get all groups
router.get('/', getAllGroups);

// Get user's groups
router.get('/user/:userId', getUserGroups);

// Search groups
router.get('/search', searchGroups);

// Get a specific group
router.get('/:groupId', getGroupById);

// Get group posts
router.get('/:groupId/posts', getGroupPosts);

// Create a post in a group
router.post('/:groupId/posts', createGroupPost);

// Upload image for group post
router.post('/:groupId/posts/:userId/image', upload.single('image'), uploadGroupPostImage);

// Edit a post in a group
router.put('/:groupId/posts/:postId', editGroupPost);

// Delete a post from a group
router.delete('/:groupId/posts/:postId', deleteGroupPost);

// Join a group
router.post('/:groupId/join', joinGroup);

// Approve a group request
router.post('/:groupId/approve/:userId', approveGroupRequest);

// Reject a group request
router.post('/:groupId/reject/:userId', rejectGroupRequest);

export default router; 