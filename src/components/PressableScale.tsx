/** A Pressable that springs to 0.96 while pressed. The base tactile feel. */
import * as Haptics from 'expo-haptics';
import React from 'react';
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { spring } from '@/theme/tokens';

interface PressableScaleProps extends PressableProps {
  scaleTo?: number;
  haptic?: boolean;
  /** Stretch the animated wrapper (and the pressable) to fill its flex parent. */
  fill?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function PressableScale({
  scaleTo = 0.96,
  haptic = true,
  fill = false,
  onPressIn,
  onPressOut,
  onPress,
  style,
  children,
  ...rest
}: PressableScaleProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[animatedStyle, fill && styles.fill]}>
      <Pressable
        onPressIn={(e) => {
          scale.value = withSpring(scaleTo, spring.bouncy);
          onPressIn?.(e);
        }}
        onPressOut={(e) => {
          scale.value = withSpring(1, spring.bouncy);
          onPressOut?.(e);
        }}
        onPress={(e) => {
          if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress?.(e);
        }}
        style={[style, fill && styles.fill]}
        {...rest}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
