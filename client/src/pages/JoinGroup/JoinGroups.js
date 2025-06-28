import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../utils/api';
import { styles } from './joinGroupsStyles'

const JoinGroups = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [userId, setUserId] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

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
      
      // Fetch all groups
      fetchAllGroups();
    } catch (err) {
      console.error("Failed to parse token:", err);
      setError("Session expired. Please login again.");
      authService.logout();
      navigate('/login');
    }
  }, [navigate]);

  const fetchAllGroups = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/groups`, {
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
      setError("Failed to load groups. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchAllGroups();
      return;
    }

    setIsSearching(true);
    setError('');

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/groups/search?query=${encodeURIComponent(searchQuery)}`,
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
      setError("Failed to search groups. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  // useEffect for real-time search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        handleSearch();
      } else {
        fetchAllGroups();
      }
    }, 300); 

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const handleJoinGroup = async (groupId) => {
    try {
      console.log('Joining group:', groupId);
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/groups/${groupId}/join`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authService.getToken()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId })
        }
      );

      const data = await response.json();
      console.log('Join group response:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to join group');
      }
      
      // separate between public and private groups logic
      setGroups(groups.map(group => {
        if (group.id === groupId) {
          if (group.isPublic) {
            // For public groups, add to members
            return { ...group, members: [...group.members, userId] };
          } else {
            // For private groups, add to pendingRequests
            return { 
              ...group, 
              pendingRequests: [...(group.pendingRequests || []), userId] 
            };
          }
        }
        return group;
      }));

      // Show appropriate notification based on group type
      if (data.isPublic) {
        showNotification('Successfully joined the group!');
      } else {
        showNotification('Join request sent! Waiting for admin approval.', 'info');
      }
    } catch (err) {
      console.error("Join group error:", err);
      showNotification("Failed to join group. Please try again.", 'error');
    }
  };


  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button 
          style={styles.backButton}
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
        <h1>Join Groups</h1>
      </div>

      <div style={styles.searchBox}>
        <input
          type="text"
          placeholder="Search groups by name or tag..."
          style={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading || isSearching ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          Loading groups...
        </div>
      ) : groups.length > 0 ? (
        <div style={styles.groupsList}>
          {groups.map(group => (
            <div key={group.id} style={styles.groupCard}>
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
                <div>
                  <span>{group.isPublic ? 'Public' : 'Private'}</span>
                  <span style={{ marginLeft: '1rem' }}>{group.members.length} members</span>
                </div>
                <button
                  style={{
                    ...(group.members.includes(userId) 
                      ? styles.joinButtonDisabled 
                      : group.pendingRequests?.includes(userId)
                        ? styles.pendingButton
                        : styles.joinButton)
                  }}
                  onClick={() => !group.members.includes(userId) && !group.pendingRequests?.includes(userId) && handleJoinGroup(group.id)}
                  disabled={group.members.includes(userId) || group.pendingRequests?.includes(userId)}
                >
                  {group.members.includes(userId) 
                    ? 'Joined' 
                    : group.pendingRequests?.includes(userId)
                      ? 'Pending'
                      : 'Join Group'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          No groups found.
        </div>
      )}

      {/* Notification Popup */}
      <div style={{
        ...styles.notification,
        ...(notification.show ? styles.notificationShow : {}),
        ...(notification.type === 'success' ? styles.notificationSuccess : {}),
        ...(notification.type === 'info' ? styles.notificationInfo : {}),
        ...(notification.type === 'error' ? styles.notificationError : {})
      }}>
        {notification.message}
      </div>
    </div>
  );
};

export default JoinGroups; 