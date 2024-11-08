import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { isAuthenticated } from './checkCookies'; // Ensure this path is correct

const ProtectedRoute = ({ children }) => {

  const navigate=useNavigate() ;
  if (!isAuthenticated()) {
    navigate('/login');
    // return 
    // <>
    // <Navigate to="/login" />
    // </>
  }
  
  return children;
};

export default ProtectedRoute;
