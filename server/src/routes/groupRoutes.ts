import express from 'express';
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
  getGroupStats
} from '../controllers/groupController';
import multer from 'multer';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Group routes
router.post('/', createGroup);
router.get('/user/:userId', getUserGroups);
router.get('/search', searchGroups);
router.get('/all', getAllGroups);
router.get('/:groupId', getGroupById);
router.get('/:groupId/posts', getGroupPosts);
router.post('/:groupId/posts', createGroupPost);
router.put('/:groupId/posts/:postId', editGroupPost);
router.delete('/:groupId/posts/:postId', deleteGroupPost);
router.post('/:groupId/join', joinGroup);
router.post('/:groupId/approve/:userId', approveGroupRequest);
router.post('/:groupId/reject/:userId', rejectGroupRequest);
router.post('/:groupId/posts/:userId/image', upload.single('image'), uploadGroupPostImage);

// Group statistics route
router.get('/:groupId/stats', getGroupStats);

export default router; 