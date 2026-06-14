/** A one-shot confetti rain for best-day saves. Pure reanimated, no deps. */
import React, { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { palette } from '@/theme/colors';

const COLORS = [palette.mint, palette.honey, palette.coral, palette.periwinkle];
const PIECES = 30;
const DURATION = 1900;

interface PieceSpec {
  startX: number;
  fall: number;
  sway: number;
  swayFreq: number;
  spin: number;
  size: number;
  color: string;
  round: boolean;
  delay: number;
}

function buildPieces(width: number, height: number): PieceSpec[] {
  return Array.from({ length: PIECES }, (_, i) => ({
    startX: Math.random() * width,
    fall: height + 120,
    sway: 24 + Math.random() * 40,
    swayFreq: 1.5 + Math.random() * 2,
    spin: (Math.random() > 0.5 ? 1 : -1) * (240 + Math.random() * 360),
    size: 8 + Math.random() * 7,
    color: COLORS[i % COLORS.length],
    round: Math.random() > 0.5,
    delay: Math.random() * 250,
  }));
}

function Piece({ spec, t }: { spec: PieceSpec; t: SharedValue<number> }) {
  const style = useAnimatedStyle(() => {
    const p = Math.max(0, Math.min(1, t.value));
    const y = -40 + spec.fall * p;
    const x = Math.sin(p * spec.swayFreq * Math.PI * 2) * spec.sway;
    const opacity = p < 0.82 ? 1 : Math.max(0, 1 - (p - 0.82) / 0.18);
    return {
      opacity,
      transform: [{ translateY: y }, { translateX: x }, { rotateZ: `${spec.spin * p}deg` }],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: spec.startX,
          top: 0,
          width: spec.size,
          height: spec.size * (spec.round ? 1 : 1.6),
          backgroundColor: spec.color,
          borderRadius: spec.round ? spec.size : 2,
        },
        style,
      ]}
    />
  );
}

export function Confetti({ visible, onDone }: { visible: boolean; onDone?: () => void }) {
  const { width, height } = Dimensions.get('window');
  const pieces = useMemo(() => buildPieces(width, height), [width, height]);
  const t = useSharedValue(0);

  useEffect(() => {
    if (!visible) return;
    t.value = 0;
    t.value = withTiming(1, { duration: DURATION, easing: Easing.linear }, (finished) => {
      'worklet';
      if (finished && onDone) scheduleOnRN(onDone);
    });
  }, [visible, t, onDone]);

  if (!visible) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((spec, i) => (
        <Piece key={i} spec={spec} t={t} />
      ))}
    </View>
  );
}
