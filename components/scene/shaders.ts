// GLSL for the botanical field, ported verbatim from lib/botanical-scene.js
// (raw WebGL2). These run as three.js RawShaderMaterials with
// glslVersion: GLSL3, which prepends only `#version 300 es` — three injects
// nothing else, so the math (and therefore the look) is byte-for-byte the old
// scene's. Two mechanical changes from the raw version:
//   - the hand-built uVP matrix is replaced by three's standard
//     projectionMatrix/modelViewMatrix uniforms, so the R3F camera drives
//     everything (grass and, later, the cats share one world);
//   - each layer's per-vertex data is named `position` (three requires an
//     attribute of that name to size its draw calls).

// ---------- grass blades ----------
// Wind: drifting value-noise gusts + sine sway; roots (t=0) pinned, amplitude
// grows with t² toward the tip. Cursor parting pushes nearby blades away.
// The field wraps endlessly: blade z is stored as an offset inside a SPAN-deep
// window that follows the camera (the mod() below).

export const BLADE_VERT = /* glsl */ `
precision highp float;

in vec2 position;  // (side: -1|1, t: 0..1 along the blade)
in vec2 aXZ;       // world x, z-offset inside the wrapping span
in vec2 aHW;       // height, width
in vec3 aMisc;     // rotation, phase, colorRand

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform float uTime, uWind, uCamZ, uSpan;
uniform vec3 uMouse;  // world x, z, strength

out float vT; out float vFog; out float vNear; out float vCRand; out float vShade;

float hash12(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}
float vnoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 float a=hash12(i),b=hash12(i+vec2(1.,0.)),c=hash12(i+vec2(0.,1.)),d=hash12(i+vec2(1.,1.));
 return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}

void main(){
  float t = position.y;
  float tt = t*t;
  float rel = mod(aXZ.y - uCamZ, uSpan);
  vec2 base = vec2(aXZ.x, uCamZ - rel);
  float gust = vnoise(vec2(base.x*0.22, base.y*0.22 - uTime*0.32));
  float sway = sin(uTime*1.7 + aMisc.y*6.28318 + base.x*0.6 + base.y*0.45);
  float lean = ((gust-0.42)*1.35 + sway*0.34 + (hash12(vec2(aMisc.y,aMisc.z))-0.5)*0.55) * uWind;
  vec2 disp = normalize(vec2(0.85,0.42)) * (lean * tt);
  vec2 mv = base - uMouse.xy;
  float md = length(mv);
  float push = (1.0 - smoothstep(0.0, 2.5, md)) * uMouse.z;
  disp += (mv / max(md, 0.001)) * push * 1.15 * tt;
  vec2 xdir = vec2(cos(aMisc.x), sin(aMisc.x));
  vec3 pos;
  pos.xz = base + xdir * (position.x * aHW.y * (1.0 - t*0.94)) + disp;
  float b = length(disp);
  pos.y = max(t*aHW.x - b*b*0.38, 0.0);
  vT = t; vCRand = aMisc.z;
  vShade = 0.82 + 0.36*hash12(vec2(aMisc.z*7.1, aMisc.y*3.3));
  vFog = smoothstep(uSpan*0.36, uSpan*0.85, rel);
  vNear = smoothstep(1.0, 2.6, rel);
  gl_Position = projectionMatrix * (modelViewMatrix * vec4(pos, 1.0));
}
`;

export const BLADE_FRAG = /* glsl */ `
precision highp float;

in float vT; in float vFog; in float vNear; in float vCRand; in float vShade;
uniform float uDark;
uniform vec3 uBg, uSage, uForest, uSand, uFog;
out vec4 frag;

float hash12(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}

void main(){
  if (hash12(gl_FragCoord.xy) > vNear + 0.02) discard;  // dithered near-fade, no sorting needed
  vec3 c = mix(uForest, uSage, smoothstep(0.22, 0.58, vCRand));
  c = mix(c, uSand, smoothstep(0.80, 0.97, vCRand));
  c *= mix(0.52, 1.10, vT) * vShade;
  vec3 cd = mix(c*0.16, uSand*0.7, pow(vT,3.0)*0.4);  // night: silhouettes, faint sand tips
  c = mix(c, cd, uDark);
  vec3 fog = mix(uFog, uBg, uDark);  // warm sage by day; night keeps uBg (faint green)
  c = mix(c, fog, vFog);
  frag = vec4(c, 1.0);
}
`;

// ---------- background wash ----------
// A single fullscreen triangle at z=0.999: vertical gradient, a drifting
// two-octave fog band on the horizon, soft vignette, film grain.

export const BG_VERT = /* glsl */ `
precision highp float;
in vec2 position;
out vec2 vUv;
void main(){
  vUv = position * 0.5 + 0.5;          // 0..1 across the fullscreen triangle
  gl_Position = vec4(position, 0.999, 1.0);
}
`;

export const BG_FRAG = /* glsl */ `
precision highp float;

uniform vec2 uRes;
uniform float uDark, uGrain, uTime;
uniform vec3 uBg, uSand, uForest, uFog;
// sky cycle
uniform vec3 uSkyTop, uSkyHorizon, uSunColor;
uniform vec2 uSunPos;       // disc centre in uv (0 = bottom, 1 = top)
uniform float uSunRadius;   // disc radius in uv
uniform float uSunGlow;     // gaussian glow sigma
uniform float uMoon;        // 0 = sun, 1 = moon
out vec4 frag;

float hash12(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}
float vnoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 float a=hash12(i),b=hash12(i+vec2(1.,0.)),c=hash12(i+vec2(0.,1.)),d=hash12(i+vec2(1.,1.));
 return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  // Correct vertical aspect so the disc stays circular on non-square canvases.
  float aspect = uRes.x / max(uRes.y, 1.0);
  vec2 suv = vec2((uv.x - 0.5) * aspect + 0.5, uv.y);
  vec2 ssun = vec2((uSunPos.x - 0.5) * aspect + 0.5, uSunPos.y);
  float sd = distance(suv, ssun);

  // vertical gradient sky (horizon colour at the bottom, top colour above)
  vec3 sky = mix(uSkyHorizon, uSkyTop, smoothstep(0.0, 1.0, uv.y));

  // soft sun/moon glow (gaussian), then the disc itself
  float glow = exp(-(sd * sd) / (2.0 * uSunGlow * uSunGlow));
  float disc = 1.0 - smoothstep(uSunRadius * 0.92, uSunRadius, sd);
  vec3 body = uSunColor;
  // moon: cooler, with a faint clipped terminator (subtle crater shading)
  body = mix(body, body * 0.9 + vec3(0.02), uMoon);
  sky += glow * uSunColor * (0.55 + 0.45 * uMoon);
  sky = mix(sky, body, disc * (1.0 - uMoon * 0.0));
  // moon dark side — clip a soft shadow so it reads as a moon, not a bulb
  float phase = mix(0.0, 0.55, uMoon);
  float sh = smoothstep(uSunRadius * (1.0 - phase), uSunRadius * (1.0 + phase), sd);
  sky = mix(sky, mix(body, uSkyTop * 0.6, 0.7), disc * uMoon * (1.0 - sh));

  vec3 c = sky;

  // warm haze at the horizon, daylight only
  c += uSand * 0.05 * smoothstep(0.78, 0.40, uv.y) * (1.0 - uDark);
  // low forest luminescence at night
  c += uForest * 0.14 * smoothstep(0.62, 0.02, uv.y) * uDark;
  // drifting fog band, warm sage by day / faint forest-green at night
  float fbm = vnoise(vec2(uv.x*3.0 + uTime*0.030, uv.y*7.0 - uTime*0.011));
  fbm = fbm*0.62 + 0.38*vnoise(vec2(uv.x*7.5 - uTime*0.018, uv.y*14.0 + uTime*0.007));
  float band = smoothstep(0.28, 0.54, uv.y) * smoothstep(0.99, 0.62, uv.y);
  c = mix(c, uFog, band * fbm * 0.60 * (1.0 - uDark));
  c += uForest * band * fbm * 0.12 * uDark;

  float d = distance(uv, vec2(0.5, 0.44));
  c *= 1.0 - 0.09 * smoothstep(0.35, 0.95, d);
  c += (hash12(gl_FragCoord.xy) - 0.5) * 0.014 * uGrain;
  frag = vec4(c, 1.0);
}
`;

// ---------- drifting seeds ----------
// Soft points that wander on sine paths and wrap with the same span as the
// blades. They brighten at night (sand-lit motes).

export const SEED_VERT = /* glsl */ `
precision highp float;

in vec4 position;  // x, y, z-offset, rand

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform float uTime, uCamZ, uSpan, uSizeK;
out float vFade;

void main(){
  float rel = mod(position.z - uCamZ, uSpan);
  vec3 p = vec3(position.x + sin(uTime*0.22 + position.w*19.0)*0.9,
                position.y + sin(uTime*0.15 + position.w*33.0)*0.45,
                uCamZ - rel);
  vFade = (1.0 - smoothstep(uSpan*0.45, uSpan*0.85, rel)) * smoothstep(0.8, 2.2, rel);
  vec4 clip = projectionMatrix * (modelViewMatrix * vec4(p, 1.0));
  gl_Position = clip;
  gl_PointSize = clamp(uSizeK / max(clip.w, 0.1), 1.5, 11.0);
}
`;

export const SEED_FRAG = /* glsl */ `
precision highp float;

in float vFade;
uniform float uDark;
uniform vec3 uSand;
out vec4 frag;

void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.08, d) * vFade * mix(0.34, 0.85, uDark);
  vec3 c = uSand * mix(0.82, 1.1, uDark);
  frag = vec4(c, a);
}
`;
