/**
 * The single seam every screen imports for persistence. Keeping all SQL here
 * means the storage engine (and a future backend sync) can change without
 * touching the UI. Functions take the db handle from useSQLiteContext().
 */
import type { SQLiteDatabase } from 'expo-sqlite';

import type { Entry, Scores } from '@/types';

interface Row {
  date: string;
  scores: string;
  note: string;
  score: number;
  createdAt: number;
  updatedAt: number;
}

function toEntry(row: Row): Entry {
  return {
    date: row.date,
    scores: JSON.parse(row.scores) as Scores,
    note: row.note,
    score: row.score,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function getByDate(db: SQLiteDatabase, date: string): Promise<Entry | null> {
  const row = await db.getFirstAsync<Row>('SELECT * FROM entries WHERE date = ?', date);
  return row ? toEntry(row) : null;
}

export async function listRange(
  db: SQLiteDatabase,
  from: string,
  to: string,
): Promise<Entry[]> {
  const rows = await db.getAllAsync<Row>(
    'SELECT * FROM entries WHERE date >= ? AND date <= ? ORDER BY date ASC',
    from,
    to,
  );
  return rows.map(toEntry);
}

export async function all(db: SQLiteDatabase): Promise<Entry[]> {
  const rows = await db.getAllAsync<Row>('SELECT * FROM entries ORDER BY date ASC');
  return rows.map(toEntry);
}

export async function countEntries(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) as n FROM entries');
  return row?.n ?? 0;
}

export interface UpsertInput {
  date: string;
  scores: Scores;
  note: string;
  score: number;
}

export async function upsert(db: SQLiteDatabase, input: UpsertInput): Promise<void> {
  const now = Date.now();
  await db.runAsync(
    `INSERT INTO entries (date, scores, note, score, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(date) DO UPDATE SET
       scores = excluded.scores,
       note = excluded.note,
       score = excluded.score,
       updatedAt = excluded.updatedAt`,
    input.date,
    JSON.stringify(input.scores),
    input.note,
    input.score,
    now,
    now,
  );
}

export async function deleteByDate(db: SQLiteDatabase, date: string): Promise<void> {
  await db.runAsync('DELETE FROM entries WHERE date = ?', date);
}

export async function deleteAll(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('DELETE FROM entries');
}
