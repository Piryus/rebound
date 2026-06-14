/**
 * The big Body & Spirit Score ring. The number counts up and the ring fills on
 * mount, eased out, with the color sampled from the score ramp.
 */
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Txt } from '@/components/Txt';
import { palette, scoreToColor } from '@/theme/colors';
import { fonts } from '@/theme/tokens';

interface ScoreDialProps {
  score: number;
  size?: number;
  subtitle?: string;
  animate?: boolean;
}

export function ScoreDial({ score, size = 208, subtitle, animate = true }: ScoreDialProps) {
  const stroke = Math.round(size * 0.07);
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const center = size / 2;

  const [t, setT] = useState(animate ? 0 : 1);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!animate) {
      setT(1);
      return;
    }
    let start: number | null = null;
    const duration = 900;
    const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
    const tick = (now: number) => {
      if (start === null) start = now;
      const p = Math.min(1, (now - start) / duration);
      setT(easeOutCubic(p));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [score, animate]);

  const display = Math.round(score * t);
  const color = scoreToColor(score);
  const offset = circumference * (1 - (score / 100) * t);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle cx={center} cy={center} r={r} stroke={palette.hairline} strokeWidth={stroke} fill="none" />
        <Circle
          cx={center}
          cy={center}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <View style={styles.center}>
        <Txt
          numberOfLines={1}
          style={[styles.number, { fontSize: Math.round(size * 0.33), lineHeight: Math.round(size * 0.4) }]}
        >
          {display}
        </Txt>
        {subtitle ? (
          <Txt variant="caption" align="center" style={styles.subtitle}>
            {subtitle}
          </Txt>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    fontFamily: fonts.displayBlack,
    color: palette.ink,
    letterSpacing: -1.5,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: -2,
  },
});
