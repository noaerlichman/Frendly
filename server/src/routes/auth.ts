import express from 'express';
import { register, login } from '../controllers/authController';

const router = express.Router();

// register /api/auth/register
router.post('/register', register);

// login /api/auth/login
router.post('/login', login);

export default router; 