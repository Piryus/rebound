import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { BandBadge } from '@/components/BandBadge';
import { BrandMark } from '@/components/BrandMark';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Confetti } from '@/components/Confetti';
import { Screen } from '@/components/Screen';
import { ScoreDial } from '@/components/ScoreDial';
import { ScoreSlider } from '@/components/ScoreSlider';
import { Txt } from '@/components/Txt';
import * as repo from '@/data/entriesRepository';
import { longDate, todayKey } from '@/lib/date';
import { syncReminder } from '@/notifications/sync';
import { defaultScores, DIMENSIONS } from '@/scoring/dimensions';
import { CELEBRATION_THRESHOLD, computeScore, getBand, SCORE_NAME } from '@/scoring/score';
import { APP_NAME, GREETINGS } from '@/theme/brand';
import { palette } from '@/theme/colors';
import { fonts, spacing, type } from '@/theme/tokens';
import type { DimensionKey, Entry, Scores } from '@/types';

export default function TodayScreen() {
  const db = useSQLiteContext();
  const today = todayKey();

  const [scores, setScores] = useState<Scores>(defaultScores());
  const [note, setNote] = useState('');
  const [existing, setExisting] = useState<Entry | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const e = await repo.getByDate(db, today);
        if (!active || !e) return;
        setExisting(e);
        setScores(e.scores);
        setNote(e.note);
      })();
      return () => {
        active = false;
      };
    }, [db, today]),
  );

  const score = computeScore(scores);
  const band = getBand(score);
  const greeting = GREETINGS[new Date().getDate() % GREETINGS.length];

  const setDim = (key: DimensionKey, value: number) => {
    setHasInteracted(true);
    setSavedAt(null);
    setScores((prev) => ({ ...prev, [key]: value }));
  };

  const onSave = async () => {
    setSaving(true);
    await repo.upsert(db, { date: today, scores, note, score });
    setExisting(await repo.getByDate(db, today));
    setSaving(false);
    setSavedAt(Date.now());
    void syncReminder({ requestIfNeeded: true });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (score >= CELEBRATION_THRESHOLD) setCelebrate(true);
  };

  return (
    <View style={styles.fill}>
      <Screen>
        <View style={styles.brandRow}>
          <BrandMark size={30} />
          <Txt style={styles.wordmark}>{APP_NAME}</Txt>
        </View>

        <Txt variant="display" style={styles.greeting}>
          {greeting}
        </Txt>
        <Txt variant="caption" style={styles.date}>
          {longDate(today)}
        </Txt>

        <Card style={styles.hero} padding={spacing.xxl}>
          <Txt variant="caption" style={styles.scoreLabel}>
            {SCORE_NAME}
          </Txt>
          <ScoreDial score={score} size={186} animate={!hasInteracted} />
          <View style={styles.bandWrap}>
            <BandBadge band={band} />
            <Txt variant="bodyMuted" align="center" style={styles.bandMsg}>
              {band.message}
            </Txt>
          </View>
        </Card>

        <Card style={styles.slidersCard}>
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

        <Card style={styles.noteCard}>
          <Txt style={styles.noteLabel}>A note for today</Txt>
          <TextInput
            value={note}
            onChangeText={(t) => {
              setNote(t);
              setSavedAt(null);
            }}
            placeholder="Anything worth remembering — what helped, what hurt, how you felt…"
            placeholderTextColor={palette.mist}
            multiline
            style={styles.noteInput}
          />
        </Card>

        <Button
          label={savedAt ? 'Saved' : existing ? 'Update today' : 'Save today'}
          icon={savedAt ? 'check' : undefined}
          variant={savedAt ? 'celebration' : 'primary'}
          onPress={onSave}
          loading={saving}
          style={styles.save}
        />
        {savedAt ? (
          <Txt variant="caption" align="center" style={styles.savedHint}>
            Logged. See you tomorrow.
          </Txt>
        ) : null}
      </Screen>

      <Confetti visible={celebrate} onDone={() => setCelebrate(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: palette.paperDawn },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  wordmark: {
    fontFamily: fonts.display,
    fontSize: type.section,
    color: palette.ink,
    letterSpacing: -0.4,
  },
  greeting: {
    marginTop: spacing.sm,
  },
  date: {
    marginTop: spacing.xs,
  },
  hero: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  scoreLabel: {
    marginBottom: spacing.sm,
  },
  bandWrap: {
    alignItems: 'center',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  bandMsg: {
    fontSize: type.small,
    lineHeight: 21,
  },
  slidersCard: {
    marginTop: spacing.lg,
  },
  sliderGap: {
    marginTop: spacing.xl,
  },
  noteCard: {
    marginTop: spacing.lg,
  },
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
    minHeight: 92,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  save: {
    marginTop: spacing.xl,
  },
  savedHint: {
    marginTop: spacing.md,
  },
});
