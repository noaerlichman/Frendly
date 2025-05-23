import React, { useState, useEffect } from 'react';
import { authService } from '../utils/api';

const FriendModal = ({ isOpen, onClose, userId }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserSuggestions();
    }
  }, [isOpen, userId]);

  const fetchUserSuggestions = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/friends/suggestions?uid=${userId}`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch users');
      }
      
      setUsers(data.users || []);
    } catch (err) {
      console.error("User suggestions error:", err);
      setError("Failed to load user suggestions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (friendId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/friends/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({
          uid: userId,
          friendId
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send friend request');
      }
      
      // Remove the user from the list
      setUsers(users.filter(user => user.uid !== friendId));
      
      // Show success message
      setSuccessMessage(`Friend request sent to ${data.friend.fullName}!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error("Add friend error:", err);
      setError("Failed to send friend request. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add Friends</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        
        <div className="modal-body">
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
                    className="btn-small btn-add" 
                    onClick={() => handleAddFriend(user.uid)}
                  >
                    Add
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-users">No users available to add as friends.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendModal; 