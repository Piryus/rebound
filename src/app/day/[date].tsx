import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BandBadge } from '@/components/BandBadge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { PressableScale } from '@/components/PressableScale';
import { ScoreDial } from '@/components/ScoreDial';
import { ScoreSlider } from '@/components/ScoreSlider';
import { Txt } from '@/components/Txt';
import * as repo from '@/data/entriesRepository';
import { isToday, longDate } from '@/lib/date';
import { defaultScores, DIMENSIONS } from '@/scoring/dimensions';
import { computeScore, getBand, SCORE_NAME } from '@/scoring/score';
import { palette } from '@/theme/colors';
import { fonts, shadow, spacing, type } from '@/theme/tokens';
import type { DimensionKey, Scores } from '@/types';

export default function DayDetailScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();

  const [scores, setScores] = useState<Scores>(defaultScores());
  const [note, setNote] = useState('');
  const [existed, setExisted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const e = await repo.getByDate(db, date);
      if (e) {
        setScores(e.scores);
        setNote(e.note);
        setExisted(true);
      }
      setLoading(false);
    })();
  }, [db, date]);

  const score = computeScore(scores);
  const band = getBand(score);

  const setDim = (key: DimensionKey, value: number) =>
    setScores((prev) => ({ ...prev, [key]: value }));

  const onSave = async () => {
    setSaving(true);
    await repo.upsert(db, { date, scores, note, score });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const onDelete = () => {
    Alert.alert('Remove this day?', 'The check-in for this day will be deleted.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await repo.deleteByDate(db, date);
          router.back();
        },
      },
    ]);
  };

  if (loading) return <View style={styles.fill} />;

  return (
    <View style={styles.fill}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.headerText}>
          <Txt variant="caption">{isToday(date) ? 'Today' : 'Check-in'}</Txt>
          <Txt variant="title">{longDate(date)}</Txt>
        </View>
        <PressableScale haptic={false} onPress={() => router.back()} style={styles.closeBtn}>
          <Icon name="close" size={22} color={palette.ink} />
        </PressableScale>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.hero} padding={spacing.xxl}>
          <Txt variant="caption" style={styles.scoreLabel}>
            {SCORE_NAME}
          </Txt>
          <ScoreDial score={score} size={156} animate={false} />
          <View style={styles.bandWrap}>
            <BandBadge band={band} />
          </View>
        </Card>

        <Card style={styles.card}>
          {DIMENSIONS.map((d, i) => (
            <View key={d.key} style={i > 0 ? styles.sliderGap : undefined}>
              <ScoreSlider
                label={d.label}
                value={scores[d.key]}
                onChange={(v) => setDim(d.key, v)}
                accent={d.accent}
                lowLabel={d.lowLabel}
                highLabel={d.highLabel}
              />
            </View>
          ))}
        </Card>

        <Card style={styles.card}>
          <Txt style={styles.noteLabel}>Note</Txt>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Add a note…"
            placeholderTextColor={palette.mist}
            multiline
            style={styles.noteInput}
          />
        </Card>

        <Button label={existed ? 'Update' : 'Save'} onPress={onSave} loading={saving} style={styles.save} />
        {existed ? (
          <PressableScale haptic={false} onPress={onDelete} style={styles.deleteBtn}>
            <Txt variant="caption" style={styles.deleteText}>
              Remove this day
            </Txt>
          </PressableScale>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: palette.paperDawn },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  headerText: { gap: 2 },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.cloud,
    ...shadow.soft,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.huge,
  },
  hero: { alignItems: 'center' },
  scoreLabel: { marginBottom: spacing.sm },
  bandWrap: { alignItems: 'center', marginTop: spacing.lg },
  card: { marginTop: spacing.lg },
  sliderGap: { marginTop: spacing.xl },
  noteLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: type.subsection,
    color: palette.ink,
    marginBottom: spacing.sm,
  },
  noteInput: {
    fontFamily: fonts.body,
    fontSize: type.body,
    color: palette.ink,
    minHeight: 80,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  save: { marginTop: spacing.xl },
  deleteBtn: { alignItems: 'center', paddingVertical: spacing.lg },
  deleteText: { color: palette.coral },
});
