import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import cloudinary from '../config/cloudinary';

export const uploadProfilePicture = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.buffer.toString('base64'), {
      folder: 'profile_pictures',
      public_id: `${userId}_${Date.now()}`,
      resource_type: 'auto'
    });

    // Update the user's profile with the new picture URL
    const userRef = doc(db, 'Users', userId);
    await updateDoc(userRef, {
      profilePicture: result.secure_url,
      updatedAt: new Date()
    });

    res.json({ 
      message: 'Profile picture uploaded successfully',
      profilePicture: result.secure_url
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ message: 'Failed to upload profile picture' });
  }
}; 