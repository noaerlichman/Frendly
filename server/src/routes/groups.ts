import express from 'express';
import multer from 'multer';
import { 
  createGroup, 
  getUserGroups, 
  getGroupById, 
  getGroupPosts, 
  createGroupPost, 
  editGroupPost, 
  deleteGroupPost, 
  searchGroups, 
  getAllGroups, 
  joinGroup, 
  approveGroupRequest, 
  rejectGroupRequest, 
  uploadGroupPostImage,
} from '../controllers/groupController';

import { getGroupStats } from '../controllers/groupStatsController';

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

// Group-specific routes
router.get('/:groupId/stats', getGroupStats);
router.get('/:groupId/posts', getGroupPosts);
router.post('/:groupId/posts', createGroupPost);
router.post('/:groupId/posts/:userId/image', upload.single('image'), uploadGroupPostImage);
router.put('/:groupId/posts/:postId', editGroupPost);
router.delete('/:groupId/posts/:postId', deleteGroupPost);
router.post('/:groupId/join', joinGroup);
router.post('/:groupId/approve/:userId', approveGroupRequest);
router.post('/:groupId/reject/:userId', rejectGroupRequest);

// Get a specific group (keep this last as it's the most generic)
router.get('/:groupId', getGroupById);

export default router; 