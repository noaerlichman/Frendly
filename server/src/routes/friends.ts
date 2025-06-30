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

// get all users that are not friend of the current user by: /api/friends/suggestions
router.get('/suggestions', getUserSuggestions);

// add new friend by /api/friends
router.post('/', addFriend);

// remove friend by /api/friends/:friendId
router.delete('/:friendId', removeFriend);

// get all friends of the current user by /api/friends/user/:uid
router.get('/user/:uid', getUserFriends);

// send friend request by /api/friends/request
router.post('/request', sendFriendRequest);

// check friend status (friends/ request/ not friends) by /api/friends/request/status
router.get('/request/status', checkFriendRequestStatus);

// handle friend request (approve/reject) by /api/friends/request/handle
router.put('/request/handle', handleFriendRequest);

export default router; 