import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children }) => {
  // null means "still checking"; true = authenticated; false = not authenticated.
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    // Call your backend endpoint to verify if the user is authenticated.
    // Ensure that this endpoint returns 200 if the access token (in the HTTP‑only cookie) is valid.
    axios
      .get('/api/v1/users/me', { withCredentials: true })
      .then(() => {
        setIsAuth(true);
      })
      .catch(() => {
        setIsAuth(false);
      });
  }, []);

  // While checking, show a loading indicator.
  if (isAuth === null) {
    return <div>Loading...</div>;
  }

  // If not authenticated, redirect to login.
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;