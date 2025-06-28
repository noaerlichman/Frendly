import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../utils/api';
import api from '../utils/api';

const AddFriends = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [requestStatuses, setRequestStatuses] = useState({});

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
      
      // Fetch user suggestions
      fetchUserSuggestions(user_id);
    } catch (err) {
      console.error("Failed to parse token:", err);
      setError("Session expired. Please login again.");
      authService.logout();
      navigate('/login');
    }
  }, [navigate]);

  const fetchUserSuggestions = async (uid) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/friends/suggestions?uid=${uid}`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch users');
      }
      
      setUsers(data.users || []);
      
      // Fetch request status for each user
      const statuses = {};
      for (const user of data.users || []) {
        const statusResponse = await api.get(`/api/friends/request/status?senderId=${uid}&receiverId=${user.uid}`);
        statuses[user.uid] = statusResponse.data.status;
      }
      setRequestStatuses(statuses);
    } catch (err) {
      console.error("User suggestions error:", err);
      setError("Failed to load user suggestions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendFriendRequest = async (friendId, friendName) => {
    try {
      setError('');
      const response = await api.post('/api/friends/request', {
        senderId: userId,
        receiverId: friendId
      });

      if (response.data) {
        // Update the request status for this user
        setRequestStatuses(prev => ({
          ...prev,
          [friendId]: 'pending'
        }));
        
        setSuccessMessage(`Friend request sent to ${friendName}!`);
        
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }
    } catch (err) {
      console.error("Send friend request error:", err);
      setError(err.response?.data?.message || "Failed to send friend request. Please try again.");
    }
  };

  const handleBackToProfile = () => {
    navigate('/profile');
  };

  const getButtonText = (userId) => {
    const status = requestStatuses[userId];
    switch (status) {
      case 'pending':
        return 'Request Pending';
      case 'accepted':
        return 'Friends';
      case 'rejected':
        return 'Request Rejected';
      default:
        return 'Add Friend';
    }
  };

  const isButtonDisabled = (userId) => {
    const status = requestStatuses[userId];
    return status === 'pending' || status === 'accepted';
  };

  return (
    <div className="add-friends-container">
      <div className="header">
        <h1>Add Friends</h1>
        <button className="btn-back" onClick={handleBackToProfile}>
          &larr; Back to Profile
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      <div className="users-container">
        {loading ? (
          <p className="loading-text">Loading users...</p>
        ) : users.length > 0 ? (
          <ul className="users-list">
            {users.map(user => (
              <li key={user.uid} className="user-item">
                <div className="user-info">
                  <div className="user-avatar">
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt={user.fullName} />
                    ) : (
                      <div className="avatar-placeholder">{user.fullName.charAt(0)}</div>
                    )}
                  </div>
                  <span className="user-name">{user.fullName}</span>
                </div>
                <button 
                  className={`btn-small ${requestStatuses[user.uid] === 'pending' ? 'btn-pending' : 'btn-add'}`}
                  onClick={() => handleSendFriendRequest(user.uid, user.fullName)}
                  disabled={isButtonDisabled(user.uid)}
                >
                  {getButtonText(user.uid)}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-users">No users available to add as friends.</p>
        )}
      </div>
    </div>
  );
};

export default AddFriends; 