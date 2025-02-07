// Import the configureStore function from Redux Toolkit
import { configureStore } from '@reduxjs/toolkit';
// Import the userReducer from the userSlice file
import userReducer from './userSlice.js';

/**
 * Create and configure the Redux store using Redux Toolkit's configureStore.
 * The store is set up with a single reducer for the 'user' slice.
 */
const store = configureStore({
  reducer: {
    // Attach the userReducer under the 'user' key in the store.
    // This allows access to user-related state via state.user.
    user: userReducer,
  },
});

// Export the configured store as the default export
export default store;
