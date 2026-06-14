/** Reconcile the scheduled reminder with the saved preferences. */
import { getReminderPrefs, type ReminderPrefs } from '@/prefs/reminder';

import {
  cancelDailyReminder,
  getPermissionState,
  requestPermission,
  scheduleDailyReminder,
} from './reminders';

export type SyncResult = 'scheduled' | 'disabled' | 'denied' | 'needsPermission';

export async function syncReminder(opts?: {
  requestIfNeeded?: boolean;
  prefs?: ReminderPrefs;
}): Promise<SyncResult> {
  const prefs = opts?.prefs ?? (await getReminderPrefs());

  if (!prefs.enabled) {
    await cancelDailyReminder();
    return 'disabled';
  }

  let state = await getPermissionState();
  if (state !== 'granted' && opts?.requestIfNeeded) {
    state = (await requestPermission()) ? 'granted' : 'denied';
  }
  if (state !== 'granted') {
    return state === 'denied' ? 'denied' : 'needsPermission';
  }

  await scheduleDailyReminder(prefs.hour, prefs.minute);
  return 'scheduled';
}
