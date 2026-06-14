/**
 * A detented 0–10 slider. Tap or drag; the thumb springs between integer
 * notches with a haptic tick on each step. Filled portion tinted to the
 * dimension's accent. Built on gesture-handler + reanimated worklets.
 */
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect } from 'react';
import { type LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { Txt } from '@/components/Txt';
import { palette } from '@/theme/colors';
import { fonts, radius, shadow, spacing, spring, type } from '@/theme/tokens';

const TRACK_HEIGHT = 14;
const THUMB = 30;
const STEPS = 10;

interface ScoreSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  accent: string;
  lowLabel: string;
  highLabel: string;
}

export function ScoreSlider({
  label,
  value,
  onChange,
  accent,
  lowLabel,
  highLabel,
}: ScoreSliderProps) {
  const width = useSharedValue(0);
  const pos = useSharedValue(value);

  useEffect(() => {
    pos.value = value;
  }, [value, pos]);

  const onLayout = (e: LayoutChangeEvent) => {
    width.value = e.nativeEvent.layout.width;
  };

  const emit = useCallback(
    (v: number) => {
      Haptics.selectionAsync();
      onChange(v);
    },
    [onChange],
  );

  const setFromX = (x: number) => {
    'worklet';
    const usable = width.value - THUMB;
    if (usable <= 0) return;
    let v = Math.round(((x - THUMB / 2) / usable) * STEPS);
    if (v < 0) v = 0;
    if (v > STEPS) v = STEPS;
    if (v !== pos.value) {
      pos.value = v;
      scheduleOnRN(emit, v);
    }
  };

  const pan = Gesture.Pan()
    .minDistance(0)
    .onBegin((e) => setFromX(e.x))
    .onUpdate((e) => setFromX(e.x));

  const fillStyle = useAnimatedStyle(() => ({
    width: withSpring((pos.value / STEPS) * (width.value - THUMB) + THUMB / 2, spring.gentle),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring((pos.value / STEPS) * (width.value - THUMB), spring.gentle) }],
  }));

  return (
    <View>
      <View style={styles.header}>
        <Txt style={styles.label}>{label}</Txt>
        <View style={[styles.valueChip, { backgroundColor: accent }]}>
          <Txt style={styles.valueText}>{value}</Txt>
        </View>
      </View>

      <GestureDetector gesture={pan}>
        <View style={styles.trackArea} onLayout={onLayout} hitSlop={{ top: 18, bottom: 18 }}>
          <View style={styles.track}>
            <Animated.View style={[styles.fill, { backgroundColor: accent }, fillStyle]} />
          </View>
          <Animated.View style={[styles.thumb, thumbStyle]}>
            <View style={[styles.thumbInner, { borderColor: accent }]} />
          </Animated.View>
        </View>
      </GestureDetector>

      <View style={styles.footer}>
        <Txt variant="caption">{lowLabel}</Txt>
        <Txt variant="caption">{highLabel}</Txt>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: type.subsection,
    color: palette.ink,
  },
  valueChip: {
    minWidth: 34,
    height: 28,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  valueText: {
    fontFamily: fonts.bodyBold,
    fontSize: type.small,
    color: palette.cloud,
  },
  trackArea: {
    height: THUMB,
    justifyContent: 'center',
  },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: radius.pill,
    backgroundColor: palette.hairline,
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: radius.pill,
  },
  thumb: {
    position: 'absolute',
    left: 0,
    width: THUMB,
    height: THUMB,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbInner: {
    width: THUMB,
    height: THUMB,
    borderRadius: radius.pill,
    backgroundColor: palette.cloud,
    borderWidth: 4,
    ...shadow.soft,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
});
