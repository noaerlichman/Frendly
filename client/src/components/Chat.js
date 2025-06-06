import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { authService } from '../utils/api';

const Chat = ({ userId, selectedChat, onClose }) => {
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    if (userId) {
      console.log('Initializing socket connection for user:', userId);
      
      // Disconnect existing socket if it exists
      if (socketRef.current) {
        console.log('Disconnecting existing socket');
        socketRef.current.disconnect();
      }

      socketRef.current = io(process.env.REACT_APP_API_URL || 'http://localhost:5001', {
        transports: ['websocket'],
        auth: {
          userId: userId
        }
      });

      socketRef.current.on('connect', () => {
        console.log('Socket connected successfully');
        console.log('Socket ID:', socketRef.current.id);
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });

      // Listen for all messages
      socketRef.current.on('message', (message) => {
        console.log('Received message event:', message);
        handleNewMessage(message);
      });

      // Also listen for newMessage event
      socketRef.current.on('newMessage', (message) => {
        console.log('Received newMessage event:', message);
        handleNewMessage(message);
      });

      // Listen for chat room events
      socketRef.current.on('joinedChat', (data) => {
        console.log('Joined chat room:', data);
      });

      socketRef.current.on('error', (error) => {
        console.error('Socket error:', error);
      });

      return () => {
        if (socketRef.current) {
          console.log('Cleaning up socket connection');
          socketRef.current.disconnect();
        }
      };
    }
  }, [userId]);

  // Handle chat selection
  useEffect(() => {
    if (selectedChat) {
      fetchChatMessages();
    }
  }, [selectedChat]);

  // Separate function to handle new messages
  const handleNewMessage = (message) => {
    console.log('Handling new message:', message);
    console.log('Current selected chat:', selectedChat);
    
    if (!selectedChat) {
      console.log('No chat selected, ignoring message');
      return;
    }

    const isRelevantMessage = message.senderId === selectedChat.uid || message.senderId === userId;
    console.log('Is message relevant:', isRelevantMessage);

    if (isRelevantMessage) {
      console.log('Updating chat messages with new message');
      setChatMessages(prev => {
        const messageExists = prev.some(m => m.id === message.id);
        if (messageExists) {
          console.log('Message already exists, updating timestamp');
          return prev.map(m => m.id === message.id ? { ...m, createdAt: message.createdAt } : m);
        }
        console.log('Adding new message to chat');
        return [...prev, message];
      });
    } else {
      console.log('Message not for current chat');
    }
  };

  const fetchChatMessages = async () => {
    if (!selectedChat) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/chat/${userId}/${selectedChat.uid}`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chat messages');
      }

      const data = await response.json();
      console.log('Chat data received:', data);
      setChatMessages(data.messages);

      // Join the chat room
      if (socketRef.current) {
        const chatId = [userId, selectedChat.uid].sort().join('_');
        console.log('Joining chat room:', chatId);
        socketRef.current.emit('joinChat', {
          chatId: chatId,
          userId: userId,
          friendId: selectedChat.uid
        });
      } else {
        console.error('Socket not initialized');
      }
    } catch (err) {
      console.error('Error fetching chat messages:', err);
    }
  };

  // Function to handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || !selectedChat) return;

    console.log('Sending message to:', selectedChat.uid);
    console.log('Message content:', chatMessage);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({
          senderId: userId,
          receiverId: selectedChat.uid,
          text: chatMessage,
          chatId: selectedChat.chatId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      console.log('Message saved successfully:', data);
      
      // Add message to local state
      setChatMessages(prev => [...prev, data.chatMessage]);
      setChatMessage('');

      // Emit the message through socket
      if (socketRef.current) {
        const messageToSend = {
          ...data.chatMessage,
          chatId: selectedChat.chatId,
          receiverId: selectedChat.uid,
          senderId: userId
        };
        console.log('Emitting message through socket:', messageToSend);
        socketRef.current.emit('sendMessage', messageToSend);
      } else {
        console.error('Socket not initialized');
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    // Handle Firestore Timestamp
    if (timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
    }

    // Handle serverTimestamp
    if (timestamp._methodName === 'serverTimestamp') {
      return new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
    }

    return '';
  };

  const chatWindowStyles = {
    container: {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '350px',
      height: '500px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000
    },
    header: {
      padding: '15px',
      borderBottom: '1px solid #dddfe2',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      backgroundColor: '#1877f2',
      color: 'white',
      borderRadius: '12px 12px 0 0'
    },
    avatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      overflow: 'hidden',
      backgroundColor: '#e4e6eb'
    },
    headerInfo: {
      flex: 1
    },
    name: {
      fontWeight: '600',
      fontSize: '16px'
    },
    closeButton: {
      background: 'none',
      border: 'none',
      color: 'white',
      cursor: 'pointer',
      fontSize: '20px',
      padding: '5px'
    },
    messagesContainer: {
      flex: 1,
      padding: '15px',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      backgroundColor: '#f0f2f5'
    },
    message: {
      maxWidth: '80%',
      padding: '8px 12px',
      borderRadius: '18px',
      fontSize: '14px',
      lineHeight: '1.4'
    },
    sentMessage: {
      alignSelf: 'flex-end',
      backgroundColor: '#1877f2',
      color: 'white'
    },
    receivedMessage: {
      alignSelf: 'flex-start',
      backgroundColor: 'white',
      color: '#1c1e21'
    },
    inputContainer: {
      padding: '15px',
      borderTop: '1px solid #dddfe2',
      display: 'flex',
      gap: '10px',
      backgroundColor: 'white',
      borderRadius: '0 0 12px 12px'
    },
    input: {
      flex: 1,
      padding: '8px 12px',
      borderRadius: '20px',
      border: '1px solid #dddfe2',
      fontSize: '14px',
      outline: 'none'
    },
    sendButton: {
      backgroundColor: '#1877f2',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '36px',
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: '16px'
    }
  };

  if (!selectedChat) return null;

  return (
    <div style={chatWindowStyles.container}>
      <div style={chatWindowStyles.header}>
        <div style={chatWindowStyles.avatar}>
          {selectedChat.profilePicture ? (
            <img 
              src={selectedChat.profilePicture} 
              alt={selectedChat.fullName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
              {selectedChat.fullName.charAt(0)}
            </div>
          )}
        </div>
        <div style={chatWindowStyles.headerInfo}>
          <div style={chatWindowStyles.name}>{selectedChat.fullName}</div>
        </div>
        <button 
          style={chatWindowStyles.closeButton}
          onClick={onClose}
        >
          ×
        </button>
      </div>
      
      <div style={chatWindowStyles.messagesContainer}>
        {chatMessages.map((message, index) => (
          <div
            key={`${message.id}-${index}`}
            style={{
              ...chatWindowStyles.message,
              ...(message.senderId === userId 
                ? chatWindowStyles.sentMessage 
                : chatWindowStyles.receivedMessage
              )
            }}
          >
            <div style={{ marginBottom: '4px' }}>{message.text}</div>
            <div style={{
              fontSize: '11px',
              opacity: 0.7,
              textAlign: message.senderId === userId ? 'right' : 'left'
            }}>
              {formatTimestamp(message.createdAt)}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} style={chatWindowStyles.inputContainer}>
        <input
          type="text"
          value={chatMessage}
          onChange={(e) => setChatMessage(e.target.value)}
          placeholder="Type a message..."
          style={chatWindowStyles.input}
        />
        <button type="submit" style={chatWindowStyles.sendButton}>
          ➤
        </button>
      </form>
    </div>
  );
};

export default Chat; 