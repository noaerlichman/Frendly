import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { UserProfile, ErrorResponse } from '../types/index';
import cloudinary from '../config/cloudinary';

/**
 * Create or update user profile
 * @route POST /api/users/profile
 * @access Private
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const { uid, fullName, dateOfBirth, gender, profilePicture }: UserProfile = req.body;

  if (!uid || !fullName || !dateOfBirth || !gender) {
    res.status(400).json({ message: 'Missing required fields' } as ErrorResponse);
    return;
  }

  try {
    // Create user profile document in Firestore
    const userProfileRef = doc(db, 'Users', uid);
    
    await setDoc(userProfileRef, {
      fullName,
      dateOfBirth,
      gender,
      profilePicture: profilePicture || '',
      updatedAt: new Date().toISOString()
    });

    res.status(200).json({
      message: 'Profile updated successfully',
      profile: {
        uid,
        fullName,
        dateOfBirth,
        gender,
        profilePicture
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error during profile update' } as ErrorResponse);
  }
};

/**
 * Get user profile
 * @route GET /api/users/profile/:uid
 * @access Private
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  const { uid } = req.params;

  if (!uid) {
    res.status(400).json({ message: 'User ID is required' } as ErrorResponse);
    return;
  }

  try {
    // Get user profile from Firestore
    const userProfileRef = doc(db, 'Users', uid);
    const profileSnapshot = await getDoc(userProfileRef);

    if (!profileSnapshot.exists()) {
      res.status(404).json({ message: 'Profile not found' } as ErrorResponse);
      return;
    }

    const profileData = profileSnapshot.data();
    
    res.status(200).json({
      message: 'Profile retrieved successfully',
      profile: {
        uid,
        fullName: profileData.fullName,
        dateOfBirth: profileData.dateOfBirth,
        gender: profileData.gender,
        profilePicture: profileData.profilePicture
      }
    });
  } catch (error) {
    console.error('Profile retrieval error:', error);
    res.status(500).json({ message: 'Server error during profile retrieval' } as ErrorResponse);
  }
};

/**
 * Upload profile picture to Cloudinary
 * @route POST /api/users/profile/:uid/picture
 * @access Private
 */
export const uploadProfilePicture = async (req: Request, res: Response): Promise<void> => {
  const { uid } = req.params;
  const file = req.file;

  console.log('=== Starting Profile Picture Upload Process ===');
  console.log('User ID:', uid);

  if (!file) {
    console.log('Error: No file received in request');
    res.status(400).json({ message: 'No file uploaded' } as ErrorResponse);
    return;
  }

  if (!uid) {
    console.log('Error: No user ID provided');
    res.status(400).json({ message: 'User ID is required' } as ErrorResponse);
    return;
  }

  try {
    console.log('File details:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      buffer: file.buffer ? 'Buffer present' : 'No buffer'
    });

    // Convert buffer to base64
    console.log('Converting file to base64...');
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${file.mimetype};base64,${b64}`;
    console.log('Base64 conversion complete. Data URI length:', dataURI.length);

    // Upload to Cloudinary
    console.log('Starting Cloudinary upload...');
    console.log('Upload parameters:', {
      folder: `ProfilePictures/${uid}`,
      public_id: `profile_${Date.now()}`,
      resource_type: 'image'
    });

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: `ProfilePictures/${uid}`,
      public_id: `profile_${Date.now()}`,
      resource_type: 'image'
    });

    console.log('Cloudinary upload successful!');
    console.log('Cloudinary response:', {
      url: result.secure_url,
      public_id: result.public_id,
      folder: result.folder,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes
    });

    // Update or create user profile with new picture URL
    console.log('Updating user profile in Firestore...');
    const userRef = doc(db, 'Users', uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      // Get existing user data
      const userData = userDoc.data();
      console.log('Existing user data:', userData);

      // Update existing document while preserving other fields
      await updateDoc(userRef, {
        ...userData,
        profilePicture: result.secure_url,
        updatedAt: new Date().toISOString()
      });
    } else {
      // Create new document with profile picture
      await setDoc(userRef, {
        profilePicture: result.secure_url,
        updatedAt: new Date().toISOString()
      });
    }
    console.log('User profile updated successfully');

    console.log('=== Profile Picture Upload Process Complete ===');

    res.status(200).json({
      message: 'Profile picture uploaded successfully',
      profilePicture: result.secure_url
    });
  } catch (error: any) {
    console.error('=== Profile Picture Upload Error ===');
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: 'Failed to upload profile picture' } as ErrorResponse);
  }
};

/**
 * Get user's profile picture
 * @route GET /api/users/profile/:uid/picture
 * @access Private
 */
export const getProfilePicture = async (req: Request, res: Response): Promise<void> => {
  const { uid } = req.params;

  if (!uid) {
    res.status(400).json({ message: 'User ID is required' } as ErrorResponse);
    return;
  }

  try {
    console.log('Fetching profile picture for user:', uid);

    // Get user profile from Firestore
    const userProfileRef = doc(db, 'Users', uid);
    const profileSnapshot = await getDoc(userProfileRef);

    if (!profileSnapshot.exists()) {
      res.status(404).json({ message: 'Profile not found' } as ErrorResponse);
      return;
    }

    const profileData = profileSnapshot.data();
    
    if (!profileData.profilePicture) {
      res.status(404).json({ message: 'No profile picture found' } as ErrorResponse);
      return;
    }

    console.log('Profile picture found:', {
      url: profileData.profilePicture
    });

    res.status(200).json({
      message: 'Profile picture retrieved successfully',
      profilePicture: profileData.profilePicture
    });
  } catch (error) {
    console.error('Profile picture retrieval error:', error);
    res.status(500).json({ message: 'Failed to retrieve profile picture' } as ErrorResponse);
  }
}; 