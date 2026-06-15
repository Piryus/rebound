import { subDays } from 'date-fns';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BandBadge } from '@/components/BandBadge';
import { Card } from '@/components/Card';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { TrendChart } from '@/components/TrendChart';
import { Txt } from '@/components/Txt';
import { useAllEntries } from '@/data/hooks';
import { toKey, todayKey } from '@/lib/date';
import { average, computeStreak } from '@/lib/stats';
import { getBand } from '@/scoring/score';
import { palette } from '@/theme/colors';
import { fonts, radius, shadow, spacing, type } from '@/theme/tokens';

const RANGES = [
  { days: 7, label: '7d' },
  { days: 30, label: '30d' },
  { days: 90, label: '90d' },
];

export default function TrendsScreen() {
  const { entries } = useAllEntries();
  const [rangeIdx, setRangeIdx] = useState(1);

  const days = RANGES[rangeIdx].days;
  const endKey = todayKey();
  const startKey = toKey(subDays(new Date(), days - 1));
  const ranged = entries.filter((e) => e.date >= startKey && e.date <= endKey);

  const avg = average(ranged);
  const streak = computeStreak(entries);
  const latest = entries.length ? entries[entries.length - 1] : null;
  const latestBand = latest ? getBand(latest.score) : null;

  return (
    <Screen>
      <Txt variant="display">Trends</Txt>
      <Txt variant="caption" style={styles.sub}>
        Watch the line climb as you bounce back.
      </Txt>

      <View style={styles.segment}>
        {RANGES.map((r, i) => {
          const active = i === rangeIdx;
          return (
            <PressableScale
              key={r.days}
              fill
              onPress={() => setRangeIdx(i)}
              style={[styles.segItem, active && styles.segItemActive]}
            >
              <Txt style={[styles.segText, { color: active ? palette.cloud : palette.mist }]}>
                {r.label}
              </Txt>
            </PressableScale>
          );
        })}
      </View>

      <Card style={styles.chartCard} padding={spacing.lg}>
        <TrendChart entries={ranged} startKey={startKey} endKey={endKey} height={210} />
      </Card>

      <Card style={styles.statsCard} padding={spacing.lg}>
        <View style={styles.statsRow}>
          <Stat label="Range avg" value={avg != null ? String(avg) : '—'} />
          <View style={styles.divider} />
          <Stat label="Streak" value={streak ? `${streak}d` : '—'} />
          <View style={styles.divider} />
          <Stat label="Latest" value={latest ? String(latest.score) : '—'} />
        </View>
        {latestBand ? (
          <View style={styles.bandRow}>
            <BandBadge band={latestBand} />
          </View>
        ) : null}
      </Card>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Txt style={styles.statValue}>{value}</Txt>
      <Txt variant="caption" style={styles.statLabel}>
        {label}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  sub: { marginTop: spacing.xs },
  segment: {
    flexDirection: 'row',
    backgroundColor: palette.cloud,
    borderRadius: radius.pill,
    padding: 5,
    gap: 6,
    marginTop: spacing.xl,
    ...shadow.soft,
  },
  segItem: {
    flex: 1,
    minWidth: 56,
    paddingVertical: 11,
    alignItems: 'center',
    borderRadius: radius.pill,
  },
  segItemActive: { backgroundColor: palette.coral },
  segText: { fontFamily: fonts.bodySemiBold, fontSize: type.small },
  chartCard: { marginTop: spacing.lg },
  statsCard: { marginTop: spacing.lg },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: {
    fontFamily: fonts.display,
    fontSize: type.title,
    color: palette.ink,
    letterSpacing: -0.5,
  },
  statLabel: {},
  divider: { width: 1, height: 32, backgroundColor: palette.hairline },
  bandRow: { alignItems: 'center', marginTop: spacing.lg },
});
