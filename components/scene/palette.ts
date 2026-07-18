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

// ── Sky cycle ───────────────────────────────────────────────────────────────
// Scroll progress (0 = top/hero, 1 = bottom/contact) drives a continuous
// day → sunset → night → sunrise sky. The sky COLOURS are keyframed below (same
// stops/timing as before — the contract with the page's day/night text, and
// what HeaderNightWatch reads via sampleSky(p).top). The sun and moon are no
// longer keyframed discs: they are two independent bodies on analytic
// horizon-to-horizon arcs (see celestial()), so the sun sets west as the moon
// rises east instead of one disc morphing in place.
export interface SkyStop {
  p: number; // scroll progress at which this stop applies
  top: readonly [number, number, number]; // sky color at the top of the screen
  horizon: readonly [number, number, number]; // sky color at the horizon
}

export const SKY_STOPS: SkyStop[] = [
  // morning — soft warm ivory sky (no cool-blue cast), pale-gold horizon
  { p: 0.0, top: [0.93, 0.91, 0.86], horizon: [0.98, 0.93, 0.79] },
  // sunset — warm cream sky over services/work
  { p: 0.38, top: [0.95, 0.86, 0.74], horizon: [0.99, 0.78, 0.55] },
  // night — deep blue-green dusk (process/proof act)
  { p: 0.56, top: [0.02, 0.05, 0.06], horizon: [0.05, 0.12, 0.12] },
  { p: 0.72, top: [0.02, 0.05, 0.06], horizon: [0.05, 0.12, 0.12] },
  // pre-dawn — light dusky blue; dark ink copy still passes AA (pricing)
  { p: 0.87, top: [0.8, 0.82, 0.88], horizon: [0.93, 0.82, 0.8] },
  // sunrise — hopeful warm dawn; "book an appointment" lands at daybreak (contact)
  { p: 1.0, top: [0.95, 0.86, 0.72], horizon: [1.0, 0.88, 0.66] },
];

export interface SampledSky {
  top: [number, number, number];
  horizon: [number, number, number];
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const lum = (c: readonly [number, number, number]) =>
  0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];

// Interpolate the sky colours between the two stops that bracket progress p.
export function sampleSky(p: number): SampledSky {
  const stops = SKY_STOPS;
  const pp = clamp(p, 0, 1);
  let i = 0;
  while (i < stops.length - 1 && stops[i + 1].p <= pp) i++;
  const a = stops[i];
  const b = stops[Math.min(i + 1, stops.length - 1)];
  const span = b.p - a.p;
  const t = span > 1e-6 ? (pp - a.p) / span : 0;
  return {
    top: [lerp(a.top[0], b.top[0], t), lerp(a.top[1], b.top[1], t), lerp(a.top[2], b.top[2], t)],
    horizon: [lerp(a.horizon[0], b.horizon[0], t), lerp(a.horizon[1], b.horizon[1], t), lerp(a.horizon[2], b.horizon[2], t)],
  };
}

// ── The celestial model ─────────────────────────────────────────────────────
// Each body follows an ellipse arc: x = 0.5 + cos(th)*RX, y = HOR + sin(th)*RY.
// th rises from ~0 (east/right horizon) through π/2 (zenith) to π (west/left
// horizon); visibility comes from altitude sin(th). The sun sets west as the
// moon rises east, so they trade places at the horizon — no in-place morph.
const HOR = 0.14, RX = 0.46, RY_SUN = 0.62, RY_MOON = 0.6;

export interface Celestial {
  sunPos: [number, number];
  sunColor: [number, number, number];
  sunRadius: number;
  sunGlow: number;
  sunVis: number;
  moonPos: [number, number];
  moonRadius: number;
  moonGlow: number;
  moonVis: number;
  moonPhase: number;
  stars: number;
}

export function celestial(p: number): Celestial {
  // sun: day arc (already up at the top of the page), then a second dawn rise
  // for the contact section
  let th = 0;
  let hasSun = true;
  if (p <= 0.38) th = lerp(1.09, 2.78, p / 0.38); // morning -> low sunset
  else if (p <= 0.58) th = lerp(2.78, Math.PI + 0.22, (p - 0.38) / 0.2); // sets below west
  else if (p >= 0.86) th = lerp(-0.12, 0.34, (p - 0.86) / 0.14); // dawn rise, east
  else hasSun = false;

  let sunVis = 0;
  let sunPos: [number, number] = [0.5, -1];
  let sunColor: [number, number, number] = [1, 0.9, 0.7];
  let sunRadius = 0.1;
  let sunGlow = 0.12;
  if (hasSun) {
    const alt = Math.sin(th);
    sunPos = [0.5 + Math.cos(th) * RX, HOR + alt * RY_SUN];
    sunVis = smooth(-0.05, 0.1, alt);
    const red = 1 - smooth(0.1, 0.62, Math.max(alt, 0)); // reddening near the horizon
    sunColor = [1.0, lerp(0.97, 0.52, red), lerp(0.87, 0.24, red)];
    sunRadius = 0.105 * (1 + 0.45 * red);
    sunGlow = 0.115 * (1 + 0.9 * red);
  }

  // moon: owns the night span; rises east as the sun sets west
  const mt = (p - 0.5) / 0.38;
  let moonVis = 0;
  let moonPos: [number, number] = [0.5, -1];
  let moonPhase = 1.2;
  if (mt > -0.02 && mt < 1.05) {
    const mth = lerp(-0.1, Math.PI + 0.1, clamp(mt, 0, 1));
    const malt = Math.sin(mth);
    moonPos = [0.5 + Math.cos(mth) * RX, HOR + malt * RY_MOON];
    moonVis = smooth(-0.04, 0.1, malt) * smooth(0.5, 0.25, lum(sampleSky(p).top));
    moonPhase = lerp(2.0, 0.5, smooth(0.5, 0.88, p)); // crescent -> gibbous across the night
  }

  const stars = smooth(0.32, 0.1, lum(sampleSky(p).top)); // in only when the sky is dark
  return { sunPos, sunColor, sunRadius, sunGlow, sunVis, moonPos, moonRadius: 0.075, moonGlow: 0.1, moonVis, moonPhase, stars };
}
