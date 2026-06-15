/** Standard screen frame: warm canvas, safe-area top, generous padding, keyboard-aware. */
import React, { forwardRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useKeyboardHeight } from '@/lib/useKeyboardScroll';
import { palette } from '@/theme/colors';
import { spacing } from '@/theme/tokens';

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}

/** Forwards a ref to the inner ScrollView so screens can scroll inputs into view. */
export const Screen = forwardRef<ScrollView, ScreenProps>(function Screen(
  { children, scroll = true, contentStyle },
  ref,
) {
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const padding: ViewStyle = {
    paddingTop: insets.top + spacing.sm,
    paddingHorizontal: spacing.xl,
    // Extra room equal to the keyboard so the last field can scroll above it
    // (Android edge-to-edge doesn't resize the window for the keyboard).
    paddingBottom: spacing.huge * 2.4 + keyboardHeight,
  };

  if (!scroll) {
    return <View style={[styles.root, padding, contentStyle]}>{children}</View>;
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        ref={ref}
        style={styles.root}
        contentContainerStyle={[padding, contentStyle]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.paperDawn,
  },
});
