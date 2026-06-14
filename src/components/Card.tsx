/** A lifted surface tile. Elevation via warmth + soft shadow, never hard borders. */
import React from 'react';
import { type StyleProp, View, type ViewProps, type ViewStyle } from 'react-native';

import { palette } from '@/theme/colors';
import { radius, shadow, spacing } from '@/theme/tokens';

interface CardProps extends ViewProps {
  padding?: number;
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Card({ padding = spacing.xl, elevated = true, style, children, ...rest }: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: palette.cloud,
          borderRadius: radius.card,
          padding,
        },
        elevated ? shadow.card : null,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
