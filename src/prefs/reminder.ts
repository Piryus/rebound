/** Tiny user preferences (reminder on/off + time) live in AsyncStorage, not SQLite. */
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@rebound:reminder';

export interface ReminderPrefs {
  enabled: boolean;
  hour: number; // 0–23, local time
  minute: number; // 0–59
}

/** End-of-day reflection by default — the prompts ask about "today". */
export const DEFAULT_REMINDER: ReminderPrefs = { enabled: true, hour: 20, minute: 0 };

export async function getReminderPrefs(): Promise<ReminderPrefs> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return DEFAULT_REMINDER;
    const parsed = JSON.parse(raw) as Partial<ReminderPrefs>;
    return {
      enabled: parsed.enabled ?? DEFAULT_REMINDER.enabled,
      hour: parsed.hour ?? DEFAULT_REMINDER.hour,
      minute: parsed.minute ?? DEFAULT_REMINDER.minute,
    };
  } catch {
    return DEFAULT_REMINDER;
  }
}

export async function setReminderPrefs(prefs: ReminderPrefs): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(prefs));
}

export function formatTime(hour: number, minute: number): string {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  const m = minute.toString().padStart(2, '0');
  const ampm = hour < 12 ? 'AM' : 'PM';
  return `${h}:${m} ${ampm}`;
}
