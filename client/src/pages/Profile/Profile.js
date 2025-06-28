import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { authService } from '../../utils/api';
import FriendsList from '../../components/ProfileFriendsTab';
import { styles } from './profileStyles';
 
const Profile = () => {
  const navigate = useNavigate();
  const { friendId } = useParams();
  const location = useLocation();
  const isReadOnly = location.state?.isReadOnly;
  const friendName = location.state?.friendName;
 
  const [userProfile, setUserProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [postError, setPostError] = useState('');
  const [userId, setUserId] = useState('');
  const [editingPost, setEditingPost] = useState(null);
  const [editText, setEditText] = useState('');
  const [viewingFriendPosts, setViewingFriendPosts] = useState(null);
  const [includesFriendPosts, setIncludeFriendPosts] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [viewMode, setViewMode] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupsError, setGroupsError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUpdatingProfilePicture, setIsUpdatingProfilePicture] = useState(false);
  
 
  // Check if user is logged in
  useEffect(() => {
    const token = authService.getToken();
    if (!token) {
      navigate('/login');
      return;
    }
 
    // Parse the token to get user info
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const { user_id } = JSON.parse(jsonPayload);
      setUserId(user_id);
 
      // If viewing a friend's profile, fetch their profile and posts
      if (friendId) {
        fetchUserProfile(friendId);
        fetchUserPosts(friendId);
      } else {
        // Fetch own profile and posts
        fetchUserProfile(user_id);
        fetchUserPosts(user_id);
      }
    } catch (err) {
      console.error("Failed to parse token:", err);
      setError("Session expired. Please login again.");
      authService.logout();
      navigate('/login');
    }
  }, [navigate, friendId]);
 
  // Fetch posts when viewingFriendPosts or includesFriendPosts changes
  useEffect(() => {
    if (userId) {
      if (viewingFriendPosts) {
        fetchFriendPosts(viewingFriendPosts.uid);
      } else {
        fetchUserPosts(userId);
      }
    }
  }, [userId, viewingFriendPosts, includesFriendPosts]);
 
  // Fetch user profile
  const fetchUserProfile = async (uid) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/users/profile/${uid}`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });
 
      const data = await response.json();
     
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch profile');
      }
     
      setUserProfile(data.profile);
    } catch (err) {
      console.error("Profile fetch error:", err);
      setError("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };
 
  // Fetch user posts
  const fetchUserPosts = async (uid) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/posts/user/${uid}?includeFriends=${includesFriendPosts}`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });
 
      const data = await response.json();
     
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch posts');
      }
     
      setPosts(data.posts || []);
    } catch (err) {
      console.error("Posts fetch error:", err);
      setError("Failed to load posts. Please try again.");
    }
  };
 
  // Fetch friend's posts
  const fetchFriendPosts = async (friendId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/posts/user/${friendId}`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });
 
      const data = await response.json();
     
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch friend posts');
      }
     
      setPosts(data.posts || []);
    } catch (err) {
      console.error("Friend posts fetch error:", err);
      setError("Failed to load friend's posts. Please try again.");
    }
  };
 
  // Start editing a post
  const handleEditClick = (post) => {
    setEditingPost(post.id);
    setEditText(post.text);
  };
 
  // Cancel editing
  const handleCancelEdit = () => {
    setEditingPost(null);
    setEditText('');
  };
 
  // Save edited post
  const handleSaveEdit = async (postId) => {
    if (!editText.trim()) {
      setPostError("Post content cannot be empty");
      return;
    }
 
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({
          uid: userId,
          text: editText
        })
      });
 
      const data = await response.json();
     
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update post');
      }
     
      // Update the posts array with the edited post
      const updatedPosts = posts.map(post =>
        post.id === postId ? { ...post, text: editText, updatedAt: data.post.updatedAt } : post
      );
     
      setPosts(updatedPosts);
      setEditingPost(null);
      setEditText('');
    } catch (err) {
      console.error("Post update error:", err);
      setPostError("Failed to update post. Please try again.");
    }
  };
 
  // Delete a post
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }
 
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({
          uid: userId
        })
      });
 
      const data = await response.json();
     
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete post');
      }
     
      // Remove the deleted post from the posts array
      const updatedPosts = posts.filter(post => post.id !== postId);
      setPosts(updatedPosts);
    } catch (err) {
      console.error("Post deletion error:", err);
      setError("Failed to delete post. Please try again.");
    }
  };
 
  // Handle viewing friend posts
  const handleViewFriendPosts = (friendId, friendName) => {
    setViewingFriendPosts({ uid: friendId, name: friendName });
    setIncludeFriendPosts(false);
  };
 
  // Handle logout
  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };
 
  // Add a handler to navigate to the AddFriends page
  const handleAddFriendsClick = () => {
    navigate('/add-friends');
  };
 
  // Fetch user's groups when groups tab is active
  useEffect(() => {
    if (activeTab === 'groups' && userId) {
      fetchUserGroups();
    }
  }, [activeTab, userId]);
 
  // Function to fetch user's groups
  const fetchUserGroups = async () => {
    setGroupsLoading(true);
    setGroupsError('');
   
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/groups/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });
 
      const data = await response.json();
     
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch groups');
      }
     
      setGroups(data.groups || []);
    } catch (err) {
      console.error("Groups fetch error:", err);
      setGroupsError("Failed to load groups. Please try again.");
    } finally {
      setGroupsLoading(false);
    }
  };
 
  // Function to handle group click
  const handleGroupClick = (groupId) => {
    navigate(`/group/${groupId}`);
  };
 
  // useEffect for real-time group search
  useEffect(() => {
    if (activeTab === 'groups' && searchQuery.trim()) {
      handleSearch();
    } else if (activeTab === 'groups' && !searchQuery.trim()) {
      // If search query is empty, fetch all groups
      fetchUserGroups();
    }
  }, [searchQuery, activeTab]);
 
  // Update handleSearch to not require form submission
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      return;
    }
 
    setIsSearching(true);
    setGroupsError('');
 
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/groups/search?query=${encodeURIComponent(searchQuery)}&userId=${encodeURIComponent(userId)}`,
        {
          headers: {
            'Authorization': `Bearer ${authService.getToken()}`
          }
        }
      );
 
      const data = await response.json();
     
      if (!response.ok) {
        throw new Error(data.message || 'Failed to search groups');
      }
     
      setGroups(data.groups || []);
    } catch (err) {
      console.error("Groups search error:", err);
      setGroupsError("Failed to search groups. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };
 
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
 
  const handlePostImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
 
  const handleUpdateProfilePicture = async () => {
    if (!selectedImage) return;
 
    setIsUpdatingProfilePicture(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedImage);
     
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/users/profile/${userId}/picture`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });
 
      if (!response.ok) {
        throw new Error('Failed to update profile picture');
      }
 
      const data = await response.json();
     
      // Update the profile picture in the state
      setUserProfile(prev => ({
        ...prev,
        profilePicture: data.profilePicture
      }));
 
      // Clear the selected image and preview
      setSelectedImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Error updating profile picture:', error);
      setError('Failed to update profile picture. Please try again.');
    } finally {
      setIsUpdatingProfilePicture(false);
    }
  };
 
  // add new post
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
 
    try {
      let imageUrl = null;
      if (selectedImage) {
        const formData = new FormData();
        formData.append('image', selectedImage);
       
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/posts/${userId}/image`, {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${authService.getToken()}`
          }
        });
 
        if (!response.ok) {
          throw new Error('Failed to upload image');
        }
 
        const data = await response.json();
        imageUrl = data.imageUrl;
      }
 
      const postData = {
        uid: userId,
        text: newPost,
        imageUrl,
        createdAt: new Date().toISOString()
      };
 
      const responsePost = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify(postData)
      });
 
      if (!responsePost.ok) {
        throw new Error('Failed to create post');
      }
 
      const dataPost = await responsePost.json();
     
      // Add new post to the posts array if viewing own posts
      if (!viewingFriendPosts) {
        setPosts([dataPost.post, ...posts]);
      }
     
      // Clear the form
      setNewPost('');
      setPostError('');
      setSelectedImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Error creating post:', error);
      setPostError('Failed to create post. Please try again.');
    }
  };
 
  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }
 
  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>
          {isReadOnly ? `${friendName}'s Profile` : 'My Profile'}
        </h1>
        <div className="header-actions">
          <button className="btn-back" onClick={() => navigate('/dashboard')}>
            &larr; Back to Dashboard
          </button>
          {!isReadOnly && (
            <button className="btn btn-logout" onClick={handleLogout}>Logout</button>
          )}
        </div>
      </div>
 
      {error && <div className="error-message">{error}</div>}
     
      {userProfile ? (
        <div className="profile-info">
          <div style={styles.profilePictureContainer}>
            <div className="profile-avatar" style={{
              width: '150px',
              height: '150px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              position: 'relative'
            }}>
              {userProfile.profilePicture ? (
                <img
                  src={userProfile.profilePicture}
                  alt={`${userProfile.fullName}'s profile`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div
                  className="avatar-placeholder"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    backgroundColor: '#e0e0e0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px',
                    color: '#666'
                  }}
                >
                  {userProfile.fullName.charAt(0).toUpperCase()}
                </div>
              )}
              {imagePreview && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      maxWidth: '80%',
                      maxHeight: '80%',
                      objectFit: 'contain'
                    }}
                  />
                </div>
              )}
            </div>
            {!isReadOnly && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  style={styles.profilePictureInput}
                  id="profile-picture-input"
                />
                <button
                  onClick={() => document.getElementById('profile-picture-input').click()}
                  style={styles.updateProfileButton}
                >
                  <i className="fas fa-camera"></i>
                  Update Picture
                </button>
                {imagePreview && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={handleUpdateProfilePicture}
                      disabled={isUpdatingProfilePicture}
                      style={{
                        ...styles.updateProfileButton,
                        backgroundColor: isUpdatingProfilePicture ? '#ccc' : '#1877f2'
                      }}
                    >
                      {isUpdatingProfilePicture ? 'Updating...' : 'Save'}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview(null);
                      }}
                      style={{
                        ...styles.updateProfileButton,
                        backgroundColor: '#dc3545'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="profile-details">
            <h2>{userProfile.fullName}</h2>
            <p><strong>Gender:</strong> {userProfile.gender}</p>
            <p><strong>Date of Birth:</strong> {userProfile.dateOfBirth}</p>
          </div>
        </div>
      ) : (
        !isReadOnly && (
          <div className="profile-incomplete">
            <p>Your profile is incomplete. Please complete your profile setup.</p>
            <button
              className="btn"
              onClick={() => navigate('/profile-setup', { state: { user: { uid: userId } } })}
            >
              Complete Profile
            </button>
          </div>
        )
      )}
 
      {!isReadOnly && (
        <div className="profile-tabs">
          <button
            className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            Posts
          </button>
          <button
            className={`tab-button ${activeTab === 'friends' ? 'active' : ''}`}
            onClick={() => setActiveTab('friends')}
          >
            Friends
          </button>
          <button
            className={`tab-button ${activeTab === 'groups' ? 'active' : ''}`}
            onClick={() => setActiveTab('groups')}
          >
            Groups
          </button>
        </div>
      )}
 
      {(!isReadOnly && activeTab === 'friends') && (
        <div className="friends-section">
          <div className="friends-search">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search"
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="search-icon"></span>
            </div>
            <div className="friends-actions">
              <button className="btn-add-friend" onClick={handleAddFriendsClick}>
                Add New Friends
              </button>
            </div>
          </div>
 
          <div className="friends-sub-nav">
            <button
              className={`sub-nav-button ${!viewMode || viewMode === 'all' ? 'active' : ''}`}
              onClick={() => setViewMode('all')}
            >
              All Friends
            </button>
            <button
              className={`sub-nav-button ${viewMode === 'birthdays' ? 'active' : ''}`}
              onClick={() => setViewMode('birthdays')}
            >
              Birthdays
            </button>
          </div>
         
          <FriendsList
            userId={userId}
            onViewFriendPosts={handleViewFriendPosts}
            viewMode={viewMode}
            searchQuery={searchQuery}
          />
        </div>
      )}
 
      {(isReadOnly || activeTab === 'posts') && (
        <div className="posts-section">
          <h2>
            {isReadOnly ? `${friendName}'s Posts` : 'My Posts'}
          </h2>
         
          {!isReadOnly && (
            <form className="post-form" onSubmit={handleSubmit}>
              <textarea
                placeholder="What's on your mind?"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                rows="3"
              />
              {postError && <div className="error-message">{postError}</div>}
              <div style={styles.imageUploadContainer}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePostImageChange}
                  style={styles.fileInput}
                  id="post-image"
                />
                <label htmlFor="post-image" style={styles.uploadButton}>
                  <i className="fas fa-image" style={styles.uploadIcon}></i>
                  Add Image
                </label>
               
                {imagePreview && (
                  <div style={styles.imagePreviewContainer}>
                    <img src={imagePreview} alt="Preview" style={styles.imagePreview} />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedImage(null);
                        setImagePreview(null);
                      }}
                      style={styles.removeImageButton}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                )}
              </div>
              <button type="submit" className="btn">Post</button>
            </form>
          )}
 
          <div className="posts-list">
            {posts.length > 0 ? (
              posts.map(post => (
                <div className="post-item" key={post.id}>
                  {editingPost === post.id ? (
                    <form
                        onSubmit={(e) => {
                        e.preventDefault();
                        handleSaveEdit(post.id);
                        }}
                        style={{ marginBottom: '10px' }}
                    >
                        <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows="3"
                        style={{ width: '100%', padding: '10px' }}
                        />
                        {postError && <div className="error-message">{postError}</div>}
                        <button type="submit" className="btn-small">Save</button>
                        <button type="button" className="btn-small btn-cancel" onClick={handleCancelEdit}>
                        Cancel
                        </button>
                    </form>
                    ) : (
                    <p className="post-text">{post.text}</p>
                    )}

                  {post.imageUrl && (
                    <div className="post-image-container">
                      <img
                        src={post.imageUrl}
                        alt="Post content"
                        className="post-image"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '400px',
                          borderRadius: '8px',
                          marginTop: '10px',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                  )}
                  <p className="post-date">{new Date(post.createdAt).toLocaleString()}</p>
                  {!isReadOnly && (
                    <div className="post-actions">
                      <button className="btn-small" onClick={() => handleEditClick(post)}>Edit</button>
                      <button className="btn-small btn-delete" onClick={() => handleDeletePost(post.id)}>Delete</button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="no-posts">
                {isReadOnly ? `${friendName} hasn't created any posts yet.` : "You haven't created any posts yet."}
              </p>
            )}
          </div>
        </div>
      )}
 
      {(!isReadOnly && activeTab === 'groups') && (
        <div style={styles.groupsSection}>
          <div style={styles.groupsHeader}>
            <h2>My Groups</h2>
            <button
              className="btn-add-friend"
              onClick={() => navigate('/create-group')}
            >
              Create Group
            </button>
          </div>
 
          <div style={styles.searchContainer}>
            <input
              type="text"
              style={styles.searchInput}
              placeholder="Search groups by name or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
 
          {groupsError && <div className="error-message">{groupsError}</div>}
 
          {groupsLoading || isSearching ? (
            <div style={styles.noGroups}>
              <p>Loading groups...</p>
            </div>
          ) : groups.length > 0 ? (
            <div style={styles.groupsList}>
              {groups.map(group => (
                <div
                  key={group.id}
                  style={styles.groupCard}
                  onClick={() => handleGroupClick(group.id)}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <h3 style={styles.groupName}>{group.name}</h3>
                  {group.description && (
                    <p style={styles.groupDescription}>{group.description}</p>
                  )}
                  {group.tags && group.tags.length > 0 && (
                    <div style={styles.groupTags}>
                      {group.tags.map(tag => (
                        <span key={tag} style={styles.groupTag}>{tag}</span>
                      ))}
                    </div>
                  )}
                  <div style={styles.groupInfo}>
                    <span>{group.isPublic ? 'Public' : 'Private'}</span>
                    <span>{group.members.length} members</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.noGroups}>
              <p>No groups found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
 
export default Profile;
 