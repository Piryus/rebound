import { differenceInCalendarDays } from 'date-fns';

import { keyToDate } from '@/lib/date';
import type { Entry } from '@/types';

export function average(entries: Entry[]): number | null {
  if (entries.length === 0) return null;
  return Math.round(entries.reduce((sum, e) => sum + e.score, 0) / entries.length);
}

/** Length of the most recent run of consecutive logged days. */
export function computeStreak(entries: Entry[]): number {
  if (entries.length === 0) return 0;
  const keys = entries.map((e) => e.date).sort();
  let streak = 1;
  for (let i = keys.length - 1; i > 0; i--) {
    const diff = differenceInCalendarDays(keyToDate(keys[i]), keyToDate(keys[i - 1]));
    if (diff === 1) streak++;
    else if (diff === 0) continue;
    else break;
  }
  return streak;
}
