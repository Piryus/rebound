/**
 * A small, cohesive rounded-stroke icon set drawn with react-native-svg.
 * One 24×24 grid, 2px strokes, round caps/joins — the "Lucide/Phosphor rounded"
 * language, hand-rolled so we don't ship a whole icon font.
 */
import React from 'react';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';

import { palette } from '@/theme/colors';

export type IconName =
  | 'sun'
  | 'calendar'
  | 'trend'
  | 'sliders'
  | 'chevronLeft'
  | 'chevronRight'
  | 'check'
  | 'edit'
  | 'bell'
  | 'download'
  | 'trash'
  | 'close'
  | 'plus';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 24, color = palette.ink, strokeWidth = 2 }: IconProps) {
  const common = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none' as const,
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'sun' && (
        <>
          <Circle cx={12} cy={12} r={5} {...common} />
          <Line x1={12} y1={1} x2={12} y2={3} {...common} />
          <Line x1={12} y1={21} x2={12} y2={23} {...common} />
          <Line x1={4.22} y1={4.22} x2={5.64} y2={5.64} {...common} />
          <Line x1={18.36} y1={18.36} x2={19.78} y2={19.78} {...common} />
          <Line x1={1} y1={12} x2={3} y2={12} {...common} />
          <Line x1={21} y1={12} x2={23} y2={12} {...common} />
          <Line x1={4.22} y1={19.78} x2={5.64} y2={18.36} {...common} />
          <Line x1={18.36} y1={5.64} x2={19.78} y2={4.22} {...common} />
        </>
      )}

      {name === 'calendar' && (
        <>
          <Rect x={3} y={4} width={18} height={18} rx={3} {...common} />
          <Line x1={16} y1={2} x2={16} y2={6} {...common} />
          <Line x1={8} y1={2} x2={8} y2={6} {...common} />
          <Line x1={3} y1={10} x2={21} y2={10} {...common} />
        </>
      )}

      {name === 'trend' && (
        <>
          <Polyline points="23 6 13.5 15.5 8.5 10.5 1 18" {...common} />
          <Polyline points="17 6 23 6 23 12" {...common} />
        </>
      )}

      {name === 'sliders' && (
        <>
          <Line x1={4} y1={21} x2={4} y2={14} {...common} />
          <Line x1={4} y1={10} x2={4} y2={3} {...common} />
          <Line x1={12} y1={21} x2={12} y2={12} {...common} />
          <Line x1={12} y1={8} x2={12} y2={3} {...common} />
          <Line x1={20} y1={21} x2={20} y2={16} {...common} />
          <Line x1={20} y1={12} x2={20} y2={3} {...common} />
          <Line x1={1} y1={14} x2={7} y2={14} {...common} />
          <Line x1={9} y1={8} x2={15} y2={8} {...common} />
          <Line x1={17} y1={16} x2={23} y2={16} {...common} />
        </>
      )}

      {name === 'chevronLeft' && <Polyline points="15 18 9 12 15 6" {...common} />}
      {name === 'chevronRight' && <Polyline points="9 18 15 12 9 6" {...common} />}
      {name === 'check' && <Polyline points="20 6 9 17 4 12" {...common} />}

      {name === 'edit' && (
        <Path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" {...common} />
      )}

      {name === 'bell' && (
        <>
          <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" {...common} />
          <Path d="M13.73 21a2 2 0 0 1-3.46 0" {...common} />
        </>
      )}

      {name === 'download' && (
        <>
          <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" {...common} />
          <Polyline points="7 10 12 15 17 10" {...common} />
          <Line x1={12} y1={15} x2={12} y2={3} {...common} />
        </>
      )}

      {name === 'trash' && (
        <>
          <Polyline points="3 6 5 6 21 6" {...common} />
          <Path
            d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
            {...common}
          />
          <Line x1={10} y1={11} x2={10} y2={17} {...common} />
          <Line x1={14} y1={11} x2={14} y2={17} {...common} />
        </>
      )}

      {name === 'close' && (
        <>
          <Line x1={18} y1={6} x2={6} y2={18} {...common} />
          <Line x1={6} y1={6} x2={18} y2={18} {...common} />
        </>
      )}

      {name === 'plus' && (
        <>
          <Line x1={12} y1={5} x2={12} y2={19} {...common} />
          <Line x1={5} y1={12} x2={19} y2={12} {...common} />
        </>
      )}
    </Svg>
  );
}
