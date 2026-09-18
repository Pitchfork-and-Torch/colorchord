import { useEffect, useRef, useCallback } from "react";
import {
  FIFTHS,
  complementaryPitch,
  fifthsAngle,
  hsl,
  mixColorName,
  mixHues,
  polar,
  type ChordQuality,
  type PitchClass,
  type VisionMode,
} from "@/lib/music/theory";
import { SpectrumGL } from "@/components/lumen-wheel/SpectrumGL";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  hue: number;
  size: number;
};

export interface LumenCanvasProps {
  rotation: number;
  quality: ChordQuality;
  activeRoot: PitchClass | null;
  activeTones: PitchClass[];
  expandedSpectrum: boolean;
  showGeometry: boolean;
  pureLight: boolean;
  pulse: number;
  visionMode: VisionMode;
  tilt: { beta: number; gamma: number };
  burstKey: number;
  intensity: number;
  /** Live resonance energy per pitch-class midi 0 - 11 */
  resonanceEnergy?: number[];
  /** Scale pitches to ghost-highlight on the ring */
  scalePitches?: PitchClass[];
  /** Multi-selected notes for theory playground */
  multiSelect?: PitchClass[];
  /** Previous chord tones for voice-leading trails */
  trailTones?: PitchClass[];
  /** Enable WebGL atmosphere (default true). */
  shaders?: boolean;
  onSelectRoot: (p: PitchClass, velocity: number) => void;
  onRotationChange: (r: number) => void;
  className?: string;
}

export function LumenCanvas({
  rotation,
  quality: _quality,
  activeRoot,
  activeTones,
  expandedSpectrum,
  showGeometry,
  pureLight,
  pulse,
  visionMode,
  tilt,
  burstKey,
  intensity,
  resonanceEnergy = [],
  scalePitches = [],
  multiSelect = [],
  trailTones = [],
  shaders = true,
  onSelectRoot,
  onRotationChange,
  className,
}: LumenCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{
    dragging: boolean;
    lastAngle: number;
    moved: boolean;
    pointerId: number | null;
    downT: number;
  }>({ dragging: false, lastAngle: 0, moved: false, pointerId: null, downT: 0 });
  const animRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const stateRef = useRef({
    rotation,
    activeRoot,
    activeTones,
    expandedSpectrum,
    showGeometry,
    pureLight,
    pulse,
    visionMode,
    tilt,
    intensity,
    resonanceEnergy,
    scalePitches,
    multiSelect,
    trailTones,
  });

  stateRef.current = {
    rotation,
    activeRoot,
    activeTones,
    expandedSpectrum,
    showGeometry,
    pureLight,
    pulse,
    visionMode,
    tilt,
    intensity,
    resonanceEnergy,
    scalePitches,
    multiSelect,
    trailTones,
  };

  useEffect(() => {
    if (burstKey === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const size = Math.min(rect.width, rect.height);
    const noteR = size * 0.3;
    const tones = stateRef.current.activeTones;
    const rot = stateRef.current.rotation;
    const mult = 10 + Math.round(stateRef.current.intensity * 12);
    for (const p of tones) {
      const a = fifthsAngle(p.fifthsIndex, rot);
      const pt = polar(cx, cy, noteR, a);
      for (let i = 0; i < mult; i++) {
        const ang = a + (Math.random() - 0.5) * 1.2;
        const sp = 0.5 + Math.random() * (1.8 + intensity * 1.4);
        particlesRef.current.push({
          x: pt.x,
          y: pt.y,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp,
          life: 1,
          max: 0.7 + Math.random() * 0.9,
          hue: p.hue,
          size: 1.1 + Math.random() * (2.5 + intensity * 1.5),
        });
      }
    }
    if (particlesRef.current.length > 220) {
      particlesRef.current = particlesRef.current.slice(-180);
    }
  }, [burstKey, intensity]);

  const hitTest = useCallback((clientX: number, clientY: number): PitchClass | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const w = rect.width;
    const h = rect.height;
    const cx = w / 2;
    const cy = h / 2;
    const size = Math.min(w, h);
    const outerR = size * 0.44;
    const innerR = size * 0.24;
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.hypot(dx, dy);
    if (dist < innerR * 0.4 || dist > outerR * 1.14) return null;
    const { rotation: rot } = stateRef.current;
    let rel = Math.atan2(dy, dx) + Math.PI / 2 - rot;
    while (rel < 0) rel += Math.PI * 2;
    while (rel >= Math.PI * 2) rel -= Math.PI * 2;
    const idx = Math.round((rel / (Math.PI * 2)) * 12) % 12;
    return FIFTHS[idx] ?? null;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, parent.clientWidth);
      const h = Math.max(1, parent.clientHeight);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(() => resize());
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const draw = (t: number) => {
      const {
        rotation: rot,
        activeRoot: root,
        activeTones: tones,
        expandedSpectrum: expanded,
        showGeometry: geometry,
        pureLight,
        pulse: pulseAmt,
        visionMode: mode,
        tilt: tiltNow,
        intensity: intens,
        resonanceEnergy: resE,
        scalePitches: scalePts,
        multiSelect: multi,
        trailTones: trail,
      } = stateRef.current;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      if (w < 2 || h < 2) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      const parallaxX = (tiltNow.gamma / 45) * Math.min(14, w * 0.02);
      const parallaxY = (tiltNow.beta / 45) * Math.min(14, h * 0.02);
      const cx = w / 2 + parallaxX;
      const cy = h / 2 + parallaxY;
      const size = Math.min(w, h);
      const outerR = size * (pureLight ? 0.48 : 0.44);
      const midR = size * (pureLight ? 0.38 : 0.36);
      const noteR = size * 0.3;
      const innerR = size * 0.22;
      const coreR = size * 0.065;
      const fx = 0.55 + intens * 0.55;

      // Clear to transparent so WebGL spectrum shows through
      ctx.clearRect(0, 0, w, h);

      // Soft vignette only - atmosphere is WebGL
      if (!pureLight) {
        const vg = ctx.createRadialGradient(cx, cy, size * 0.25, cx, cy, size * 0.78);
        vg.addColorStop(0, "rgba(7,7,9,0.05)");
        vg.addColorStop(0.5, "rgba(7,7,9,0.12)");
        vg.addColorStop(1, "rgba(7,7,9,0.55)");
        ctx.fillStyle = vg;
        ctx.fillRect(0, 0, w, h);
      } else {
        ctx.fillStyle = "rgba(3,3,6,0.35)";
        ctx.fillRect(0, 0, w, h);
      }

      // Rays
      if (tones.length > 0) {
        for (const p of tones) {
          const a = fifthsAngle(p.fifthsIndex, rot);
          const tip = polar(cx, cy, outerR * 1.35, a);
          const g = ctx.createLinearGradient(cx, cy, tip.x, tip.y);
          g.addColorStop(0, hsl(p.hue, 90, 70, (0.14 + pulseAmt * 0.18) * fx, mode));
          g.addColorStop(0.55, hsl(p.hue, 90, 55, (0.06 + pulseAmt * 0.08) * fx, mode));
          g.addColorStop(1, hsl(p.hue, 90, 50, 0, mode));
          ctx.strokeStyle = g;
          ctx.lineWidth = (8 + pulseAmt * 14) * (0.7 + intens * 0.5);
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(tip.x, tip.y);
          ctx.stroke();
        }
      }

      // Complementary diameter (tritone / opposite hue) from root
      if (root && !pureLight) {
        const comp = complementaryPitch(root);
        const a0 = fifthsAngle(root.fifthsIndex, rot);
        const a1 = fifthsAngle(comp.fifthsIndex, rot);
        const p0 = polar(cx, cy, noteR, a0);
        const p1 = polar(cx, cy, noteR, a1);
        ctx.save();
        ctx.setLineDash([4, 6]);
        ctx.lineWidth = 1.25;
        const cg = ctx.createLinearGradient(p0.x, p0.y, p1.x, p1.y);
        cg.addColorStop(0, hsl(root.hue, 80, 60, 0.45, mode));
        cg.addColorStop(0.5, "hsla(0 0% 100% / 0.12)");
        cg.addColorStop(1, hsl(comp.hue, 80, 60, 0.45, mode));
        ctx.strokeStyle = cg;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
        ctx.setLineDash([]);
        // Tiny opposite marker
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, 3.5, 0, Math.PI * 2);
        ctx.strokeStyle = hsl(comp.hue, 70, 65, 0.55, mode);
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }

      if (expanded && !pureLight) {
        const uvR = outerR * 1.1;
        const irR = outerR * 1.18;
        const gUv = ctx.createRadialGradient(cx, cy, outerR * 0.95, cx, cy, irR);
        gUv.addColorStop(0, "hsla(265 80% 55% / 0)");
        gUv.addColorStop(0.4, `hsla(265 70% 55% / ${0.08 + pulseAmt * 0.06})`);
        gUv.addColorStop(0.7, `hsla(200 60% 50% / ${0.05 + pulseAmt * 0.03})`);
        gUv.addColorStop(1, `hsla(12 90% 45% / ${0.06 + pulseAmt * 0.04})`);
        ctx.fillStyle = gUv;
        ctx.beginPath();
        ctx.arc(cx, cy, irR, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.setLineDash([3, 7]);
        ctx.lineWidth = 1;
        ctx.strokeStyle = `hsla(270 70% 70% / ${0.26 + pulseAmt * 0.12})`;
        ctx.beginPath();
        ctx.arc(cx, cy, uvR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = `hsla(12 85% 55% / ${0.2 + pulseAmt * 0.1})`;
        ctx.beginPath();
        ctx.arc(cx, cy, irR * 0.98, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        // Labels for beyond-vision rings
        const fs = Math.max(8, size * 0.018);
        ctx.font = `500 ${fs}px system-ui, sans-serif`;
        ctx.fillStyle = "hsla(270 60% 75% / 0.45)";
        ctx.textAlign = "center";
        ctx.fillText("UV", cx, cy - uvR - 4);
        ctx.fillStyle = "hsla(12 80% 65% / 0.4)";
        ctx.fillText("IR", cx, cy - irR * 0.98 - 4);
        ctx.restore();
      }

      // Spectral ring
      const segs = pureLight ? 96 : 144;
      for (let i = 0; i < segs; i++) {
        const a0 = -Math.PI / 2 + (i / segs) * Math.PI * 2 + rot;
        const a1 = -Math.PI / 2 + ((i + 1.05) / segs) * Math.PI * 2 + rot;
        const hue = (i / segs) * 360;
        ctx.beginPath();
        ctx.arc(cx, cy, outerR, a0, a1);
        ctx.arc(cx, cy, midR, a1, a0, true);
        ctx.closePath();
        ctx.fillStyle = hsl(hue, pureLight ? 95 : 90, pureLight ? 58 : 54, pureLight ? 1 : 0.95, mode);
        ctx.fill();
      }

      ctx.strokeStyle = "hsla(0 0% 100% / 0.14)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, outerR + 0.5, 0, Math.PI * 2);
      ctx.stroke();

      // Tick marks at each fifths node on the ring (harmonic = spectral tick)
      for (let i = 0; i < 12; i++) {
        const a = fifthsAngle(i, rot);
        const inner = polar(cx, cy, midR + 1, a);
        const outer = polar(cx, cy, outerR - 1, a);
        ctx.strokeStyle = "hsla(0 0% 100% / 0.18)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(inner.x, inner.y);
        ctx.lineTo(outer.x, outer.y);
        ctx.stroke();
      }

      // Scale overlay (ghost arc wedges)
      if (scalePts.length > 0 && !pureLight) {
        for (const p of scalePts) {
          const a = fifthsAngle(p.fifthsIndex, rot);
          const half = (Math.PI * 2) / 12 / 2;
          ctx.beginPath();
          ctx.arc(cx, cy, midR - 2, a - half * 0.85, a + half * 0.85);
          ctx.strokeStyle = hsl(p.hue, 70, 60, 0.22 + 0.08 * Math.sin(t * 0.002 + p.fifthsIndex), mode);
          ctx.lineWidth = 6;
          ctx.stroke();
        }
      }

      // Live resonance pulse rings on detected pitch classes
      if (resE && resE.length === 12) {
        for (let i = 0; i < 12; i++) {
          const e = resE[i] ?? 0;
          if (e < 0.12) continue;
          const pc = FIFTHS.find((p) => p.midi === i);
          if (!pc) continue;
          const a = fifthsAngle(pc.fifthsIndex, rot);
          const pt = polar(cx, cy, noteR, a);
          const r = 10 + e * 22 + pulseAmt * 4;
          const g = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, r);
          g.addColorStop(0, hsl(pc.hue, 95, 70, 0.15 + e * 0.45, mode));
          g.addColorStop(1, hsl(pc.hue, 90, 50, 0, mode));
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Voice-leading trails from previous chord
      if (trail.length > 0 && tones.length > 0 && geometry) {
        const n = Math.min(trail.length, tones.length);
        for (let i = 0; i < n; i++) {
          const a = trail[i]!;
          const b = tones[i]!;
          const p0 = polar(cx, cy, noteR, fifthsAngle(a.fifthsIndex, rot));
          const p1 = polar(cx, cy, noteR, fifthsAngle(b.fifthsIndex, rot));
          ctx.strokeStyle = hsl(b.hue, 70, 65, 0.28, mode);
          ctx.lineWidth = 1.5;
          ctx.setLineDash([2, 5]);
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.quadraticCurveTo(cx, cy, p1.x, p1.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      const disc = ctx.createRadialGradient(cx, cy, 0, cx, cy, innerR);
      disc.addColorStop(0, pureLight ? "#0a0a12" : "#14141a");
      disc.addColorStop(0.75, "#0c0c11");
      disc.addColorStop(1, "#09090c");
      ctx.fillStyle = disc;
      ctx.beginPath();
      ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
      ctx.fill();

      const activeIds = new Set(tones.map((p) => p.id));
      const multiIds = new Set(multi.map((p) => p.id));

      for (const p of tones) {
        const a = fifthsAngle(p.fifthsIndex, rot);
        const half = (Math.PI * 2) / 12 / 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, outerR * 1.01, a - half * 0.9, a + half * 0.9);
        ctx.closePath();
        const g = ctx.createRadialGradient(cx, cy, coreR, cx, cy, outerR);
        g.addColorStop(0, hsl(p.hue, 80, 70, (0.1 + pulseAmt * 0.12) * fx, mode));
        g.addColorStop(0.5, hsl(p.hue, 90, 55, (0.18 + pulseAmt * 0.14) * fx, mode));
        g.addColorStop(1, hsl(p.hue, 90, 50, 0, mode));
        ctx.fillStyle = g;
        ctx.fill();
      }

      if (geometry && tones.length >= 2) {
        const pts = tones.map((p) => polar(cx, cy, noteR, fifthsAngle(p.fifthsIndex, rot)));
        ctx.save();
        ctx.beginPath();
        pts.forEach((pt, i) => {
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.closePath();
        ctx.fillStyle = mixHues(
          tones.map((p) => p.hue),
          0.14 + pulseAmt * 0.1,
          mode,
        );
        ctx.fill();
        ctx.strokeStyle = mixHues(
          tones.map((p) => p.hue),
          0.6 + pulseAmt * 0.25,
          mode,
        );
        ctx.lineWidth = 1.75 + pulseAmt;
        ctx.shadowColor = mixHues(
          tones.map((p) => p.hue),
          0.9,
          mode,
        );
        ctx.shadowBlur = (14 + pulseAmt * 20) * fx;
        ctx.stroke();
        ctx.shadowBlur = 0;
        for (let i = 0; i < pts.length; i++) {
          const p = tones[i]!;
          const pt = pts[i]!;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 4.5 + pulseAmt * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = hsl(p.hue, 90, 72, 0.98, mode);
          ctx.fill();
        }
        ctx.restore();
      }

      const parts = particlesRef.current;
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i]!;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.life -= 0.016 / p.max;
        if (p.life <= 0) {
          parts.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = hsl(p.hue, 90, 65, p.life * 0.85, mode);
        ctx.fill();
      }

      if (!pureLight || tones.length > 0) {
        const fontSize = Math.max(11, size * 0.03);
        const labelFs = Math.max(8, size * 0.017);
        ctx.font = `600 ${fontSize}px system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        for (const p of FIFTHS) {
          const a = fifthsAngle(p.fifthsIndex, rot);
          const pt = polar(cx, cy, noteR, a);
          const active = activeIds.has(p.id);
          const selected = multiIds.has(p.id);
          if (pureLight && !active && !selected) continue;
          const nodeR = active ? 15 + pulseAmt * 4 : selected ? 14 : 12.5;

          if (selected && !active) {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, nodeR + 4, 0, Math.PI * 2);
            ctx.strokeStyle = hsl(p.hue, 80, 70, 0.7, mode);
            ctx.lineWidth = 2;
            ctx.stroke();
          }

          if (active) {
            const ng = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, nodeR * 2.6);
            ng.addColorStop(0, hsl(p.hue, 90, 70, 0.55 * fx, mode));
            ng.addColorStop(1, hsl(p.hue, 90, 50, 0, mode));
            ctx.fillStyle = ng;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, nodeR * 2.6, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.beginPath();
          ctx.arc(pt.x, pt.y, nodeR, 0, Math.PI * 2);
          ctx.fillStyle = active ? hsl(p.hue, 78, 46, 0.96, mode) : "hsla(0 0% 7% / 0.88)";
          ctx.fill();
          ctx.strokeStyle = active ? hsl(p.hue, 85, 78, 0.98, mode) : hsl(p.hue, 75, 58, 0.5, mode);
          ctx.lineWidth = active ? 2.25 : 1.3;
          ctx.stroke();

          ctx.fillStyle = active ? "#ffffff" : "hsla(0 0% 94% / 0.88)";
          ctx.font = `600 ${fontSize}px system-ui, sans-serif`;
          ctx.fillText(p.label, pt.x, pt.y);

          // Color name under active tones
          if (active && !pureLight) {
            ctx.font = `500 ${labelFs}px system-ui, sans-serif`;
            ctx.fillStyle = hsl(p.hue, 40, 78, 0.85, mode);
            const outward = polar(cx, cy, noteR + nodeR + labelFs + 2, a);
            ctx.fillText(p.colorName, outward.x, outward.y);
          }
        }
      }

      // Center core - additive mix of chord light
      const corePulse = coreR * (1 + pulseAmt * 0.18);
      const coreG = ctx.createRadialGradient(cx, cy, 0, cx, cy, corePulse * 3.2);
      if (tones.length > 0) {
        coreG.addColorStop(0, "hsla(0 0% 100% / 0.98)");
        coreG.addColorStop(
          0.22,
          mixHues(
            tones.map((p) => p.hue),
            0.82,
            mode,
          ),
        );
        coreG.addColorStop(
          0.55,
          mixHues(
            tones.map((p) => p.hue),
            0.28,
            mode,
          ),
        );
        coreG.addColorStop(1, "hsla(0 0% 0% / 0)");
      } else {
        coreG.addColorStop(0, "hsla(0 0% 100% / 0.94)");
        coreG.addColorStop(0.35, "hsla(0 0% 95% / 0.3)");
        coreG.addColorStop(1, "hsla(0 0% 0% / 0)");
      }
      ctx.fillStyle = coreG;
      ctx.beginPath();
      ctx.arc(cx, cy, corePulse * 3.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, corePulse * 0.52, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = tones.length
        ? mixHues(
            tones.map((p) => p.hue),
            0.9,
            mode,
          )
        : "hsla(0 0% 100% / 0.85)";
      ctx.shadowBlur = (20 + pulseAmt * 24) * fx;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Center caption: named additive color of the chord mix
      if (tones.length >= 2 && !pureLight && size > 260) {
        const mixName = mixColorName(tones);
        ctx.font = `500 ${Math.max(8, size * 0.016)}px system-ui, sans-serif`;
        ctx.fillStyle = "hsla(0 0% 100% / 0.55)";
        ctx.textAlign = "center";
        ctx.fillText(mixName, cx, cy + corePulse * 2.15);
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const angleAt = (cx: number, cy: number, x: number, y: number) => Math.atan2(y - cy, x - cx);

    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      dragRef.current = {
        dragging: true,
        lastAngle: angleAt(rect.width / 2, rect.height / 2, e.clientX - rect.left, e.clientY - rect.top),
        moved: false,
        pointerId: e.pointerId,
        downT: performance.now(),
      };
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d.dragging) return;
      const rect = canvas.getBoundingClientRect();
      const ang = angleAt(rect.width / 2, rect.height / 2, e.clientX - rect.left, e.clientY - rect.top);
      let delta = ang - d.lastAngle;
      if (delta > Math.PI) delta -= Math.PI * 2;
      if (delta < -Math.PI) delta += Math.PI * 2;
      if (Math.abs(delta) > 0.008) d.moved = true;
      d.lastAngle = ang;
      onRotationChange(stateRef.current.rotation + delta);
    };

    const onUp = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d.dragging) return;
      d.dragging = false;
      if (!d.moved) {
        const hit = hitTest(e.clientX, e.clientY);
        if (hit) {
          const dt = Math.min(400, performance.now() - d.downT);
          const velocity = 0.45 + (1 - dt / 400) * 0.55;
          onSelectRoot(hit, velocity);
        }
      }
      try {
        if (d.pointerId != null) canvas.releasePointerCapture(d.pointerId);
      } catch {
        /* ignore */
      }
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    return () => {
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
  }, [hitTest, onRotationChange, onSelectRoot]);

  return (
    <div className={className} style={{ position: "relative", width: "100%", height: "100%" }}>
      <SpectrumGL
        className="absolute inset-0 h-full w-full"
        rotation={rotation}
        pulse={pulse}
        intensity={intensity}
        pureLight={pureLight}
        activeTones={activeTones}
        resonanceEnergy={resonanceEnergy}
        tilt={tilt}
        enabled={shaders}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ touchAction: "none", display: "block", width: "100%", height: "100%" }}
        aria-label="ColorChord dual wheel - Circle of Fifths mapped to the spectral color wheel"
      />
    </div>
  );
}
