/**
 * The Rebound mark: an upward arc (the bounce / a sunrise dome) with a rising
 * dot at its apex. Used as the logo, the empty-state motif, and accents.
 */
import React from 'react';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { palette } from '@/theme/colors';

interface BrandMarkProps {
  size?: number;
  color?: string;
  /** Draw the subtle ground line under the arc. */
  ground?: boolean;
}

export function BrandMark({ size = 48, color = palette.coral, ground = true }: BrandMarkProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      {ground && (
        <Line
          x1={6}
          y1={33}
          x2={42}
          y2={33}
          stroke={color}
          strokeOpacity={0.22}
          strokeWidth={3.5}
          strokeLinecap="round"
        />
      )}
      <Path
        d="M7 33 A 17 17 0 0 1 41 33"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        fill="none"
      />
      <Circle cx={24} cy={16} r={4.5} fill={color} />
    </Svg>
  );
}
