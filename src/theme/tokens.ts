/**
 * Design tokens: type, spacing, radius, shadow, motion.
 * Paired on a contrast axis — Fraunces (serif display) + Inter (humanist sans).
 */
import { Platform, type TextStyle, type ViewStyle } from 'react-native';

import { palette } from './colors';

/** Exact @expo-google-fonts named weight strings (also the fontFamily values). */
export const fonts = {
  // Display — Fraunces (serif, optical)
  display: 'Fraunces_600SemiBold',
  displayMedium: 'Fraunces_500Medium',
  displayRegular: 'Fraunces_400Regular',
  displayBold: 'Fraunces_700Bold',
  displayBlack: 'Fraunces_900Black',
  // Body — Inter (humanist sans)
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
} as const;

/** The font map passed to useFonts() at the root. Imports live in the layout. */

export const type = {
  hero: 56, // the big day score
  display: 40,
  title: 28,
  section: 20,
  subsection: 17,
  body: 16,
  small: 14,
  caption: 13,
  micro: 11,
} as const;

/** 8pt base, with a couple of in-between steps for airy rhythm. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const radius = {
  cell: 8, // heatmap squircle cells
  input: 14,
  button: 16,
  card: 24,
  sheet: 28,
  pill: 999,
} as const;

/** Low / warm / diffuse elevation. Lift + warmth, never hard borders. */
export const shadow: Record<'card' | 'soft' | 'coral' | 'mint', ViewStyle> = {
  card: {
    shadowColor: palette.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
  },
  soft: {
    shadowColor: palette.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  coral: {
    shadowColor: palette.coral,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 16,
    elevation: 6,
  },
  mint: {
    shadowColor: palette.mint,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 16,
    elevation: 6,
  },
};

/** Spring config used across micro-interactions (cells bloom, score counts up). */
export const spring = {
  gentle: { damping: 18, stiffness: 180, mass: 1 },
  bouncy: { damping: 12, stiffness: 220, mass: 0.9 },
} as const;

export const timing = {
  fast: 160,
  base: 240,
  slow: 360,
} as const;

/** A couple of ready-made text styles for the most common roles. */
export const textStyles = {
  hero: {
    fontFamily: fonts.displayBlack,
    fontSize: type.hero,
    color: palette.ink,
    letterSpacing: -1.5,
  } as TextStyle,
  display: {
    fontFamily: fonts.display,
    fontSize: type.display,
    color: palette.ink,
    letterSpacing: -1,
  } as TextStyle,
  title: {
    fontFamily: fonts.display,
    fontSize: type.title,
    color: palette.ink,
    letterSpacing: -0.6,
  } as TextStyle,
  section: {
    fontFamily: fonts.displayMedium,
    fontSize: type.section,
    color: palette.ink,
    letterSpacing: -0.3,
  } as TextStyle,
  body: {
    fontFamily: fonts.body,
    fontSize: type.body,
    color: palette.ink,
    lineHeight: 23,
  } as TextStyle,
  bodyMuted: {
    fontFamily: fonts.body,
    fontSize: type.body,
    color: palette.mist,
    lineHeight: 23,
  } as TextStyle,
  caption: {
    fontFamily: fonts.bodyMedium,
    fontSize: type.caption,
    color: palette.mist,
    letterSpacing: 0.1,
  } as TextStyle,
};

export const hairlineWidth = Platform.select({ ios: 0.5, default: 1 }) ?? 1;
