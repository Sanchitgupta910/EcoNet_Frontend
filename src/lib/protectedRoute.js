import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from './checkCookies'; // Ensure this path is correct

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

export default ProtectedRoute;
