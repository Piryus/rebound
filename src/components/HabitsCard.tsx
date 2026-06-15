/**
 * Daily habits checklist for a given date. Tap a row to mark it done (saved
 * immediately), long-press to remove, and add new habits inline. Streaks show
 * once a habit has been kept up two days running.
 */
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';

import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { PressableScale } from '@/components/PressableScale';
import { Txt } from '@/components/Txt';
import {
  addHabit,
  deleteHabit,
  type HabitStatus,
  setDone,
  statusForDate,
} from '@/data/habitsRepository';
import { inkSoft, palette } from '@/theme/colors';
import { fonts, radius, spacing, type } from '@/theme/tokens';

const HABIT_COLORS = ['#FF6F61', '#19C39A', '#6C8BFF', '#F4A93C', '#2FB6C4', '#9B7EDC'];

interface HabitsCardProps {
  date: string;
  /**
   * Whether habits can be added/removed here (Today). When false (reviewing a
   * past day) the card shows a read-mostly checklist: still toggleable to fix
   * history, but without Add/Edit/delete.
   */
  manageable?: boolean;
  /** Called when the add-habit input focuses, so the parent can scroll it into view. */
  onInputFocus?: () => void;
}

export function HabitsCard({ date, manageable = true, onInputFocus }: HabitsCardProps) {
  const db = useSQLiteContext();
  const [items, setItems] = useState<HabitStatus[]>([]);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');

  const reload = useCallback(async () => {
    setItems(await statusForDate(db, date));
  }, [db, date]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const toggle = async (s: HabitStatus) => {
    Haptics.selectionAsync();
    setItems((prev) =>
      prev.map((x) => (x.habit.id === s.habit.id ? { ...x, done: !x.done } : x)),
    );
    await setDone(db, s.habit.id, date, !s.done);
    reload();
  };

  const remove = (s: HabitStatus) => {
    Alert.alert('Remove habit?', `"${s.habit.name}" and its history will be deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await deleteHabit(db, s.habit.id);
          reload();
        },
      },
    ]);
  };

  const submitAdd = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setAdding(false);
      return;
    }
    await addHabit(db, trimmed);
    setName('');
    reload();
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Txt style={styles.title}>Habits</Txt>
          <Txt variant="caption" style={styles.subtitle}>
            {!manageable
              ? 'What you kept up that day.'
              : editing
                ? 'Tap a habit to remove it.'
                : 'Tick off the little things — stretches, meds, icing.'}
          </Txt>
        </View>
        {manageable && items.length > 0 ? (
          <PressableScale haptic={false} onPress={() => setEditing((e) => !e)} style={styles.editBtn}>
            <Txt style={styles.editText}>{editing ? 'Done' : 'Edit'}</Txt>
          </PressableScale>
        ) : null}
      </View>

      {items.length === 0 && !adding ? (
        <Txt variant="bodyMuted" style={styles.empty}>
          {manageable
            ? 'No habits yet. Add the ones you want to keep up.'
            : 'No habits were tracked on this day.'}
        </Txt>
      ) : null}

      <View style={styles.list}>
        {items.map((s, i) => {
          const color = HABIT_COLORS[i % HABIT_COLORS.length];
          return (
            <PressableScale
              key={s.habit.id}
              haptic={false}
              onPress={() => (editing ? remove(s) : toggle(s))}
              onLongPress={manageable ? () => remove(s) : undefined}
              style={styles.row}
            >
              <View
                style={[
                  styles.check,
                  s.done ? { backgroundColor: color, borderColor: color } : { borderColor: palette.hairline },
                ]}
              >
                {s.done ? <Icon name="check" size={15} color={palette.cloud} strokeWidth={3} /> : null}
              </View>
              <Txt style={[styles.name, s.done && styles.nameDone]}>{s.habit.name}</Txt>
              {editing ? (
                <Icon name="trash" size={18} color={palette.coral} strokeWidth={2} />
              ) : s.streak > 1 ? (
                <Txt style={styles.streak}>🔥 {s.streak}</Txt>
              ) : null}
            </PressableScale>
          );
        })}
      </View>

      {!manageable ? null : adding ? (
        <View style={styles.addRow}>
          <TextInput
            value={name}
            onChangeText={setName}
            onFocus={onInputFocus}
            placeholder="e.g. Morning stretches"
            placeholderTextColor={palette.mist}
            autoFocus
            returnKeyType="done"
            blurOnSubmit={false}
            onSubmitEditing={submitAdd}
            style={styles.addInput}
          />
          <PressableScale onPress={submitAdd} style={[styles.addConfirm, { backgroundColor: palette.coral }]}>
            <Icon name="check" size={18} color={palette.cloud} strokeWidth={2.6} />
          </PressableScale>
        </View>
      ) : (
        <PressableScale haptic={false} onPress={() => setAdding(true)} style={styles.addTrigger}>
          <Icon name="plus" size={18} color={palette.coral} strokeWidth={2.4} />
          <Txt style={styles.addText}>Add a habit</Txt>
        </PressableScale>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: spacing.lg },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerText: { flex: 1 },
  editBtn: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    marginRight: -spacing.sm,
  },
  editText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: type.small,
    color: palette.coral,
  },
  title: {
    fontFamily: fonts.bodySemiBold,
    fontSize: type.subsection,
    color: palette.ink,
  },
  subtitle: { marginTop: 2 },
  empty: { marginTop: spacing.lg, fontSize: type.small },
  list: { marginTop: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 11,
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: type.body,
    color: palette.ink,
  },
  nameDone: { color: inkSoft, textDecorationLine: 'line-through' },
  streak: {
    fontFamily: fonts.bodySemiBold,
    fontSize: type.small,
    color: inkSoft,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  addInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: type.body,
    color: palette.ink,
    backgroundColor: palette.paperDawn,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
  },
  addConfirm: {
    width: 44,
    height: 44,
    borderRadius: radius.input,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  addText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: type.body,
    color: palette.coral,
  },
});
