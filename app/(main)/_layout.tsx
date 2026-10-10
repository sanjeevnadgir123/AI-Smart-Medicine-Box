import { Stack, router } from 'expo-router';
import { Colors } from '../../src/constants/theme';
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';

export default function MainLayout() {
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data?.type === 'medicine-dose') {
        router.push('/(main)/schedule');
      }
    });

    return () => subscription.remove();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.light.background,
        },
        headerShadowVisible: false,
        headerTintColor: Colors.light.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen 
        name="dashboard" 
        options={{ 
          title: 'Dashboard',
          headerShown: false // Hide header for dashboard, we'll build a custom one
        }} 
      />
      <Stack.Screen name="medicines" options={{ title: 'My Medicines', headerShown: false }} />
      <Stack.Screen name="add-medicine" options={{ title: 'Add Medicine', headerShown: false }} />
      <Stack.Screen name="edit-medicine" options={{ title: 'Edit Medicine', headerShown: false }} />
      <Stack.Screen name="schedule" options={{ title: 'Schedule' }} />
      <Stack.Screen name="history" options={{ title: 'History' }} />
      <Stack.Screen name="alerts" options={{ title: 'Alerts' }} />
      <Stack.Screen name="caregiver" options={{ title: 'Caregiver' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
    </Stack>
  );
}
