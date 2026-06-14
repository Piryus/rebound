/**
 * Daily local reminder. All notification logic lives here so screens just call
 * scheduleDailyReminder / cancelDailyReminder. Local scheduled notifications
 * work in both a dev build and Expo Go; the custom channel only fully applies
 * in a dev/production build.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { palette } from '@/theme/colors';

export const REMINDER_CHANNEL = 'daily-reminder';

const COPY = [
  { title: 'How are you feeling today?', body: 'Take a moment to log your check-in.' },
  { title: 'Time for your daily check-in', body: 'A quick read on body and mind.' },
  { title: 'How did today go?', body: 'Capture it while it’s fresh.' },
];

/** Sets the foreground handler. Call once at app start. */
export function configureNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL, {
    name: 'Daily check-in',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: palette.coral,
  });
}

export type PermissionState = 'granted' | 'denied' | 'undetermined';

export async function getPermissionState(): Promise<PermissionState> {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) return 'granted';
  // Android reports a never-requested permission as "denied" with canAskAgain
  // still true. Only treat it as a hard denial when we can no longer ask.
  if (settings.canAskAgain) return 'undetermined';
  return 'denied';
}

export async function requestPermission(): Promise<boolean> {
  const settings = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: true, allowSound: true },
  });
  return settings.granted || settings.status === 'granted';
}

/**
 * Schedule (or reschedule) the single daily reminder. Cancels any existing
 * schedule first so changing the time never stacks duplicates.
 */
export async function scheduleDailyReminder(hour: number, minute: number): Promise<void> {
  await ensureAndroidChannel();
  await Notifications.cancelAllScheduledNotificationsAsync();
  const copy = COPY[(hour + minute) % COPY.length];
  await Notifications.scheduleNotificationAsync({
    content: { title: copy.title, body: copy.body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: REMINDER_CHANNEL,
    },
  });
}

export async function cancelDailyReminder(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function isReminderScheduled(): Promise<boolean> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.length > 0;
}
