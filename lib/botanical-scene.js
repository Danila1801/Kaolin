/* <botanical-scene> — a procedural botanical field in raw WebGL2.
   - Wind: sine + drifting value-noise in the vertex shader. Roots (t=0) are pinned;
     amplitude grows with t² toward the blade tip.
   - Cursor: pointer position is unprojected onto the ground plane and passed as a
     uniform; nearby blades part away from it.
   - Scroll: page scroll progress drives the camera deeper along -Z (endless field
     via modulo wrapping), with gentle lateral sway.
   - Theme: elements marked [data-scene-dark] darken the scene as they cross the
     viewport (ivory daylight -> near-black grove).
   - Performance: adaptive DPR ladder driven by an EMA of frame time.
   - Respects prefers-reduced-motion: wind frozen, no cursor parting, no smoothing. */
(function () {
  if (customElements.get('botanical-scene')) return;

  var IVORY = [0.976, 0.965, 0.941];
  var NIGHT = [0.022, 0.045, 0.037];  // deep pine-black (emerald & cream v2)
  var SAGE = [0.424, 0.471, 0.267];   // #6C7844
  var FOREST = [0.247, 0.306, 0.286]; // #3F4E49
  var SAND = [0.784, 0.663, 0.416];   // #C8A96A muted gold

  var SPAN = 64.0;
  var TRAVEL = 44.0;

  // ---------- tiny mat4 (column-major) ----------
  function perspective(fovY, aspect, near, far) {
    var f = 1 / Math.tan(fovY / 2), nf = 1 / (near - far);
    return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];
  }
  function mul(a, b) {
    var o = new Array(16);
    for (var c = 0; c < 4; c++) for (var r = 0; r < 4; r++) {
      o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    }
    return o;
  }
  function viewMatrix(px, py, pz, pitch) {
    var c = Math.cos(-pitch), s = Math.sin(-pitch);
    // Rx(-pitch) * T(-P)
    var rx = [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1];
    var t = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -px, -py, -pz, 1];
    return mul(rx, t);
  }

  // ---------- shaders ----------
  var BLADE_VS = '#version 300 es\n' +
    'precision highp float;\n' +
    'layout(location=0) in vec2 aLocal;\n' +   // (side, t)
    'layout(location=1) in vec2 aXZ;\n' +
    'layout(location=2) in vec2 aHW;\n' +      // height, width
    'layout(location=3) in vec3 aMisc;\n' +    // rot, phase, colorRand
    'uniform mat4 uVP;\n' +
    'uniform float uTime, uWind, uCamZ, uSpan;\n' +
    'uniform vec3 uMouse;\n' +                 // world x, z, strength
    'out float vT; out float vFog; out float vNear; out float vCRand; out float vShade;\n' +
    'float hash12(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}\n' +
    'float vnoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);\n' +
    ' float a=hash12(i),b=hash12(i+vec2(1.,0.)),c=hash12(i+vec2(0.,1.)),d=hash12(i+vec2(1.,1.));\n' +
    ' return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}\n' +
    'void main(){\n' +
    '  float t = aLocal.y;\n' +
    '  float tt = t*t;\n' +
    '  float rel = mod(aXZ.y - uCamZ, uSpan);\n' +
    '  vec2 base = vec2(aXZ.x, uCamZ - rel);\n' +
    '  float gust = vnoise(vec2(base.x*0.22, base.y*0.22 - uTime*0.32));\n' +
    '  float sway = sin(uTime*1.7 + aMisc.y*6.28318 + base.x*0.6 + base.y*0.45);\n' +
    '  float lean = ((gust-0.42)*1.35 + sway*0.34 + (hash12(vec2(aMisc.y,aMisc.z))-0.5)*0.55) * uWind;\n' +
    '  vec2 disp = normalize(vec2(0.85,0.42)) * (lean * tt);\n' +
    '  vec2 mv = base - uMouse.xy;\n' +
    '  float md = length(mv);\n' +
    '  float push = (1.0 - smoothstep(0.0, 2.5, md)) * uMouse.z;\n' +
    '  disp += (mv / max(md, 0.001)) * push * 1.15 * tt;\n' +
    '  vec2 xdir = vec2(cos(aMisc.x), sin(aMisc.x));\n' +
    '  vec3 pos;\n' +
    '  pos.xz = base + xdir * (aLocal.x * aHW.y * (1.0 - t*0.94)) + disp;\n' +
    '  float b = length(disp);\n' +
    '  pos.y = max(t*aHW.x - b*b*0.38, 0.0);\n' +
    '  vT = t; vCRand = aMisc.z;\n' +
    '  vShade = 0.82 + 0.36*hash12(vec2(aMisc.z*7.1, aMisc.y*3.3));\n' +
    '  vFog = smoothstep(uSpan*0.42, uSpan*0.9, rel);\n' +
    '  vNear = smoothstep(1.0, 2.6, rel);\n' +
    '  gl_Position = uVP * vec4(pos, 1.0);\n' +
    '}\n';

  var BLADE_FS = '#version 300 es\n' +
    'precision highp float;\n' +
    'in float vT; in float vFog; in float vNear; in float vCRand; in float vShade;\n' +
    'uniform float uDark;\n' +
    'uniform vec3 uBg, uSage, uForest, uSand;\n' +
    'out vec4 frag;\n' +
    'float hash12(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}\n' +
    'void main(){\n' +
    '  if (hash12(gl_FragCoord.xy) > vNear + 0.02) discard;\n' + // dithered near-fade, no sorting needed
    '  vec3 c = mix(uForest, uSage, smoothstep(0.22, 0.58, vCRand));\n' +
    '  c = mix(c, uSand, smoothstep(0.80, 0.97, vCRand));\n' +
    '  c *= mix(0.52, 1.10, vT) * vShade;\n' +
    '  vec3 cd = mix(c*0.16, uSand*0.7, pow(vT,3.0)*0.4);\n' + // night: silhouettes, faint sand tips
    '  c = mix(c, cd, uDark);\n' +
    '  c = mix(c, uBg, vFog);\n' +
    '  frag = vec4(c, 1.0);\n' +
    '}\n';

  var BG_VS = '#version 300 es\n' +
    'void main(){\n' +
    '  vec2 p = vec2(float((gl_VertexID<<1)&2), float(gl_VertexID&2));\n' +
    '  gl_Position = vec4(p*2.0-1.0, 0.999, 1.0);\n' +
    '}\n';

  var BG_FS = '#version 300 es\n' +
    'precision highp float;\n' +
    'uniform vec2 uRes;\n' +
    'uniform float uDark, uGrain;\n' +
    'uniform vec3 uBg, uSand, uForest;\n' +
    'out vec4 frag;\n' +
    'float hash12(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}\n' +
    'void main(){\n' +
    '  vec2 uv = gl_FragCoord.xy / uRes;\n' +
    '  vec3 c = uBg;\n' +
    '  c += uSand * 0.05 * smoothstep(0.78, 0.40, uv.y) * (1.0 - uDark);\n' + // warm haze at the horizon, daylight
    '  c += uForest * 0.14 * smoothstep(0.62, 0.02, uv.y) * uDark;\n' +       // low forest luminescence at night
    '  float d = distance(uv, vec2(0.5, 0.44));\n' +
    '  c *= 1.0 - 0.09 * smoothstep(0.35, 0.95, d);\n' +
    '  c += (hash12(gl_FragCoord.xy) - 0.5) * 0.014 * uGrain;\n' +
    '  frag = vec4(c, 1.0);\n' +
    '}\n';

  var SEED_VS = '#version 300 es\n' +
    'precision highp float;\n' +
    'layout(location=0) in vec4 aSeed;\n' + // x, y, z, rand
    'uniform mat4 uVP;\n' +
    'uniform float uTime, uCamZ, uSpan, uSizeK;\n' +
    'out float vFade;\n' +
    'void main(){\n' +
    '  float rel = mod(aSeed.z - uCamZ, uSpan);\n' +
    '  vec3 p = vec3(aSeed.x + sin(uTime*0.22 + aSeed.w*19.0)*0.9,\n' +
    '                aSeed.y + sin(uTime*0.15 + aSeed.w*33.0)*0.45,\n' +
    '                uCamZ - rel);\n' +
    '  vFade = (1.0 - smoothstep(uSpan*0.45, uSpan*0.85, rel)) * smoothstep(0.8, 2.2, rel);\n' +
    '  gl_Position = uVP * vec4(p, 1.0);\n' +
    '  gl_PointSize = clamp(uSizeK / max(gl_Position.w, 0.1), 1.5, 11.0);\n' +
    '}\n';

  var SEED_FS = '#version 300 es\n' +
    'precision highp float;\n' +
    'in float vFade;\n' +
    'uniform float uDark;\n' +
    'uniform vec3 uSand;\n' +
    'out vec4 frag;\n' +
    'void main(){\n' +
    '  float d = length(gl_PointCoord - 0.5);\n' +
    '  float a = smoothstep(0.5, 0.08, d) * vFade * mix(0.34, 0.85, uDark);\n' +
    '  vec3 c = uSand * mix(0.82, 1.1, uDark);\n' +
    '  frag = vec4(c, a);\n' +
    '}\n';

  function compile(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error('botanical-scene shader: ' + gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }
  function program(gl, vs, fs) {
    var p = gl.createProgram();
    var a = compile(gl, gl.VERTEX_SHADER, vs), b = compile(gl, gl.FRAGMENT_SHADER, fs);
    if (!a || !b) return null;
    gl.attachShader(p, a); gl.attachShader(p, b); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.error('botanical-scene link: ' + gl.getProgramInfoLog(p));
      return null;
    }
    return p;
  }

  var DENSITY = { airy: 0.55, standard: 1.0, lush: 1.6 };
  var DPR_LADDER = [0.75, 1.0, 1.35, 1.75];

  class BotanicalScene extends HTMLElement {
    static get observedAttributes() { return ['wind', 'density', 'grain']; }

    constructor() {
      super();
      this._wind = 1.0;
      this._density = 'standard';
      this._grain = 1.0;
      this._time = 0;
      this._scroll = 0;
      this._scrollT = 0;
      this._dark = 0;
      this._mouse = { cx: -1, cy: -1, s: 0, lastMove: -1e9, wx: 0, wz: 0 };
      this._ema = 16;
      this._lastDprChange = 0;
      this._raf = 0;
      this._lastT = 0;
      this._ready = false;
      this._reduced = false;
      this._needsStatic = true;
    }

    attributeChangedCallback(name, _old, val) {
      if (name === 'wind') { var f = parseFloat(val); this._wind = isNaN(f) ? 1 : f; }
      if (name === 'grain') { this._grain = (val === 'off' || val === 'false' || val === '0') ? 0 : 1; }
      if (name === 'density') {
        var d = DENSITY[val] ? val : 'standard';
        if (d !== this._density) { this._density = d; if (this._ready) this._buildInstances(); }
      }
      this._needsStatic = true;
    }

    connectedCallback() {
      this.style.display = 'block';
      this.style.width = '100%';
      this.style.height = '100%';
      var c = document.createElement('canvas');
      c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
      this.style.position = 'relative';
      this.appendChild(c);
      this._canvas = c;

      var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      this._reduced = mq.matches;
      this._mqH = (e) => { this._reduced = e.matches; this._needsStatic = true; };
      mq.addEventListener('change', this._mqH);
      this._mq = mq;

      var gl = c.getContext('webgl2', { alpha: false, antialias: true, powerPreference: 'high-performance' });
      if (!gl) { // graceful fallback: quiet ivory gradient + solid dark act
        this.style.background = 'linear-gradient(180deg,#FAF8F3 0%,#F9F6F0 55%,#F1ECDF 100%)';
        // sections inside [data-scene-dark] use ivory text; without WebGL the
        // canvas can't darken behind them, so paint the wrapper itself
        var paintDark = function () {
          var els = document.querySelectorAll('[data-scene-dark]');
          if (!els.length) return false;
          for (var i = 0; i < els.length; i++) els[i].style.background = '#07100D';
          return true;
        };
        if (!paintDark()) {
          var tries = 0;
          var iv = setInterval(function () { if (paintDark() || ++tries > 40) clearInterval(iv); }, 250);
        }
        return;
      }
      this._gl = gl;

      this._pBlade = program(gl, BLADE_VS, BLADE_FS);
      this._pBg = program(gl, BG_VS, BG_FS);
      this._pSeed = program(gl, SEED_VS, SEED_FS);
      if (!this._pBlade || !this._pBg || !this._pSeed) return;

      this._uni = {};
      ['uVP', 'uTime', 'uWind', 'uCamZ', 'uSpan', 'uMouse', 'uDark', 'uBg', 'uSage', 'uForest', 'uSand'].forEach((n) => {
        this._uni['b_' + n] = gl.getUniformLocation(this._pBlade, n);
      });
      ['uRes', 'uDark', 'uGrain', 'uBg', 'uSand', 'uForest'].forEach((n) => {
        this._uni['g_' + n] = gl.getUniformLocation(this._pBg, n);
      });
      ['uVP', 'uTime', 'uCamZ', 'uSpan', 'uSizeK', 'uDark', 'uSand'].forEach((n) => {
        this._uni['s_' + n] = gl.getUniformLocation(this._pSeed, n);
      });

      // blade strip geometry: (side, t) pairs
      var SEG = 6, strip = [];
      for (var i = 0; i <= SEG; i++) { var t = i / SEG; strip.push(-1, t, 1, t); }
      this._stripCount = (SEG + 1) * 2;
      this._vaoBlade = gl.createVertexArray();
      gl.bindVertexArray(this._vaoBlade);
      var vb = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vb);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(strip), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 8, 0);
      this._instBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this._instBuf);
      var stride = 28; // 7 floats
      gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 2, gl.FLOAT, false, stride, 0); gl.vertexAttribDivisor(1, 1);
      gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 2, gl.FLOAT, false, stride, 8); gl.vertexAttribDivisor(2, 1);
      gl.enableVertexAttribArray(3); gl.vertexAttribPointer(3, 3, gl.FLOAT, false, stride, 16); gl.vertexAttribDivisor(3, 1);
      gl.bindVertexArray(null);

      // seeds
      this._vaoSeed = gl.createVertexArray();
      gl.bindVertexArray(this._vaoSeed);
      var sb = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, sb);
      var seeds = [];
      var SN = 150;
      for (var j = 0; j < SN; j++) {
        seeds.push((Math.random() * 2 - 1) * 11, 0.15 + Math.pow(Math.random(), 2) * 3.2, Math.random() * SPAN, Math.random());
      }
      this._seedCount = SN;
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(seeds), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 16, 0);
      gl.bindVertexArray(null);

      this._vaoBg = gl.createVertexArray();

      // DPR ladder start
      var want = Math.min(window.devicePixelRatio || 1, 1.75);
      this._dprLevel = DPR_LADDER.length - 1;
      while (this._dprLevel > 0 && DPR_LADDER[this._dprLevel] > want + 0.01) this._dprLevel--;

      this._buildInstances();
      this._ready = true;

      this._onMove = (e) => {
        this._mouse.cx = e.clientX; this._mouse.cy = e.clientY;
        this._mouse.lastMove = performance.now();
      };
      this._onLeave = () => { this._mouse.lastMove = -1e9; };
      window.addEventListener('pointermove', this._onMove, { passive: true });
      window.addEventListener('pointerleave', this._onLeave, { passive: true });
      this._onVis = () => { this._needsStatic = true; };
      document.addEventListener('visibilitychange', this._onVis);
      this._ro = new ResizeObserver(() => { this._resize(); this._needsStatic = true; });
      this._ro.observe(this);
      this._onScroll = () => { this._needsStatic = true; };
      window.addEventListener('scroll', this._onScroll, { passive: true });

      this._resize();
      this._lastT = performance.now();
      var loop = (now) => {
        this._raf = requestAnimationFrame(loop);
        this._frame(now);
      };
      this._raf = requestAnimationFrame(loop);
    }

    disconnectedCallback() {
      cancelAnimationFrame(this._raf);
      window.removeEventListener('pointermove', this._onMove);
      window.removeEventListener('pointerleave', this._onLeave);
      window.removeEventListener('scroll', this._onScroll);
      document.removeEventListener('visibilitychange', this._onVis);
      if (this._mq) this._mq.removeEventListener('change', this._mqH);
      if (this._ro) this._ro.disconnect();
    }

    _buildInstances() {
      var gl = this._gl;
      var base = (window.innerWidth < 768 ? 1300 : 2600);
      var N = Math.round(base * DENSITY[this._density]);
      var data = new Float32Array(N * 7);
      for (var i = 0; i < N; i++) {
        var x = (Math.random() * 2 - 1);
        x = Math.sign(x || 1) * Math.pow(Math.abs(x), 0.72) * 13;
        // keep a corridor clear where the type sits (the type is left-aligned
        // on screen => negative world x, so the cleared band is biased left).
        // Tuned wider/emptier than the prototype: copy legibility beats density.
        if (x > -7.5 && x < 3.0 && Math.random() < 0.88) {
          x = Math.random() < 0.62 ? 3.0 + Math.random() * 10.4 : -7.5 - Math.random() * 6.5;
        }
        var edge = Math.min(Math.abs(x) / 9, 1);
        var h = 0.5 + Math.pow(Math.random(), 1.5) * 1.5;
        h *= 0.7 + edge * 0.75;
        if (x > -8 && x < 3.4) h *= 0.42;
        var o = i * 7;
        data[o] = x;
        data[o + 1] = Math.random() * SPAN;
        data[o + 2] = h;
        data[o + 3] = 0.05 + Math.random() * 0.055;
        data[o + 4] = Math.random() * Math.PI;
        data[o + 5] = Math.random();
        data[o + 6] = Math.random();
      }
      this._instCount = N;
      gl.bindBuffer(gl.ARRAY_BUFFER, this._instBuf);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    }

    _resize() {
      if (!this._gl) return;
      var dpr = DPR_LADDER[this._dprLevel];
      var w = Math.max(this.clientWidth, 2), h = Math.max(this.clientHeight, 2);
      this._canvas.width = Math.round(w * dpr);
      this._canvas.height = Math.round(h * dpr);
      this._w = w; this._h = h;
    }

    _frame(now) {
      var gl = this._gl;
      if (!gl || !this._ready) return;
      if (document.hidden) { this._lastT = now; return; }

      var dt = Math.min(Math.max(now - this._lastT, 0), 50);
      this._lastT = now;

      // adaptive DPR (spec: drop resolution before dropping frames)
      this._ema = this._ema * 0.95 + dt * 0.05;
      if (now - this._lastDprChange > 1800) {
        if (this._ema > 26 && this._dprLevel > 0) { this._dprLevel--; this._lastDprChange = now; this._resize(); }
        else if (this._ema < 12.5 && this._dprLevel < DPR_LADDER.length - 1 && now - this._lastDprChange > 4500) {
          this._dprLevel++; this._lastDprChange = now; this._resize();
        }
      }

      // scroll -> camera target
      var doc = document.documentElement;
      var max = Math.max(doc.scrollHeight - window.innerHeight, 1);
      var target = Math.min(Math.max(window.scrollY / max, 0), 1);
      var k = this._reduced ? 1 : 1 - Math.pow(0.0018, dt / 1000); // smooth ~seamless
      this._scroll += (target - this._scroll) * k;

      // dark passage detection
      var els = document.querySelectorAll('[data-scene-dark]');
      var dTarget = 0, vh = window.innerHeight, mid = vh * 0.5;
      for (var i = 0; i < els.length; i++) {
        var r = els[i].getBoundingClientRect();
        var into = Math.min(Math.max((mid - r.top) / (vh * 0.42), 0), 1);
        var outof = Math.min(Math.max((r.bottom - mid) / (vh * 0.42), 0), 1);
        dTarget = Math.max(dTarget, Math.min(into, outof));
      }
      this._dark += (dTarget - this._dark) * Math.min(1, dt / 1000 * 4.5);

      if (!this._reduced) this._time += dt / 1000;
      else this._time = 2.0;

      // reduced motion: only re-render when something actually changed
      if (this._reduced) {
        var still = Math.abs(target - this._scrollT) < 1e-5 && Math.abs(dTarget - this._dark) < 0.002 && !this._needsStatic;
        if (still) return;
        this._scroll = target;
        this._needsStatic = false;
      }
      this._scrollT = target;

      // camera
      var p = this._scroll;
      var camZ = 4 - p * TRAVEL;
      var camX = Math.sin(p * 5.1) * 0.55;
      var camY = 1.32 + Math.sin(p * 2.6) * 0.1;
      var pitch = -0.16;
      var aspect = this._w / this._h;
      var fov = aspect < 0.8 ? 1.12 : 0.92;
      var vp = mul(perspective(fov, aspect, 0.1, 200), viewMatrix(camX, camY, camZ, pitch));

      // pointer -> ground plane
      var m = this._mouse, strength = 0;
      if (!this._reduced && now - m.lastMove < 2600 && m.cx >= 0) {
        strength = 1 - Math.min(Math.max((now - m.lastMove - 1400) / 1200, 0), 1);
        var ndcX = (m.cx / this._w) * 2 - 1;
        var ndcY = 1 - (m.cy / this._h) * 2;
        var th = Math.tan(fov / 2);
        var dx = ndcX * th * aspect, dy = ndcY * th, dz = -1;
        var cp = Math.cos(pitch), sp = Math.sin(pitch);
        var wy = dy * cp - dz * sp;
        var wz = dy * sp + dz * cp;
        if (wy < -0.03) {
          var t = -camY / wy;
          t = Math.min(t, 46);
          m.wx = camX + dx * t;
          m.wz = camZ + wz * t;
        } else strength = 0;
      }
      m.s += (strength - m.s) * Math.min(1, dt / 1000 * 6);

      var bg = [
        IVORY[0] + (NIGHT[0] - IVORY[0]) * this._dark,
        IVORY[1] + (NIGHT[1] - IVORY[1]) * this._dark,
        IVORY[2] + (NIGHT[2] - IVORY[2]) * this._dark
      ];

      gl.viewport(0, 0, this._canvas.width, this._canvas.height);
      gl.disable(gl.BLEND);
      gl.disable(gl.DEPTH_TEST);
      gl.clear(gl.DEPTH_BUFFER_BIT);

      // background wash
      gl.useProgram(this._pBg);
      gl.bindVertexArray(this._vaoBg);
      gl.uniform2f(this._uni.g_uRes, this._canvas.width, this._canvas.height);
      gl.uniform1f(this._uni.g_uDark, this._dark);
      gl.uniform1f(this._uni.g_uGrain, this._grain);
      gl.uniform3fv(this._uni.g_uBg, bg);
      gl.uniform3fv(this._uni.g_uSand, SAND);
      gl.uniform3fv(this._uni.g_uForest, FOREST);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      // blades
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.useProgram(this._pBlade);
      gl.bindVertexArray(this._vaoBlade);
      gl.uniformMatrix4fv(this._uni.b_uVP, false, vp);
      gl.uniform1f(this._uni.b_uTime, this._time);
      gl.uniform1f(this._uni.b_uWind, this._reduced ? 0.35 : this._wind);
      gl.uniform1f(this._uni.b_uCamZ, camZ);
      gl.uniform1f(this._uni.b_uSpan, SPAN);
      gl.uniform3f(this._uni.b_uMouse, m.wx, m.wz, m.s);
      gl.uniform1f(this._uni.b_uDark, this._dark);
      gl.uniform3fv(this._uni.b_uBg, bg);
      gl.uniform3fv(this._uni.b_uSage, SAGE);
      gl.uniform3fv(this._uni.b_uForest, FOREST);
      gl.uniform3fv(this._uni.b_uSand, SAND);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, this._stripCount, this._instCount);

      // drifting seeds
      gl.depthMask(false);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(this._pSeed);
      gl.bindVertexArray(this._vaoSeed);
      gl.uniformMatrix4fv(this._uni.s_uVP, false, vp);
      gl.uniform1f(this._uni.s_uTime, this._time);
      gl.uniform1f(this._uni.s_uCamZ, camZ);
      gl.uniform1f(this._uni.s_uSpan, SPAN);
      gl.uniform1f(this._uni.s_uSizeK, this._canvas.height * 0.012);
      gl.uniform1f(this._uni.s_uDark, this._dark);
      gl.uniform3fv(this._uni.s_uSand, SAND);
      gl.drawArrays(gl.POINTS, 0, this._seedCount);
      gl.depthMask(true);
      gl.bindVertexArray(null);
    }
  }

  customElements.define('botanical-scene', BotanicalScene);
})();

// The export makes this file a module so a TypeScript `import()` accepts it;
// importing it is purely for the side effect of registering the element.
export {};
