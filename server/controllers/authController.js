const { auth } = require('../config/firebase');
const { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} = require('firebase/auth');

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
const register = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        uid: user.uid,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error.code, error.message);
    
    if (error.code === 'auth/email-already-in-use') {
      return res.status(400).json({ message: 'Email is already in use' });
    } else if (error.code === 'auth/weak-password') {
      return res.status(400).json({ message: 'Password is too weak' });
    } else if (error.code === 'auth/invalid-email') {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    res.status(500).json({ message: 'Server error during registration' });
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get the ID token for the client
    const token = await user.getIdToken();

    res.status(200).json({
      message: 'Login successful',
      user: {
        uid: user.uid,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error.code, error.message);
    
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      return res.status(401).json({ message: 'Invalid credentials' });
    } else if (error.code === 'auth/too-many-requests') {
      return res.status(429).json({ message: 'Too many login attempts, please try again later' });
    }
    
    res.status(500).json({ message: 'Server error during login' });
  }
};

module.exports = {
  register,
  login
}; 