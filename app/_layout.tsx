import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import 'react-native-reanimated';

export let globalLatestAuthUrl: string | null = null;

export default function RootLayout() {
  useEffect(() => {
    // Catch deep links at the absolute root before Router consumes them
    const handleUrl = (url: string | null) => {
      if (url && url.includes('auth/callback')) {
        globalLatestAuthUrl = url;
        if (__DEV__) console.log('[RootLayout] Caught Auth URL:', url);
      }
    };
    
    Linking.getInitialURL().then(handleUrl);
    const subscription = Linking.addEventListener('url', (e) => handleUrl(e.url));
    
    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="auth/callback" />
        <Stack.Screen name="(main)" />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}
