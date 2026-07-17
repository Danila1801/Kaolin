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

// ── Sky cycle (Stage 2) ────────────────────────────────────────────────────
// Scroll progress (0 = top/hero, 1 = bottom/contact) drives a continuous
// day → sunset → night → sunrise sky. Every stop is a light-enough sky behind
// the dark ink copy (morning / sunset / pre-dawn / sunrise) EXCEPT the night
// stop, which pairs with the [data-scene-dark] act (light text on dark). This
// keeps WCAG AA text through all four phases without hard scrims.
export interface SkyStop {
  p: number; // scroll progress at which this stop applies
  top: readonly [number, number, number]; // sky color at the top of the screen
  horizon: readonly [number, number, number]; // sky color at the horizon
  sun: readonly [number, number]; // disc centre in uv (0 = bottom, 1 = top)
  sunColor: readonly [number, number, number];
  sunRadius: number; // disc radius in uv units
  sunGlow: number; // gaussian glow sigma in uv units
  moon: number; // 0 = sun, 1 = moon
}

export const SKY_STOPS: SkyStop[] = [
  // morning — soft warm ivory sky (no cool-blue cast), pale-gold horizon
  { p: 0.0, top: [0.93, 0.91, 0.86], horizon: [0.98, 0.93, 0.79],
    sun: [0.72, 0.74], sunColor: [1.0, 0.96, 0.82], sunRadius: 0.13, sunGlow: 0.16, moon: 0 },
  // sunset — warm cream sky, low amber sun over services/work
  { p: 0.38, top: [0.95, 0.86, 0.74], horizon: [0.99, 0.78, 0.55],
    sun: [0.5, 0.42], sunColor: [1.0, 0.66, 0.36], sunRadius: 0.15, sunGlow: 0.18, moon: 0 },
  // night — deep blue-green dusk; the sun becomes a cool moon (process/proof act)
  { p: 0.56, top: [0.02, 0.05, 0.06], horizon: [0.05, 0.12, 0.12],
    sun: [0.5, 0.8], sunColor: [0.82, 0.88, 0.86], sunRadius: 0.08, sunGlow: 0.1, moon: 1 },
  { p: 0.72, top: [0.02, 0.05, 0.06], horizon: [0.05, 0.12, 0.12],
    sun: [0.5, 0.8], sunColor: [0.82, 0.88, 0.86], sunRadius: 0.08, sunGlow: 0.1, moon: 1 },
  // pre-dawn — light dusky blue; dark ink copy still passes AA (pricing)
  { p: 0.87, top: [0.8, 0.82, 0.88], horizon: [0.93, 0.82, 0.8],
    sun: [0.5, 0.4], sunColor: [0.85, 0.75, 0.72], sunRadius: 0.06, sunGlow: 0.06, moon: 0 },
  // sunrise — hopeful warm dawn; "book an appointment" lands at daybreak (contact)
  { p: 1.0, top: [0.95, 0.86, 0.72], horizon: [1.0, 0.88, 0.66],
    sun: [0.42, 0.42], sunColor: [1.0, 0.74, 0.46], sunRadius: 0.14, sunGlow: 0.17, moon: 0 },
];

export interface SampledSky {
  top: [number, number, number];
  horizon: [number, number, number];
  sun: [number, number];
  sunColor: [number, number, number];
  sunRadius: number;
  sunGlow: number;
  moon: number;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Interpolate the sky between the two stops that bracket scroll progress p.
export function sampleSky(p: number): SampledSky {
  const stops = SKY_STOPS;
  const pp = Math.min(Math.max(p, 0), 1);
  let i = 0;
  while (i < stops.length - 1 && stops[i + 1].p <= pp) i++;
  const a = stops[i];
  const b = stops[Math.min(i + 1, stops.length - 1)];
  const span = b.p - a.p;
  const t = span > 1e-6 ? (pp - a.p) / span : 0;
  return {
    top: [lerp(a.top[0], b.top[0], t), lerp(a.top[1], b.top[1], t), lerp(a.top[2], b.top[2], t)],
    horizon: [lerp(a.horizon[0], b.horizon[0], t), lerp(a.horizon[1], b.horizon[1], t), lerp(a.horizon[2], b.horizon[2], t)],
    sun: [lerp(a.sun[0], b.sun[0], t), lerp(a.sun[1], b.sun[1], t)],
    sunColor: [lerp(a.sunColor[0], b.sunColor[0], t), lerp(a.sunColor[1], b.sunColor[1], t), lerp(a.sunColor[2], b.sunColor[2], t)],
    sunRadius: lerp(a.sunRadius, b.sunRadius, t),
    sunGlow: lerp(a.sunGlow, b.sunGlow, t),
    moon: lerp(a.moon, b.moon, t),
  };
}
