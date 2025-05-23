import express from 'express';
import { 
  getUserSuggestions, 
  addFriend, 
  removeFriend, 
  getUserFriends,
  sendFriendRequest,
  checkFriendRequestStatus,
  handleFriendRequest
} from '../controllers/friendController';

const router = express.Router();

// @route   GET /api/friends/suggestions
// @desc    Get users for friend suggestions
// @access  Private
router.get('/suggestions', getUserSuggestions);

// @route   POST /api/friends
// @desc    Add a friend
// @access  Private
router.post('/', addFriend);

// @route   DELETE /api/friends/:friendId
// @desc    Remove a friend
// @access  Private
router.delete('/:friendId', removeFriend);

// @route   GET /api/friends/user/:uid
// @desc    Get user's friends
// @access  Private
router.get('/user/:uid', getUserFriends);

// @route   POST /api/friends/request
// @desc    Send a friend request
// @access  Private
router.post('/request', sendFriendRequest);

// @route   GET /api/friends/request/status
// @desc    Check friend request status between two users
// @access  Private
router.get('/request/status', checkFriendRequestStatus);

// @route   PUT /api/friends/request/handle
// @desc    Handle friend request (approve/reject)
// @access  Private
router.put('/request/handle', handleFriendRequest);

export default router; 