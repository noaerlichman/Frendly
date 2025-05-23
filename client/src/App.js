import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ProfileSetup from './pages/ProfileSetup';
import Profile from './pages/Profile';
import AddFriends from './pages/AddFriends';
import Dashboard from './pages/Dashboard';
import CreateGroup from './pages/CreateGroup';
import Group from './pages/Group';
import JoinGroups from './pages/JoinGroups';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/profile/:friendId" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/add-friends" element={<PrivateRoute><AddFriends /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/create-group" element={<PrivateRoute><CreateGroup /></PrivateRoute>} />
        <Route path="/group/:groupId" element={<PrivateRoute><Group /></PrivateRoute>} />
        <Route path="/join-groups" element={<PrivateRoute><JoinGroups /></PrivateRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App; 