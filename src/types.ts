/** The six daily dimensions, injury-agnostic. */
export type DimensionKey =
  | 'pain'
  | 'mobility'
  | 'confidence'
  | 'fear'
  | 'mood'
  | 'sleep';

/** A raw daily rating per dimension, each 0–10. */
export type Scores = Record<DimensionKey, number>;

/** One persisted day. `date` is the local 'YYYY-MM-DD' and the primary key. */
export interface Entry {
  date: string;
  scores: Scores;
  note: string;
  /** Derived 0–100 composite, stored for fast heat coloring. */
  score: number;
  createdAt: number;
  updatedAt: number;
}
