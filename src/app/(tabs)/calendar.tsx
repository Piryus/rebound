import {
  addMonths,
  endOfMonth,
  format,
  isSameMonth,
  startOfMonth,
  subMonths,
} from 'date-fns';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BrandMark } from '@/components/BrandMark';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { MonthHeatmap } from '@/components/MonthHeatmap';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { useRangeEntries } from '@/data/hooks';
import { toKey } from '@/lib/date';
import { average } from '@/lib/stats';
import { palette, SCORE_RAMP } from '@/theme/colors';
import { fonts, radius, spacing, type } from '@/theme/tokens';

export default function CalendarScreen() {
  const [monthDate, setMonthDate] = useState(() => startOfMonth(new Date()));
  const fromKey = toKey(startOfMonth(monthDate));
  const toKeyStr = toKey(endOfMonth(monthDate));
  const { entries, byDate } = useRangeEntries(fromKey, toKeyStr);

  const canGoNext = !isSameMonth(monthDate, new Date());
  const monthAvg = average(entries);

  return (
    <Screen>
      <Txt variant="display">Calendar</Txt>
      <Txt variant="caption" style={styles.sub}>
        Your weather, day by day — color shows the day, the footer hints body vs. mood.
      </Txt>

      <Card style={styles.card}>
        <View style={styles.navRow}>
          <PressableScale onPress={() => setMonthDate((m) => subMonths(m, 1))} style={styles.navBtn}>
            <Icon name="chevronLeft" size={22} color={palette.ink} />
          </PressableScale>
          <Txt style={styles.monthLabel}>{format(monthDate, 'MMMM yyyy')}</Txt>
          <PressableScale
            onPress={() => canGoNext && setMonthDate((m) => addMonths(m, 1))}
            style={[styles.navBtn, !canGoNext && styles.navDisabled]}
          >
            <Icon name="chevronRight" size={22} color={canGoNext ? palette.ink : palette.hairline} />
          </PressableScale>
        </View>

        <View style={styles.heatmap}>
          <MonthHeatmap
            monthDate={monthDate}
            entries={byDate}
            onDayPress={(key) => router.push({ pathname: '/day/[date]', params: { date: key } })}
          />
        </View>

        <View style={styles.legend}>
          <Txt variant="caption">Tough</Txt>
          <View style={styles.ramp}>
            {SCORE_RAMP.map((c) => (
              <View key={c} style={[styles.rampCell, { backgroundColor: c }]} />
            ))}
          </View>
          <Txt variant="caption">Thriving</Txt>
        </View>
      </Card>

      {entries.length > 0 ? (
        <Txt variant="bodyMuted" align="center" style={styles.summary}>
          This month · avg {monthAvg} · {entries.length}{' '}
          {entries.length === 1 ? 'check-in' : 'check-ins'}
        </Txt>
      ) : (
        <View style={styles.empty}>
          <BrandMark size={56} color={palette.hairline} ground={false} />
          <Txt variant="bodyMuted" align="center" style={styles.emptyText}>
            No check-ins this month yet. Tap a day to log it, or head to Today.
          </Txt>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  sub: { marginTop: spacing.xs, maxWidth: 320 },
  card: { marginTop: spacing.xl },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.paperDawn,
  },
  navDisabled: { opacity: 0.5 },
  monthLabel: {
    fontFamily: fonts.display,
    fontSize: type.subsection,
    color: palette.ink,
    letterSpacing: -0.3,
  },
  heatmap: { marginTop: spacing.xs },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  ramp: {
    flexDirection: 'row',
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  rampCell: { width: 16, height: 10 },
  summary: { marginTop: spacing.lg },
  empty: { alignItems: 'center', marginTop: spacing.xxl, gap: spacing.md },
  emptyText: { maxWidth: 280 },
});
