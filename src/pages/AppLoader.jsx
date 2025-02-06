import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { setUser } from '../app/userSlice'; 

/**
 * AppLoader is a top-level component responsible for loading
 * essential data (like the current user) before the rest of the application renders.
 *
 * It calls the backend endpoint `/api/v1/users/current` (with credentials)
 * to check if the user is authenticated. If so, it dispatches the user data
 * to the Redux store so that all components can access the user details.
 */

const AppLoader = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Call the backend to get current user details.
    axios
      .get('/api/v1/users/me', { withCredentials: true })
      .then((response) => {

        console.log('User data fetched:', response.data); // Debug log
        // If the request is successful, update the Redux store with the user data.
        dispatch(setUser(response.data.data));
      })
      .catch((error) => {
        // If the request fails (e.g., unauthorized), log the error.
        console.error('Failed to fetch current user:', error);
      });
  }, [dispatch]);

  // Render the child components (i.e., the rest of the app)
  return children;
};

export default AppLoader;
