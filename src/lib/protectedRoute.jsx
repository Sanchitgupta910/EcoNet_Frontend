import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

/**
 * ProtectedRoute is a wrapper component that protects its child components
 * from being accessed by users who are not authenticated.
 *
 * It performs an asynchronous check (by calling `/api/v1/users/current` with credentials)
 * and if the check fails, it redirects the user to the login page.
 */
const ProtectedRoute = ({ children }) => {
  // isAuth is initialized as null (i.e., "still checking"),
  // then becomes true (authenticated) or false (not authenticated).
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    axios
      .get('/api/v1/users/me', { withCredentials: true })
      .then(() => {
        // If the API call is successful, set isAuth to true.
        setIsAuth(true);
      })
      .catch(() => {
        // If the API call fails, set isAuth to false.
        setIsAuth(false);
      });
  }, []);

  // While authentication status is being determined, show a loading indicator.
  if (isAuth === null) {
    return <div>Loading...</div>;
  }

  // If not authenticated, redirect to the login page.
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child components (protected content).
  return children;
};

export default ProtectedRoute;
