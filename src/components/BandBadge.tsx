/** A small pill naming the score band, with a saturated dot for color identity. */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Txt } from '@/components/Txt';
import type { Band } from '@/scoring/score';
import { palette, withAlpha } from '@/theme/colors';
import { fonts, radius, spacing, type } from '@/theme/tokens';

export function BandBadge({ band }: { band: Band }) {
  return (
    <View style={[styles.pill, { backgroundColor: withAlpha(band.color, 0.24) }]}>
      <View style={[styles.dot, { backgroundColor: band.color }]} />
      <Txt style={styles.label}>{band.label}</Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingLeft: spacing.sm,
    paddingRight: spacing.md,
    paddingVertical: 6,
    gap: spacing.sm - 2,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: radius.pill,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: type.small,
    color: palette.ink,
    letterSpacing: 0.1,
  },
});
