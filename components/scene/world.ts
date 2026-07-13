// The botanical field as plain imperative three.js — the direct descendant of
// the old <botanical-scene> web component (lib/botanical-scene.js). Everything
// stateful and mutable lives here, in ordinary functions, deliberately outside
// any React component: React (FieldStage.tsx) only creates the world in an
// effect, ticks it once per frame, and disposes it on unmount. That split is
// what keeps the React side pure while the scene stays free to mutate GPU
// state every frame.

import * as THREE from "three";
import type { RootState } from "@react-three/fiber";
import {
  DENSITY,
  DPR_LADDER,
  FOG,
  FOREST,
  IVORY,
  NIGHT,
  SAGE,
  SAND,
  SPAN,
  TRAVEL,
  type Density,
} from "./palette";
import {
  BG_FRAG,
  BG_VERT,
  BLADE_FRAG,
  BLADE_VERT,
  SEED_FRAG,
  SEED_VERT,
} from "./shaders";

// Fixed downward camera tilt, same as the raw version.
const PITCH = -0.16;
const SEG = 6;
const SEED_COUNT = 150;

// Deterministic PRNG (mulberry32). The raw version used Math.random(); seeding
// instead means the field is byte-identical on every visit and under React
// StrictMode's double-mounting — same aesthetic, stronger invariants.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// One shared uniform store for the whole scene. Each material references the
// same `{ value }` objects, so the tick mutates a value once and every layer
// (background, blades, seeds) sees it — exactly how the raw-WebGL version
// shared uniform state across its three programs.
function createUniforms(grain: 0 | 1) {
  return {
    uTime: { value: 0 },
    uWind: { value: 0 }, // set every tick (wind prop, or 0.35 under reduced motion)
    uCamZ: { value: 4 },
    uSpan: { value: SPAN },
    uMouse: { value: new THREE.Vector3(0, 0, 0) }, // world x, z, strength
    uDark: { value: 0 },
    uGrain: { value: grain },
    uRes: { value: new THREE.Vector2(2, 2) }, // canvas size in device px
    uSizeK: { value: 12 }, // point-size scale, tracks canvas pixel height
    uBg: { value: new THREE.Vector3(...IVORY) }, // ivory→night mix, set per tick
    uSage: { value: new THREE.Vector3(...SAGE) },
    uForest: { value: new THREE.Vector3(...FOREST) },
    uSand: { value: new THREE.Vector3(...SAND) },
    uFog: { value: new THREE.Vector3(...FOG) },
  };
}
type Uniforms = ReturnType<typeof createUniforms>;

// ---------- the sky/ground wash ----------
// One fullscreen triangle drawn first each frame with depth off, so blades
// draw over it. (The raw version generated it from gl_VertexID; three.js wants
// a real position buffer, so the same clip-space corners are spelled out.)
function buildBackground(u: Uniforms) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute([-1, -1, 3, -1, -1, 3], 2));

  const mat = new THREE.RawShaderMaterial({
    glslVersion: THREE.GLSL3,
    vertexShader: BG_VERT,
    fragmentShader: BG_FRAG,
    uniforms: {
      uRes: u.uRes,
      uDark: u.uDark,
      uGrain: u.uGrain,
      uTime: u.uTime,
      uBg: u.uBg,
      uSand: u.uSand,
      uForest: u.uForest,
      uFog: u.uFog,
    },
    depthTest: false,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false; // clip-space geometry, always on screen
  mesh.renderOrder = -1; // paint the sky before everything else
  return mesh;
}

// ---------- grass blades ----------
// Instance distribution ported verbatim, including the cleared corridor where
// the headline sits (biased left, since the type is left-aligned => negative
// world x) and the shorter blades inside it: copy legibility beats density.
function buildGrass(u: Uniforms, density: Density) {
  // Base blade: the raw version drew a TRIANGLE_STRIP; three.js meshes draw
  // indexed triangles, so the same (side, t) vertices get a small index that
  // unrolls the strip — the rasterized geometry is identical.
  const strip: number[] = [];
  for (let i = 0; i <= SEG; i++) {
    const t = i / SEG;
    strip.push(-1, t, 1, t);
  }
  const index: number[] = [];
  for (let i = 0; i < SEG; i++) {
    const b = i * 2;
    index.push(b, b + 1, b + 2, b + 2, b + 1, b + 3);
  }

  const rand = mulberry32(0x516f11a); // arbitrary fixed seed — the field's "cut"
  const base = window.innerWidth < 768 ? 1300 : 2600;
  const n = Math.round(base * DENSITY[density]);
  const xz = new Float32Array(n * 2);
  const hw = new Float32Array(n * 2);
  const misc = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    let x = rand() * 2 - 1;
    x = Math.sign(x || 1) * Math.pow(Math.abs(x), 0.72) * 13;
    // keep a corridor clear where the type sits
    if (x > -7.5 && x < 3.0 && rand() < 0.88) {
      x = rand() < 0.62 ? 3.0 + rand() * 10.4 : -7.5 - rand() * 6.5;
    }
    const edge = Math.min(Math.abs(x) / 9, 1);
    let h = 0.5 + Math.pow(rand(), 1.5) * 1.5;
    h *= 0.7 + edge * 0.75;
    if (x > -8 && x < 3.4) h *= 0.42;
    xz[i * 2] = x;
    xz[i * 2 + 1] = rand() * SPAN;
    hw[i * 2] = h;
    hw[i * 2 + 1] = 0.05 + rand() * 0.055;
    misc[i * 3] = rand() * Math.PI;
    misc[i * 3 + 1] = rand();
    misc[i * 3 + 2] = rand();
  }

  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(strip, 2));
  geo.setIndex(index);
  geo.setAttribute("aXZ", new THREE.InstancedBufferAttribute(xz, 2));
  geo.setAttribute("aHW", new THREE.InstancedBufferAttribute(hw, 2));
  geo.setAttribute("aMisc", new THREE.InstancedBufferAttribute(misc, 3));
  geo.instanceCount = n;

  const mat = new THREE.RawShaderMaterial({
    glslVersion: THREE.GLSL3,
    vertexShader: BLADE_VERT,
    fragmentShader: BLADE_FRAG,
    uniforms: {
      uTime: u.uTime,
      uWind: u.uWind,
      uCamZ: u.uCamZ,
      uSpan: u.uSpan,
      uMouse: u.uMouse,
      uDark: u.uDark,
      uBg: u.uBg,
      uSage: u.uSage,
      uForest: u.uForest,
      uSand: u.uSand,
      uFog: u.uFog,
    },
    // The raw version never enabled face culling; blades twist freely.
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geo, mat);
  // Blade positions are generated in the shader (the wrap-around mod());
  // a CPU-side bounding volume would be meaningless.
  mesh.frustumCulled = false;
  mesh.renderOrder = 0;
  return mesh;
}

// ---------- drifting seeds ----------
// Soft alpha-blended points wandering on slow sine paths, wrapping through the
// same depth span as the blades. Depth-tested but not depth-written, so blades
// in front occlude them without sorting.
function buildSeeds(u: Uniforms) {
  const rand = mulberry32(0xca7f00d);
  const data = new Float32Array(SEED_COUNT * 4);
  for (let i = 0; i < SEED_COUNT; i++) {
    data[i * 4] = (rand() * 2 - 1) * 11;
    data[i * 4 + 1] = 0.15 + Math.pow(rand(), 2) * 3.2;
    data[i * 4 + 2] = rand() * SPAN;
    data[i * 4 + 3] = rand();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(data, 4));

  const mat = new THREE.RawShaderMaterial({
    glslVersion: THREE.GLSL3,
    vertexShader: SEED_VERT,
    fragmentShader: SEED_FRAG,
    uniforms: {
      uTime: u.uTime,
      uCamZ: u.uCamZ,
      uSpan: u.uSpan,
      uSizeK: u.uSizeK,
      uDark: u.uDark,
      uSand: u.uSand,
    },
    transparent: true, // normal src-alpha blending, same as the raw pass
    depthWrite: false,
  });

  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  points.renderOrder = 1;
  return points;
}

export type WorldOptions = {
  density: Density;
  grain: 0 | 1;
  initialDprLevel: number;
};

export type World = ReturnType<typeof createWorld>;

export function createWorld({ density, grain, initialDprLevel }: WorldOptions) {
  const uniforms = createUniforms(grain);
  const objects = [buildBackground(uniforms), buildGrass(uniforms, density), buildSeeds(uniforms)];

  // Mutable per-frame state, ported from the web component's fields.
  const st = {
    scroll: 0,
    dark: 0,
    ema: 16,
    dprLevel: initialDprLevel,
    lastDprChange: 0,
    kicked: 0,
    lastW: 0,
    lastH: 0,
    mouse: { cx: -1, cy: -1, s: 0, lastMove: -1e9, wx: 0, wz: 0 },
  };

  function pointerMove(clientX: number, clientY: number) {
    st.mouse.cx = clientX;
    st.mouse.cy = clientY;
    st.mouse.lastMove = performance.now();
  }

  function pointerLeave() {
    st.mouse.lastMove = -1e9;
  }

  // Per-frame conductor, ported from the raw version's _frame():
  // - page scroll → smoothed travel progress → camera position along -Z
  //   (native scroll stays untouched; the scene only *reads* it)
  // - [data-scene-dark] elements crossing the viewport middle → night fade
  // - pointer unprojected onto the ground plane → blades part nearby
  // - EMA of frame time → adaptive resolution ladder (drop DPR before frames)
  function tick(rs: RootState, delta: number, wind: number, reduced: boolean) {
    const cam = rs.camera as THREE.PerspectiveCamera;
    const now = performance.now();
    const dt = Math.min(Math.max(delta * 1000, 0), 50);

    // Portrait phones get a wider view of the field than landscape screens.
    if (rs.size.width !== st.lastW || rs.size.height !== st.lastH) {
      st.lastW = rs.size.width;
      st.lastH = rs.size.height;
      const aspect = rs.size.width / Math.max(rs.size.height, 1);
      cam.fov = (aspect < 0.8 ? 1.12 : 0.92) * (180 / Math.PI);
      cam.rotation.set(PITCH, 0, 0);
      cam.updateProjectionMatrix();
    }

    // Adaptive DPR. Skipped under reduced motion: frames are event-driven
    // there, so frame spacing says nothing about GPU load.
    if (!reduced) {
      st.ema = st.ema * 0.95 + dt * 0.05;
      if (now - st.lastDprChange > 1800) {
        if (st.ema > 26 && st.dprLevel > 0) {
          st.dprLevel--;
          st.lastDprChange = now;
          rs.setDpr(DPR_LADDER[st.dprLevel]);
        } else if (
          st.ema < 12.5 &&
          st.dprLevel < DPR_LADDER.length - 1 &&
          now - st.lastDprChange > 4500
        ) {
          st.dprLevel++;
          st.lastDprChange = now;
          rs.setDpr(DPR_LADDER[st.dprLevel]);
        }
      }
    }

    // scroll → camera target (reduced motion: no smoothing, position snaps)
    const doc = document.documentElement;
    const max = Math.max(doc.scrollHeight - window.innerHeight, 1);
    const target = Math.min(Math.max(window.scrollY / max, 0), 1);
    const k = reduced ? 1 : 1 - Math.pow(0.0018, dt / 1000);
    st.scroll += (target - st.scroll) * k;

    // dark passage detection
    const els = document.querySelectorAll("[data-scene-dark]");
    let dTarget = 0;
    const vh = window.innerHeight;
    const mid = vh * 0.5;
    for (const el of els) {
      const r = el.getBoundingClientRect();
      const into = Math.min(Math.max((mid - r.top) / (vh * 0.42), 0), 1);
      const outof = Math.min(Math.max((r.bottom - mid) / (vh * 0.42), 0), 1);
      dTarget = Math.max(dTarget, Math.min(into, outof));
    }
    st.dark += (dTarget - st.dark) * Math.min(1, (dt / 1000) * 4.5);

    const u = uniforms;
    if (!reduced) u.uTime.value += dt / 1000;
    else u.uTime.value = 2.0; // frozen mid-sway: a calm, still field

    // camera travel: deeper along -Z with gentle lateral/vertical sway
    const p = st.scroll;
    const camZ = 4 - p * TRAVEL;
    const camX = Math.sin(p * 5.1) * 0.55;
    const camY = 1.32 + Math.sin(p * 2.6) * 0.1;
    cam.position.set(camX, camY, camZ);

    // pointer → ground plane (same unprojection math as the raw version:
    // build the eye ray from NDC, rotate by the fixed pitch, intersect y=0)
    const m = st.mouse;
    let strength = 0;
    if (!reduced && now - m.lastMove < 2600 && m.cx >= 0) {
      strength = 1 - Math.min(Math.max((now - m.lastMove - 1400) / 1200, 0), 1);
      const w = Math.max(rs.size.width, 1);
      const h = Math.max(rs.size.height, 1);
      const fov = (cam.fov * Math.PI) / 180;
      const aspect = w / h;
      const ndcX = (m.cx / w) * 2 - 1;
      const ndcY = 1 - (m.cy / h) * 2;
      const th = Math.tan(fov / 2);
      const dx = ndcX * th * aspect;
      const dy = ndcY * th;
      const dz = -1;
      const cp = Math.cos(PITCH);
      const sp = Math.sin(PITCH);
      const wy = dy * cp - dz * sp;
      const wz = dy * sp + dz * cp;
      if (wy < -0.03) {
        let t = -camY / wy;
        t = Math.min(t, 46);
        m.wx = camX + dx * t;
        m.wz = camZ + wz * t;
      } else strength = 0;
    }
    m.s += (strength - m.s) * Math.min(1, (dt / 1000) * 6);

    // shared uniforms — every material sees these same objects
    u.uWind.value = reduced ? 0.35 : wind;
    u.uCamZ.value = camZ;
    u.uMouse.value.set(m.wx, m.wz, m.s);
    u.uDark.value = st.dark;
    u.uBg.value.set(
      IVORY[0] + (NIGHT[0] - IVORY[0]) * st.dark,
      IVORY[1] + (NIGHT[1] - IVORY[1]) * st.dark,
      IVORY[2] + (NIGHT[2] - IVORY[2]) * st.dark
    );
    u.uRes.value.set(rs.gl.domElement.width, rs.gl.domElement.height);
    u.uSizeK.value = rs.gl.domElement.height * 0.012;

    // Intel/ANGLE first-paint kick, ported as-is: on the second frame,
    // realloc the drawing buffer and nudge the scroll offset once (1px,
    // restored next frame) — some compositor builds keep displaying the
    // canvas's initial blank frame until a real invalidation arrives.
    if (st.kicked === 1) {
      rs.gl.setSize(rs.size.width, rs.size.height, false);
      if (window.scrollY === 0) {
        window.scrollTo({ top: 1, behavior: "instant" });
        requestAnimationFrame(() => {
          window.scrollTo({ top: 0, behavior: "instant" });
        });
      }
      rs.invalidate();
    }
    if (st.kicked < 2) st.kicked++;

    // Under reduced motion frames are demand-driven: keep repainting until
    // the night fade settles (e.g. after an anchor jump into the dark act).
    if (reduced && Math.abs(dTarget - st.dark) > 0.002) rs.invalidate();
  }

  function dispose() {
    for (const o of objects) {
      o.geometry.dispose();
      (o.material as THREE.Material).dispose();
    }
  }

  return { objects, uniforms, st, tick, pointerMove, pointerLeave, dispose };
}
