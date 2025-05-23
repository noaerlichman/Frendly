import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import './ChatList.css';

const API_URL = process.env.REACT_APP_API_URL;

const ChatList = ({ onSelectChat, selectedFriend }) => {
  const { currentUser } = useAuth();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFriends = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        setError(null);
        
        // Get friends list
        const response = await axios.get(
          `${API_URL}/api/friends/user/${currentUser.uid}`
        );

        // Get chat info for each friend
        const friendsWithChats = await Promise.all(
          response.data.friends.map(async (friend) => {
            try {
              const chatResponse = await axios.get(
                `${API_URL}/api/chat/${currentUser.uid}/${friend.uid}`
              );
              
              // Ensure we have a valid chatId
              if (!chatResponse.data.chatId) {
                console.error(`No chatId returned for friend ${friend.uid}`);
                return {
                  ...friend,
                  chatId: null,
                  lastMessage: null
                };
              }

              return {
                ...friend,
                chatId: chatResponse.data.chatId,
                lastMessage: chatResponse.data.messages[0] || null
              };
            } catch (err) {
              console.error(`Error fetching chat for friend ${friend.uid}:`, err);
              return {
                ...friend,
                chatId: null,
                lastMessage: null
              };
            }
          })
        );

        // Filter out any friends without valid chatIds
        const validFriends = friendsWithChats.filter(friend => friend.chatId);
        setFriends(validFriends);
      } catch (err) {
        console.error('Error fetching friends:', err);
        setError('Failed to load friends');
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="chat-list-container">
        <div className="loading">Loading friends...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-list-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="chat-list-container">
        <div className="no-friends">
          No friends to chat with. Add some friends to start chatting!
        </div>
      </div>
    );
  }

  return (
    <div className="chat-list-container">
      <div className="chat-list-header">
        <h3>Chats</h3>
      </div>
      <div className="friends-list">
        {friends.map((friend) => (
          <div
            key={friend.uid}
            className={`friend-item ${selectedFriend?.uid === friend.uid ? 'selected' : ''}`}
            onClick={() => onSelectChat(friend)}
          >
            <div className="friend-avatar">
              {friend.photoURL ? (
                <img src={friend.photoURL} alt={friend.displayName} />
              ) : (
                <div className="avatar-placeholder">
                  {friend.displayName.charAt(0)}
                </div>
              )}
            </div>
            <div className="friend-info">
              <div className="friend-name">{friend.displayName}</div>
              {friend.lastMessage && (
                <div className="last-message">
                  <span className="message-preview">
                    {friend.lastMessage.senderId === currentUser.uid ? 'You: ' : ''}
                    {friend.lastMessage.text}
                  </span>
                  <span className="message-time">
                    {new Date(friend.lastMessage.createdAt?.toDate()).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList; 