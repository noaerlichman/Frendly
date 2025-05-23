import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { io } from 'socket.io-client';
import axios from 'axios';
import './Chat.css';

const API_URL = process.env.REACT_APP_API_URL;

const Chat = ({ selectedFriend }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    if (currentUser && selectedFriend) {
      socketRef.current = io(API_URL, {
        auth: {
          userId: currentUser.uid
        }
      });

      socketRef.current.on('connect', () => {
        console.log('Connected to chat server');
      });

      socketRef.current.on('newMessage', (message) => {
        if (message.chatId === chatId) {
          setMessages(prev => [message, ...prev]);
        }
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [currentUser, selectedFriend, chatId]);

  // Fetch messages when friend is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentUser || !selectedFriend) return;

      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `${API_URL}/api/chat/${currentUser.uid}/${selectedFriend.uid}`
        );
        
        // Only update chatId if it's null or different
        if (!chatId || chatId !== response.data.chatId) {
          setChatId(response.data.chatId);
        }
        
        // Sort messages by date (oldest first)
        const sortedMessages = response.data.messages.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
          const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
          return dateA - dateB;
        });
        
        setMessages(sortedMessages);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [currentUser, selectedFriend]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    const markAsRead = async () => {
      if (!chatId || !currentUser) return;

      try {
        await axios.put(`${API_URL}/api/chat/read`, {
          userId: currentUser.uid,
          chatId
        });
      } catch (err) {
        console.error('Error marking messages as read:', err);
      }
    };

    markAsRead();
  }, [chatId, currentUser]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !selectedFriend) return;

    try {
      const response = await axios.post(`${API_URL}/api/chat`, {
        senderId: currentUser.uid,
        receiverId: selectedFriend.uid,
        text: newMessage.trim(),
        chatId
      });

      // Only update chatId if it's a new chat
      if (!chatId) {
        setChatId(response.data.chatId);
      }

      // Add message to local state
      setMessages(prev => [...prev, response.data.chatMessage]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  if (!selectedFriend) {
    return (
      <div className="chat-container">
        <div className="no-chat-selected">
          Select a friend to start chatting
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="chat-container">
        <div className="loading">Loading messages...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>{selectedFriend.displayName}</h3>
      </div>
      
      <div className="messages-container">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.senderId === currentUser.uid ? 'sent' : 'received'}`}
          >
            <div className="message-content">
              <p>{message.text}</p>
              <small>
                {new Date(message.createdAt?.toDate?.() || message.createdAt).toLocaleTimeString()}
              </small>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="message-input-container">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="message-input"
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat; 