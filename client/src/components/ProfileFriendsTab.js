import React, { useState, useEffect } from 'react';
import { authService } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const FriendsList = ({ userId, onViewFriendPosts, viewMode, searchQuery }) => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      fetchFriends();
    }
  }, [userId]);

  const calculateDaysUntilBirthday = (dateOfBirth) => {
    if (!dateOfBirth) return Infinity;

    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    const [year, month, day] = dateOfBirth.split('-').map(num => parseInt(num));
    const nextBirthday = new Date(today.getFullYear(), month - 1, day);
    nextBirthday.setHours(0, 0, 0, 0); 

    // If birthday has already passed this year, set it to next year
    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }

    // Calculate difference in days
    const diffTime = nextBirthday - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const formatBirthday = (dateOfBirth) => {
    if (!dateOfBirth) return '';
    const [year, month, day] = dateOfBirth.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };

  const sortedFriends = () => {
    let filteredFriends = [...friends];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredFriends = filteredFriends.filter(friend => 
        friend.fullName.toLowerCase().includes(query)
      );
    }

    // Apply birthday sorting if in birthday mode
    if (viewMode === 'birthdays') {
      filteredFriends = filteredFriends
        .filter(friend => friend.dateOfBirth)
        .sort((a, b) => {
          const daysA = calculateDaysUntilBirthday(a.dateOfBirth);
          const daysB = calculateDaysUntilBirthday(b.dateOfBirth);
          return daysA - daysB;
        });
    }

    return filteredFriends;
  };

  const fetchFriends = async () => {
    setLoading(true);
    setError('');
    
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
      setError("Failed to load friends. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    if (!window.confirm('Are you sure you want to remove this friend?')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/friends/${friendId}`, {
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
        throw new Error(data.message || 'Failed to remove friend');
      }
      
      // Remove friend from the list
      setFriends(friends.filter(friend => friend.uid !== friendId));
    } catch (err) {
      console.error("Remove friend error:", err);
      setError("Failed to remove friend. Please try again.");
    }
  };

  const handleViewProfile = (friendId, friendName) => {
    navigate(`/profile/${friendId}`, { 
      state: { 
        isReadOnly: true,
        friendName: friendName 
      } 
    });
  };

  if (loading) {
    return <div className="loading-text">Loading friends...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  const friendsList = sortedFriends();

  return (
    <div className="friends-list-container">
      <h3>
        {viewMode === 'birthdays' ? 'Upcoming Birthdays' : 'My Friends'} ({friendsList.length})
      </h3>
      
      {friendsList.length > 0 ? (
        <div className="friends-grid">
          {friendsList.map(friend => (
            <div key={friend.uid} className="friend-card">
              <div className="friend-card-avatar">
                {friend.profilePicture ? (
                  <img src={friend.profilePicture} alt={friend.fullName} />
                ) : (
                  <div className="avatar-placeholder">{friend.fullName.charAt(0)}</div>
                )}
              </div>
              <div className="friend-card-info">
                <h4 className="friend-card-name">{friend.fullName}</h4>
                {friend.currentCity && <p className="friend-card-location">{friend.currentCity}</p>}
                {viewMode === 'birthdays' && friend.dateOfBirth && (
                  <>
                    <p className="friend-birthday-date">
                      Birthday: {formatBirthday(friend.dateOfBirth)}
                    </p>
                    <p className="friend-birthday">
                      {calculateDaysUntilBirthday(friend.dateOfBirth) === 0 
                        ? "🎉 Today is their birthday! 🎉" 
                        : `Upcoming birthday in ${calculateDaysUntilBirthday(friend.dateOfBirth)} days`
                      }
                    </p>
                    {calculateDaysUntilBirthday(friend.dateOfBirth) === 0 && (
                      <p className="birthday-celebration">
                        🎂 Send them a birthday wish! 🎂
                      </p>
                    )}
                  </>
                )}
              </div>
              <div className="friend-card-actions">
                <button 
                  className="btn-card btn-view" 
                  onClick={() => handleViewProfile(friend.uid, friend.fullName)}
                >
                  View Profile
                </button>
                <button 
                  className="btn-card btn-remove" 
                  onClick={() => handleRemoveFriend(friend.uid)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-friends">
          {viewMode === 'birthdays' 
            ? "No upcoming birthdays to show." 
            : "You haven't added any friends yet."
          }
        </p>
      )}
    </div>
  );
};

export default FriendsList; 