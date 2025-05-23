import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../utils/api';
import FriendsList from '../components/FriendsList';
import Chat from '../components/Chat';

const Dashboard = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [postError, setPostError] = useState('');
  const [userId, setUserId] = useState('');
  const [activeTab, setActiveTab] = useState('posts');
  const [viewMode, setViewMode] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupsError, setGroupsError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [friends, setFriends] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  // Add styles for the Groups section
  const styles = {
    groupsSection: {
      padding: '1rem',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      marginTop: '1rem'
    },
    groupsHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
      paddingBottom: '1rem',
      borderBottom: '1px solid #dddfe2'
    },
    searchContainer: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1.5rem'
    },
    searchInput: {
      flex: 1,
      padding: '0.5rem 1rem',
      borderRadius: '6px',
      border: '1px solid #dddfe2',
      fontSize: '14px',
      outline: 'none'
    },
    noGroups: {
      textAlign: 'center',
      padding: '2rem',
      backgroundColor: '#f0f2f5',
      borderRadius: '8px',
      color: '#65676b'
    },
    groupsList: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '1rem',
      padding: '1rem'
    },
    groupCard: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '1rem',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.2s ease',
      cursor: 'pointer'
    },
    groupName: {
      fontSize: '1.2rem',
      fontWeight: '600',
      marginBottom: '0.5rem',
      color: '#1c1e21'
    },
    groupDescription: {
      fontSize: '0.9rem',
      color: '#65676b',
      marginBottom: '0.5rem'
    },
    groupTags: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
      marginBottom: '0.5rem'
    },
    groupTag: {
      backgroundColor: '#f0f2f5',
      padding: '0.25rem 0.5rem',
      borderRadius: '4px',
      fontSize: '0.8rem',
      color: '#65676b'
    },
    groupInfo: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '0.8rem',
      color: '#65676b'
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

  // Add notification styles
  const notificationStyles = {
    notificationIcon: {
      position: 'relative',
      cursor: 'pointer',
      padding: '0.5rem',
      marginRight: '1rem'
    },
    notificationBadge: {
      position: 'absolute',
      top: '-5px',
      right: '-5px',
      backgroundColor: '#ff4444',
      color: 'white',
      borderRadius: '50%',
      padding: '0.2rem 0.5rem',
      fontSize: '0.8rem',
      minWidth: '1.2rem',
      textAlign: 'center'
    },
    notificationPanel: {
      position: 'absolute',
      top: '100%',
      right: '1rem',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      width: '300px',
      maxHeight: '400px',
      overflowY: 'auto',
      zIndex: 1000
    },
    notificationItem: {
      padding: '1rem',
      borderBottom: '1px solid #dddfe2',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease'
    },
    notificationItemUnread: {
      backgroundColor: '#f0f2f5'
    },
    notificationMessage: {
      fontSize: '0.9rem',
      color: '#1c1e21'
    },
    notificationTime: {
      fontSize: '0.8rem',
      color: '#65676b',
      marginTop: '0.5rem'
    },
    notificationActions: {
      display: 'flex',
      gap: '0.5rem',
      marginTop: '0.5rem'
    },
    actionButton: {
      padding: '0.25rem 0.5rem',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.8rem',
      flex: 1
    },
    acceptButton: {
      backgroundColor: '#4CAF50',
      color: 'white'
    },
    declineButton: {
      backgroundColor: '#f44336',
      color: 'white'
    }
  };

  useEffect(() => {
    // Get user ID from token
    const token = authService.getToken();
    if (!token) {
      navigate('/login');
      return;
    }

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
      
      // Fetch posts
      fetchPosts(user_id);
    } catch (err) {
      console.error("Failed to parse token:", err);
      setError("Session expired. Please login again.");
      authService.logout();
      navigate('/login');
    }
  }, [navigate]);

  const fetchPosts = async (uid) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/posts/user/${uid}?includeFriends=true`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch posts');
      }
      
      // Fetch user information for each post
      const postsWithUsers = await Promise.all(
        (data.posts || []).map(async (post) => {
          const userResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/users/profile/${post.uid}`, {
            headers: {
              'Authorization': `Bearer ${authService.getToken()}`
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
      
      // Sort posts by date, newest first
      const sortedPosts = postsWithUsers.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setPosts(sortedPosts);
    } catch (err) {
      console.error("Posts fetch error:", err);
      setError("Failed to load posts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    
    if (!newPost.trim()) {
      setPostError("Post content cannot be empty");
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({
          uid: userId,
          text: newPost
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create post');
      }
      
      // Add new post to the beginning of the posts array
      setPosts([data.post, ...posts]);
      
      // Clear the form
      setNewPost('');
      setPostError('');
    } catch (err) {
      console.error("Post creation error:", err);
      setPostError("Failed to create post. Please try again.");
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleAddFriendsClick = () => {
    navigate('/add-friends');
  };

  const handleViewFriendPosts = (friendId, friendName) => {
    // Navigate to friend's profile
    navigate(`/profile/${friendId}`, { 
      state: { 
        isReadOnly: true,
        friendName: friendName 
      } 
    });
  };

  // Add useEffect for groups tab
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

  // Function to handle group search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchUserGroups();
      return;
    }

    setIsSearching(true);
    setGroupsError('');

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/groups/search?query=${encodeURIComponent(searchQuery)}&userId=${userId}`,
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

  // Add useEffect for real-time search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (activeTab === 'groups') {
        if (searchQuery) {
          handleSearch();
        } else {
          fetchUserGroups();
        }
      }
    }, 300); // Reduced debounce time for more responsive search

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, activeTab]);

  // Function to handle group click
  const handleGroupClick = (groupId) => {
    navigate(`/group/${groupId}`);
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const url = `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/notifications/user/${userId}`;
      console.log('Fetching notifications from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch notifications');
      }
      console.log(data.notifications);
      setNotifications(data.notifications || []);
      setUnreadCount(data.notifications.filter(n => !n.isRead).length);
    } catch (err) {
      console.error("Notifications fetch error:", err);
      console.error("Notifications fetch error:", err.message, err);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const url = `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/notifications/${userId}/${notificationId}/read`;
      console.log('Marking notification as read:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      // Update local state
      setNotifications(notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Mark as read error:", err);
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    setShowNotifications(false);
  };

  const handleGroupRequest = async (notification, action) => {
    try {
      console.log('Handling group request:', { notification, action });
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/groups/${notification.groupId}/${action}/${notification.senderId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authService.getToken()}`
          }
        }
      );

      const data = await response.json();
      console.log('Group request response:', data);

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${action} group request`);
      }

      // Delete the notification
      const deleteResponse = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/notifications/${userId}/${notification.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authService.getToken()}`
          }
        }
      );

      if (!deleteResponse.ok) {
        throw new Error('Failed to delete notification');
      }

      // Remove the notification from the list
      setNotifications(notifications.filter(n => n.id !== notification.id));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(`Error ${action}ing group request:`, err);
    }
  };

  // Handle friend request
  const handleFriendRequest = async (notification, action) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/friends/request/handle`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authService.getToken()}`
          },
          body: JSON.stringify({
            userId: userId,
            senderId: notification.senderId,
            action: action
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${action} friend request`);
      }

      // Delete the notification from the database
      const deleteResponse = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/notifications/${userId}/${notification.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authService.getToken()}`
          }
        }
      );

      if (!deleteResponse.ok) {
        throw new Error('Failed to delete notification');
      }

      // Remove the notification from the list
      setNotifications(prevNotifications => 
        prevNotifications.filter(n => n.id !== notification.id)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Refresh friends list if request was approved
      if (action === 'approve') {
        fetchFriends();
      }
    } catch (error) {
      console.error(`Error ${action}ing friend request:`, error);
      setError(error.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  // Add useEffect for notifications
  useEffect(() => {
    if (userId) {
      fetchNotifications();
      // Set up polling for new notifications
      const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
      return () => clearInterval(interval);
    }
  }, [userId]);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notification-container')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showChatMenu && !event.target.closest('.chat-container')) {
        setShowChatMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showChatMenu]);

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    // Handle Firestore timestamp
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleString();
    }
    
    // Handle regular date string
    return new Date(timestamp).toLocaleString();
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
      
      // Add new post to the beginning of the posts array
      setPosts([dataPost.post, ...posts]);
      
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

  // Add useEffect for friends
  useEffect(() => {
    if (userId) {
      fetchFriends();
    }
  }, [userId]);

  // Function to fetch user's friends
  const fetchFriends = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/friends/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch friends');
      }
      
      setFriends(data.friends || []);
    } catch (err) {
      console.error("Friends fetch error:", err);
      console.error("Friends fetch error:", err.message, err);
    }
  };

  // Update the friend click handler
  const handleFriendClick = async (friend) => {
    console.log('Friend clicked:', friend);
    setSelectedChat(friend);
    setShowChatMenu(false);
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="app-title">Frendly</h1>
        <div className="header-actions">
          <div 
            className="chat-container"
            style={{
              position: 'relative',
              cursor: 'pointer',
              padding: '0.5rem',
              marginRight: '1rem'
            }}
            onClick={(e) => {
              e.stopPropagation();
              setShowChatMenu(!showChatMenu);
            }}
          >
            <span role="img" aria-label="chat">💬</span>
            {showChatMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                width: '300px',
                maxHeight: '400px',
                overflowY: 'auto',
                zIndex: 1000,
                padding: '1rem'
              }}>
                <h3 style={{ marginBottom: '1rem', color: '#1c1e21' }}>Chat with Friends</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {friends.map(friend => (
                    <div
                      key={friend.uid}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '0.5rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease'
                      }}
                      onClick={() => {
                        handleFriendClick(friend);
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f2f5'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        backgroundColor: '#e4e6eb'
                      }}>
                        {friend.profilePicture ? (
                          <img 
                            src={friend.profilePicture} 
                            alt={friend.fullName}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#1c1e21'
                          }}>
                            {friend.fullName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <span style={{ color: '#1c1e21' }}>{friend.fullName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div 
            className="notification-container"
            style={notificationStyles.notificationIcon} 
            onClick={(e) => {
              e.stopPropagation();
              setShowNotifications(!showNotifications);
            }}
          >
            <span role="img" aria-label="notifications">🔔</span>
            {unreadCount > 0 && (
              <span style={notificationStyles.notificationBadge}>
                {unreadCount}
              </span>
            )}
            {showNotifications && (
              <div style={notificationStyles.notificationPanel}>
                {notifications.length > 0 ? (
                  notifications.map(notification => (
                    <div
                      key={notification.id}
                      style={{
                        ...notificationStyles.notificationItem,
                        ...(!notification.isRead ? notificationStyles.notificationItemUnread : {})
                      }}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div style={notificationStyles.notificationMessage}>
                        {notification.message}
                      </div>
                      <div style={notificationStyles.notificationTime}>
                        {formatDate(notification.createdAt)}
                      </div>
                      {notification.type === 'group_join_request' && (
                        <div style={notificationStyles.notificationActions}>
                          <button
                            style={{...notificationStyles.actionButton, ...notificationStyles.acceptButton}}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGroupRequest(notification, 'approve');
                            }}
                          >
                            Accept
                          </button>
                          <button
                            style={{...notificationStyles.actionButton, ...notificationStyles.declineButton}}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGroupRequest(notification, 'reject');
                            }}
                          >
                            Decline
                          </button>
                        </div>
                      )}
                      {notification.type === 'friend_request' && !notification.message.includes('accepted your friend request') && (
                        <div style={notificationStyles.notificationActions}>
                          <button
                            style={{...notificationStyles.actionButton, ...notificationStyles.acceptButton}}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFriendRequest(notification, 'approve');
                            }}
                          >
                            Accept
                          </button>
                          <button
                            style={{...notificationStyles.actionButton, ...notificationStyles.declineButton}}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFriendRequest(notification, 'reject');
                            }}
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={notificationStyles.notificationItem}>
                    <div style={notificationStyles.notificationMessage}>
                      No notifications
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <button className="btn-profile" onClick={handleProfileClick}>
            My Profile
          </button>
          <button className="btn-logout" onClick={handleLogout}>
            <span className="logout-icon">🚪</span>
          </button>
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-tabs">
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
      
      {activeTab === 'posts' && (
        <div className="posts-section">
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

          <div className="posts-list">
            {posts.length > 0 ? (
              posts.map(post => (
                <div className="post-item" key={post.id}>
                  {post.authorName && (
                    <div className="post-author">
                      <div className="post-author-avatar">
                        {post.authorPicture ? (
                          <img 
                            src={post.authorPicture} 
                            alt={post.authorName}
                            style={{
                              width: '100%',
                              height: '100%',
                              borderRadius: '50%',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <div className="avatar-placeholder">{post.authorName.charAt(0)}</div>
                        )}
                      </div>
                      <span>{post.authorName}</span>
                    </div>
                  )}
                  <p className="post-text">{post.text}</p>
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
                </div>
              ))
            ) : (
              <p className="no-posts">No posts to display yet.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'friends' && (
        <div className="posts-section">
          <div className="section-header">
            <div className="search-box">
              <input 
                type="text" 
                placeholder="Search friends..." 
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="search-icon"></span>
            </div>
            <button className="btn" onClick={handleAddFriendsClick}>
              Add New Friends
            </button>
          </div>

          <div className="sub-nav" style={{ marginBottom: '1.5rem' }}>
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
          
          <div className="posts-list">
            <FriendsList 
              userId={userId} 
              onViewFriendPosts={handleViewFriendPosts} 
              viewMode={viewMode} 
              searchQuery={searchQuery} 
            />
          </div>
        </div>
      )}

      {activeTab === 'groups' && (
        <div className="posts-section">
          <div className="section-header">
            <h2>My Groups</h2>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                className="btn"
                onClick={() => navigate('/join-groups')}
              >
                Join Group
              </button>
              <button 
                className="btn"
                onClick={() => navigate('/create-group')}
              >
                Create Group
              </button>
            </div>
          </div>

          <div className="search-box" style={{ marginTop: '1.5rem' }}>
            <input 
              type="text" 
              placeholder="Search groups by name or tag..." 
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="search-icon"></span>
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

      {/* Replace chat window with Chat component */}
      {selectedChat && (
        <Chat
          userId={userId}
          selectedChat={selectedChat}
          onClose={() => setSelectedChat(null)}
        />
      )}
    </div>
  );
};

export default Dashboard; 