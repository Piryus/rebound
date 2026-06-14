/**
 * A smooth SVG trend of the daily 0–100 score across a date range. Points are
 * placed at their true date (gaps are honest), connected with a Catmull-Rom
 * curve, under a soft coral wash. Dots are tinted by their own score.
 */
import { differenceInCalendarDays } from 'date-fns';
import React, { useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Line as SvgLine, LinearGradient, Path, Stop } from 'react-native-svg';

import { Txt } from '@/components/Txt';
import { keyToDate } from '@/lib/date';
import { palette, scoreToColor, withAlpha } from '@/theme/colors';
import { fonts } from '@/theme/tokens';
import type { Entry } from '@/types';

interface TrendChartProps {
  entries: Entry[]; // ascending, within range
  startKey: string;
  endKey: string;
  height?: number;
}

interface Pt {
  x: number;
  y: number;
  score: number;
}

function smoothPath(pts: Pt[]): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export function TrendChart({ entries, startKey, endKey, height = 200 }: TrendChartProps) {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const pad = { left: 30, right: 10, top: 14, bottom: 20 };
  const plotW = Math.max(0, width - pad.left - pad.right);
  const plotH = height - pad.top - pad.bottom;
  const baseY = pad.top + plotH;

  const startDate = keyToDate(startKey);
  const totalDays = Math.max(1, differenceInCalendarDays(keyToDate(endKey), startDate));

  const xFor = (key: string) =>
    pad.left + (differenceInCalendarDays(keyToDate(key), startDate) / totalDays) * plotW;
  const yFor = (score: number) => pad.top + (1 - score / 100) * plotH;

  const pts: Pt[] = entries.map((e) => ({ x: xFor(e.date), y: yFor(e.score), score: e.score }));
  const line = smoothPath(pts);
  const area = line ? `${line} L ${pts[pts.length - 1].x} ${baseY} L ${pts[0].x} ${baseY} Z` : '';

  const gridLines = [0, 25, 50, 75, 100];

  return (
    <View onLayout={onLayout} style={{ height }}>
      {width > 0 && (
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={palette.coral} stopOpacity={0.18} />
              <Stop offset="1" stopColor={palette.coral} stopOpacity={0} />
            </LinearGradient>
          </Defs>

          {gridLines.map((g) => {
            const y = yFor(g);
            return (
              <SvgLine
                key={g}
                x1={pad.left}
                y1={y}
                x2={width - pad.right}
                y2={y}
                stroke={palette.hairline}
                strokeWidth={1}
              />
            );
          })}

          {area ? <Path d={area} fill="url(#trendFill)" /> : null}
          {line ? (
            <Path d={line} stroke={palette.coral} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          ) : null}

          {pts.map((p, i) => (
            <Circle key={i} cx={p.x} cy={p.y} r={4.5} fill={scoreToColor(p.score)} stroke={palette.cloud} strokeWidth={2} />
          ))}
        </Svg>
      )}

      {/* y labels */}
      {width > 0 &&
        [0, 50, 100].map((g) => (
          <View key={g} style={[styles.yLabel, { top: yFor(g) - 7 }]}>
            <Txt style={styles.yLabelText}>{g}</Txt>
          </View>
        ))}

      {entries.length < 2 && (
        <View style={styles.empty} pointerEvents="none">
          <Txt variant="bodyMuted" align="center">
            Keep checking in — your trend line appears once you have a couple of days.
          </Txt>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  yLabel: {
    position: 'absolute',
    left: 0,
    width: 26,
    alignItems: 'flex-end',
  },
  yLabelText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: palette.mist,
  },
  empty: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
});
