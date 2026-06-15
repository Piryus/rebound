/**
 * Habits: a simple daily checklist (stretches, meds, icing…). A row in
 * habit_logs means that habit was done on that date. All habit SQL lives here.
 */
import { subDays } from 'date-fns';
import type { SQLiteDatabase } from 'expo-sqlite';

import { keyToDate, toKey } from '@/lib/date';

export interface Habit {
  id: number;
  name: string;
  createdAt: number;
  sortOrder: number;
}

export interface HabitStatus {
  habit: Habit;
  done: boolean;
  streak: number;
}

export async function listHabits(db: SQLiteDatabase): Promise<Habit[]> {
  return db.getAllAsync<Habit>('SELECT * FROM habits ORDER BY sortOrder ASC, id ASC');
}

export async function addHabit(db: SQLiteDatabase, name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) return;
  const row = await db.getFirstAsync<{ m: number }>(
    'SELECT COALESCE(MAX(sortOrder), 0) AS m FROM habits',
  );
  await db.runAsync(
    'INSERT INTO habits (name, createdAt, sortOrder) VALUES (?, ?, ?)',
    trimmed,
    Date.now(),
    (row?.m ?? 0) + 1,
  );
}

export async function deleteHabit(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM habit_logs WHERE habitId = ?', id);
  await db.runAsync('DELETE FROM habits WHERE id = ?', id);
}

export async function setDone(
  db: SQLiteDatabase,
  habitId: number,
  date: string,
  done: boolean,
): Promise<void> {
  if (done) {
    await db.runAsync('INSERT OR IGNORE INTO habit_logs (habitId, date) VALUES (?, ?)', habitId, date);
  } else {
    await db.runAsync('DELETE FROM habit_logs WHERE habitId = ? AND date = ?', habitId, date);
  }
}

/** Consecutive days (ending at `date`) this habit was done. */
async function streakFor(db: SQLiteDatabase, habitId: number, date: string): Promise<number> {
  const rows = await db.getAllAsync<{ date: string }>(
    'SELECT date FROM habit_logs WHERE habitId = ? AND date <= ? ORDER BY date DESC LIMIT 400',
    habitId,
    date,
  );
  const set = new Set(rows.map((r) => r.date));
  let streak = 0;
  let cursor = date;
  while (set.has(cursor)) {
    streak++;
    cursor = toKey(subDays(keyToDate(cursor), 1));
  }
  return streak;
}

/**
 * Every habit with its done-state and streak for the given date. Only habits
 * that already existed on that date are included, so past days are an honest
 * record (a habit added today doesn't show as "missed" before it existed).
 */
export async function statusForDate(db: SQLiteDatabase, date: string): Promise<HabitStatus[]> {
  const habits = (await listHabits(db)).filter((h) => toKey(new Date(h.createdAt)) <= date);
  const doneRows = await db.getAllAsync<{ habitId: number }>(
    'SELECT habitId FROM habit_logs WHERE date = ?',
    date,
  );
  const doneSet = new Set(doneRows.map((r) => r.habitId));

  const out: HabitStatus[] = [];
  for (const habit of habits) {
    out.push({ habit, done: doneSet.has(habit.id), streak: await streakFor(db, habit.id, date) });
  }
  return out;
}
