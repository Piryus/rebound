/**
 * The six daily dimensions. Evidence-informed by injury & rehabilitation
 * psychology: pain intensity, functional mobility, self-efficacy (confidence),
 * kinesiophobia (fear of re-injury), mood/affect, and sleep quality.
 *
 * Negative-polarity items (pain, fear) are inverted before compositing so that
 * for every dimension, higher always means better. Copy is injury-agnostic.
 */
import type { DimensionKey, Scores } from '@/types';

export type Polarity = 'positive' | 'negative';

export interface Dimension {
  key: DimensionKey;
  label: string;
  /** The question shown in the daily check-in. */
  prompt: string;
  lowLabel: string;
  highLabel: string;
  /** Relative weight in the composite. Weights sum to 1.0. */
  weight: number;
  polarity: Polarity;
  /** Vivid, distinct accent used for this dimension's slider fill. */
  accent: string;
  /** Icon name from the in-app SVG icon set. */
  icon: 'pain' | 'mobility' | 'confidence' | 'fear' | 'mood' | 'sleep';
}

export const DIMENSIONS: readonly Dimension[] = [
  {
    key: 'pain',
    label: 'Pain',
    prompt: 'How intense was your pain today, on average?',
    lowLabel: 'No pain',
    highLabel: 'Worst imaginable',
    weight: 0.2,
    polarity: 'negative',
    accent: '#FF6F61', // coral
    icon: 'pain',
  },
  {
    key: 'mobility',
    label: 'Mobility',
    prompt: 'How well could your body do what you needed — walking, stairs, bending, lifting?',
    lowLabel: 'Fully limited',
    highLabel: 'Moved freely',
    weight: 0.2,
    polarity: 'positive',
    accent: '#19C39A', // mint
    icon: 'mobility',
  },
  {
    key: 'confidence',
    label: 'Confidence',
    prompt: 'How much did you trust the injured area to hold up today?',
    lowLabel: "Didn't trust it",
    highLabel: 'Fully confident',
    weight: 0.15,
    polarity: 'positive',
    accent: '#F4A93C', // amber
    icon: 'confidence',
  },
  {
    key: 'fear',
    label: 'Fear of movement',
    prompt: 'How much did fear of re-injury make you hold back or avoid moving?',
    lowLabel: 'No fear',
    highLabel: 'Avoided a lot',
    weight: 0.15,
    polarity: 'negative',
    accent: '#9B7EDC', // violet
    icon: 'fear',
  },
  {
    key: 'mood',
    label: 'Mood',
    prompt: 'Overall, how was your mood and morale today?',
    lowLabel: 'Low / hopeless',
    highLabel: 'Upbeat / motivated',
    weight: 0.2,
    polarity: 'positive',
    accent: '#6C8BFF', // periwinkle
    icon: 'mood',
  },
  {
    key: 'sleep',
    label: 'Sleep',
    prompt: 'How well did you sleep last night?',
    lowLabel: 'Barely slept',
    highLabel: 'Deep & restful',
    weight: 0.1,
    polarity: 'positive',
    accent: '#2FB6C4', // teal
    icon: 'sleep',
  },
] as const;

export const DIMENSION_BY_KEY: Record<DimensionKey, Dimension> = DIMENSIONS.reduce(
  (acc, d) => {
    acc[d.key] = d;
    return acc;
  },
  {} as Record<DimensionKey, Dimension>,
);

/** A neutral starting point (5/10 everywhere) for a fresh check-in. */
export function defaultScores(): Scores {
  return { pain: 5, mobility: 5, confidence: 5, fear: 5, mood: 5, sleep: 5 };
}

/**
 * Short, value-specific descriptors that help the user pick the score that
 * matches how they actually feel. `describe(key, value)` returns the phrase for
 * the current 0–10 value (first band where value <= upTo).
 */
type Descriptor = { upTo: number; text: string };

const DESCRIPTORS: Record<DimensionKey, Descriptor[]> = {
  pain: [
    { upTo: 0, text: 'No pain at all' },
    { upTo: 2, text: 'Barely there' },
    { upTo: 4, text: 'Naggy, but manageable' },
    { upTo: 6, text: 'A steady, real ache' },
    { upTo: 8, text: 'Hard to ignore' },
    { upTo: 10, text: "Severe — it's all I feel" },
  ],
  mobility: [
    { upTo: 0, text: 'Could barely move it' },
    { upTo: 2, text: 'Very stiff and limited' },
    { upTo: 4, text: 'Cautious, careful movements' },
    { upTo: 6, text: 'Fine for everyday things' },
    { upTo: 8, text: 'Moving pretty freely' },
    { upTo: 10, text: 'Full, easy range' },
  ],
  confidence: [
    { upTo: 0, text: "Didn't trust it at all" },
    { upTo: 2, text: 'Bracing for it to give' },
    { upTo: 4, text: 'Wary, testing it gently' },
    { upTo: 6, text: 'Cautiously trusting it' },
    { upTo: 8, text: 'Mostly confident' },
    { upTo: 10, text: 'Fully trust it' },
  ],
  fear: [
    { upTo: 0, text: 'No hesitation at all' },
    { upTo: 2, text: 'Barely thought about it' },
    { upTo: 4, text: 'Held back here and there' },
    { upTo: 6, text: 'Avoided a few things' },
    { upTo: 8, text: 'Skipped a lot, just in case' },
    { upTo: 10, text: 'Fear ran the day' },
  ],
  mood: [
    { upTo: 0, text: 'Really low' },
    { upTo: 2, text: 'Pretty down' },
    { upTo: 4, text: 'Flat, a bit discouraged' },
    { upTo: 6, text: 'Even — okay overall' },
    { upTo: 8, text: 'Good, fairly upbeat' },
    { upTo: 10, text: 'Genuinely great' },
  ],
  sleep: [
    { upTo: 0, text: 'Barely slept' },
    { upTo: 2, text: 'Restless, broken sleep' },
    { upTo: 4, text: 'Light and patchy' },
    { upTo: 6, text: 'Decent enough' },
    { upTo: 8, text: 'Solid and restful' },
    { upTo: 10, text: 'Deep, fully rested' },
  ],
};

export function describe(key: DimensionKey, value: number): string {
  const list = DESCRIPTORS[key];
  return (list.find((d) => value <= d.upTo) ?? list[list.length - 1]).text;
}
