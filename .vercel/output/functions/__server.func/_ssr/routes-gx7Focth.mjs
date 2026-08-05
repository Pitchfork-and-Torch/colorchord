import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { M as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as cn, t as Button } from "./button-pF9ahLE2.mjs";
import { _ as pitchByMidi, a as beamColor$1, b as theoryBlurb, c as complementaryPitch, d as hsl, f as inferQuality, g as parseChordSymbol, h as nearestPitchFromFrequency, i as VOICE_LABELS, l as fifthsAngle, m as mixHues, n as PROGRESSIONS, o as chordColorLookup, p as mixColorName, r as QUALITY_LABELS, s as chordPitches, t as FIFTHS, u as frequencyOf, v as polar, x as theoryHeadline, y as romanDegree } from "./theory-C76ANaGL.mjs";
import { C as CircleDot, S as Download, T as ChevronDown, _ as Maximize2, a as Upload, b as Eye, c as Sparkles, d as Radio, f as Play, g as MicOff, h as Mic, i as Volume2, l as Share2, m as Moon, n as Waves, p as Pause, r as VolumeX, s as Square, t as X, u as RotateCcw, v as Info, w as ChevronUp, x as EyeOff, y as Flashlight } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-gx7Focth.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LumenCanvas({ rotation, quality: _quality, activeRoot, activeTones, expandedSpectrum, showGeometry, pureLight, pulse, visionMode, tilt, burstKey, intensity, resonanceEnergy = [], scalePitches = [], multiSelect = [], trailTones = [], onSelectRoot, onRotationChange, className }) {
	const canvasRef = (0, import_react.useRef)(null);
	const dragRef = (0, import_react.useRef)({
		dragging: false,
		lastAngle: 0,
		moved: false,
		pointerId: null,
		downT: 0
	});
	const animRef = (0, import_react.useRef)(0);
	const particlesRef = (0, import_react.useRef)([]);
	const stateRef = (0, import_react.useRef)({
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
		trailTones
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
		trailTones
	};
	(0, import_react.useEffect)(() => {
		if (burstKey === 0) return;
		const canvas = canvasRef.current;
		if (!canvas) return;
		const rect = canvas.getBoundingClientRect();
		const cx = rect.width / 2;
		const cy = rect.height / 2;
		const noteR = Math.min(rect.width, rect.height) * .3;
		const tones = stateRef.current.activeTones;
		const rot = stateRef.current.rotation;
		const mult = 10 + Math.round(stateRef.current.intensity * 12);
		for (const p of tones) {
			const a = fifthsAngle(p.fifthsIndex, rot);
			const pt = polar(cx, cy, noteR, a);
			for (let i = 0; i < mult; i++) {
				const ang = a + (Math.random() - .5) * 1.2;
				const sp = .5 + Math.random() * (1.8 + intensity * 1.4);
				particlesRef.current.push({
					x: pt.x,
					y: pt.y,
					vx: Math.cos(ang) * sp,
					vy: Math.sin(ang) * sp,
					life: 1,
					max: .7 + Math.random() * .9,
					hue: p.hue,
					size: 1.1 + Math.random() * (2.5 + intensity * 1.5)
				});
			}
		}
		if (particlesRef.current.length > 220) particlesRef.current = particlesRef.current.slice(-180);
	}, [burstKey, intensity]);
	const hitTest = (0, import_react.useCallback)((clientX, clientY) => {
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
		const outerR = size * .44;
		const innerR = size * .24;
		const dx = x - cx;
		const dy = y - cy;
		const dist = Math.hypot(dx, dy);
		if (dist < innerR * .4 || dist > outerR * 1.14) return null;
		const { rotation: rot } = stateRef.current;
		let rel = Math.atan2(dy, dx) + Math.PI / 2 - rot;
		while (rel < 0) rel += Math.PI * 2;
		while (rel >= Math.PI * 2) rel -= Math.PI * 2;
		const idx = Math.round(rel / (Math.PI * 2) * 12) % 12;
		return FIFTHS[idx] ?? null;
	}, []);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d", { alpha: false });
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
		const draw = (t) => {
			const { rotation: rot, activeRoot: root, activeTones: tones, expandedSpectrum: expanded, showGeometry: geometry, pureLight, pulse: pulseAmt, visionMode: mode, tilt: tiltNow, intensity: intens, resonanceEnergy: resE, scalePitches: scalePts, multiSelect: multi, trailTones: trail } = stateRef.current;
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			const w = canvas.width / dpr;
			const h = canvas.height / dpr;
			if (w < 2 || h < 2) {
				animRef.current = requestAnimationFrame(draw);
				return;
			}
			const parallaxX = tiltNow.gamma / 45 * Math.min(14, w * .02);
			const parallaxY = tiltNow.beta / 45 * Math.min(14, h * .02);
			const cx = w / 2 + parallaxX;
			const cy = h / 2 + parallaxY;
			const size = Math.min(w, h);
			const outerR = size * (pureLight ? .48 : .44);
			const midR = size * (pureLight ? .38 : .36);
			const noteR = size * .3;
			const innerR = size * .22;
			const coreR = size * .065;
			const fx = .55 + intens * .55;
			ctx.fillStyle = pureLight ? "#030306" : "#070709";
			ctx.fillRect(0, 0, w, h);
			if (!pureLight) for (let i = 0; i < 70; i++) {
				const sx = (Math.sin(42 + i * 12.3) * .5 + .5) * w;
				const sy = (Math.cos(42 + i * 7.1) * .5 + .5) * h;
				const a = .1 + .35 * (.5 + .5 * Math.sin(t * .001 + i));
				ctx.fillStyle = `rgba(240,240,245,${a * .4})`;
				ctx.beginPath();
				ctx.arc(sx, sy, i % 9 === 0 ? 1.1 : .5, 0, Math.PI * 2);
				ctx.fill();
			}
			if (tones.length > 0) for (const p of tones) {
				const a = fifthsAngle(p.fifthsIndex, rot);
				const tip = polar(cx, cy, outerR * 1.35, a);
				const g = ctx.createLinearGradient(cx, cy, tip.x, tip.y);
				g.addColorStop(0, hsl(p.hue, 90, 70, (.14 + pulseAmt * .18) * fx, mode));
				g.addColorStop(.55, hsl(p.hue, 90, 55, (.06 + pulseAmt * .08) * fx, mode));
				g.addColorStop(1, hsl(p.hue, 90, 50, 0, mode));
				ctx.strokeStyle = g;
				ctx.lineWidth = (8 + pulseAmt * 14) * (.7 + intens * .5);
				ctx.beginPath();
				ctx.moveTo(cx, cy);
				ctx.lineTo(tip.x, tip.y);
				ctx.stroke();
			}
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
				cg.addColorStop(0, hsl(root.hue, 80, 60, .45, mode));
				cg.addColorStop(.5, "hsla(0 0% 100% / 0.12)");
				cg.addColorStop(1, hsl(comp.hue, 80, 60, .45, mode));
				ctx.strokeStyle = cg;
				ctx.beginPath();
				ctx.moveTo(p0.x, p0.y);
				ctx.lineTo(p1.x, p1.y);
				ctx.stroke();
				ctx.setLineDash([]);
				ctx.beginPath();
				ctx.arc(p1.x, p1.y, 3.5, 0, Math.PI * 2);
				ctx.strokeStyle = hsl(comp.hue, 70, 65, .55, mode);
				ctx.lineWidth = 1;
				ctx.stroke();
				ctx.restore();
			}
			if (expanded && !pureLight) {
				const uvR = outerR * 1.1;
				const irR = outerR * 1.18;
				const gUv = ctx.createRadialGradient(cx, cy, outerR * .95, cx, cy, irR);
				gUv.addColorStop(0, "hsla(265 80% 55% / 0)");
				gUv.addColorStop(.4, `hsla(265 70% 55% / ${.08 + pulseAmt * .06})`);
				gUv.addColorStop(.7, `hsla(200 60% 50% / ${.05 + pulseAmt * .03})`);
				gUv.addColorStop(1, `hsla(12 90% 45% / ${.06 + pulseAmt * .04})`);
				ctx.fillStyle = gUv;
				ctx.beginPath();
				ctx.arc(cx, cy, irR, 0, Math.PI * 2);
				ctx.fill();
				ctx.save();
				ctx.setLineDash([3, 7]);
				ctx.lineWidth = 1;
				ctx.strokeStyle = `hsla(270 70% 70% / ${.26 + pulseAmt * .12})`;
				ctx.beginPath();
				ctx.arc(cx, cy, uvR, 0, Math.PI * 2);
				ctx.stroke();
				ctx.strokeStyle = `hsla(12 85% 55% / ${.2 + pulseAmt * .1})`;
				ctx.beginPath();
				ctx.arc(cx, cy, irR * .98, 0, Math.PI * 2);
				ctx.stroke();
				ctx.setLineDash([]);
				const fs = Math.max(8, size * .018);
				ctx.font = `500 ${fs}px system-ui, sans-serif`;
				ctx.fillStyle = "hsla(270 60% 75% / 0.45)";
				ctx.textAlign = "center";
				ctx.fillText("UV", cx, cy - uvR - 4);
				ctx.fillStyle = "hsla(12 80% 65% / 0.4)";
				ctx.fillText("IR", cx, cy - irR * .98 - 4);
				ctx.restore();
			}
			const segs = pureLight ? 96 : 144;
			for (let i = 0; i < segs; i++) {
				const a0 = -Math.PI / 2 + i / segs * Math.PI * 2 + rot;
				const a1 = -Math.PI / 2 + (i + 1.05) / segs * Math.PI * 2 + rot;
				const hue = i / segs * 360;
				ctx.beginPath();
				ctx.arc(cx, cy, outerR, a0, a1);
				ctx.arc(cx, cy, midR, a1, a0, true);
				ctx.closePath();
				ctx.fillStyle = hsl(hue, pureLight ? 95 : 90, pureLight ? 58 : 54, pureLight ? 1 : .95, mode);
				ctx.fill();
			}
			ctx.strokeStyle = "hsla(0 0% 100% / 0.14)";
			ctx.lineWidth = 1.5;
			ctx.beginPath();
			ctx.arc(cx, cy, outerR + .5, 0, Math.PI * 2);
			ctx.stroke();
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
			if (scalePts.length > 0 && !pureLight) for (const p of scalePts) {
				const a = fifthsAngle(p.fifthsIndex, rot);
				const half = Math.PI * 2 / 12 / 2;
				ctx.beginPath();
				ctx.arc(cx, cy, midR - 2, a - half * .85, a + half * .85);
				ctx.strokeStyle = hsl(p.hue, 70, 60, .22 + .08 * Math.sin(t * .002 + p.fifthsIndex), mode);
				ctx.lineWidth = 6;
				ctx.stroke();
			}
			if (resE && resE.length === 12) for (let i = 0; i < 12; i++) {
				const e = resE[i] ?? 0;
				if (e < .12) continue;
				const pc = FIFTHS.find((p) => p.midi === i);
				if (!pc) continue;
				const a = fifthsAngle(pc.fifthsIndex, rot);
				const pt = polar(cx, cy, noteR, a);
				const r = 10 + e * 22 + pulseAmt * 4;
				const g = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, r);
				g.addColorStop(0, hsl(pc.hue, 95, 70, .15 + e * .45, mode));
				g.addColorStop(1, hsl(pc.hue, 90, 50, 0, mode));
				ctx.fillStyle = g;
				ctx.beginPath();
				ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
				ctx.fill();
			}
			if (trail.length > 0 && tones.length > 0 && geometry) {
				const n = Math.min(trail.length, tones.length);
				for (let i = 0; i < n; i++) {
					const a = trail[i];
					const b = tones[i];
					const p0 = polar(cx, cy, noteR, fifthsAngle(a.fifthsIndex, rot));
					const p1 = polar(cx, cy, noteR, fifthsAngle(b.fifthsIndex, rot));
					ctx.strokeStyle = hsl(b.hue, 70, 65, .28, mode);
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
			disc.addColorStop(.75, "#0c0c11");
			disc.addColorStop(1, "#09090c");
			ctx.fillStyle = disc;
			ctx.beginPath();
			ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
			ctx.fill();
			const activeIds = new Set(tones.map((p) => p.id));
			const multiIds = new Set(multi.map((p) => p.id));
			for (const p of tones) {
				const a = fifthsAngle(p.fifthsIndex, rot);
				const half = Math.PI * 2 / 12 / 2;
				ctx.beginPath();
				ctx.moveTo(cx, cy);
				ctx.arc(cx, cy, outerR * 1.01, a - half * .9, a + half * .9);
				ctx.closePath();
				const g = ctx.createRadialGradient(cx, cy, coreR, cx, cy, outerR);
				g.addColorStop(0, hsl(p.hue, 80, 70, (.1 + pulseAmt * .12) * fx, mode));
				g.addColorStop(.5, hsl(p.hue, 90, 55, (.18 + pulseAmt * .14) * fx, mode));
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
				ctx.fillStyle = mixHues(tones.map((p) => p.hue), .14 + pulseAmt * .1, mode);
				ctx.fill();
				ctx.strokeStyle = mixHues(tones.map((p) => p.hue), .6 + pulseAmt * .25, mode);
				ctx.lineWidth = 1.75 + pulseAmt;
				ctx.shadowColor = mixHues(tones.map((p) => p.hue), .9, mode);
				ctx.shadowBlur = (14 + pulseAmt * 20) * fx;
				ctx.stroke();
				ctx.shadowBlur = 0;
				for (let i = 0; i < pts.length; i++) {
					const p = tones[i];
					const pt = pts[i];
					ctx.beginPath();
					ctx.arc(pt.x, pt.y, 4.5 + pulseAmt * 2.5, 0, Math.PI * 2);
					ctx.fillStyle = hsl(p.hue, 90, 72, .98, mode);
					ctx.fill();
				}
				ctx.restore();
			}
			const parts = particlesRef.current;
			for (let i = parts.length - 1; i >= 0; i--) {
				const p = parts[i];
				p.x += p.vx;
				p.y += p.vy;
				p.vx *= .985;
				p.vy *= .985;
				p.life -= .016 / p.max;
				if (p.life <= 0) {
					parts.splice(i, 1);
					continue;
				}
				ctx.beginPath();
				ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
				ctx.fillStyle = hsl(p.hue, 90, 65, p.life * .85, mode);
				ctx.fill();
			}
			if (!pureLight || tones.length > 0) {
				const fontSize = Math.max(11, size * .03);
				const labelFs = Math.max(8, size * .017);
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
						ctx.strokeStyle = hsl(p.hue, 80, 70, .7, mode);
						ctx.lineWidth = 2;
						ctx.stroke();
					}
					if (active) {
						const ng = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, nodeR * 2.6);
						ng.addColorStop(0, hsl(p.hue, 90, 70, .55 * fx, mode));
						ng.addColorStop(1, hsl(p.hue, 90, 50, 0, mode));
						ctx.fillStyle = ng;
						ctx.beginPath();
						ctx.arc(pt.x, pt.y, nodeR * 2.6, 0, Math.PI * 2);
						ctx.fill();
					}
					ctx.beginPath();
					ctx.arc(pt.x, pt.y, nodeR, 0, Math.PI * 2);
					ctx.fillStyle = active ? hsl(p.hue, 78, 46, .96, mode) : "hsla(0 0% 7% / 0.88)";
					ctx.fill();
					ctx.strokeStyle = active ? hsl(p.hue, 85, 78, .98, mode) : hsl(p.hue, 75, 58, .5, mode);
					ctx.lineWidth = active ? 2.25 : 1.3;
					ctx.stroke();
					ctx.fillStyle = active ? "#ffffff" : "hsla(0 0% 94% / 0.88)";
					ctx.font = `600 ${fontSize}px system-ui, sans-serif`;
					ctx.fillText(p.label, pt.x, pt.y);
					if (active && !pureLight) {
						ctx.font = `500 ${labelFs}px system-ui, sans-serif`;
						ctx.fillStyle = hsl(p.hue, 40, 78, .85, mode);
						const outward = polar(cx, cy, noteR + nodeR + labelFs + 2, a);
						ctx.fillText(p.colorName, outward.x, outward.y);
					}
				}
			}
			const corePulse = coreR * (1 + pulseAmt * .18);
			const coreG = ctx.createRadialGradient(cx, cy, 0, cx, cy, corePulse * 3.2);
			if (tones.length > 0) {
				coreG.addColorStop(0, "hsla(0 0% 100% / 0.98)");
				coreG.addColorStop(.22, mixHues(tones.map((p) => p.hue), .82, mode));
				coreG.addColorStop(.55, mixHues(tones.map((p) => p.hue), .28, mode));
				coreG.addColorStop(1, "hsla(0 0% 0% / 0)");
			} else {
				coreG.addColorStop(0, "hsla(0 0% 100% / 0.94)");
				coreG.addColorStop(.35, "hsla(0 0% 95% / 0.3)");
				coreG.addColorStop(1, "hsla(0 0% 0% / 0)");
			}
			ctx.fillStyle = coreG;
			ctx.beginPath();
			ctx.arc(cx, cy, corePulse * 3.2, 0, Math.PI * 2);
			ctx.fill();
			ctx.beginPath();
			ctx.arc(cx, cy, corePulse * .52, 0, Math.PI * 2);
			ctx.fillStyle = "#ffffff";
			ctx.shadowColor = tones.length ? mixHues(tones.map((p) => p.hue), .9, mode) : "hsla(0 0% 100% / 0.85)";
			ctx.shadowBlur = (20 + pulseAmt * 24) * fx;
			ctx.fill();
			ctx.shadowBlur = 0;
			if (tones.length >= 2 && !pureLight && size > 280) {
				ctx.font = `500 ${Math.max(8, size * .016)}px system-ui, sans-serif`;
				ctx.fillStyle = "hsla(0 0% 100% / 0.45)";
				ctx.textAlign = "center";
				ctx.fillText("additive mix", cx, cy + corePulse * 2.1);
			}
			animRef.current = requestAnimationFrame(draw);
		};
		animRef.current = requestAnimationFrame(draw);
		return () => {
			cancelAnimationFrame(animRef.current);
			ro.disconnect();
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const angleAt = (cx, cy, x, y) => Math.atan2(y - cy, x - cx);
		const onDown = (e) => {
			const rect = canvas.getBoundingClientRect();
			dragRef.current = {
				dragging: true,
				lastAngle: angleAt(rect.width / 2, rect.height / 2, e.clientX - rect.left, e.clientY - rect.top),
				moved: false,
				pointerId: e.pointerId,
				downT: performance.now()
			};
			canvas.setPointerCapture(e.pointerId);
		};
		const onMove = (e) => {
			const d = dragRef.current;
			if (!d.dragging) return;
			const rect = canvas.getBoundingClientRect();
			const ang = angleAt(rect.width / 2, rect.height / 2, e.clientX - rect.left, e.clientY - rect.top);
			let delta = ang - d.lastAngle;
			if (delta > Math.PI) delta -= Math.PI * 2;
			if (delta < -Math.PI) delta += Math.PI * 2;
			if (Math.abs(delta) > .008) d.moved = true;
			d.lastAngle = ang;
			onRotationChange(stateRef.current.rotation + delta);
		};
		const onUp = (e) => {
			const d = dragRef.current;
			if (!d.dragging) return;
			d.dragging = false;
			if (!d.moved) {
				const hit = hitTest(e.clientX, e.clientY);
				if (hit) onSelectRoot(hit, .45 + (1 - Math.min(400, performance.now() - d.downT) / 400) * .55);
			}
			try {
				if (d.pointerId != null) canvas.releasePointerCapture(d.pointerId);
			} catch {}
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
	}, [
		hitTest,
		onRotationChange,
		onSelectRoot
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref: canvasRef,
		className,
		style: {
			touchAction: "none",
			display: "block",
			width: "100%",
			height: "100%"
		},
		"aria-label": "Color Chord dual wheel — Circle of Fifths mapped to the spectral color wheel"
	});
}
/** High-quality multi-voice Web Audio engine for Color Chord */
var ctx = null;
var master = null;
var compressor = null;
var dryGain = null;
var wetGain = null;
var convolver = null;
var ambientGain = null;
var ambientNodes = [];
var voice = "pad";
var rotationPan = 0;
var masterVol = .85;
var active = /* @__PURE__ */ new Map();
function ensure() {
	if (!ctx || ctx.state === "closed") {
		ctx = new AudioContext();
		master = ctx.createGain();
		master.gain.value = .001;
		compressor = ctx.createDynamicsCompressor();
		compressor.threshold.value = -18;
		compressor.knee.value = 18;
		compressor.ratio.value = 3.5;
		compressor.attack.value = .003;
		compressor.release.value = .18;
		dryGain = ctx.createGain();
		dryGain.gain.value = .52;
		wetGain = ctx.createGain();
		wetGain.gain.value = .48;
		convolver = ctx.createConvolver();
		convolver.buffer = makeImpulse(ctx, 2.4, 1.85);
		dryGain.connect(compressor);
		wetGain.connect(compressor);
		convolver.connect(wetGain);
		compressor.connect(master);
		master.connect(ctx.destination);
		ambientGain = ctx.createGain();
		ambientGain.gain.value = 0;
		ambientGain.connect(dryGain);
		ambientGain.connect(convolver);
		master.gain.setValueAtTime(.32 * masterVol, ctx.currentTime);
	}
	return ctx;
}
function makeImpulse(c, seconds, decay) {
	const rate = c.sampleRate;
	const len = Math.floor(rate * seconds);
	const buffer = c.createBuffer(2, len, rate);
	for (let ch = 0; ch < 2; ch++) {
		const data = buffer.getChannelData(ch);
		for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
	}
	return buffer;
}
function assertMasterGain() {
	if (!master || !ctx || ctx.state === "closed") return;
	const target = .32 * masterVol;
	try {
		const t = ctx.currentTime;
		master.gain.cancelScheduledValues(t);
		master.gain.setValueAtTime(Math.max(master.gain.value, target * .01), t);
		master.gain.linearRampToValueAtTime(target, t + .03);
	} catch {}
}
/**
* Must be called synchronously inside a user gesture (tap/click).
* Do NOT await anything before calling this — browsers drop the gesture chain.
*/
function unlockAudio() {
	const c = ensure();
	if (c.state === "suspended" || c.state === "interrupted") c.resume().then(() => assertMasterGain());
	assertMasterGain();
	return c;
}
async function resumeAudio() {
	const c = ensure();
	if (c.state === "suspended" || c.state === "interrupted") try {
		await c.resume();
	} catch {}
	assertMasterGain();
	return c;
}
function setMasterVolume(v) {
	masterVol = Math.max(0, Math.min(1, v));
	ensure();
	assertMasterGain();
}
/** Current intended master (0–1) for mic restore paths. */
function getMasterVolume() {
	return masterVol;
}
function setSynthVoice(v) {
	voice = v;
}
function setRotationPan(rotationRad) {
	rotationPan = Math.sin(rotationRad) * .55;
	const c = ensure();
	for (const h of active.values()) h.panner.pan.setTargetAtTime(rotationPan, c.currentTime, .05);
}
function keyFor(midiPc, octave) {
	return `${midiPc}:${octave}`;
}
function connectOut(node, c) {
	const panner = c.createStereoPanner();
	panner.pan.value = rotationPan;
	node.connect(panner);
	panner.connect(dryGain);
	panner.connect(convolver);
	return panner;
}
function voicePartials(v) {
	switch (v) {
		case "pure": return [{
			ratio: 1,
			gain: 1,
			type: "sine"
		}];
		case "organ": return [
			{
				ratio: 1,
				gain: .7,
				type: "sine"
			},
			{
				ratio: 2,
				gain: .45,
				type: "sine"
			},
			{
				ratio: 3,
				gain: .22,
				type: "sine"
			},
			{
				ratio: 4,
				gain: .14,
				type: "sine"
			},
			{
				ratio: 6,
				gain: .08,
				type: "sine"
			}
		];
		case "piano": return [
			{
				ratio: 1,
				gain: .85,
				type: "triangle"
			},
			{
				ratio: 2,
				gain: .28,
				type: "sine"
			},
			{
				ratio: 3,
				gain: .12,
				type: "sine"
			},
			{
				ratio: 4.01,
				gain: .06,
				type: "sine"
			},
			{
				ratio: 5.04,
				gain: .04,
				type: "sine"
			}
		];
		case "strings": return [
			{
				ratio: 1,
				gain: .55,
				type: "sawtooth"
			},
			{
				ratio: 1.003,
				gain: .35,
				type: "sawtooth"
			},
			{
				ratio: 2,
				gain: .18,
				type: "sine"
			},
			{
				ratio: 3,
				gain: .08,
				type: "sine"
			}
		];
		default: return [
			{
				ratio: 1,
				gain: .55,
				type: "sine"
			},
			{
				ratio: 1.01,
				gain: .35,
				type: "sine"
			},
			{
				ratio: 2,
				gain: .2,
				type: "triangle"
			},
			{
				ratio: 3,
				gain: .08,
				type: "sine"
			},
			{
				ratio: .5,
				gain: .12,
				type: "sine"
			}
		];
	}
}
function envFor(v, duration) {
	switch (v) {
		case "piano": return {
			attack: .008,
			decay: .25,
			sustain: .35,
			release: Math.min(.9, duration * .45)
		};
		case "organ": return {
			attack: .02,
			decay: .05,
			sustain: .85,
			release: .2
		};
		case "strings": return {
			attack: .12,
			decay: .2,
			sustain: .7,
			release: .55
		};
		case "pure": return {
			attack: .025,
			decay: .05,
			sustain: .8,
			release: .4
		};
		default: return {
			attack: .08,
			decay: .18,
			sustain: .65,
			release: .55
		};
	}
}
function playTone(midiPc, options = {}) {
	const c = unlockAudio();
	const octave = options.octave ?? 4;
	const duration = options.duration ?? 1.4;
	const velocity = Math.max(.05, Math.min(1, options.velocity ?? .85));
	const v = options.voice ?? voice;
	const freq = frequencyOf(midiPc, octave);
	const id = keyFor(midiPc, octave);
	stopTone(midiPc, octave, .03);
	const mix = c.createGain();
	mix.gain.value = 0;
	const panner = connectOut(mix, c);
	const partials = voicePartials(v);
	const oscs = [];
	let mod = null;
	let modGain = null;
	if (v === "pad" || v === "strings") {
		mod = c.createOscillator();
		modGain = c.createGain();
		mod.frequency.value = freq * (v === "strings" ? 1.5 : 2);
		modGain.gain.value = freq * (v === "strings" ? .8 : .35);
		mod.connect(modGain);
	}
	for (const p of partials) {
		const osc = c.createOscillator();
		osc.type = p.type ?? "sine";
		osc.frequency.value = freq * p.ratio;
		if (modGain && p.ratio === 1) modGain.connect(osc.frequency);
		const g = c.createGain();
		g.gain.value = p.gain * velocity;
		if (v === "strings" || v === "pad") {
			const f = c.createBiquadFilter();
			f.type = "lowpass";
			f.frequency.value = v === "strings" ? 3200 : 2400;
			f.Q.value = .4;
			osc.connect(f);
			f.connect(g);
		} else osc.connect(g);
		g.connect(mix);
		oscs.push(osc);
	}
	const env = envFor(v, duration);
	const now = c.currentTime;
	const peak = .55 * velocity;
	mix.gain.setValueAtTime(0, now);
	mix.gain.linearRampToValueAtTime(peak, now + env.attack);
	mix.gain.linearRampToValueAtTime(peak * env.sustain, now + env.attack + env.decay);
	const relStart = now + Math.max(env.attack + env.decay, duration - env.release);
	mix.gain.setValueAtTime(peak * env.sustain, relStart);
	mix.gain.exponentialRampToValueAtTime(.001, relStart + env.release);
	for (const osc of oscs) {
		osc.start(now);
		osc.stop(relStart + env.release + .05);
	}
	mod?.start(now);
	mod?.stop(relStart + env.release + .05);
	const handle = {
		panner,
		stop: (release = .08) => {
			const t = c.currentTime;
			try {
				const cur = Math.max(mix.gain.value || 0, .001);
				mix.gain.cancelScheduledValues(t);
				mix.gain.setValueAtTime(cur, t);
				mix.gain.exponentialRampToValueAtTime(.001, t + release);
				for (const osc of oscs) try {
					osc.stop(t + release + .03);
				} catch {}
				try {
					mod?.stop(t + release + .03);
				} catch {}
			} catch {}
		}
	};
	active.set(id, handle);
}
function playChord(midis, options = {}) {
	unlockAudio();
	const octave = options.octave ?? 4;
	const duration = options.duration ?? 1.7;
	const velocity = options.velocity ?? .85;
	midis.forEach((m, i) => {
		playTone(m, {
			octave: octave + (i >= 3 ? 1 : 0),
			duration: duration + i * .03,
			velocity: velocity * (1 - i * .06),
			voice: options.voice
		});
	});
}
function stopTone(midiPc, octave = 4, release = .08) {
	const id = keyFor(midiPc, octave);
	const entry = active.get(id);
	if (!entry) return;
	entry.stop(release);
	active.delete(id);
}
function stopAll(release = .06) {
	for (const [id, entry] of active) {
		entry.stop(release);
		active.delete(id);
	}
}
function startAmbient(midis, level = .08) {
	const c = unlockAudio();
	stopAmbient();
	if (!ambientGain || midis.length === 0) return;
	ambientGain.gain.cancelScheduledValues(c.currentTime);
	ambientGain.gain.setTargetAtTime(level * masterVol, c.currentTime, .8);
	for (let i = 0; i < midis.length; i++) {
		const freq = frequencyOf(midis[i], 3 + i % 2);
		const osc = c.createOscillator();
		const g = c.createGain();
		osc.type = "sine";
		osc.frequency.value = freq;
		const lfo = c.createOscillator();
		const lfoG = c.createGain();
		lfo.frequency.value = .04 + i * .015;
		lfoG.gain.value = 1.5 + i;
		lfo.connect(lfoG);
		lfoG.connect(osc.frequency);
		g.gain.value = .25 / midis.length;
		osc.connect(g);
		g.connect(ambientGain);
		osc.start();
		lfo.start();
		ambientNodes.push(osc, lfo);
	}
}
function stopAmbient() {
	if (!ctx || ctx.state === "closed" || !ambientGain) return;
	ambientGain.gain.setTargetAtTime(0, ctx.currentTime, .4);
	for (const n of ambientNodes) try {
		n.stop(ctx.currentTime + .6);
	} catch {}
	ambientNodes = [];
}
/** Shared engine context — mic analysis must use this, never a second AudioContext. */
function getAudioContext() {
	return ensure();
}
var stream$1 = null;
var torchTrack = null;
var torchSupported = null;
var torchOn = false;
var lightShow = false;
var mode = "off";
var beamEl = null;
var beamIntensity = 0;
var beamColor = "hsl(0 0% 100%)";
var anim = null;
var envelope = {
	attack: .04,
	sustain: .85,
	release: .45,
	hold: 1.2,
	peak: .92
};
var envStart = 0;
var envActive = false;
function setLightMode(m) {
	mode = m;
	if (m === "off") {
		setTorch(false);
		setBeamInstant(0);
	}
}
function setLightShow(on) {
	lightShow = on;
	if (!on && !envActive) {
		setTorch(false);
		setBeamInstant(0);
	}
}
async function detectTorchSupport() {
	if (torchSupported != null) return torchSupported;
	if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
		torchSupported = false;
		return false;
	}
	try {
		const s = await navigator.mediaDevices.getUserMedia({
			video: { facingMode: { ideal: "environment" } },
			audio: false
		});
		const caps = s.getVideoTracks()[0]?.getCapabilities?.();
		const ok = Boolean(caps && "torch" in caps && caps.torch);
		s.getTracks().forEach((t) => t.stop());
		torchSupported = ok;
		return ok;
	} catch {
		torchSupported = false;
		return false;
	}
}
async function ensureTorchTrack() {
	if (torchTrack && torchTrack.readyState === "live") return torchTrack;
	if (!await detectTorchSupport()) return null;
	try {
		stream$1 = await navigator.mediaDevices.getUserMedia({
			video: { facingMode: { ideal: "environment" } },
			audio: false
		});
		torchTrack = stream$1.getVideoTracks()[0] ?? null;
		return torchTrack;
	} catch {
		torchSupported = false;
		return null;
	}
}
async function setTorch(on) {
	if (mode !== "torch" && mode !== "hybrid" && on) return;
	if (!on && !torchOn) return;
	const track = await ensureTorchTrack();
	if (!track) return;
	try {
		await track.applyConstraints({ advanced: [{ torch: on }] });
		torchOn = on;
	} catch {
		try {
			await track.applyConstraints({ advanced: [{ torch: on }] });
			torchOn = on;
		} catch {
			torchSupported = false;
		}
	}
}
function releaseTorch() {
	setTorch(false);
	stream$1?.getTracks().forEach((t) => t.stop());
	stream$1 = null;
	torchTrack = null;
}
function ensureBeamEl() {
	if (typeof document === "undefined") return null;
	if (beamEl && document.body.contains(beamEl)) return beamEl;
	beamEl = document.createElement("div");
	beamEl.id = "color-chord-beam";
	beamEl.setAttribute("aria-hidden", "true");
	Object.assign(beamEl.style, {
		position: "fixed",
		inset: "0",
		zIndex: "50",
		pointerEvents: "none",
		opacity: "0",
		transition: "opacity 40ms linear",
		background: beamColor,
		mixBlendMode: "normal"
	});
	document.body.appendChild(beamEl);
	return beamEl;
}
function setBeamInstant(intensity) {
	beamIntensity = Math.max(0, Math.min(1, intensity));
	const el = ensureBeamEl();
	if (!el) return;
	el.style.background = beamColor;
	el.style.opacity = String(beamIntensity);
	if (beamIntensity <= .001 && !lightShow) el.style.opacity = "0";
}
function setBeamColor(cssColor) {
	beamColor = cssColor;
	if (beamEl) beamEl.style.background = cssColor;
}
function envLevel(now) {
	const t = (now - envStart) / 1e3;
	const { attack, sustain, release, hold, peak } = envelope;
	if (t < 0) return 0;
	let level = 0;
	if (t < attack) level = t / attack;
	else if (t < attack + hold) level = sustain + (1 - sustain) * Math.exp(-(t - attack) * 2);
	else {
		const rt = t - attack - hold;
		if (rt < release) level = sustain * (1 - rt / release);
		else level = 0;
	}
	return level * peak;
}
function tick() {
	const now = performance.now();
	let level = envActive ? envLevel(now) : lightShow ? Math.max(beamIntensity * .35, .08) : 0;
	if (lightShow && !envActive) level = .38 + .1 * Math.sin(now / 450);
	if (mode === "screen" || mode === "hybrid") setBeamInstant(level);
	else if (mode === "off") setBeamInstant(0);
	if (mode === "torch" || mode === "hybrid") {
		const should = level > .35;
		if (should !== torchOn) setTorch(should);
	}
	if (envActive && envLevel(now) <= 0 && now - envStart > 50) {
		envActive = false;
		if (!lightShow) {
			setTorch(false);
			if (mode !== "off") setBeamInstant(0);
		}
	}
	anim = requestAnimationFrame(tick);
}
function startLightEngine() {
	if (anim != null) return;
	ensureBeamEl();
	anim = requestAnimationFrame(tick);
}
function stopLightEngine() {
	if (anim != null) cancelAnimationFrame(anim);
	anim = null;
	envActive = false;
	setBeamInstant(0);
	releaseTorch();
}
/** Fire a light envelope synced to audio attack/sustain. */
function pulseLight(cssColor, opts = {}) {
	if (mode === "off") return;
	startLightEngine();
	setBeamColor(cssColor);
	envelope = {
		attack: opts.attack ?? .04,
		hold: opts.hold ?? 1,
		release: opts.release ?? .45,
		sustain: opts.sustain ?? .82,
		peak: opts.peak ?? .92
	};
	const peak = opts.peak ?? .92;
	envStart = performance.now();
	envActive = true;
	if (mode === "screen" || mode === "hybrid") setBeamInstant(peak);
	if (mode === "torch" || mode === "hybrid") setTorch(true);
}
function holdLight(cssColor, intensity = .7) {
	if (mode === "off") return;
	startLightEngine();
	setBeamColor(cssColor);
	lightShow = true;
	setBeamInstant(intensity);
	if (mode === "torch" || mode === "hybrid") setTorch(true);
}
/** Chord-aware haptic patterns for Living Spectrum */
var enabled = true;
var intensityScale = 1;
function setHapticsEnabled(on) {
	enabled = on;
}
function setHapticsIntensity(v) {
	intensityScale = Math.max(0, Math.min(1, v));
}
function hapticsAvailable() {
	return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
}
function scalePattern(pattern) {
	if (typeof pattern === "number") return Math.max(4, Math.round(pattern * (.4 + .6 * intensityScale)));
	return pattern.map((n, i) => i % 2 === 1 ? n : Math.max(4, Math.round(n * (.4 + .6 * intensityScale))));
}
function hapticChord(kind) {
	if (!enabled || !hapticsAvailable() || intensityScale <= 0) return;
	switch (kind) {
		case "note":
			navigator.vibrate(scalePattern(12));
			break;
		case "consonant":
			navigator.vibrate(scalePattern([
				14,
				30,
				10
			]));
			break;
		case "dominant":
			navigator.vibrate(scalePattern([
				18,
				40,
				18,
				40,
				28
			]));
			break;
		case "dissonant":
			navigator.vibrate(scalePattern([
				10,
				20,
				10,
				20,
				10,
				20,
				24
			]));
			break;
		case "listen": navigator.vibrate(scalePattern(6));
	}
}
function hapticJourneyMark() {
	if (!enabled || !hapticsAvailable() || intensityScale <= 0) return;
	navigator.vibrate(scalePattern([
		8,
		40,
		16
	]));
}
var recording = false;
var startMs = 0;
var events = [];
var name = "Living spectrum journey";
function isRecording() {
	return recording;
}
function journeyEvents() {
	return events.slice();
}
function startJourney(label) {
	recording = true;
	startMs = performance.now();
	events = [];
	if (label) name = label;
	else name = `Journey ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`;
}
function stopJourney() {
	recording = false;
}
function clearJourney() {
	recording = false;
	events = [];
}
function recordEvent(root, quality) {
	if (!recording) return;
	const tones = chordPitches(root, quality);
	events.push({
		t: Math.round(performance.now() - startMs),
		rootId: root.id,
		quality,
		colors: tones.map((t) => t.colorName),
		mix: mixColorName(tones),
		symbol: quality === "note" ? root.label : quality === "major" ? root.label : quality === "minor" ? `${root.label}m` : `${root.label} ${QUALITY_LABELS[quality]}`
	});
}
function snapshotJourney(keyRootId, voice) {
	return {
		v: 1,
		name,
		createdAt: (/* @__PURE__ */ new Date()).toISOString(),
		keyRootId,
		voice,
		events: events.slice()
	};
}
function exportJourneyJson(keyRootId, voice) {
	return JSON.stringify(snapshotJourney(keyRootId, voice), null, 2);
}
/** Compact share hash for deep-link (events truncated if huge). */
function encodeJourneyUrl(keyRootId, voice) {
	const slim = {
		v: 1,
		k: keyRootId,
		voice,
		e: snapshotJourney(keyRootId, voice).events.slice(0, 80).map((ev) => [
			ev.t,
			ev.rootId,
			ev.quality
		])
	};
	try {
		return btoa(JSON.stringify(slim)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
	} catch {
		return "";
	}
}
function decodeJourneyUrl(hash) {
	try {
		const pad = hash.length % 4 === 0 ? "" : "=".repeat(4 - hash.length % 4);
		const raw = atob(hash.replace(/-/g, "+").replace(/_/g, "/") + pad);
		const slim = JSON.parse(raw);
		if (!slim?.e) return null;
		const events = slim.e.map(([t, rootId, quality]) => {
			const root = FIFTHS.find((p) => p.id === rootId) ?? FIFTHS[0];
			const tones = chordPitches(root, quality);
			return {
				t,
				rootId,
				quality,
				colors: tones.map((x) => x.colorName),
				mix: mixColorName(tones),
				symbol: root.label
			};
		});
		return {
			v: 1,
			name: "Shared journey",
			createdAt: (/* @__PURE__ */ new Date()).toISOString(),
			keyRootId: slim.k,
			voice: slim.voice,
			events
		};
	} catch {
		return null;
	}
}
function playJourney(snap, onEvent, onDone) {
	let cancelled = false;
	const timers = [];
	snap.events.forEach((ev, i) => {
		const id = window.setTimeout(() => {
			if (cancelled) return;
			onEvent(FIFTHS.find((p) => p.id === ev.rootId) ?? FIFTHS[0], ev.quality, i);
			if (i === snap.events.length - 1) onDone?.();
		}, ev.t);
		timers.push(id);
	});
	if (snap.events.length === 0) onDone?.();
	return { stop: () => {
		cancelled = true;
		timers.forEach((t) => clearTimeout(t));
	} };
}
/** Minimal type-0 MIDI of roots as whole notes (export heuristic). */
function exportJourneyMidi(snap) {
	const track = [];
	const pushVar = (n) => {
		const bytes = [];
		let v = n;
		bytes.unshift(v & 127);
		v >>= 7;
		while (v > 0) {
			bytes.unshift(v & 127 | 128);
			v >>= 7;
		}
		track.push(...bytes);
	};
	let lastT = 0;
	const ticksPerMs = .48;
	for (const ev of snap.events) {
		const note = 60 + (FIFTHS.find((p) => p.id === ev.rootId) ?? FIFTHS[0]).midi;
		const delta = Math.max(0, Math.round((ev.t - lastT) * ticksPerMs));
		lastT = ev.t;
		pushVar(delta);
		track.push(144, note, 80);
		pushVar(120);
		track.push(128, note, 0);
	}
	pushVar(0);
	track.push(255, 47, 0);
	const header = [
		77,
		84,
		104,
		100,
		0,
		0,
		0,
		6,
		0,
		0,
		0,
		1,
		1,
		224
	];
	const trackHeader = [
		77,
		84,
		114,
		107
	];
	const len = track.length;
	const lenBytes = [
		len >> 24 & 255,
		len >> 16 & 255,
		len >> 8 & 255,
		len & 255
	];
	return new Uint8Array([
		...header,
		...trackHeader,
		...lenBytes,
		...track
	]);
}
/** YIN pitch detection (de Cheveigné & Kawahara) — pure JS, low latency. */
/**
* Estimate fundamental frequency from a mono float buffer.
* @returns frequency in Hz, or -1 if unvoiced / below threshold
*/
function yinPitch(buf, sampleRate, threshold = .12) {
	const n = buf.length;
	if (n < 64) return {
		frequency: -1,
		probability: 0
	};
	let rms = 0;
	for (let i = 0; i < n; i++) rms += buf[i] * buf[i];
	rms = Math.sqrt(rms / n);
	if (rms < .008) return {
		frequency: -1,
		probability: 0
	};
	const half = Math.floor(n / 2);
	const yinBuf = new Float32Array(half);
	for (let tau = 0; tau < half; tau++) {
		let sum = 0;
		for (let i = 0; i < half; i++) {
			const d = buf[i] - buf[i + tau];
			sum += d * d;
		}
		yinBuf[tau] = sum;
	}
	yinBuf[0] = 1;
	let running = 0;
	for (let tau = 1; tau < half; tau++) {
		running += yinBuf[tau];
		yinBuf[tau] = yinBuf[tau] * tau / (running || 1);
	}
	let tauEstimate = -1;
	for (let tau = 2; tau < half; tau++) if (yinBuf[tau] < threshold) {
		while (tau + 1 < half && yinBuf[tau + 1] < yinBuf[tau]) tau++;
		tauEstimate = tau;
		break;
	}
	if (tauEstimate < 0) {
		let minV = 1;
		let minT = -1;
		for (let tau = 2; tau < half; tau++) if (yinBuf[tau] < minV) {
			minV = yinBuf[tau];
			minT = tau;
		}
		if (minV < .35) tauEstimate = minT;
	}
	if (tauEstimate < 0) return {
		frequency: -1,
		probability: 0
	};
	const x0 = tauEstimate > 0 ? yinBuf[tauEstimate - 1] : yinBuf[tauEstimate];
	const x1 = yinBuf[tauEstimate];
	const x2 = tauEstimate + 1 < half ? yinBuf[tauEstimate + 1] : x1;
	const denom = 2 * (2 * x1 - x2 - x0);
	let better = tauEstimate;
	if (denom !== 0) better = tauEstimate + (x2 - x0) / denom;
	const frequency = sampleRate / better;
	if (frequency < 50 || frequency > 2e3) return {
		frequency: -1,
		probability: 0
	};
	return {
		frequency,
		probability: Math.max(0, Math.min(1, 1 - x1))
	};
}
/** Peak-pick chroma energies from time-domain via simple Goertzel-ish bins. */
function chromaEnergies(buf, sampleRate) {
	const chroma = /* @__PURE__ */ new Float32Array(12);
	for (let pc = 0; pc < 12; pc++) {
		let e = 0;
		for (let oct = 2; oct <= 6; oct++) {
			const midi = (oct + 1) * 12 + pc;
			const freq = 440 * Math.pow(2, (midi - 69) / 12);
			let re = 0;
			let im = 0;
			const w = 2 * Math.PI * freq / sampleRate;
			const len = Math.min(buf.length, 2048);
			for (let i = 0; i < len; i++) {
				re += buf[i] * Math.cos(w * i);
				im -= buf[i] * Math.sin(w * i);
			}
			e += (re * re + im * im) / len;
		}
		chroma[pc] = e;
	}
	let max = 0;
	for (let i = 0; i < 12; i++) if (chroma[i] > max) max = chroma[i];
	if (max > 0) for (let i = 0; i < 12; i++) chroma[i] /= max;
	return chroma;
}
/**
* Live Resonance — microphone / file analysis driving the dual wheel.
* Main synth audio always takes priority; resonance is opt-in and isolated.
*/
var stream = null;
var source = null;
var analyser = null;
var raf = null;
var running = false;
var listeners = /* @__PURE__ */ new Set();
var config = {
	sensitivity: .55,
	decayMs: 420,
	mode: "listen"
};
var fileAudio = null;
var savedMaster = .9;
var energySmoothed = /* @__PURE__ */ new Float32Array(12);
function emptyFrame() {
	return {
		pitches: [],
		fundamental: null,
		estimatedQuality: "note",
		frequency: null,
		clarity: 0
	};
}
function estimateChord(active) {
	if (active.length <= 1) return "note";
	const midis = active.map((a) => a.pitch.midi).sort((a, b) => a - b);
	const root = midis[0];
	const rel = midis.map((m) => (m - root + 12) % 12).sort((a, b) => a - b);
	const has = (n) => rel.includes(n);
	if (has(4) && has(7) && has(10)) return "dom7";
	if (has(4) && has(7) && has(11)) return "maj7";
	if (has(3) && has(7) && has(10)) return "min7";
	if (has(4) && has(7)) return "major";
	if (has(3) && has(7)) return "minor";
	if (has(5) && has(7)) return "sus4";
	if (has(3) && has(6)) return "dim";
	if (has(4) && has(8)) return "aug";
	return active.length >= 3 ? "major" : "note";
}
function processBuffer(buf, sampleRate) {
	const { frequency, probability } = yinPitch(buf, sampleRate, .22 - config.sensitivity * .18);
	const chroma = chromaEnergies(buf, sampleRate);
	const gate = .35 - config.sensitivity * .2;
	const alpha = .35;
	for (let i = 0; i < 12; i++) energySmoothed[i] = energySmoothed[i] * .65 + chroma[i] * alpha;
	const pitches = [];
	for (let i = 0; i < 12; i++) {
		const e = energySmoothed[i];
		if (e >= gate) pitches.push({
			pitch: pitchByMidi(i),
			energy: e
		});
	}
	pitches.sort((a, b) => b.energy - a.energy);
	let fundamental = null;
	let clarity = 0;
	let freqOut = null;
	if (frequency > 0 && probability > .25) {
		const near = nearestPitchFromFrequency(frequency);
		if (near) {
			fundamental = near.pitch;
			clarity = probability;
			freqOut = frequency;
			if (!pitches.some((p) => p.pitch.midi === near.pitch.midi)) pitches.unshift({
				pitch: near.pitch,
				energy: Math.max(.6, probability)
			});
		}
	} else if (pitches[0]) {
		fundamental = pitches[0].pitch;
		clarity = pitches[0].energy;
	}
	const top = pitches.slice(0, 4);
	return {
		pitches: top,
		fundamental,
		estimatedQuality: estimateChord(top),
		frequency: freqOut,
		clarity
	};
}
function loop() {
	if (!running || !analyser) return;
	try {
		const ctx = getAudioContext();
		const buf = new Float32Array(analyser.fftSize);
		analyser.getFloatTimeDomainData(buf);
		const frame = processBuffer(buf, ctx.sampleRate);
		listeners.forEach((fn) => fn(frame));
	} catch {}
	raf = requestAnimationFrame(loop);
}
function restoreMain() {
	unlockAudio();
	setMasterVolume(savedMaster);
	resumeAudio();
}
function setResonanceConfig(partial) {
	config = {
		...config,
		...partial
	};
}
function subscribeResonance(fn) {
	listeners.add(fn);
	return () => listeners.delete(fn);
}
function isResonanceRunning() {
	return running;
}
async function startMicResonance() {
	if (running && stream) return true;
	await stopResonance();
	savedMaster = getMasterVolume() > 0 ? getMasterVolume() : .9;
	try {
		unlockAudio();
		const audioCtx = getAudioContext();
		stream = await navigator.mediaDevices.getUserMedia({
			audio: {
				echoCancellation: true,
				noiseSuppression: true,
				autoGainControl: true
			},
			video: false
		});
		source = audioCtx.createMediaStreamSource(stream);
		analyser = audioCtx.createAnalyser();
		analyser.fftSize = 2048;
		analyser.smoothingTimeConstant = .2;
		source.connect(analyser);
		running = true;
		energySmoothed = /* @__PURE__ */ new Float32Array(12);
		restoreMain();
		loop();
		return true;
	} catch {
		await stopResonance();
		restoreMain();
		return false;
	}
}
/** Analyze an uploaded audio file (secondary path). */
async function startFileResonance(file) {
	await stopResonance();
	savedMaster = getMasterVolume() > 0 ? getMasterVolume() : .9;
	try {
		unlockAudio();
		const audioCtx = getAudioContext();
		const url = URL.createObjectURL(file);
		fileAudio = new Audio(url);
		fileAudio.crossOrigin = "anonymous";
		fileAudio.loop = true;
		await fileAudio.play();
		source = audioCtx.createMediaElementSource(fileAudio);
		analyser = audioCtx.createAnalyser();
		analyser.fftSize = 2048;
		const gain = audioCtx.createGain();
		gain.gain.value = .35;
		source.connect(analyser);
		source.connect(gain);
		gain.connect(audioCtx.destination);
		running = true;
		energySmoothed = /* @__PURE__ */ new Float32Array(12);
		restoreMain();
		loop();
		return true;
	} catch {
		await stopResonance();
		restoreMain();
		return false;
	}
}
async function stopResonance() {
	running = false;
	if (raf != null) cancelAnimationFrame(raf);
	raf = null;
	try {
		source?.disconnect();
	} catch {}
	try {
		analyser?.disconnect();
	} catch {}
	stream?.getTracks().forEach((t) => {
		try {
			t.stop();
		} catch {}
	});
	if (fileAudio) {
		try {
			fileAudio.pause();
			fileAudio.src = "";
		} catch {}
		fileAudio = null;
	}
	stream = null;
	source = null;
	analyser = null;
	listeners.forEach((fn) => fn(emptyFrame()));
	restoreMain();
}
var MOOD_STEPS = {
	resolve: {
		steps: [7, 0],
		qualities: ["dom7", "major"],
		blurb: "Dominant pulls home — hue falls a fifth into rest."
	},
	tension: {
		steps: [2, 7],
		qualities: ["min7", "dom7"],
		blurb: "ii–V tension widens the spectral span before release."
	},
	melancholy: {
		steps: [
			9,
			5,
			0
		],
		qualities: [
			"minor",
			"major",
			"major"
		],
		blurb: "vi–IV–I cools then warms — minor green toward crimson rest."
	},
	lift: {
		steps: [
			5,
			0,
			7
		],
		qualities: [
			"major",
			"major",
			"major"
		],
		blurb: "Subdominant lift, then tonic and bright dominant open the wheel."
	},
	wander: {
		steps: [
			0,
			10,
			8,
			7
		],
		qualities: [
			"minor",
			"major",
			"major",
			"major"
		],
		blurb: "Andalusian descent — colors walk counter-clockwise around the ring."
	}
};
function suggestionsForKey(keyRoot) {
	return Object.keys(MOOD_STEPS).map((mood) => {
		const def = MOOD_STEPS[mood];
		const step = def.steps[0];
		const midi = (keyRoot.midi + step) % 12;
		const root = FIFTHS.find((p) => p.midi === midi) ?? keyRoot;
		const quality = def.qualities[0] ?? inferQuality(step, "major");
		return {
			id: mood,
			label: mood === "resolve" ? "Resolve" : mood === "tension" ? "More tension" : mood === "melancholy" ? "Melancholic bridge" : mood === "lift" ? "Lift" : "Wander",
			mood,
			root,
			quality,
			blurb: def.blurb
		};
	});
}
function progressionForMood(mood, keyRoot) {
	const def = MOOD_STEPS[mood];
	return def.steps.map((step, i) => {
		const midi = (keyRoot.midi + step) % 12;
		return {
			root: FIFTHS.find((p) => p.midi === midi) ?? keyRoot,
			quality: def.qualities[i] ?? "major"
		};
	});
}
/** Scales & modes for geometry overlay — degrees relative to root midi. */
var SCALES = [
	{
		id: "major",
		name: "Major (Ionian)",
		intervals: [
			0,
			2,
			4,
			5,
			7,
			9,
			11
		]
	},
	{
		id: "naturalMinor",
		name: "Natural minor",
		intervals: [
			0,
			2,
			3,
			5,
			7,
			8,
			10
		]
	},
	{
		id: "harmonicMinor",
		name: "Harmonic minor",
		intervals: [
			0,
			2,
			3,
			5,
			7,
			8,
			11
		]
	},
	{
		id: "melodicMinor",
		name: "Melodic minor",
		intervals: [
			0,
			2,
			3,
			5,
			7,
			9,
			11
		]
	},
	{
		id: "dorian",
		name: "Dorian",
		intervals: [
			0,
			2,
			3,
			5,
			7,
			9,
			10
		]
	},
	{
		id: "phrygian",
		name: "Phrygian",
		intervals: [
			0,
			1,
			3,
			5,
			7,
			8,
			10
		]
	},
	{
		id: "lydian",
		name: "Lydian",
		intervals: [
			0,
			2,
			4,
			6,
			7,
			9,
			11
		]
	},
	{
		id: "mixolydian",
		name: "Mixolydian",
		intervals: [
			0,
			2,
			4,
			5,
			7,
			9,
			10
		]
	},
	{
		id: "locrian",
		name: "Locrian",
		intervals: [
			0,
			1,
			3,
			5,
			6,
			8,
			10
		]
	},
	{
		id: "pentatonic",
		name: "Major pentatonic",
		intervals: [
			0,
			2,
			4,
			7,
			9
		]
	},
	{
		id: "blues",
		name: "Blues",
		intervals: [
			0,
			3,
			5,
			6,
			7,
			10
		]
	}
];
function scalePitches(rootMidi, scaleId) {
	return (SCALES.find((s) => s.id === scaleId) ?? SCALES[0]).intervals.map((iv) => pitchByMidi((rootMidi + iv) % 12));
}
var QUALITIES = [
	"note",
	"major",
	"minor",
	"dom7",
	"maj7",
	"min7",
	"sus4",
	"dim",
	"aug"
];
var VOICES = [
	"pure",
	"pad",
	"organ",
	"piano",
	"strings"
];
function LumenApp() {
	const [rotation, setRotation] = (0, import_react.useState)(0);
	const [quality, setQuality] = (0, import_react.useState)("major");
	const [voice, setVoice] = (0, import_react.useState)("pad");
	const [activeRoot, setActiveRoot] = (0, import_react.useState)(null);
	const [activeTones, setActiveTones] = (0, import_react.useState)([]);
	const [activeStep, setActiveStep] = (0, import_react.useState)(0);
	const [expandedSpectrum, setExpandedSpectrum] = (0, import_react.useState)(true);
	const [showGeometry, setShowGeometry] = (0, import_react.useState)(true);
	const [muted, setMuted] = (0, import_react.useState)(false);
	const [pulse, setPulse] = (0, import_react.useState)(0);
	const [infoOpen, setInfoOpen] = (0, import_react.useState)(false);
	const [theoryOpen, setTheoryOpen] = (0, import_react.useState)(true);
	const [dockOpen, setDockOpen] = (0, import_react.useState)(false);
	const [playingProgression, setPlayingProgression] = (0, import_react.useState)(null);
	const [keyRoot, setKeyRoot] = (0, import_react.useState)(FIFTHS[0]);
	const [lightMode, setLightModeState] = (0, import_react.useState)("off");
	const [lightShow, setLightShowState] = (0, import_react.useState)(false);
	const [pureLight, setPureLight] = (0, import_react.useState)(false);
	const [spectacular, setSpectacular] = (0, import_react.useState)(false);
	const [ambient, setAmbient] = (0, import_react.useState)(false);
	const [resonanceOn, setResonanceOn] = (0, import_react.useState)(false);
	const [resonanceMode, setResonanceMode] = (0, import_react.useState)("listen");
	const [sensitivity, setSensitivity] = (0, import_react.useState)(.55);
	const [micLabel, setMicLabel] = (0, import_react.useState)(null);
	const [torchOk, setTorchOk] = (0, import_react.useState)(null);
	const [visionMode, setVisionMode] = (0, import_react.useState)("full");
	const [burstKey, setBurstKey] = (0, import_react.useState)(0);
	const [tilt, setTilt] = (0, import_react.useState)({
		beta: 0,
		gamma: 0
	});
	const [haptics, setHaptics] = (0, import_react.useState)(true);
	const [shareHint, setShareHint] = (0, import_react.useState)(null);
	const [chordQuery, setChordQuery] = (0, import_react.useState)("");
	const [chordAnswer, setChordAnswer] = (0, import_react.useState)(null);
	const [chordError, setChordError] = (0, import_react.useState)(null);
	const [recording, setRecording] = (0, import_react.useState)(false);
	const [journeyCount, setJourneyCount] = (0, import_react.useState)(0);
	const [playingJourney, setPlayingJourney] = (0, import_react.useState)(false);
	const [scaleId, setScaleId] = (0, import_react.useState)("off");
	const [multiSelect, setMultiSelect] = (0, import_react.useState)([]);
	const [trailTones, setTrailTones] = (0, import_react.useState)([]);
	const [resonanceEnergy, setResonanceEnergy] = (0, import_react.useState)(() => Array(12).fill(0));
	const [perfMode, setPerfMode] = (0, import_react.useState)(false);
	const progTimer = (0, import_react.useRef)(null);
	const pulseTimer = (0, import_react.useRef)(null);
	const lastQuality = (0, import_react.useRef)("major");
	const lastMicId = (0, import_react.useRef)(null);
	const lastMicAt = (0, import_react.useRef)(0);
	const userPlayUntil = (0, import_react.useRef)(0);
	const journeyPlayRef = (0, import_react.useRef)(null);
	const ambientGenRef = (0, import_react.useRef)(null);
	(0, import_react.useRef)(0);
	const fileInputRef = (0, import_react.useRef)(null);
	const intensity = (0, import_react.useMemo)(() => {
		let n = .25;
		if (lightMode === "screen") n += .2;
		if (lightMode === "torch" || lightMode === "hybrid") n += .3;
		if (lightShow) n += .15;
		if (pureLight) n += .15;
		if (spectacular) n += .25;
		if (ambient) n += .08;
		if (resonanceOn) n += .1;
		return Math.min(1, n);
	}, [
		lightMode,
		lightShow,
		pureLight,
		spectacular,
		ambient,
		resonanceOn
	]);
	const scaleOverlay = (0, import_react.useMemo)(() => {
		if (scaleId === "off") return [];
		return scalePitches(keyRoot.midi, scaleId);
	}, [scaleId, keyRoot]);
	const suggestions = (0, import_react.useMemo)(() => suggestionsForKey(keyRoot), [keyRoot]);
	(0, import_react.useEffect)(() => {
		startLightEngine();
		detectTorchSupport().then(setTorchOk);
		setHapticsEnabled(haptics);
		if (typeof window !== "undefined") {
			const h = window.location.hash.replace(/^#j=/, "");
			if (h && h.length > 8) {
				const snap = decodeJourneyUrl(h);
				if (snap) {
					setShareHint("Shared journey ready — open Journey to play");
					window.__ccJourney = snap;
				}
			}
		}
		return () => {
			if (progTimer.current) window.clearTimeout(progTimer.current);
			if (pulseTimer.current) window.clearInterval(pulseTimer.current);
			if (ambientGenRef.current) window.clearTimeout(ambientGenRef.current);
			journeyPlayRef.current?.stop();
			stopAll();
			stopAmbient();
			stopResonance();
			stopLightEngine();
			releaseTorch();
		};
	}, []);
	(0, import_react.useEffect)(() => {
		setMasterVolume(muted ? 0 : .9);
	}, [muted]);
	(0, import_react.useEffect)(() => {
		setSynthVoice(voice);
	}, [voice]);
	(0, import_react.useEffect)(() => {
		setRotationPan(rotation);
	}, [rotation]);
	(0, import_react.useEffect)(() => {
		setLightMode(lightMode);
	}, [lightMode]);
	(0, import_react.useEffect)(() => {
		setLightShow(lightShow);
	}, [lightShow]);
	(0, import_react.useEffect)(() => {
		setHapticsEnabled(haptics);
		setHapticsIntensity(haptics ? 1 : 0);
	}, [haptics]);
	(0, import_react.useEffect)(() => {
		setResonanceConfig({
			sensitivity,
			mode: resonanceMode
		});
	}, [sensitivity, resonanceMode]);
	(0, import_react.useEffect)(() => {
		const onOrient = (e) => {
			setTilt({
				beta: Math.max(-45, Math.min(45, e.beta ?? 0)),
				gamma: Math.max(-45, Math.min(45, e.gamma ?? 0))
			});
		};
		window.addEventListener("deviceorientation", onOrient);
		return () => window.removeEventListener("deviceorientation", onOrient);
	}, []);
	const triggerPulse = (0, import_react.useCallback)(() => {
		setPulse(1);
		setBurstKey((k) => k + 1);
		if (pulseTimer.current) window.clearInterval(pulseTimer.current);
		const start = performance.now();
		pulseTimer.current = window.setInterval(() => {
			const t = (performance.now() - start) / 1e3;
			if (t >= 1) {
				setPulse(0);
				if (pulseTimer.current) window.clearInterval(pulseTimer.current);
				pulseTimer.current = null;
				return;
			}
			setPulse(Math.max(0, 1 - t));
		}, 32);
	}, []);
	const fireLights = (0, import_react.useCallback)((tones, q, duration) => {
		if (lightMode === "off") return;
		const color = beamColor$1(tones.map((t) => t.hue), 1, visionMode);
		if (lightShow) holdLight(color, .55 + intensity * .35);
		else pulseLight(color, {
			attack: .03,
			hold: Math.max(.35, duration * .55),
			release: .4,
			sustain: .75,
			peak: .55 + intensity * .4
		});
		hapticChord(q === "note" ? "note" : q === "dom7" || q === "dim" || q === "aug" ? q === "dom7" ? "dominant" : "dissonant" : "consonant");
	}, [
		lightMode,
		lightShow,
		visionMode,
		intensity
	]);
	const playRoot = (0, import_react.useCallback)((root, q = quality, velocity = .85, step = 0, opts) => {
		if (opts?.fromMic && performance.now() < userPlayUntil.current) return;
		unlockAudio();
		if (!opts?.fromMic) userPlayUntil.current = performance.now() + 1400;
		const tones = chordPitches(root, q);
		setTrailTones(activeTones);
		setActiveRoot(root);
		setActiveTones(tones);
		setActiveStep(step);
		lastQuality.current = q;
		triggerPulse();
		const duration = q === "note" ? 1.15 : 1.75;
		fireLights(tones, q, duration);
		if (!muted && (!opts?.fromMic || resonanceMode === "listenSynth")) playChord(tones.map((p) => p.midi), {
			duration: opts?.fromMic ? Math.min(duration, 1.05) : duration,
			velocity: opts?.fromMic ? Math.min(velocity, .55) : velocity,
			voice
		});
		if (ambient && !opts?.fromMic) startAmbient(tones.map((p) => p.midi), .07);
		if (!opts?.fromMic && isRecording()) {
			recordEvent(root, q);
			setJourneyCount(journeyEvents().length);
			hapticJourneyMark();
		}
	}, [
		quality,
		muted,
		voice,
		ambient,
		triggerPulse,
		fireLights,
		activeTones,
		resonanceMode
	]);
	(0, import_react.useEffect)(() => {
		if (!resonanceOn) {
			setResonanceEnergy(Array(12).fill(0));
			return;
		}
		const unsub = subscribeResonance((frame) => {
			const energies = Array(12).fill(0);
			for (const p of frame.pitches) energies[p.pitch.midi] = p.energy;
			setResonanceEnergy(energies);
			if (!frame.fundamental || frame.clarity < .35) {
				setMicLabel(null);
				return;
			}
			const label = frame.frequency ? `${frame.fundamental.label} ${frame.fundamental.colorName} · ${Math.round(frame.frequency)} Hz` : `${frame.fundamental.label} ${frame.fundamental.colorName}`;
			setMicLabel(label);
			const now = performance.now();
			if (lastMicId.current === frame.fundamental.id && now - lastMicAt.current < 850) return;
			if (now < userPlayUntil.current) return;
			lastMicId.current = frame.fundamental.id;
			lastMicAt.current = now;
			const q = frame.pitches.length >= 3 ? frame.estimatedQuality : "note";
			playRoot(frame.fundamental, q === "note" ? "note" : q, .4 + frame.clarity * .2, 0, { fromMic: true });
		});
		return () => {
			unsub();
		};
	}, [resonanceOn, playRoot]);
	const stopProgression = (0, import_react.useCallback)(() => {
		if (progTimer.current) {
			window.clearTimeout(progTimer.current);
			progTimer.current = null;
		}
		setPlayingProgression(null);
	}, []);
	const playProgression = (0, import_react.useCallback)(async (progId) => {
		const prog = PROGRESSIONS.find((p) => p.id === progId);
		if (!prog) return;
		if (playingProgression === progId) {
			stopProgression();
			return;
		}
		unlockAudio();
		stopProgression();
		setPlayingProgression(progId);
		await resumeAudio();
		const run = (i) => {
			if (i >= prog.steps.length) {
				setPlayingProgression(null);
				return;
			}
			const step = prog.steps[i];
			const midi = (keyRoot.midi + step) % 12;
			const root = FIFTHS.find((p) => p.midi === midi) ?? keyRoot;
			const q = prog.qualities?.[i] ?? (quality === "note" ? "major" : inferQuality(step, quality));
			playRoot(root, q, .88, step);
			progTimer.current = window.setTimeout(() => run(i + 1), 1050);
		};
		run(0);
	}, [
		keyRoot,
		playRoot,
		playingProgression,
		quality,
		stopProgression
	]);
	const toggleResonance = async () => {
		unlockAudio();
		if (resonanceOn || isResonanceRunning()) {
			await stopResonance();
			setResonanceOn(false);
			setMicLabel(null);
			lastMicId.current = null;
			unlockAudio();
			setMasterVolume(muted ? 0 : .9);
			return;
		}
		setResonanceConfig({
			mode: resonanceMode,
			sensitivity
		});
		const ok = await startMicResonance();
		setResonanceOn(ok);
		unlockAudio();
		setMasterVolume(muted ? 0 : .9);
		if (!ok) setMicLabel("Mic unavailable");
	};
	const onFileAudio = async (file) => {
		if (!file) return;
		unlockAudio();
		setResonanceConfig({
			mode: resonanceMode,
			sensitivity
		});
		const ok = await startFileResonance(file);
		setResonanceOn(ok);
		if (!ok) setMicLabel("Could not open file");
		else setMicLabel(`File · ${file.name}`);
	};
	const askChordColor = (0, import_react.useCallback)((raw) => {
		unlockAudio();
		const q = (raw ?? chordQuery).trim();
		if (!q) {
			setChordError("Type a chord — e.g. Am7, G7, F#maj7");
			setChordAnswer(null);
			return;
		}
		const result = chordColorLookup(q);
		if (!result.ok) {
			setChordError(`${result.error} ${result.hint}`);
			setChordAnswer(null);
			return;
		}
		setChordError(null);
		setChordAnswer(result.answer);
		setTheoryOpen(true);
		if (result.quality !== "note") setQuality(result.quality);
		else setQuality("note");
		const parsed = parseChordSymbol(q);
		if (parsed) playRoot(parsed.root, parsed.quality, .9, 0);
	}, [chordQuery, playRoot]);
	const enableSpectacular = async () => {
		const next = !spectacular;
		setSpectacular(next);
		unlockAudio();
		if (next) {
			setLightModeState(torchOk ? "hybrid" : "screen");
			setLightShowState(true);
			setPureLight(true);
			setExpandedSpectrum(true);
			setShowGeometry(true);
			setVoice("pad");
			setAmbient(true);
			setDockOpen(false);
			setTheoryOpen(true);
			const root = keyRoot;
			playRoot(root, "major", .9, 0);
			startAmbient([
				root.midi,
				(root.midi + 4) % 12,
				(root.midi + 7) % 12
			], .06);
			if (torchOk) setLightMode("hybrid");
		} else {
			setPureLight(false);
			setLightShowState(false);
			setLightModeState("off");
			setAmbient(false);
			stopAmbient();
			setDockOpen(false);
		}
	};
	const toggleRecord = () => {
		if (recording) {
			stopJourney();
			setRecording(false);
			setShareHint(`Journey · ${journeyEvents().length} events`);
			window.setTimeout(() => setShareHint(null), 2e3);
		} else {
			startJourney();
			setRecording(true);
			setJourneyCount(0);
			hapticJourneyMark();
		}
	};
	const playRecordedJourney = () => {
		const events = journeyEvents();
		const shared = window.__ccJourney;
		const snap = events.length > 0 ? {
			v: 1,
			name: "Session",
			createdAt: (/* @__PURE__ */ new Date()).toISOString(),
			keyRootId: keyRoot.id,
			voice,
			events
		} : shared ?? {
			v: 1,
			name: "Empty",
			createdAt: (/* @__PURE__ */ new Date()).toISOString(),
			keyRootId: keyRoot.id,
			voice,
			events: []
		};
		if (snap.events.length === 0) {
			setShareHint("No journey recorded yet");
			window.setTimeout(() => setShareHint(null), 1600);
			return;
		}
		journeyPlayRef.current?.stop();
		setPlayingJourney(true);
		setPerfMode(true);
		unlockAudio();
		journeyPlayRef.current = playJourney(snap, (root, q) => playRoot(root, q, .88, 0), () => {
			setPlayingJourney(false);
			setPerfMode(false);
		});
	};
	const exportJson = () => {
		const json = exportJourneyJson(keyRoot.id, voice);
		const blob = new Blob([json], { type: "application/json" });
		const a = document.createElement("a");
		a.href = URL.createObjectURL(blob);
		a.download = "colorchord-journey.json";
		a.click();
	};
	const exportMidi = () => {
		const bytes = exportJourneyMidi({
			v: 1,
			name: "journey",
			createdAt: (/* @__PURE__ */ new Date()).toISOString(),
			keyRootId: keyRoot.id,
			voice,
			events: journeyEvents()
		});
		const blob = new Blob([bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)], { type: "audio/midi" });
		const a = document.createElement("a");
		a.href = URL.createObjectURL(blob);
		a.download = "colorchord-journey.mid";
		a.click();
	};
	const shareJourneyLink = async () => {
		const enc = encodeJourneyUrl(keyRoot.id, voice);
		if (!enc) return;
		const url = `${window.location.origin}${window.location.pathname}#j=${enc}`;
		try {
			if (navigator.share) await navigator.share({
				title: "ColorChord Journey",
				url
			});
			else {
				await navigator.clipboard.writeText(url);
				setShareHint("Journey link copied");
				window.setTimeout(() => setShareHint(null), 1800);
			}
		} catch {}
	};
	const runMood = (mood) => {
		const steps = progressionForMood(mood, keyRoot);
		unlockAudio();
		let i = 0;
		const tick = () => {
			if (i >= steps.length) return;
			const s = steps[i];
			playRoot(s.root, s.quality, .88, 0);
			i++;
			if (i < steps.length) window.setTimeout(tick, 1e3);
		};
		tick();
	};
	const exportPng = () => {
		const canvas = document.querySelector("canvas");
		if (!canvas) return;
		const a = document.createElement("a");
		a.download = `colorchord-${activeRoot?.id ?? "wheel"}.png`;
		a.href = canvas.toDataURL("image/png");
		a.click();
	};
	const shareApp = async () => {
		const url = typeof window !== "undefined" ? window.location.href : "https://colorchord.grok.me";
		const data = {
			title: "ColorChord 2.0 — Living Spectrum",
			text: "A color is a chord · living light. Circle of Fifths mapped to the spectrum.",
			url
		};
		try {
			if (navigator.share) {
				await navigator.share(data);
				return;
			}
			await navigator.clipboard.writeText(url);
			setShareHint("Link copied");
			window.setTimeout(() => setShareHint(null), 1800);
		} catch {}
	};
	const statusLine = (0, import_react.useMemo)(() => {
		if (resonanceOn && micLabel) return `Living · ${micLabel}`;
		if (recording) return `Recording journey · ${journeyCount} events`;
		if (!activeRoot) return "A color is a chord · tap, ask, or listen";
		const q = lastQuality.current;
		if (q === "note") {
			const comp = complementaryPitch(activeRoot);
			return `${activeRoot.label} ${activeRoot.colorName} · opposite ${comp.label} ${comp.colorName}`;
		}
		const roman = romanDegree(activeStep, q);
		const mix = mixColorName(activeTones);
		return `${roman}  ·  ${activeRoot.label} ${QUALITY_LABELS[q]}  ·  ${mix}`;
	}, [
		activeRoot,
		activeTones,
		activeStep,
		resonanceOn,
		micLabel,
		burstKey,
		recording,
		journeyCount
	]);
	const blurb = (0, import_react.useMemo)(() => {
		if (chordAnswer) return chordAnswer;
		if (!activeRoot || activeTones.length === 0) return "Living Spectrum: fifths = hue. Ask Am7, open Live Resonance, or record a journey of light.";
		return theoryBlurb(activeRoot, lastQuality.current, activeTones);
	}, [
		activeRoot,
		activeTones,
		burstKey,
		chordAnswer
	]);
	const headline = (0, import_react.useMemo)(() => {
		if (!activeRoot) return null;
		return theoryHeadline(activeRoot, lastQuality.current, activeTones);
	}, [
		activeRoot,
		activeTones,
		burstKey
	]);
	const uiHidden = pureLight && !dockOpen || perfMode && !dockOpen;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex h-[calc(100dvh-var(--grok-banner-h,0px))] flex-col overflow-hidden bg-[var(--color-bg)] text-[var(--color-fg)]",
		style: { marginTop: "var(--grok-banner-h, 0px)" },
		role: "application",
		"aria-label": "ColorChord Living Spectrum dual harmonic instrument",
		children: [
			!uiHidden && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-1.5 p-2 pt-[max(0.4rem,env(safe-area-inset-top))] sm:gap-2 sm:p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pointer-events-auto max-w-[min(100%,17.5rem)] rounded-[var(--radius-md)] bg-[var(--color-bg)]/80 px-2 py-1.5 shadow-lg backdrop-blur-md sm:max-w-[min(100%,20rem)] sm:bg-transparent sm:px-0 sm:py-0 sm:shadow-none sm:backdrop-blur-none",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[0.5rem] font-medium tracking-[0.18em] text-[var(--color-fg-subtle)] uppercase sm:text-[0.6rem]",
							children: "Living Spectrum · 2.0"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-0.5 text-[0.95rem] font-semibold tracking-[-0.03em] sm:text-2xl",
							children: "ColorChord"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 hidden text-xs leading-snug text-[var(--color-fg-muted)] sm:block",
							children: "A color is a chord · living light"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-1 flex flex-wrap items-center gap-1 sm:mt-2 sm:gap-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => {
										unlockAudio();
										setMuted((m) => {
											const next = !m;
											setMasterVolume(next ? 0 : .9);
											return next;
										});
									},
									"aria-label": muted ? "Unmute speakers" : "Mute speakers",
									"aria-pressed": muted,
									className: cn("inline-flex min-h-10 items-center gap-1 rounded-full border px-2.5 py-1.5 text-[0.68rem] font-medium transition-colors sm:min-h-9", muted ? "border-[var(--color-border)] text-[var(--color-fg-muted)]" : "border-[var(--color-fg)]/30 bg-white/5 text-[var(--color-fg)]"),
									children: [muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-3.5" }), muted ? "Muted" : "Sound"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => void toggleResonance(),
									"aria-label": resonanceOn ? "Stop live resonance" : "Start live resonance",
									"aria-pressed": resonanceOn,
									title: "Listen to the world — optional. Main sound works without this.",
									className: cn("inline-flex min-h-10 items-center gap-1 rounded-full border px-2.5 py-1.5 text-[0.68rem] font-medium transition-colors sm:min-h-9", resonanceOn ? "border-[var(--color-fg)] bg-white/10 text-[var(--color-fg)]" : "border-[var(--color-border)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"),
									children: [resonanceOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MicOff, { className: "size-3.5" }), "Live"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: toggleRecord,
									"aria-pressed": recording,
									className: cn("inline-flex min-h-10 items-center gap-1 rounded-full border px-2.5 py-1.5 text-[0.68rem] font-medium sm:min-h-9", recording ? "border-red-400/50 bg-red-500/15 text-red-200" : "border-[var(--color-border)] text-[var(--color-fg-muted)]"),
									children: [recording ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleDot, { className: "size-3.5" }), recording ? "Stop" : "Rec"]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "mt-1 flex w-full max-w-[17rem] items-center gap-1 sm:mt-2 sm:max-w-[18rem]",
							onSubmit: (e) => {
								e.preventDefault();
								askChordColor();
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								value: chordQuery,
								onChange: (e) => {
									setChordQuery(e.target.value);
									setChordError(null);
								},
								placeholder: "Chord… Am7",
								"aria-label": "Ask what color a chord is",
								enterKeyHint: "search",
								className: "min-h-10 min-w-0 flex-1 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)]/90 px-2.5 text-xs text-[var(--color-fg)] outline-none placeholder:text-[var(--color-fg-subtle)] focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] sm:min-h-9",
								autoCapitalize: "off",
								autoCorrect: "off",
								spellCheck: false
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "submit",
								className: "min-h-10 shrink-0 rounded-full border border-[var(--color-fg)] bg-[var(--color-fg)] px-2.5 text-[0.68rem] font-medium text-[var(--color-accent-fg)] sm:min-h-9",
								children: "Color"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 flex flex-wrap gap-1",
							children: [
								"C",
								"Am",
								"G7",
								"Dm7"
							].map((ex) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									setChordQuery(ex);
									askChordColor(ex);
								},
								className: "min-h-8 rounded-full border border-[var(--color-border)] px-2 py-0.5 text-[0.62rem] font-medium text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]",
								children: ex
							}, ex))
						}),
						chordError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 max-w-[17rem] text-[0.62rem] leading-snug text-red-300/90",
							children: chordError
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pointer-events-auto flex flex-col items-end gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: spectacular ? "default" : "secondary",
						size: "sm",
						className: "min-h-10 gap-1 px-2.5 sm:min-h-9",
						onClick: () => void enableSpectacular(),
						"aria-pressed": spectacular,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[0.68rem] sm:text-sm",
							children: spectacular ? "Calm" : "Boost"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								size: "icon",
								className: "size-10",
								"aria-label": pureLight ? "Exit pure light" : "Pure light mode",
								onClick: () => {
									setPureLight((v) => !v);
									if (!pureLight) setDockOpen(false);
								},
								children: pureLight ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize2, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								size: "icon",
								className: "size-10 hidden sm:inline-flex",
								"aria-label": "Share",
								onClick: () => void shareApp(),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								size: "icon",
								className: "size-10",
								"aria-label": "About ColorChord",
								onClick: () => setInfoOpen(true),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "size-4" })
							})
						]
					})]
				})]
			}),
			shareHint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute top-16 left-1/2 z-30 -translate-x-1/2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-1.5 text-xs text-[var(--color-fg)] shadow-lg",
				children: shareHint
			}),
			uiHidden && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "absolute top-[max(0.75rem,env(safe-area-inset-top))] right-3 z-30 min-h-11 min-w-11 rounded-full border border-white/20 bg-black/45 text-white backdrop-blur-sm",
				onClick: () => {
					setPureLight(false);
					setPerfMode(false);
					setDockOpen(false);
					setSpectacular(false);
					setLightShowState(false);
					setLightModeState("off");
					setAmbient(false);
					stopAmbient();
				},
				"aria-label": "Exit pure mode",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "mx-auto size-4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative min-h-[50dvh] min-h-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LumenCanvas, {
					className: "absolute inset-0 h-full w-full",
					rotation,
					quality: lastQuality.current,
					activeRoot,
					activeTones,
					expandedSpectrum,
					showGeometry,
					pureLight: pureLight || perfMode,
					pulse,
					visionMode,
					tilt,
					burstKey,
					intensity,
					resonanceEnergy,
					scalePitches: scaleOverlay,
					multiSelect,
					trailTones,
					onSelectRoot: (p, vel) => {
						unlockAudio();
						if (multiSelect.length > 0 && multiSelect.some((m) => m.id === p.id)) setMultiSelect((ms) => ms.filter((m) => m.id !== p.id));
						else if (multiSelect.length > 0) {
							const next = [...multiSelect, p].slice(-4);
							setMultiSelect(next);
							if (next.length >= 2) {
								setActiveRoot(next[0]);
								setActiveTones(next);
								lastQuality.current = "note";
								triggerPulse();
								if (!muted) playChord(next.map((x) => x.midi), {
									duration: 1.6,
									velocity: vel,
									voice
								});
								fireLights(next, "note", 1.6);
							} else playRoot(p, quality, vel);
						} else playRoot(p, quality, vel);
					},
					onRotationChange: setRotation
				}), !uiHidden && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pointer-events-none absolute inset-x-0 bottom-1.5 z-10 flex flex-col items-center gap-1.5 px-2 sm:bottom-3 sm:px-3",
					children: theoryOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pointer-events-auto max-w-[min(100%,34rem)] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)]/93 px-3 py-2 text-center shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md sm:px-3.5 sm:py-2.5",
						"aria-live": "polite",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "line-clamp-2 text-[0.7rem] font-medium tracking-tight text-[var(--color-fg)] sm:text-sm",
								children: statusLine
							}),
							headline && activeRoot && lastQuality.current !== "note" && !chordAnswer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-0.5 hidden text-[0.65rem] text-[var(--color-fg-subtle)] sm:block sm:text-xs",
								children: headline
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-0.5 line-clamp-3 text-[0.62rem] leading-relaxed text-[var(--color-fg-muted)] sm:line-clamp-4 sm:text-xs",
								children: blurb
							})
						]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "z-20 shrink-0 border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)]/96 pb-[env(safe-area-inset-bottom)] backdrop-blur-md",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "flex min-h-11 w-full flex-col items-center justify-center gap-0.5 py-2 text-[var(--color-fg-subtle)]",
					onClick: () => setDockOpen((v) => !v),
					"aria-expanded": dockOpen,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-1.5 text-[0.62rem] font-medium tracking-[0.14em] uppercase",
						children: [dockOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "size-3.5" }), dockOpen ? "Hide controls" : "Show controls"]
					}), !dockOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[0.58rem] normal-case",
						children: "Live · Light · Voice · Journey · Theory"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("cc-scroll mx-auto max-w-3xl flex-col gap-2 overflow-y-auto overscroll-contain px-3 pb-3 sm:gap-3 sm:px-4", dockOpen ? "flex max-h-[40dvh] sm:max-h-[48dvh]" : "hidden"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)]/40 p-2.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[0.6rem] font-medium tracking-[0.14em] text-[var(--color-fg-subtle)] uppercase",
									children: "Live Resonance"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[0.62rem] text-[var(--color-fg-subtle)]",
									children: "Optional. Main sound never depends on the mic."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap gap-1.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => void toggleResonance(),
											className: cn("inline-flex min-h-10 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[0.7rem] font-medium", resonanceOn ? "border-[var(--color-fg)] bg-white/10 text-[var(--color-fg)]" : "border-[var(--color-border)] text-[var(--color-fg-muted)]"),
											children: [resonanceOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MicOff, { className: "size-3.5" }), resonanceOn ? "Listening" : "Start mic"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setResonanceMode((m) => m === "listen" ? "listenSynth" : "listen"),
											className: "min-h-10 rounded-full border border-[var(--color-border)] px-2.5 py-1.5 text-[0.7rem] text-[var(--color-fg-muted)]",
											children: resonanceMode === "listenSynth" ? "Listen + synth" : "Listen only"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => fileInputRef.current?.click(),
											className: "inline-flex min-h-10 items-center gap-1 rounded-full border border-[var(--color-border)] px-2.5 py-1.5 text-[0.7rem] text-[var(--color-fg-muted)]",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-3.5" }), "Audio file"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											ref: fileInputRef,
											type: "file",
											accept: "audio/*",
											className: "hidden",
											onChange: (e) => void onFileAudio(e.target.files?.[0] ?? null)
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex items-center gap-2 text-[0.65rem] text-[var(--color-fg-muted)]",
									children: ["Sensitivity", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "range",
										min: .15,
										max: .95,
										step: .05,
										value: sensitivity,
										onChange: (e) => setSensitivity(Number(e.target.value)),
										className: "min-h-10 flex-1 accent-[var(--color-fg)]"
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[0.6rem] font-medium tracking-[0.14em] text-[var(--color-fg-subtle)] uppercase",
								children: "Journey"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: toggleRecord,
										className: cn("min-h-10 rounded-full border px-2.5 py-1.5 text-[0.7rem] font-medium", recording ? "border-red-400/50 text-red-200" : "border-[var(--color-border)] text-[var(--color-fg-muted)]"),
										children: recording ? "Stop rec" : "Record"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: playRecordedJourney,
										className: "inline-flex min-h-10 items-center gap-1 rounded-full border border-[var(--color-border)] px-2.5 py-1.5 text-[0.7rem] text-[var(--color-fg-muted)]",
										children: [playingJourney ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-3" }), "Playback"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => void shareJourneyLink(),
										className: "min-h-10 rounded-full border border-[var(--color-border)] px-2.5 py-1.5 text-[0.7rem] text-[var(--color-fg-muted)]",
										children: "Share link"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: exportJson,
										className: "min-h-10 rounded-full border border-[var(--color-border)] px-2.5 py-1.5 text-[0.7rem] text-[var(--color-fg-muted)]",
										children: "JSON"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: exportMidi,
										className: "min-h-10 rounded-full border border-[var(--color-border)] px-2.5 py-1.5 text-[0.7rem] text-[var(--color-fg-muted)]",
										children: "MIDI"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => {
											clearJourney();
											setJourneyCount(0);
											setRecording(false);
										},
										className: "min-h-10 rounded-full border border-[var(--color-border)] px-2.5 py-1.5 text-[0.7rem] text-[var(--color-fg-muted)]",
										children: "Clear"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setPerfMode((v) => !v),
										className: cn("min-h-10 rounded-full border px-2.5 py-1.5 text-[0.7rem]", perfMode ? "border-[var(--color-fg)] text-[var(--color-fg)]" : "border-[var(--color-border)] text-[var(--color-fg-muted)]"),
										children: "Performance"
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "w-full text-[0.6rem] font-medium tracking-[0.14em] text-[var(--color-fg-subtle)] uppercase sm:w-auto",
									children: "Light"
								}),
								[
									["off", "Off"],
									["screen", "Screen beam"],
									["torch", "Flash"],
									["hybrid", "Hybrid"]
								].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									disabled: id === "torch" || id === "hybrid" ? torchOk === false : false,
									onClick: () => setLightModeState(id),
									className: cn("min-h-10 rounded-full border px-2.5 py-1.5 text-[0.7rem] font-medium sm:min-h-9", lightMode === id ? "border-[var(--color-fg)] bg-[var(--color-fg)] text-[var(--color-accent-fg)]" : "border-[var(--color-border)] text-[var(--color-fg-muted)]", (id === "torch" || id === "hybrid") && torchOk === false && "opacity-40"),
									children: id === "torch" || id === "hybrid" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flashlight, { className: "size-3" }), label]
									}) : label
								}, id)),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setLightShowState((v) => !v),
									className: cn("min-h-10 rounded-full border px-2.5 py-1.5 text-[0.7rem] font-medium sm:min-h-9", lightShow ? "border-[var(--color-fg)] bg-white/10 text-[var(--color-fg)]" : "border-[var(--color-border)] text-[var(--color-fg-muted)]"),
									children: "Light show"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[0.6rem] font-medium tracking-[0.14em] text-[var(--color-fg-subtle)] uppercase",
								children: "Voice"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-1.5",
								children: VOICES.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setVoice(v),
									className: cn("min-h-10 rounded-full border px-2.5 py-1.5 text-[0.7rem] font-medium sm:min-h-9", voice === v ? "border-[var(--color-fg)] bg-[var(--color-fg)] text-[var(--color-accent-fg)]" : "border-[var(--color-border)] text-[var(--color-fg-muted)]"),
									children: VOICE_LABELS[v]
								}, v))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[0.6rem] font-medium tracking-[0.14em] text-[var(--color-fg-subtle)] uppercase",
								children: "Voicing"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-1.5",
								children: QUALITIES.map((q) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => {
										setQuality(q);
										if (activeRoot) playRoot(activeRoot, q);
									},
									className: cn("min-h-10 rounded-full border px-2.5 py-1.5 text-[0.7rem] font-medium sm:min-h-9", quality === q ? "border-[var(--color-fg)] bg-[var(--color-fg)] text-[var(--color-accent-fg)]" : "border-[var(--color-border)] text-[var(--color-fg-muted)]"),
									children: QUALITY_LABELS[q]
								}, q))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[0.6rem] font-medium tracking-[0.14em] text-[var(--color-fg-subtle)] uppercase",
									children: "Scale overlay"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setScaleId("off"),
										className: cn("min-h-9 rounded-full border px-2.5 py-1.5 text-[0.7rem]", scaleId === "off" ? "border-[var(--color-fg)] text-[var(--color-fg)]" : "border-[var(--color-border)] text-[var(--color-fg-muted)]"),
										children: "Off"
									}), SCALES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setScaleId(s.id),
										className: cn("min-h-9 rounded-full border px-2.5 py-1.5 text-[0.7rem]", scaleId === s.id ? "border-[var(--color-fg)] text-[var(--color-fg)]" : "border-[var(--color-border)] text-[var(--color-fg-muted)]"),
										children: s.name
									}, s.id))]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => setMultiSelect((m) => m.length ? [] : activeRoot ? [activeRoot] : []),
									className: cn("min-h-9 self-start rounded-full border px-2.5 py-1.5 text-[0.7rem]", multiSelect.length ? "border-[var(--color-fg)] text-[var(--color-fg)]" : "border-[var(--color-border)] text-[var(--color-fg-muted)]"),
									children: ["Multi-select ", multiSelect.length ? `(${multiSelect.length})` : "off"]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[0.6rem] font-medium tracking-[0.14em] text-[var(--color-fg-subtle)] uppercase",
								children: "Suggest"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-1.5",
								children: suggestions.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									title: s.blurb,
									onClick: () => runMood(s.mood),
									className: "min-h-9 rounded-full border border-[var(--color-border)] px-2.5 py-1.5 text-[0.7rem] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]",
									children: s.label
								}, s.id))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[0.6rem] font-medium tracking-[0.14em] text-[var(--color-fg-subtle)] uppercase",
									children: "Progressions"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex items-center gap-2 text-xs text-[var(--color-fg-muted)]",
									children: ["Key", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										value: keyRoot.id,
										onChange: (e) => {
											const p = FIFTHS.find((x) => x.id === e.target.value);
											if (p) setKeyRoot(p);
										},
										className: "min-h-10 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-2 py-1.5 text-xs text-[var(--color-fg)] outline-none sm:min-h-9",
										children: FIFTHS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
											value: p.id,
											children: [
												p.label,
												" · ",
												p.colorName
											]
										}, p.id))
									})]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-1.5",
								children: PROGRESSIONS.map((p) => {
									const active = playingProgression === p.id;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => void playProgression(p.id),
										className: cn("inline-flex min-h-10 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[0.7rem] font-medium sm:min-h-9", active ? "border-[var(--color-fg)] bg-white/10 text-[var(--color-fg)]" : "border-[var(--color-border)] text-[var(--color-fg-muted)]"),
										children: [active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-3" }), p.name]
									}, p.id);
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-1 border-t border-[var(--color-border)] pt-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "ghost",
									size: "sm",
									onClick: () => setExpandedSpectrum((v) => !v),
									className: "gap-1 min-h-10",
									children: [expandedSpectrum ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-3.5" }), "UV/IR"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "ghost",
									size: "sm",
									onClick: () => setShowGeometry((v) => !v),
									className: "gap-1 min-h-10",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Waves, { className: "size-3.5" }), "Geometry"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "ghost",
									size: "sm",
									onClick: () => {
										setAmbient((v) => {
											const next = !v;
											if (next && activeTones.length) startAmbient(activeTones.map((t) => t.midi), .07);
											else stopAmbient();
											return next;
										});
									},
									className: "gap-1 min-h-10",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "size-3.5" }), "Ambient"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "sm",
									onClick: () => setTheoryOpen((v) => !v),
									className: "gap-1 min-h-10",
									children: "Theory"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "ghost",
									size: "sm",
									onClick: () => setVisionMode((m) => m === "full" ? "deuteranopia" : m === "deuteranopia" ? "luminance" : "full"),
									className: "gap-1 min-h-10",
									children: ["Vision: ", visionMode === "full" ? "full" : visionMode === "luminance" ? "luma" : "CVD"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "ghost",
									size: "sm",
									onClick: () => setHaptics((v) => !v),
									className: "gap-1 min-h-10",
									children: ["Haptics ", haptics ? "on" : "off"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "ghost",
									size: "sm",
									onClick: () => setRotation(0),
									className: "gap-1 min-h-10",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-3.5" }), "Reset"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "ghost",
									size: "sm",
									onClick: exportPng,
									className: "gap-1 min-h-10",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3.5" }), "PNG"]
								})
							]
						})
					]
				})]
			}),
			infoOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-40 flex items-end justify-center bg-black/65 p-3 sm:items-center",
				role: "dialog",
				"aria-modal": "true",
				"aria-label": "About ColorChord Living Spectrum",
				onClick: () => setInfoOpen(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-h-[min(85dvh,40rem)] w-full max-w-md overflow-y-auto rounded-[var(--radius-xl)] border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] p-5 shadow-2xl",
					onClick: (e) => e.stopPropagation(),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[0.65rem] font-medium tracking-[0.18em] text-[var(--color-fg-subtle)] uppercase",
							children: "ColorChord 2.0"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-1 text-lg font-semibold tracking-tight",
							children: "Living Spectrum"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 space-y-3 text-sm leading-relaxed text-[var(--color-fg-muted)]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									className: "font-medium text-[var(--color-fg)]",
									children: "Why this color?"
								}), " One step on the Circle of Fifths ≈ 30° of hue. C is crimson; each fifth walks the spectrum. Opposite notes are tritones and complementary colors."] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										className: "font-medium text-[var(--color-fg)]",
										children: "Live Resonance"
									}),
									" ",
									"listens (YIN pitch + chroma) and paints the wheel — optional, never required for sound."
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
									"Record a ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										className: "font-medium text-[var(--color-fg)]",
										children: "Journey"
									}),
									", share a deep link, export JSON or MIDI. Scale overlays and multi-select open the theory playground."
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-[var(--color-fg-subtle)]",
									children: "Nod to Newton’s color circle and Scriabin’s color organ — presented lightly, as living geometry rather than doctrine."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								className: "flex-1",
								onClick: () => void shareApp(),
								children: "Share"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "flex-1",
								onClick: () => setInfoOpen(false),
								children: "Close"
							})]
						})
					]
				})
			})
		]
	});
}
function Home() {
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setReady(true);
	}, []);
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-[100dvh] place-items-center bg-[#070709] text-[#f0f0f2]",
		style: { marginTop: "var(--grok-banner-h, 0px)" },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[0.65rem] font-medium tracking-[0.2em] text-[#6b6b76] uppercase",
					children: "Dual harmonic instrument"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-lg font-semibold tracking-tight",
					children: "Color Chord"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-[#9b9ba6]",
					children: "Loading the wheel…"
				})
			]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LumenApp, {});
}
//#endregion
export { Home as component };
