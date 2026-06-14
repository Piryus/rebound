/** Primary / secondary / celebration buttons. Min height 52, springy press. */
import React from 'react';
import { ActivityIndicator, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { PressableScale } from '@/components/PressableScale';
import { Txt } from '@/components/Txt';
import { palette } from '@/theme/colors';
import { fonts, radius, shadow, spacing, type } from '@/theme/tokens';

type Variant = 'primary' | 'secondary' | 'celebration';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const isFilled = variant === 'primary' || variant === 'celebration';
  const bg =
    variant === 'primary' ? palette.coral : variant === 'celebration' ? palette.mint : palette.cloud;
  const fg = isFilled ? palette.cloud : palette.ink;
  const glow = variant === 'celebration' ? shadow.mint : variant === 'primary' ? shadow.coral : null;

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        { backgroundColor: bg, opacity: disabled ? 0.5 : 1 },
        variant === 'secondary' && styles.secondaryBorder,
        glow,
        style as ViewStyle,
      ]}
    >
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator color={fg} />
        ) : (
          <>
            {icon && <Icon name={icon} size={20} color={fg} strokeWidth={2.4} />}
            <Txt style={[styles.label, { color: fg }]}>{label}</Txt>
          </>
        )}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 54,
    borderRadius: radius.button,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBorder: {
    borderWidth: 1,
    borderColor: palette.hairline,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: type.body,
    letterSpacing: 0.2,
  },
});
