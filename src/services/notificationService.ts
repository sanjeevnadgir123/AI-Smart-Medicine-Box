import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DoseLog } from '../models/dose';
import { Medicine } from '../models/medicine';

const NOTIFICATION_STORAGE_KEY = '@medicine_notification_map';

// Configure how notifications behave when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Create Android notification channel with HIGH importance
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('medicine-reminders-high', {
    name: 'Medicine Reminders',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
  });
}

/**
 * Requests permission for notifications safely.
 * Returns true if permission is granted.
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
};

/**
 * Checks the current notification permission status without requesting.
 */
export const getNotificationPermissionStatus = async (): Promise<string> => {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
};

// ─── AsyncStorage Mapping Helpers ──────────────────────────────────────────────
// Maps dose.id (Supabase UUID) → Expo notification identifier (string)
// This prevents duplicate scheduling and allows targeted cancellation.

const getNotificationMap = async (): Promise<Record<string, string>> => {
  try {
    const mapStr = await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEY);
    return mapStr ? JSON.parse(mapStr) : {};
  } catch (e) {
    console.error('[NOTIFICATION] Error reading notification map', e);
    return {};
  }
};

const saveNotificationMap = async (map: Record<string, string>): Promise<void> => {
  try {
    await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.error('[NOTIFICATION] Error saving notification map', e);
  }
};

const getNotificationIdForDose = async (doseId: string): Promise<string | null> => {
  const map = await getNotificationMap();
  return map[doseId] || null;
};

const saveNotificationIdForDose = async (doseId: string, notificationId: string): Promise<void> => {
  const map = await getNotificationMap();
  map[doseId] = notificationId;
  await saveNotificationMap(map);
};

const removeNotificationIdForDose = async (doseId: string): Promise<void> => {
  const map = await getNotificationMap();
  delete map[doseId];
  await saveNotificationMap(map);
};

// ─── Core Scheduling ──────────────────────────────────────────────────────────

/**
 * Schedules a local notification for a specific dose at its scheduled time.
 * 
 * Uses the correct Expo SDK 54 DateTriggerInput format:
 *   { type: SchedulableTriggerInputTypes.DATE, date: Date, channelId?: string }
 * 
 * Prevents duplicates by checking the AsyncStorage mapping before scheduling.
 * Skips scheduling if the dose time is in the past.
 */
export const scheduleDoseNotification = async (dose: DoseLog, medicine: Medicine): Promise<void> => {
  const scheduledTime = new Date(dose.scheduled_time);
  const now = new Date();

  console.log(`[NOTIFICATION] Preparing dose ${dose.id}`);
  console.log(`[NOTIFICATION] Now: ${now.toISOString()} | Scheduled: ${scheduledTime.toISOString()}`);

  // 1. Do not schedule notifications for past times
  if (scheduledTime.getTime() <= now.getTime()) {
    console.log(`[NOTIFICATION] Skipping — scheduled time is in the past`);
    return;
  }

  const diffSeconds = Math.round((scheduledTime.getTime() - now.getTime()) / 1000);
  console.log(`[NOTIFICATION] Trigger in ${diffSeconds} seconds`);

  // 2. Check if we already have a notification mapped for this dose
  const existingNotificationId = await getNotificationIdForDose(dose.id);
  if (existingNotificationId) {
    console.log(`[NOTIFICATION] Already scheduled (ID: ${existingNotificationId}), skipping`);
    return;
  }

  // 3. Schedule using the correct DateTriggerInput format
  const compartment = dose.compartment || medicine.compartment;
  const bodyText = `It's time to take ${medicine.name} ${medicine.dose}.${compartment ? `\nCompartment ${compartment}` : ''}`;

  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: '💊 Medicine Reminder',
        body: bodyText,
        data: {
          type: 'medicine-dose',
          doseId: dose.id,
          medicineId: medicine.id,
        },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: scheduledTime,
        channelId: 'medicine-reminders-high',
      },
    });

    console.log(`[NOTIFICATION] Scheduled successfully — Expo ID: ${identifier}`);

    // 4. Save the mapping: dose.id → Expo notification identifier
    await saveNotificationIdForDose(dose.id, identifier);
  } catch (e) {
    console.error(`[NOTIFICATION] Failed to schedule for dose ${dose.id}:`, e);
  }
};

/**
 * Cancels a scheduled notification for a specific dose if one exists.
 */
export const cancelDoseNotification = async (doseId: string): Promise<void> => {
  const notificationId = await getNotificationIdForDose(doseId);
  if (notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log(`[NOTIFICATION] Cancelled notification ${notificationId} for dose ${doseId}`);
    } catch (e) {
      console.error(`[NOTIFICATION] Error cancelling notification for dose ${doseId}:`, e);
    }
    await removeNotificationIdForDose(doseId);
  }
};

/**
 * Synchronizes notifications for today's doses:
 * - Schedules missing notifications for pending doses with active medicines
 * - Cancels notifications for taken/missed/skipped doses or inactive medicines
 * - Skips doses whose time has already passed
 * 
 * This is safe to call multiple times (on app start, resume, etc.)
 * because it checks the AsyncStorage mapping before scheduling.
 */
export const syncNotifications = async (doses: DoseLog[]): Promise<void> => {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    console.log('[NOTIFICATION] Permission not granted, skipping sync');
    return;
  }

  for (const dose of doses) {
    if (dose.status === 'pending' && dose.medicine && dose.medicine.status === 'active') {
      await scheduleDoseNotification(dose, dose.medicine);
    } else {
      // Dose is taken/missed/skipped or medicine is inactive — cancel if scheduled
      await cancelDoseNotification(dose.id);
    }
  }
};

/**
 * Cancels all scheduled notifications and clears the mapping.
 * Use on logout.
 */
export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await AsyncStorage.removeItem(NOTIFICATION_STORAGE_KEY);
    console.log('[NOTIFICATION] All notifications cancelled');
  } catch (e) {
    console.error('[NOTIFICATION] Failed to cancel all notifications', e);
  }
};
