import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { UserProfile, ErrorResponse } from '../types/types';
import cloudinary from '../config/cloudinary';


// update or create user profile by: POST /api/users/profile
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


// get user's profile by: GET /api/users/profile/:uid
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


// upload profile picture to cloudinary by: POST /api/users/profile/:uid/picture
export const uploadProfilePicture = async (req: Request, res: Response): Promise<void> => {
  const { uid } = req.params;
  const file = req.file;

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
    // Convert buffer to base64
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${file.mimetype};base64,${b64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: `ProfilePictures/${uid}`,
      public_id: `profile_${Date.now()}`,
      resource_type: 'image'
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