import { Request, Response } from 'express';
import { auth } from '../config/firebase';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
  AuthError
} from 'firebase/auth';
import { User, AuthResponse, ErrorResponse } from '../types/index';

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password }: User = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required' } as ErrorResponse);
    return;
  }

  try {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const response: AuthResponse = {
      message: 'User registered successfully',
      user: {
        uid: user.uid,
        email: user.email as string
      }
    };

    res.status(201).json(response);
  } catch (error) {
    const authError = error as AuthError;
    console.error('Registration error:', authError.code, authError.message);
    
    if (authError.code === 'auth/email-already-in-use') {
      res.status(400).json({ message: 'Email is already in use' } as ErrorResponse);
    } else if (authError.code === 'auth/weak-password') {
      res.status(400).json({ message: 'Password is too weak' } as ErrorResponse);
    } else if (authError.code === 'auth/invalid-email') {
      res.status(400).json({ message: 'Invalid email format' } as ErrorResponse);
    } else {
      res.status(500).json({ message: 'Server error during registration' } as ErrorResponse);
    }
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password }: User = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required' } as ErrorResponse);
    return;
  }

  try {
    const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get the ID token for the client
    const token = await user.getIdToken();

    const response: AuthResponse = {
      message: 'Login successful',
      user: {
        uid: user.uid,
        email: user.email as string
      },
      token
    };

    res.status(200).json(response);
  } catch (error) {
    const authError = error as AuthError;
    console.error('Login error:', authError.code, authError.message);
    
    if (authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password') {
      res.status(401).json({ message: 'Invalid credentials' } as ErrorResponse);
    } else if (authError.code === 'auth/too-many-requests') {
      res.status(429).json({ message: 'Too many login attempts, please try again later' } as ErrorResponse);
    } else {
      res.status(500).json({ message: 'Server error during login' } as ErrorResponse);
    }
  }
}; 