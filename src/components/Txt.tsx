/** Typed text wrapper so every label uses the right font weight and color. */
import React from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';

import { textStyles } from '@/theme/tokens';

type Variant = keyof typeof textStyles;

interface TxtProps extends TextProps {
  variant?: Variant;
  color?: string;
  align?: TextStyle['textAlign'];
}

export function Txt({ variant = 'body', color, align, style, children, ...rest }: TxtProps) {
  return (
    <Text
      style={[textStyles[variant], color ? { color } : null, align ? { textAlign: align } : null, style]}
      {...rest}
    >
      {children}
    </Text>
  );
}
