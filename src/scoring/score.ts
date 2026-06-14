/**
 * The Body & Spirit Score: a single 0–100 composite of the six daily ratings.
 *
 * Each dimension is normalised so higher = better (negative items inverted),
 * multiplied by its weight (weights sum to 1.0), summed, and scaled ×10.
 * Bands are framed supportively — a bad day is data, not failure.
 */
import type { Scores } from '@/types';

import { DIMENSIONS } from './dimensions';

export const SCORE_NAME = 'Body & Spirit Score';

export function computeScore(scores: Scores): number {
  let sum = 0;
  for (const dim of DIMENSIONS) {
    const raw = scores[dim.key];
    const adjusted = dim.polarity === 'negative' ? 10 - raw : raw;
    sum += dim.weight * adjusted;
  }
  return Math.round(Math.max(0, Math.min(100, sum * 10)));
}

export interface Band {
  min: number;
  max: number;
  label: string;
  /** Short companion line shown alongside the score. */
  message: string;
  /** Band swatch color (aligned to the heat ramp). */
  color: string;
}

export const BANDS: readonly Band[] = [
  {
    min: 0,
    max: 24,
    label: 'Tough day',
    message:
      'Storms pass. This reflects real difficulty, not weakness — protect the area, rest gently, and treat today as information. One rough day does not undo your progress.',
    color: '#E8927C',
  },
  {
    min: 25,
    max: 44,
    label: 'Struggling',
    message:
      'Things feel heavy in body and mind. Keep movements small, prioritise sleep tonight, and be kind to yourself. Notice what made today harder.',
    color: '#F6C79B',
  },
  {
    min: 45,
    max: 64,
    label: 'Holding steady',
    message:
      "You're in the workable middle. Stick to your steady baseline rather than over-pushing or shutting down — consistency is what builds recovery.",
    color: '#F4E0A6',
  },
  {
    min: 65,
    max: 84,
    label: 'Good day',
    message:
      'Body and mood are cooperating. A great day for planned movement and gentle loading — bank the win, and resist overdoing it.',
    color: '#8FD9A8',
  },
  {
    min: 85,
    max: 100,
    label: 'Thriving',
    message:
      'What a day — strong on every front. Enjoy it, stay confident, and keep pacing so a great day stays great tomorrow.',
    color: '#19C39A',
  },
] as const;

export function getBand(score: number): Band {
  const s = Math.max(0, Math.min(100, score));
  return BANDS.find((b) => s >= b.min && s <= b.max) ?? BANDS[2];
}

/** Score at/above which a save triggers the best-day celebration. */
export const CELEBRATION_THRESHOLD = 85;
