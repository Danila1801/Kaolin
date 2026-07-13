// Scene-space constants for the botanical field, shared by every layer.
// Colors are float triplets (0..1) fed straight into raw shaders — three.js
// color management never touches them, so they render exactly as written
// (same numbers the raw-WebGL version used).

export const IVORY: readonly [number, number, number] = [0.976, 0.965, 0.941];
export const NIGHT: readonly [number, number, number] = [0.022, 0.045, 0.037]; // deep pine-black
export const SAGE: readonly [number, number, number] = [0.424, 0.471, 0.267]; // #6C7844
export const FOREST: readonly [number, number, number] = [0.247, 0.306, 0.286]; // #3F4E49
export const SAND: readonly [number, number, number] = [0.784, 0.663, 0.416]; // #C8A96A muted gold
export const FOG: readonly [number, number, number] = [0.831, 0.863, 0.788]; // #D4DCC9 warm-sage fog

// World geometry: the field is a SPAN-deep strip that wraps endlessly as the
// camera travels TRAVEL units over one full page scroll.
export const SPAN = 64.0;
export const TRAVEL = 44.0;

// Adaptive resolution ladder — drop render resolution before dropping frames.
export const DPR_LADDER = [0.75, 1.0, 1.35, 1.75] as const;

export function initialDprLevel(): number {
  const want = Math.min(window.devicePixelRatio || 1, 1.75);
  let level = DPR_LADDER.length - 1;
  while (level > 0 && DPR_LADDER[level] > want + 0.01) level--;
  return level;
}

export const DENSITY = { airy: 0.55, standard: 1.0, lush: 1.6 } as const;
export type Density = keyof typeof DENSITY;
