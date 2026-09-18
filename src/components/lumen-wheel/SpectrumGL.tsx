/**
 * Living Spectrum WebGL field — atmosphere, spectral bloom, chord rays.
 * Renders under the interactive Canvas 2D wheel. Graceful no-op if WebGL unavailable.
 */

import { useEffect, useRef } from "react";
import type { PitchClass } from "@/lib/music/theory";

export type SpectrumGLProps = {
  rotation: number;
  pulse: number;
  intensity: number;
  pureLight: boolean;
  activeTones: PitchClass[];
  resonanceEnergy?: number[];
  tilt?: { beta: number; gamma: number };
  enabled?: boolean;
  className?: string;
};

const VERT = /* glsl */ `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAG = /* glsl */ `
precision mediump float;

uniform vec2 u_res;
uniform float u_time;
uniform float u_rot;
uniform float u_pulse;
uniform float u_intensity;
uniform float u_pure;
uniform vec2 u_tilt;
uniform int u_toneCount;
uniform vec4 u_tones[4]; // rgb + strength
uniform float u_toneAng[4]; // fifths angle without rotation
uniform float u_resEnergy[12];

// Hash / value noise
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= 2.05;
    a *= 0.5;
  }
  return v;
}

// Approx HSL to RGB (h 0–1)
vec3 hsl2rgb(float h, float s, float l) {
  float c = (1.0 - abs(2.0 * l - 1.0)) * s;
  float hp = mod(h, 1.0) * 6.0;
  float x = c * (1.0 - abs(mod(hp, 2.0) - 1.0));
  vec3 rgb;
  if (hp < 1.0) rgb = vec3(c, x, 0.0);
  else if (hp < 2.0) rgb = vec3(x, c, 0.0);
  else if (hp < 3.0) rgb = vec3(0.0, c, x);
  else if (hp < 4.0) rgb = vec3(0.0, x, c);
  else if (hp < 5.0) rgb = vec3(x, 0.0, c);
  else rgb = vec3(c, 0.0, x);
  float m = l - 0.5 * c;
  return rgb + m;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / min(u_res.x, u_res.y);
  p += u_tilt * 0.04;

  float r = length(p);
  float ang = atan(p.y, p.x) + 1.5707963 - u_rot; // match canvas top = C
  float hue = fract(ang / 6.2831853);

  // Deep void
  vec3 col = mix(vec3(0.02, 0.02, 0.035), vec3(0.01, 0.01, 0.018), smoothstep(0.0, 1.2, r));

  // Nebula / living grain
  float n = fbm(p * 2.8 + u_time * 0.03);
  float n2 = fbm(p * 5.5 - u_time * 0.02 + 3.1);
  float neb = n * 0.55 + n2 * 0.35;
  vec3 nebCol = hsl2rgb(fract(hue + n * 0.08 + u_time * 0.01), 0.62, 0.32);
  col += nebCol * neb * (0.22 + u_intensity * 0.28) * (1.0 - smoothstep(0.45, 1.25, r));

  // Soft star field
  float stars = pow(hash(floor(gl_FragCoord.xy * 0.55)), 26.0);
  col += vec3(0.85, 0.88, 1.0) * stars * (0.35 + 0.25 * sin(u_time + hash(gl_FragCoord.xy) * 6.0));

  // Spectral ring halo (outside the 2D mid ring)
  float ring = abs(r - 0.42);
  float ringMask = smoothstep(0.1, 0.0, ring);
  vec3 ringHue = hsl2rgb(hue, 0.95, 0.55);
  // Chromatic fringe
  float hR = fract(hue + 0.02);
  float hB = fract(hue - 0.02);
  vec3 fringe = vec3(hsl2rgb(hR, 0.98, 0.58).r, ringHue.g, hsl2rgb(hB, 0.98, 0.58).b);
  float ringGlow = ringMask * (0.55 + u_pulse * 0.45 + u_intensity * 0.55);
  col += fringe * ringGlow;
  // Outer bloom falloff
  col += ringHue * exp(-ring * 9.0) * (0.32 + u_intensity * 0.45) * (0.75 + u_pulse * 0.55);

  // UV / IR faint outer ghosts
  float uvR = abs(r - 0.52);
  col += vec3(0.45, 0.25, 0.85) * exp(-uvR * 18.0) * 0.12 * (0.5 + 0.5 * u_intensity);
  float irR = abs(r - 0.58);
  col += vec3(0.85, 0.25, 0.12) * exp(-irR * 18.0) * 0.1 * (0.5 + 0.5 * u_intensity);

  // Chord tone rays (additive light beams)
  for (int i = 0; i < 4; i++) {
    if (i >= u_toneCount) break;
    vec3 th = u_tones[i].rgb;
    float str = u_tones[i].a;
    float ta = u_toneAng[i] + u_rot;
    float da = abs(mod(ang - ta + 3.14159265, 6.2831853) - 3.14159265);
    float lobe = exp(-da * da * 10.0);
    float radial = exp(-r * 1.6) * (0.35 + 0.65 * smoothstep(0.55, 0.0, r));
    float pulseBoost = 1.0 + u_pulse * 1.5;
    col += th * str * lobe * radial * pulseBoost * (0.85 + u_intensity * 0.6);
    // Soft fill glow
    col += th * str * exp(-r * 2.2) * 0.12 * pulseBoost;
  }

  // Resonance energy spikes at 12 fifths positions
  for (int i = 0; i < 12; i++) {
    float e = u_resEnergy[i];
    if (e < 0.05) continue;
    float fa = -1.5707963 + float(i) * 0.5235988 + u_rot; // wait: energy is by midi not fifths index
    // We pass energy already ordered by fifths in JS for simplicity
    float target = -1.5707963 + float(i) * 0.5235988 + u_rot;
    // Actually rotation is applied to wheel; node angles are fifthsAngle = -PI/2 + i/12*2PI + rot
    float nodeAng = -1.5707963 + (float(i) / 12.0) * 6.2831853 + u_rot;
    float da = abs(mod(ang - nodeAng + 3.14159, 6.28318) - 3.14159);
    float lobe = exp(-da * da * 22.0);
    float nodeHue = float(i) / 12.0;
    vec3 nc = hsl2rgb(nodeHue, 0.9, 0.55);
    float nr = abs(r - 0.30);
    col += nc * e * lobe * exp(-nr * 14.0) * (0.9 + u_pulse);
  }

  // Center white radiant point (additive unison)
  float core = exp(-r * r * 55.0) * (0.35 + u_pulse * 0.55 + u_intensity * 0.25);
  col += vec3(1.0, 0.98, 0.95) * core;

  // Pure light: darker void, brighter core/rays
  if (u_pure > 0.5) {
    col *= 0.55;
    col += vec3(1.0) * exp(-r * r * 40.0) * (0.4 + u_pulse * 0.5);
  }

  // Soft vignette
  col *= 1.0 - smoothstep(0.75, 1.45, r) * 0.55;

  // Tone map
  col = col / (1.0 + col * 0.65);
  col = pow(max(col, 0.0), vec3(0.92));

  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.warn("[SpectrumGL]", gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

function hueToRgb(h: number): [number, number, number] {
  const s = 0.9;
  const l = 0.55;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0,
    g = 0,
    b = 0;
  if (hp < 1) [r, g, b] = [c, x, 0];
  else if (hp < 2) [r, g, b] = [x, c, 0];
  else if (hp < 3) [r, g, b] = [0, c, x];
  else if (hp < 4) [r, g, b] = [0, x, c];
  else if (hp < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const m = l - c / 2;
  return [r + m, g + m, b + m];
}

export function SpectrumGL({
  rotation,
  pulse,
  intensity,
  pureLight,
  activeTones,
  resonanceEnergy = [],
  tilt = { beta: 0, gamma: 0 },
  enabled = true,
  className,
}: SpectrumGLProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const progRef = useRef<WebGLProgram | null>(null);
  const rafRef = useRef(0);
  const locRef = useRef<Record<string, WebGLUniformLocation | null>>({});
  const stateRef = useRef({
    rotation,
    pulse,
    intensity,
    pureLight,
    activeTones,
    resonanceEnergy,
    tilt,
    enabled,
  });
  stateRef.current = {
    rotation,
    pulse,
    intensity,
    pureLight,
    activeTones,
    resonanceEnergy,
    tilt,
    enabled,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl =
      canvas.getContext("webgl", {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: "high-performance",
      }) ||
      (canvas.getContext("experimental-webgl", {
        alpha: false,
        antialias: false,
      }) as WebGLRenderingContext | null);

    if (!gl) {
      canvas.style.display = "none";
      return;
    }
    glRef.current = gl;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn("[SpectrumGL] link", gl.getProgramInfoLog(prog));
      return;
    }
    progRef.current = prog;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    // full-screen triangle
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const names = [
      "u_res",
      "u_time",
      "u_rot",
      "u_pulse",
      "u_intensity",
      "u_pure",
      "u_tilt",
      "u_toneCount",
    ];
    const locs: Record<string, WebGLUniformLocation | null> = {};
    for (const n of names) locs[n] = gl.getUniformLocation(prog, n);
    for (let i = 0; i < 4; i++) locs[`u_tones[${i}]`] = gl.getUniformLocation(prog, `u_tones[${i}]`);
    for (let i = 0; i < 4; i++) locs[`u_toneAng[${i}]`] = gl.getUniformLocation(prog, `u_toneAng[${i}]`);
    for (let i = 0; i < 12; i++)
      locs[`u_resEnergy[${i}]`] = gl.getUniformLocation(prog, `u_resEnergy[${i}]`);
    locRef.current = locs;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const w = Math.max(1, parent.clientWidth);
      const h = Math.max(1, parent.clientHeight);
      const bw = Math.floor(w * dpr);
      const bh = Math.floor(h * dpr);
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw;
        canvas.height = bh;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        gl.viewport(0, 0, bw, bh);
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    let running = true;
    const t0 = performance.now();

    const frame = (now: number) => {
      if (!running) return;
      rafRef.current = requestAnimationFrame(frame);
      const s = stateRef.current;
      if (!s.enabled) {
        gl.clearColor(0.027, 0.027, 0.035, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        return;
      }
      resize();
      gl.useProgram(prog);
      const L = locRef.current;
      gl.uniform2f(L.u_res!, canvas.width, canvas.height);
      gl.uniform1f(L.u_time!, (now - t0) / 1000);
      gl.uniform1f(L.u_rot!, s.rotation);
      gl.uniform1f(L.u_pulse!, s.pulse);
      gl.uniform1f(L.u_intensity!, s.intensity);
      gl.uniform1f(L.u_pure!, s.pureLight ? 1 : 0);
      gl.uniform2f(
        L.u_tilt!,
        Math.max(-1, Math.min(1, s.tilt.gamma / 45)),
        Math.max(-1, Math.min(1, s.tilt.beta / 45)),
      );

      const tones = s.activeTones.slice(0, 4);
      gl.uniform1i(L.u_toneCount!, tones.length);
      for (let i = 0; i < 4; i++) {
        const loc = L[`u_tones[${i}]`];
        const aLoc = L[`u_toneAng[${i}]`];
        if (i < tones.length) {
          const p = tones[i]!;
          const [r, g, b] = hueToRgb(p.hue);
          if (loc) gl.uniform4f(loc, r, g, b, 0.75 + s.pulse * 0.35);
          // Match canvas fifthsAngle without rot: -PI/2 + index/12 * 2PI
          if (aLoc) gl.uniform1f(aLoc, -Math.PI / 2 + (p.fifthsIndex / 12) * Math.PI * 2);
        } else {
          if (loc) gl.uniform4f(loc, 0, 0, 0, 0);
          if (aLoc) gl.uniform1f(aLoc, 0);
        }
      }

      // Map midi energy → fifths index for angular spikes
      // FIFTHS order is by fifthsIndex; midi varies. Pass energy keyed by fifthsIndex:
      const byFifths = new Array(12).fill(0);
      if (s.resonanceEnergy?.length === 12) {
        // resonanceEnergy is by midi; convert using known midi→fifths
        const midiToFifths = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5]; // midi 0..11 → fifthsIndex
        for (let midi = 0; midi < 12; midi++) {
          const fi = midiToFifths[midi] ?? midi;
          byFifths[fi] = Math.max(byFifths[fi], s.resonanceEnergy[midi] ?? 0);
        }
      }
      for (let i = 0; i < 12; i++) {
        const loc = L[`u_resEnergy[${i}]`];
        if (loc) gl.uniform1f(loc, byFifths[i] ?? 0);
      }

      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    rafRef.current = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      glRef.current = null;
      progRef.current = null;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}
