/**
 * Local-first SQLite. One row per calendar day; re-saving a day upserts it.
 * Run as the SQLiteProvider `onInit` so the schema exists before any screen reads.
 */
import type { SQLiteDatabase } from 'expo-sqlite';

export const DB_NAME = 'rebound.db';

export async function migrateDb(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`PRAGMA journal_mode = 'wal';`);

  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;

  if (version === 0) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS entries (
        date TEXT PRIMARY KEY NOT NULL,
        scores TEXT NOT NULL,
        note TEXT NOT NULL DEFAULT '',
        score INTEGER NOT NULL,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      );
    `);
    await db.execAsync('PRAGMA user_version = 1');
    version = 1;
  }

  if (version === 1) {
    // Habits: simple daily checklist. A row in habit_logs = done that day.
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS habits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        sortOrder INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS habit_logs (
        habitId INTEGER NOT NULL,
        date TEXT NOT NULL,
        PRIMARY KEY (habitId, date)
      );
    `);
    await db.execAsync('PRAGMA user_version = 2');
    version = 2;
  }
}
