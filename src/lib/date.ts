/** Local-time date helpers. Keys are 'YYYY-MM-DD' in the device's local zone. */
import { format, parse } from 'date-fns';

export const DATE_KEY = 'yyyy-MM-dd';

export function toKey(date: Date): string {
  return format(date, DATE_KEY);
}

export function todayKey(): string {
  return toKey(new Date());
}

export function keyToDate(key: string): Date {
  return parse(key, DATE_KEY, new Date());
}

/** "Sat, 14 Jun" style label for a date key. */
export function prettyDate(key: string): string {
  return format(keyToDate(key), 'EEE, d MMM');
}

/** "Saturday, 14 June 2026" long label. */
export function longDate(key: string): string {
  return format(keyToDate(key), 'EEEE, d MMMM yyyy');
}

export function isToday(key: string): boolean {
  return key === todayKey();
}
