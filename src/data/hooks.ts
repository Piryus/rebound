/** Focus-aware data hooks over the repository. Reload when a screen is focused. */
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useMemo, useState } from 'react';

import * as repo from '@/data/entriesRepository';
import type { Entry } from '@/types';

export function useRangeEntries(fromKey: string, toKey: string) {
  const db = useSQLiteContext();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const rows = await repo.listRange(db, fromKey, toKey);
    setEntries(rows);
    setLoading(false);
  }, [db, fromKey, toKey]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const byDate = useMemo(() => new Map(entries.map((e) => [e.date, e])), [entries]);
  return { entries, byDate, loading, reload };
}

export function useAllEntries() {
  const db = useSQLiteContext();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const rows = await repo.all(db);
    setEntries(rows);
    setLoading(false);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  return { entries, loading, reload };
}
