import express from 'express';
import multer from 'multer';
import { updateProfile, getProfile, uploadProfilePicture } from '../controllers/profileController';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// @route   POST /api/users/profile
// @desc    Create or update user profile
// @access  Private
router.post('/profile', updateProfile);

// @route   GET /api/users/profile/:uid
// @desc    Get user profile
// @access  Private
router.get('/profile/:uid', getProfile);

// @route   POST /api/users/profile/:uid/picture
// @desc    Upload profile picture
// @access  Private
router.post('/profile/:uid/picture', upload.single('file'), uploadProfilePicture);

export default router; 