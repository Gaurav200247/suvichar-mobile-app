import { useEffect } from 'react';
import { SplashScreen } from 'expo-router';

export function useFrameworkReady() {
  useEffect(() => {
    // Hide splash screen once the app is ready
    SplashScreen.hideAsync();
  }, []);
}
