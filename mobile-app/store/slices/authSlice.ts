import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import { UserProfile } from '../api/authApi';

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requiresProfileSetup: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  requiresProfileSetup: false,
};

// Helper to persist auth data
const persistAuthData = async (accessToken: string, user: UserProfile, requiresProfileSetup: boolean) => {
  try {
    await SecureStore.setItemAsync('accessToken', accessToken);
    await SecureStore.setItemAsync('user', JSON.stringify(user));
    await SecureStore.setItemAsync('requiresProfileSetup', String(requiresProfileSetup));
  } catch (error) {
    console.error('Failed to persist auth data:', error);
  }
};

// Helper to clear auth data
const clearAuthData = async () => {
  try {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('user');
    await SecureStore.deleteItemAsync('requiresProfileSetup');
  } catch (error) {
    console.error('Failed to clear auth data:', error);
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: UserProfile;
        accessToken: string;
        requiresProfileSetup?: boolean;
      }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.requiresProfileSetup = action.payload.requiresProfileSetup ?? false;
      
      // Persist all auth data
      persistAuthData(
        action.payload.accessToken, 
        action.payload.user, 
        action.payload.requiresProfileSetup ?? false
      );
    },

    updateUser: (state, action: PayloadAction<UserProfile>) => {
      state.user = action.payload;
      state.requiresProfileSetup = !action.payload.name || action.payload.name.trim() === '';
      
      // Update persisted user data
      SecureStore.setItemAsync('user', JSON.stringify(action.payload)).catch(console.error);
      SecureStore.setItemAsync('requiresProfileSetup', String(state.requiresProfileSetup)).catch(console.error);
    },

    setProfileSetupComplete: (state) => {
      state.requiresProfileSetup = false;
      SecureStore.setItemAsync('requiresProfileSetup', 'false').catch(console.error);
    },

    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.requiresProfileSetup = false;
      
      // Clear all persisted data
      clearAuthData();
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    restoreAuthState: (
      state,
      action: PayloadAction<{
        accessToken: string | null;
        user: UserProfile | null;
        requiresProfileSetup: boolean;
      }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      state.isAuthenticated = !!action.payload.accessToken;
      state.requiresProfileSetup = action.payload.requiresProfileSetup;
      state.isLoading = false;
    },
  },
});

export const {
  setCredentials,
  updateUser,
  setProfileSetupComplete,
  logout,
  setLoading,
  restoreAuthState,
} = authSlice.actions;

export default authSlice.reducer;

// Async thunk to restore auth state from SecureStore
export const loadAuthState = async () => {
  try {
    const accessToken = await SecureStore.getItemAsync('accessToken');
    const userStr = await SecureStore.getItemAsync('user');
    const requiresProfileSetupStr = await SecureStore.getItemAsync('requiresProfileSetup');
    
    const user = userStr ? JSON.parse(userStr) : null;
    const requiresProfileSetup = requiresProfileSetupStr === 'true';
    
    return { accessToken, user, requiresProfileSetup };
  } catch (error) {
    console.error('Failed to load auth state:', error);
    return { accessToken: null, user: null, requiresProfileSetup: false };
  }
};

