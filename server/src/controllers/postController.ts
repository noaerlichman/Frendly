import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  arrayUnion, 
  updateDoc, 
  arrayRemove 
} from 'firebase/firestore';
import { Post, Friend, ErrorResponse } from '../types/types';
import cloudinary from '../config/cloudinary';


// create new post by: POST /api/posts
export const createPost = async (req: Request, res: Response): Promise<void> => {
  const { uid, text, imageUrl, createdAt }: Post = req.body;

  if (!uid || !text) {
    res.status(400).json({ message: 'User ID and text content are required' } as ErrorResponse);
    return;
  }

  try {
    // Reference to the user's posts document
    const userPostsRef = doc(db, 'userPosts', uid);
    
    const postId = Date.now().toString();
    
    // Create the new post instance
    const newPost = {
      id: postId,
      text,
      imageUrl: imageUrl || null,
      createdAt: createdAt || new Date().toISOString()
    };
    
    const docSnap = await getDoc(userPostsRef);
    
    if (docSnap.exists()) {
      // Document exists, update the posts array
      await updateDoc(userPostsRef, {
        posts: arrayUnion(newPost)
      });
    } else {
      // Document doesn't exist, create it with the first post
      await setDoc(userPostsRef, {
        posts: [newPost]
      });
    }

    res.status(201).json({
      message: 'Post created successfully',
      post: {
        uid,
        ...newPost
      }
    });
  } catch (error) {
    console.error('Post creation error:', error);
    res.status(500).json({ message: 'Server error during post creation' } as ErrorResponse);
  }
};


// get user's posts by: GET /api/posts/user/:uid
export const getUserPosts = async (req: Request, res: Response): Promise<void> => {
  const { uid } = req.params;
  const { includeFriends } = req.query;

  if (!uid) {
    res.status(400).json({ message: 'User ID is required' } as ErrorResponse);
    return;
  }

  try {
    const allPosts: Post[] = [];
    
    // Get the user's posts document
    const userPostsRef = doc(db, 'userPosts', uid);
    const docSnap = await getDoc(userPostsRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const posts = data.posts || [];
      
      // Add uid to each post
      const userPosts = posts.map((post: any) => ({
        ...post,
        uid,
        isOwner: true 
      }));
      
      allPosts.push(...userPosts);
    }
    
    // in case of Dashboard - get friend's posts too
    if (includeFriends === 'true') {
      // Get user's friends
      const userFriendsRef = doc(db, 'Friends', uid);
      const friendsDoc = await getDoc(userFriendsRef);
      
      if (friendsDoc.exists()) {
        const friendsData = friendsDoc.data();
        const friends = friendsData.friends || [];
        
        // Fetch posts for each friend
        for (const friend of friends) {
          const friendId = friend.uid;
          const friendPostsRef = doc(db, 'userPosts', friendId);
          const friendPostsDoc = await getDoc(friendPostsRef);
          
          if (friendPostsDoc.exists()) {
            const data = friendPostsDoc.data();
            const friendPosts = data.posts || [];
            
            // Add friend info to each post
            const formattedFriendPosts = friendPosts.map((post: any) => ({
              ...post,
              uid: friendId,
              friendName: friend.fullName,
              isOwner: false // Mark as non-owner for UI permissions
            }));
            
            allPosts.push(...formattedFriendPosts);
          }
        }
      }
    }
    
    // Sort all posts by createdAt
    allPosts.sort((a, b) => 
      new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime()
    );
    
    res.status(200).json({
      message: 'Posts retrieved successfully',
      posts: allPosts
    });
  } catch (error) {
    console.error('Posts retrieval error:', error);
    res.status(500).json({ message: 'Server error during posts retrieval' } as ErrorResponse);
  }
};


// update post by: PUT /api/posts/:id
export const updatePost = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { uid, text }: Post = req.body;

  if (!id || !uid || !text) {
    res.status(400).json({ message: 'Post ID, user ID, and text content are required' } as ErrorResponse);
    return;
  }

  try {
    // Get the user's posts document
    const userPostsRef = doc(db, 'userPosts', uid);
    const docSnap = await getDoc(userPostsRef);
    
    if (!docSnap.exists()) {
      res.status(404).json({ message: 'No posts found for this user' } as ErrorResponse);
      return;
    }
    
    const data = docSnap.data();
    const posts = data.posts || [];
    
    // Find the post to update
    const postIndex = posts.findIndex((post: any) => post.id === id);
    
    if (postIndex === -1) {
      res.status(404).json({ message: 'Post not found' } as ErrorResponse);
      return;
    }
    
    // Remove the old post
    const oldPost = posts[postIndex];
    await updateDoc(userPostsRef, {
      posts: arrayRemove(oldPost)
    });
    
    // Create updated post
    const updatedPost = {
      ...oldPost,
      text,
      updatedAt: new Date().toISOString()
    };
    
    // Add the updated post
    await updateDoc(userPostsRef, {
      posts: arrayUnion(updatedPost)
    });
    
    res.status(200).json({
      message: 'Post updated successfully',
      post: {
        ...updatedPost,
        uid
      }
    });
  } catch (error) {
    console.error('Post update error:', error);
    res.status(500).json({ message: 'Server error during post update' } as ErrorResponse);
  }
};


// delete a post by: DELETE /api/posts/:id
export const deletePost = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { uid } = req.body;

  if (!id || !uid) {
    res.status(400).json({ message: 'Post ID and user ID are required' } as ErrorResponse);
    return;
  }

  try {
    // Get the user's posts document
    const userPostsRef = doc(db, 'userPosts', uid);
    const docSnap = await getDoc(userPostsRef);
    
    if (!docSnap.exists()) {
      res.status(404).json({ message: 'No posts found for this user' } as ErrorResponse);
      return;
    }
    
    const data = docSnap.data();
    const posts = data.posts || [];
    
    // Find the post to delete
    const postToDelete = posts.find((post: any) => post.id === id);
    
    if (!postToDelete) {
      res.status(404).json({ message: 'Post not found' } as ErrorResponse);
      return;
    }
    
    // Remove the post
    await updateDoc(userPostsRef, {
      posts: arrayRemove(postToDelete)
    });
    
    res.status(200).json({
      message: 'Post deleted successfully',
      id
    });
  } catch (error) {
    console.error('Post deletion error:', error);
    res.status(500).json({ message: 'Server error during post deletion' } as ErrorResponse);
  }
};


// upload post image to cloudinary by: POST /api/posts/:uid/image
export const uploadPostImage = async (req: Request, res: Response): Promise<void> => {
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
      folder: `UserPosts/${uid}`,
      public_id: `post_${Date.now()}`,
      resource_type: 'image'
    });

    console.log('Cloudinary upload successful!');

    res.status(200).json({
      message: 'Post image uploaded successfully',
      imageUrl: result.secure_url
    });
  } catch (error: any) {
    console.error('=== Post Image Upload Error ===');
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: 'Failed to upload post image' } as ErrorResponse);
  }
}; 