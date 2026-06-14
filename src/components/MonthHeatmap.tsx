/**
 * The signature "weather" calendar: a month grid of squircle cells tinted along
 * the score ramp. Each logged day carries a thin dual-tone footer — coral for
 * pain intensity, periwinkle for mood — so body and mind read at a glance.
 */
import { eachDayOfInterval, endOfMonth, getDay, startOfMonth } from 'date-fns';
import React, { useMemo, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, View } from 'react-native';

import { PressableScale } from '@/components/PressableScale';
import { Txt } from '@/components/Txt';
import { toKey, todayKey } from '@/lib/date';
import { palette, scoreToColor, withAlpha } from '@/theme/colors';
import { fonts, radius } from '@/theme/tokens';
import type { Entry } from '@/types';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const GAP = 6;

interface MonthHeatmapProps {
  monthDate: Date;
  entries: Map<string, Entry>;
  onDayPress: (key: string) => void;
}

export function MonthHeatmap({ monthDate, entries, onDayPress }: MonthHeatmapProps) {
  const [containerW, setContainerW] = useState(0);
  const cell = containerW > 0 ? (containerW - GAP * 6) / 7 : 0;

  const days = useMemo(
    () => eachDayOfInterval({ start: startOfMonth(monthDate), end: endOfMonth(monthDate) }),
    [monthDate],
  );
  const leadBlanks = (getDay(startOfMonth(monthDate)) + 6) % 7; // Monday-first
  const today = todayKey();

  return (
    <View onLayout={(e: LayoutChangeEvent) => setContainerW(e.nativeEvent.layout.width)}>
      <View style={[styles.row, styles.weekHeader]}>
        {WEEKDAYS.map((d, i) => (
          <View key={i} style={{ width: cell, alignItems: 'center' }}>
            <Txt variant="caption">{d}</Txt>
          </View>
        ))}
      </View>

      <View style={styles.row}>
        {Array.from({ length: leadBlanks }).map((_, i) => (
          <View key={`blank-${i}`} style={{ width: cell, height: cell }} />
        ))}

        {days.map((d) => {
          const key = toKey(d);
          const entry = entries.get(key);
          const isToday = key === today;
          const bg = entry ? scoreToColor(entry.score) : palette.hairline;

          return (
            <PressableScale
              key={key}
              haptic={false}
              onPress={() => onDayPress(key)}
              style={{ width: cell, height: cell }}
            >
              <View
                style={[
                  styles.cell,
                  {
                    backgroundColor: bg,
                    borderColor: isToday ? palette.coral : 'transparent',
                    borderWidth: isToday ? 2 : 0,
                  },
                ]}
              >
                <Txt style={[styles.dayNum, { color: entry ? palette.ink : palette.mist }]}>
                  {d.getDate()}
                </Txt>
                {entry && (
                  <View style={styles.notch}>
                    <View
                      style={[
                        styles.notchHalf,
                        { backgroundColor: withAlpha(palette.coral, 0.25 + (entry.scores.pain / 10) * 0.75) },
                      ]}
                    />
                    <View
                      style={[
                        styles.notchHalf,
                        { backgroundColor: withAlpha(palette.periwinkle, 0.25 + (entry.scores.mood / 10) * 0.75) },
                      ]}
                    />
                  </View>
                )}
              </View>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  weekHeader: {
    marginBottom: GAP,
  },
  cell: {
    flex: 1,
    borderRadius: radius.cell,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  dayNum: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    includeFontPadding: false,
  },
  notch: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    flexDirection: 'row',
  },
  notchHalf: {
    flex: 1,
  },
});
