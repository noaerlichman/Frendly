import express from 'express';
import multer from 'multer';
import { createPost, getUserPosts, updatePost, deletePost, uploadPostImage } from '../controllers/postController';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// create new post: /api/posts
router.post('/', createPost);

// get all user's  posts: /api/posts/user/:uid
router.get('/user/:uid', getUserPosts);

// update some post: /api/posts/:id
router.put('/:id', updatePost);

// delete post by post id: /api/posts/:id
router.delete('/:id', deletePost);

// upload image to cloudinary: /api/posts/:uid/image
router.post('/:uid/image', upload.single('image'), uploadPostImage);

export default router; 