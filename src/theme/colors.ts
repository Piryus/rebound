/**
 * Forced light theme. Colors are hardcoded and never derived from
 * useColorScheme() — a device in dark mode must still render the light identity.
 *
 * Art direction: "A sunrise you can hold." Warm Paper Dawn canvas, color does the
 * emotional work, elevation comes from warmth + lift rather than hard borders.
 */

export const palette = {
  paperDawn: '#FBF7F0', // primary canvas (warm off-white, never pure white)
  cloud: '#FFFFFF', // card / tile surfaces, lifted off the warm ground
  ink: '#2E2A3A', // primary text / high-contrast UI (soft deep plum, not black)
  mist: '#8A8597', // secondary text, captions, axis labels
  coral: '#FF6F61', // primary accent: brand, primary buttons, today-ring, pain
  mint: '#19C39A', // celebration / success: best days, positive deltas, streaks
  periwinkle: '#6C8BFF', // morale / mood accent + info
  honey: '#FFC24B', // warm mid accent: reminders, small sparkles
  hairline: '#EDE6DB', // borders, dividers, empty heatmap cells, inactive tracks
} as const;

/** Slightly darkened ink for low-emphasis-but-still-readable secondary text. */
export const inkSoft = '#56506A';

/**
 * Continuous 7-stop heat ramp for the Body & Spirit calendar.
 * Indexed by the 0–100 composite; worst (dusk) → best (spring). Days with no
 * entry use `palette.hairline`.
 */
export const SCORE_RAMP = [
  '#E8927C', // ~0   worst — warm dusk
  '#F2A98C', // ~17
  '#F6C79B', // ~33
  '#F4E0A6', // ~50  neutral — soft sand
  '#CFE6A0', // ~67
  '#8FD9A8', // ~83
  '#19C39A', // ~100 best — spring mint
] as const;

type RGB = { r: number; g: number; b: number };

function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }: RGB): string {
  const c = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

/**
 * Map a 0–100 composite score to a color along the SCORE_RAMP, interpolating
 * smoothly in RGB between the two nearest stops.
 */
export function scoreToColor(score: number): string {
  const s = clamp(score, 0, 100);
  const segments = SCORE_RAMP.length - 1;
  const pos = (s / 100) * segments;
  const i = Math.min(Math.floor(pos), segments - 1);
  const t = pos - i;
  const a = hexToRgb(SCORE_RAMP[i]);
  const b = hexToRgb(SCORE_RAMP[i + 1]);
  return rgbToHex({
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  });
}

/** Convenience: map a single 0–10 dimension value onto the same ramp. */
export function scoreToColor10(value: number): string {
  return scoreToColor(clamp(value, 0, 10) * 10);
}

/** Apply an alpha (0–1) to a hex color, returning an 8-digit hex string. */
export function withAlpha(hex: string, alpha: number): string {
  const a = Math.round(clamp(alpha, 0, 1) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
}

export const emptyCellColor = palette.hairline;
