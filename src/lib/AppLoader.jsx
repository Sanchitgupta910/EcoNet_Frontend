import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { setUser } from '../app/userSlice';

/**
 * AppLoader is a top-level component responsible for loading
 * essential data (like the current user) before the rest of the application renders.
 *
 * It calls the backend endpoint `/api/v1/users/me` (with credentials)
 * to check if the user is authenticated. If so, it dispatches the user data
 * to the Redux store so that all components can access the user details.
 */

const AppLoader = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Delay the API call by 1 second to allow cookies/session storage to update
    const timer = setTimeout(() => {
      axios
        .get('/api/v1/users/me', { withCredentials: true })
        .then((response) => {
          dispatch(setUser(response.data.data));
        })
        .catch((err) => {
          console.error('Failed to fetch current user:', err);
          // Optionally handle the error (e.g., clear session storage or redirect to login)
        });
    }, 100);

    return () => clearTimeout(timer);
  }, [dispatch]);

  return children;
};

export default AppLoader;
