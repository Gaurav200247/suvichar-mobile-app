import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect, Href } from 'expo-router';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { restoreAuthState, loadAuthState } from '../store/slices/authSlice';
import { useTheme } from '../context/ThemeContext';

export default function Index() {
  const dispatch = useAppDispatch();
  const { isDark } = useTheme();
  const { accessToken, requiresProfileSetup, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const initAuth = async () => {
      const authData = await loadAuthState();
      dispatch(restoreAuthState(authData));
    };
    
    initAuth();
  }, [dispatch]);

  // Show loading while restoring auth state
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#09090B' : '#FAFAFA' }}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  // If user is authenticated
  if (accessToken) {
    // Check if profile setup is needed
    if (requiresProfileSetup) {
      return <Redirect href={'/(user)/purpose' as Href} />;
    }
    // Go to main user screen
    return <Redirect href={'/(user)/(tabs)' as Href} />;
  }

  // Not authenticated - go to login
  return <Redirect href={'/(auth)/login' as Href} />;
}
