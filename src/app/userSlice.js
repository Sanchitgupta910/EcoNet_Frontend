import { createSlice } from '@reduxjs/toolkit';

/**
 * Loads the user object from sessionStorage.
 * If user data exists, it is parsed from JSON; otherwise, returns null.
 * Any parsing errors are caught and logged.
 *
 * @returns {Object|null} Parsed user object or null if not found or on error.
 */
const loadUserFromSession = () => {
  const userData = sessionStorage.getItem('user');
  if (userData) {
    try {
      const parsedUser = JSON.parse(userData);
      console.log('Loaded user from session storage:', parsedUser);
      return parsedUser;
    } catch (error) {
      console.error('Failed to parse user data from session storage:', error);
      return null;
    }
  }
  return null;
};

// Initialize the Redux state with the user loaded from sessionStorage.
const initialState = {
  user: loadUserFromSession(),
};

/**
 * userSlice manages the current user state and persists it in sessionStorage.
 */
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    /**
     * Sets the current user in the Redux store and saves the user to sessionStorage.
     *
     * @param {Object} state - The current state.
     * @param {Object} action - The action object containing the new user data in action.payload.
     */
    setUser: (state, action) => {
      state.user = action.payload;
      try {
        sessionStorage.setItem('user', JSON.stringify(action.payload));
        console.log('User saved to session storage:', action.payload);
      } catch (error) {
        console.error('Failed to save user data to session storage:', error);
      }
    },
    /**
     * Clears the current user from the Redux store and removes the user from sessionStorage.
     *
     * @param {Object} state - The current state.
     */
    clearUser: (state) => {
      state.user = null;
      sessionStorage.removeItem('user');
      console.log('User cleared from session storage');
    },
  },
});

// Export the action creators for setting and clearing the user.
export const { setUser, clearUser } = userSlice.actions;

// Export the reducer to be included in the Redux store.
export default userSlice.reducer;
