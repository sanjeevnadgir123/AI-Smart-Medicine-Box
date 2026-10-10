import React from 'react';
import { View, Text, StyleSheet, Linking, Platform } from 'react-native';
import { Colors, Typography, Spacing } from '../../src/constants/theme';
import { AppButton } from '../../src/components/common/AppButton';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';
import { requestNotificationPermissions, getNotificationPermissionStatus } from '../../src/services/notificationService';

export default function SettingsScreen() {
  const [notificationStatus, setNotificationStatus] = React.useState<string>('checking...');

  React.useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const status = await getNotificationPermissionStatus();
    setNotificationStatus(status);
  };

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermissions();
    setNotificationStatus(granted ? 'granted' : 'denied');
    if (!granted) {
      // On Android, once denied, the user must enable from system settings
      if (Platform.OS === 'android') {
        Linking.openSettings();
      }
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.replace('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const isEnabled = notificationStatus === 'granted';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>This section will be built in a later phase.</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.settingRow}>
          <View style={styles.statusRow}>
            <Text style={styles.statusIcon}>{isEnabled ? '🟢' : '🔴'}</Text>
            <Text style={styles.settingText}>
              {isEnabled ? 'Notifications enabled' : 'Notifications disabled'}
            </Text>
          </View>
          {!isEnabled && notificationStatus !== 'checking...' && (
            <AppButton title="Enable" onPress={handleRequestPermission} />
          )}
        </View>
      </View>

      <View style={styles.logoutContainer}>
        <AppButton title="Logout" onPress={handleLogout} variant="outline" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  title: {
    ...Typography.h2,
    color: Colors.light.primary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body1,
    color: Colors.light.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  section: {
    width: '100%',
    backgroundColor: Colors.light.surface,
    padding: Spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  settingText: {
    ...Typography.body1,
    color: Colors.light.text,
  },
  logoutContainer: {
    marginTop: Spacing.xxl,
    width: '100%',
    paddingHorizontal: Spacing.xl,
  }
});
