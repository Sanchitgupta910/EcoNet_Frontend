// src/store/userSlice.js
import { createSlice } from '@reduxjs/toolkit';

const loadUserFromSession = () => {
  const userData = sessionStorage.getItem('user');
  try {
    if (userData) {
      console.log('Loaded user from session storage:', JSON.parse(userData));
      return JSON.parse(userData);
    }
    return null;
  } catch (error) {
    console.error('Failed to parse user data from session storage:', error);
    return null;
  }
};

const initialState = {
  user: loadUserFromSession(),
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      sessionStorage.setItem('user', JSON.stringify(action.payload));
      console.log('User saved to session storage:', action.payload);
    },
    clearUser: (state) => {
      state.user = null;
      sessionStorage.removeItem('user');
      console.log('User cleared from session storage');
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
