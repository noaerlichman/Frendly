import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../utils/api';

const PrivateRoute = ({ children }) => {
  const token = authService.getToken();
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute; 