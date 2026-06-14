const getInitialState = () => {
  try {
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
    const token = localStorage.getItem('token') || null;
    const profile = localStorage.getItem('profile') ? JSON.parse(localStorage.getItem('profile')) : null;
    return { user, token, profile, isBlindMode: false };
  } catch (err) {
    return { user: null, token: null, profile: null, isBlindMode: false };
  }
};

import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    setCredentials(state, action) {
      const { user, token, refreshToken, profile } = action.payload;
      state.user = user;
      state.token = token;
      state.profile = profile;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('profile', JSON.stringify(profile));
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    },
    updateProfile(state, action) {
      state.profile = action.payload;
      localStorage.setItem('profile', JSON.stringify(action.payload));
    },
    toggleBlindMode(state) {
      state.isBlindMode = !state.isBlindMode;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.profile = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('profile');
      localStorage.removeItem('refreshToken');
    }
  }
});

export const { setCredentials, updateProfile, toggleBlindMode, logout } = authSlice.actions;
export default authSlice.reducer;
