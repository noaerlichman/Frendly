import React, { useState } from 'react';
import ChatList from '../components/Chat/ChatList';
import Chat from '../components/Chat/Chat';
import './ChatPage.css';

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState(null);

  const handleSelectChat = (friend) => {
    setSelectedChat(friend);
  };

  return (
    <div className="chat-page">
      <ChatList onSelectChat={handleSelectChat} />
      <div className="chat-main">
        {selectedChat ? (
          <Chat
            otherUserId={selectedChat.uid}
            otherUserName={selectedChat.fullName}
          />
        ) : (
          <div className="no-chat-selected">
            <h2>Select a chat to start messaging</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage; 