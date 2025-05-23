import express from 'express';
import multer from 'multer';
import { createPost, getUserPosts, updatePost, deletePost, uploadPostImage } from '../controllers/postController';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', createPost);

// @route   GET /api/posts/user/:uid
// @desc    Get posts by user ID
// @access  Private
router.get('/user/:uid', getUserPosts);

// @route   PUT /api/posts/:id
// @desc    Update a post
// @access  Private
router.put('/:id', updatePost);

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', deletePost);

// @route   POST /api/posts/:uid/image
// @desc    Upload post image
// @access  Private
router.post('/:uid/image', upload.single('image'), uploadPostImage);

export default router; 