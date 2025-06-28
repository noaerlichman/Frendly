import express from 'express';
import multer from 'multer';
import { updateProfile, getProfile, uploadProfilePicture } from '../controllers/profileController';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });


router.post('/profile', updateProfile);

router.get('/profile/:uid', getProfile);

router.post('/profile/:uid/picture', upload.single('file'), uploadProfilePicture);

export default router; 