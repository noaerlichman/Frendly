import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authService } from '../utils/api';
import GroupStats from '../components/GroupStats';

const Group = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newPost, setNewPost] = useState('');
  const [posts, setPosts] = useState([]);
  const [postError, setPostError] = useState('');
  const [members, setMembers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState('');
  const [editingPost, setEditingPost] = useState(null);
  const [editText, setEditText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px'
    },
    header: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    appHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      paddingBottom: '20px',
      borderBottom: '1px solid #dddfe2'
    },
    appName: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#1877f2',
      margin: 0
    },
    backButton: {
      backgroundColor: 'transparent',
      border: 'none',
      fontSize: '20px',
      cursor: 'pointer',
      color: '#65676b',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      padding: '8px 12px',
      borderRadius: '6px',
      transition: 'background-color 0.2s ease'
    },
    backButtonHover: {
      backgroundColor: '#f0f2f5'
    },
    groupName: {
      fontSize: '24px',
      fontWeight: '600',
      marginBottom: '10px',
      color: '#1c1e21'
    },
    description: {
      fontSize: '16px',
      color: '#65676b',
      marginBottom: '20px'
    },
    membersSection: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    membersTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '15px',
      color: '#1c1e21'
    },
    membersList: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '15px'
    },
    memberCard: {
      backgroundColor: '#f0f2f5',
      borderRadius: '8px',
      padding: '15px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    memberAvatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: '#e4e6eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      fontWeight: '600',
      color: '#1c1e21'
    },
    memberName: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#1c1e21'
    },
    postsSection: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    postForm: {
      marginBottom: '20px'
    },
    postInput: {
      width: '100%',
      padding: '10px',
      borderRadius: '8px',
      border: '1px solid #dddfe2',
      marginBottom: '10px',
      fontSize: '14px',
      resize: 'vertical',
      minHeight: '100px'
    },
    postButton: {
      backgroundColor: '#1877f2',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      padding: '8px 16px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer'
    },
    postButtonHover: {
      backgroundColor: '#166fe5'
    },
    postsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    },
    postItem: {
      backgroundColor: '#f0f2f5',
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '15px'
    },
    postAuthor: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '10px'
    },
    postAuthorAvatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: '#e4e6eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      fontWeight: '600',
      color: '#1c1e21'
    },
    postText: {
      fontSize: '14px',
      color: '#1c1e21',
      marginBottom: '10px'
    },
    postDate: {
      fontSize: '12px',
      color: '#65676b'
    },
    postInfo: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '12px',
      color: '#65676b'
    },
    postActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginTop: '10px'
    },
    actionButton: {
      backgroundColor: 'transparent',
      border: 'none',
      fontSize: '14px',
      cursor: 'pointer',
      color: '#65676b',
      padding: '4px 8px',
      borderRadius: '4px',
      transition: 'all 0.2s ease'
    },
    cancelButton: {
      backgroundColor: 'transparent',
      border: 'none',
      fontSize: '14px',
      cursor: 'pointer',
      color: '#65676b',
      padding: '0'
    },
    noPosts: {
      textAlign: 'center',
      color: '#65676b',
      fontStyle: 'italic'
    },
    imageUploadContainer: {
      marginTop: '10px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    fileInput: {
      display: 'none'
    },
    uploadButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      padding: '8px 12px',
      backgroundColor: '#f0f2f5',
      borderRadius: '20px',
      cursor: 'pointer',
      fontSize: '14px',
      color: '#65676b',
      transition: 'background-color 0.2s',
      '&:hover': {
        backgroundColor: '#e4e6eb'
      }
    },
    uploadIcon: {
      fontSize: '16px'
    },
    imagePreviewContainer: {
      position: 'relative',
      marginTop: '10px'
    },
    imagePreview: {
      maxWidth: '200px',
      maxHeight: '200px',
      borderRadius: '8px',
      objectFit: 'cover'
    },
    removeImageButton: {
      position: 'absolute',
      top: '-8px',
      right: '-8px',
      backgroundColor: '#ffffff',
      border: 'none',
      borderRadius: '50%',
      width: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      '&:hover': {
        backgroundColor: '#f0f2f5'
      }
    }
  };

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const token = authService.getToken();
        if (!token) {
          navigate('/login');
          return;
        }

        // Parse the token to get user info
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

        // Fetch group details
        const groupResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/groups/${groupId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!groupResponse.ok) {
          throw new Error('Failed to fetch group details');
        }

        const groupData = await groupResponse.json();
        setGroup(groupData.group);

        // Check if current user is admin
        const isUserAdmin = groupData.group.adminId === user_id;
        setIsAdmin(isUserAdmin);

        // Fetch group members
        const membersPromises = groupData.group.members.map(async (memberId) => {
          const memberResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/users/profile/${memberId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (memberResponse.ok) {
            const memberData = await memberResponse.json();
            return memberData.profile;
          }
          return null;
        });

        const membersData = await Promise.all(membersPromises);
        setMembers(membersData.filter(member => member !== null));

        // Fetch group posts
        const postsResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/groups/${groupId}/posts`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (postsResponse.ok) {
          const postsData = await postsResponse.json();
          
          // Fetch user information for each post
          const postsWithUsers = await Promise.all(
            (postsData.posts || []).map(async (post) => {
              const userResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/users/profile/${post.userId}`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              
              if (userResponse.ok) {
                const userData = await userResponse.json();
                return {
                  ...post,
                  authorName: userData.profile.fullName,
                  authorPicture: userData.profile.profilePicture,
                  imageUrl: post.imageUrl
                };
              }
              return {
                ...post,
                imageUrl: post.imageUrl
              };
            })
          );
          
          setPosts(postsWithUsers);
        }

      } catch (err) {
        console.error('Error fetching group data:', err);
        setError('Failed to load group data');
      } finally {
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [groupId, navigate]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    
    if (!newPost.trim()) {
      setPostError('Post content cannot be empty');
      return;
    }

    try {
      const token = authService.getToken();
      const userId = JSON.parse(atob(token.split('.')[1])).user_id;

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/groups/${groupId}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          text: newPost,
          userId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      const data = await response.json();
      
      // Fetch user information for the new post
      const userResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/users/profile/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        const newPostWithUser = {
          ...data.post,
          authorName: userData.profile.fullName,
          authorPicture: userData.profile.profilePicture
        };
        setPosts([newPostWithUser, ...posts]);
      } else {
        // If user fetch fails, still add the post but with default values
        setPosts([{
          ...data.post,
          authorName: 'Unknown User',
          authorPicture: null
        }, ...posts]);
      }
      
      setNewPost('');
      setPostError('');
    } catch (err) {
      console.error('Error creating post:', err);
      setPostError('Failed to create post');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    // If timestamp is a Firestore Timestamp
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleString();
    }
    
    // If timestamp is an ISO string
    if (typeof timestamp === 'string') {
      return new Date(timestamp).toLocaleString();
    }
    
    // If timestamp is a Date object
    if (timestamp instanceof Date) {
      return timestamp.toLocaleString();
    }
    
    // If timestamp is a number (milliseconds)
    if (typeof timestamp === 'number') {
      return new Date(timestamp).toLocaleString();
    }
    
    // If timestamp is an object with _seconds
    if (timestamp._seconds) {
      return new Date(timestamp._seconds * 1000).toLocaleString();
    }
    
    // Fallback to current date
    return new Date().toLocaleString();
  };

  const handleEditClick = (post) => {
    setEditingPost(post.id);
    setEditText(post.text);
  };

  const handleSaveEdit = async (postId) => {
    if (!editText.trim()) {
      setPostError('Post content cannot be empty');
      return;
    }

    try {
      const token = authService.getToken();
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/groups/${groupId}/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          text: editText,
          userId: userId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update post');
      }

      const data = await response.json();
      
      // Find the original post to preserve user information
      const originalPost = posts.find(post => post.id === postId);
      
      // Update posts with the edited post while preserving user information
      setPosts(posts.map(post => 
        post.id === postId 
          ? {
              ...data.post,
              authorName: originalPost.authorName,
              authorPicture: originalPost.authorPicture
            }
          : post
      ));
      
      setEditingPost(null);
      setEditText('');
      setPostError('');
    } catch (err) {
      console.error('Error updating post:', err);
      setPostError('Failed to update post');
    }
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    setEditText('');
  };

  const canModifyPost = (postUserId) => {
    return isAdmin || postUserId === userId;
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const token = authService.getToken();
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/groups/${groupId}/posts/${postId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            userId
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      setPosts(posts.filter(post => post.id !== postId));
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('Failed to delete post');
    }
  };

  const handleImageChange = (e) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      let imageUrl = null;
      if (selectedImage) {
        const formData = new FormData();
        formData.append('image', selectedImage);
        
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/groups/${groupId}/posts/${userId}/image`, {
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
        text: newPost,
        imageUrl,
        createdAt: new Date().toISOString(),
        userId: userId
      };

      const postResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/groups/${groupId}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify(postData)
      });

      if (!postResponse.ok) {
        throw new Error('Failed to create post');
      }

      const postDataResponse = await postResponse.json();
      
      // Fetch user information for the new post
      const userResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/users/profile/${userId}`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        const newPostWithUser = {
          ...postDataResponse.post,
          authorName: userData.profile.fullName,
          authorPicture: userData.profile.profilePicture
        };
        setPosts([newPostWithUser, ...posts]);
      } else {
        // If user fetch fails, still add the post but with default values
        setPosts([{
          ...postDataResponse.post,
          authorName: 'Unknown User',
          authorPicture: null
        }, ...posts]);
      }
      
      setNewPost('');
      setPostError('');
      setSelectedImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Error creating post:', error);
      setPostError('Failed to create post');
    }
  };

  if (loading) {
    return <div style={styles.container}>Loading group...</div>;
  }

  if (error) {
    return <div style={styles.container}>{error}</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.appHeader}>
          <h1 style={styles.appName}>Frendly</h1>
          <button
            style={styles.backButton}
            onClick={() => navigate(-1)}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = styles.backButtonHover.backgroundColor}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            ← Back
          </button>
        </div>
        <h2 style={styles.groupName}>{group.name}</h2>
        {group.description && (
          <p style={styles.description}>{group.description}</p>
        )}
      </div>

      <GroupStats groupId={groupId} isAdmin={isAdmin} />

      <div style={styles.membersSection}>
        <h2 style={styles.membersTitle}>Members ({members.length})</h2>
        <div style={styles.membersList}>
          {members.map(member => (
            <div key={member.uid} style={styles.memberCard}>
              <div style={styles.memberAvatar}>
                {member.profilePicture ? (
                  <img src={member.profilePicture} alt={member.fullName} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                ) : (
                  member.fullName.charAt(0)
                )}
              </div>
              <span style={styles.memberName}>{member.fullName}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.postsSection}>
        <form onSubmit={handleSubmit} style={styles.postForm}>
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's on your mind?"
            style={styles.postInput}
          />
          
          <div style={styles.imageUploadContainer}>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
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
                  onClick={() => {
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

          {postError && <div style={{ color: 'red', marginBottom: '10px' }}>{postError}</div>}
          <button type="submit" style={styles.postButton}>
            Post
          </button>
        </form>

        <div style={styles.postsList}>
          {posts.length > 0 ? (
            posts.map(post => (
              <div key={post.id} style={styles.postItem}>
                <div style={styles.postAuthor}>
                  <div style={styles.postAuthorAvatar}>
                    {post.authorPicture ? (
                      <img 
                        src={post.authorPicture} 
                        alt={post.authorName} 
                        style={{ width: '100%', height: '100%', borderRadius: '50%' }} 
                      />
                    ) : (
                      post.authorName?.charAt(0) || '?'
                    )}
                  </div>
                  <span>{post.authorName || 'Unknown User'}</span>
                </div>
                {editingPost === post.id ? (
                  <div>
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      style={styles.postInput}
                    />
                    <div style={styles.postActions}>
                      <button
                        onClick={() => handleSaveEdit(post.id)}
                        style={styles.postButton}
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        style={styles.cancelButton}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p style={styles.postText}>{post.text}</p>
                    {console.log('Post image URL:', post.imageUrl)}
                    {post.imageUrl && (
                      <div style={{
                        marginTop: '10px',
                        marginBottom: '10px',
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center'
                      }}>
                        <img 
                          src={post.imageUrl} 
                          alt="Post content" 
                          style={{
                            maxWidth: '100%',
                            maxHeight: '400px',
                            borderRadius: '8px',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            console.error('Error loading image:', e);
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div style={styles.postInfo}>
                      <span style={styles.postDate}>{formatDate(post.createdAt)}</span>
                      {canModifyPost(post.userId) && (
                        <div style={styles.postActions}>
                          <button
                            onClick={() => handleEditClick(post)}
                            style={styles.actionButton}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            style={{...styles.actionButton, backgroundColor: '#ffebee', color: '#dc3545'}}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <p style={styles.noPosts}>No posts yet. Be the first to post!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Group; 