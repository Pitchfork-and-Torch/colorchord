import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { M as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as cn, t as Button } from "./button-pF9ahLE2.mjs";
import { _ as polar, a as beamColor$1, b as theoryHeadline, c as complementaryPitch, d as hsl, f as inferQuality, g as parseChordSymbol, h as nearestPitchFromFrequency, i as VOICE_LABELS, l as fifthsAngle, m as mixHues, n as PROGRESSIONS, o as chordColorLookup, p as mixColorName, r as QUALITY_LABELS, s as chordPitches, t as FIFTHS, u as frequencyOf, v as romanDegree, y as theoryBlurb } from "./theory-CL5NkV1y.mjs";
import { _ as Eye, b as ChevronUp, c as RotateCcw, d as Moon, f as Mic, g as Flashlight, h as Info, i as Volume2, l as Play, m as Maximize2, n as Waves, o as Sparkles, p as MicOff, r as VolumeX, s as Share2, t as X, u as Pause, v as EyeOff, x as ChevronDown, y as Download } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-VX1ikH8H.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LumenCanvas({ rotation, quality: _quality, activeRoot, activeTones, expandedSpectrum, showGeometry, pureLight, pulse, visionMode, tilt, burstKey, intensity, onSelectRoot, onRotationChange, className }) {
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
		intensity
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
		intensity
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
			const { rotation: rot, activeRoot: root, activeTones: tones, expandedSpectrum: expanded, showGeometry: geometry, pureLight, pulse: pulseAmt, visionMode: mode, tilt: tiltNow, intensity: intens } = stateRef.current;
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
			const disc = ctx.createRadialGradient(cx, cy, 0, cx, cy, innerR);
			disc.addColorStop(0, pureLight ? "#0a0a12" : "#14141a");
			disc.addColorStop(.75, "#0c0c11");
			disc.addColorStop(1, "#09090c");
			ctx.fillStyle = disc;
			ctx.beginPath();
			ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
			ctx.fill();
			const activeIds = new Set(tones.map((p) => p.id));
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
					if (pureLight && !active) continue;
					const nodeR = active ? 15 + pulseAmt * 4 : 12.5;
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
/** Chord-aware haptic patterns */
var enabled = true;
function setHapticsEnabled(on) {
	enabled = on;
}
function hapticsAvailable() {
	return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
}
/** Tension → resolution patterns */
function hapticChord(kind) {
	if (!enabled || !hapticsAvailable()) return;
	switch (kind) {
		case "note":
			navigator.vibrate(12);
			break;
		case "consonant":
			navigator.vibrate([
				14,
				30,
				10
			]);
			break;
		case "dominant":
			navigator.vibrate([
				18,
				40,
				18,
				40,
				28
			]);
			break;
		case "dissonant": navigator.vibrate([
			10,
			20,
			10,
			20,
			10,
			20,
			24
		]);
	}
}
/** Real-time pitch detection → nearest Circle-of-Fifths note.
*  Uses the shared synth AudioContext so Listen never kills playback.
*/
var stream = null;
var analyser = null;
var source = null;
var silentGain = null;
var raf = null;
var running = false;
var onPitch = null;
function autoCorrelate(buf, sampleRate) {
	let size = buf.length;
	let rms = 0;
	for (let i = 0; i < size; i++) rms += buf[i] * buf[i];
	rms = Math.sqrt(rms / size);
	if (rms < .01) return -1;
	let r1 = 0;
	let r2 = size - 1;
	const thres = .2;
	for (let i = 0; i < size / 2; i++) if (Math.abs(buf[i]) < thres) {
		r1 = i;
		break;
	}
	for (let i = 1; i < size / 2; i++) if (Math.abs(buf[size - i]) < thres) {
		r2 = size - i;
		break;
	}
	const slice = buf.slice(r1, r2);
	size = slice.length;
	if (size < 32) return -1;
	const c = new Float32Array(size);
	for (let i = 0; i < size; i++) {
		let sum = 0;
		for (let j = 0; j < size - i; j++) sum += slice[j] * slice[j + i];
		c[i] = sum;
	}
	let d = 0;
	while (d + 1 < size && c[d] > c[d + 1]) d++;
	let maxval = -1;
	let maxpos = -1;
	for (let i = d; i < size; i++) if (c[i] > maxval) {
		maxval = c[i];
		maxpos = i;
	}
	let T0 = maxpos;
	if (T0 <= 0) return -1;
	const x1 = c[T0 - 1] ?? c[T0];
	const x2 = c[T0];
	const x3 = c[T0 + 1] ?? x2;
	const a = (x1 + x3 - 2 * x2) / 2;
	const b = (x3 - x1) / 2;
	if (a) T0 = T0 - b / (2 * a);
	return sampleRate / T0;
}
function loop() {
	if (!running || !analyser) return;
	const ctx = getAudioContext();
	const buf = new Float32Array(analyser.fftSize);
	analyser.getFloatTimeDomainData(buf);
	const freq = autoCorrelate(buf, ctx.sampleRate);
	if (freq > 0) {
		const near = nearestPitchFromFrequency(freq);
		if (near) {
			const clarity = Math.max(0, 1 - Math.abs(near.cents) / 50);
			onPitch?.({
				pitch: near.pitch,
				octave: near.octave,
				cents: near.cents,
				frequency: freq,
				clarity
			});
		} else onPitch?.(null);
	} else onPitch?.(null);
	raf = requestAnimationFrame(loop);
}
async function startMic(cb) {
	if (running) {
		onPitch = cb;
		return true;
	}
	try {
		await resumeAudio();
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
		analyser.smoothingTimeConstant = .8;
		silentGain = audioCtx.createGain();
		silentGain.gain.value = 0;
		source.connect(analyser);
		analyser.connect(silentGain);
		silentGain.connect(audioCtx.destination);
		onPitch = cb;
		running = true;
		await resumeAudio();
		loop();
		return true;
	} catch {
		stopMic();
		return false;
	}
}
async function stopMic() {
	running = false;
	if (raf != null) cancelAnimationFrame(raf);
	raf = null;
	onPitch = null;
	try {
		source?.disconnect();
	} catch {}
	try {
		analyser?.disconnect();
	} catch {}
	try {
		silentGain?.disconnect();
	} catch {}
	stream?.getTracks().forEach((t) => {
		try {
			t.stop();
		} catch {}
	});
	stream = null;
	analyser = null;
	source = null;
	silentGain = null;
	await resumeAudio();
}
function isMicRunning() {
	return running;
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
	const [micOn, setMicOn] = (0, import_react.useState)(false);
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
	const progTimer = (0, import_react.useRef)(null);
	const pulseTimer = (0, import_react.useRef)(null);
	const lastQuality = (0, import_react.useRef)("major");
	const lastMicId = (0, import_react.useRef)(null);
	const lastMicAt = (0, import_react.useRef)(0);
	const intensity = (0, import_react.useMemo)(() => {
		let n = .25;
		if (lightMode === "screen") n += .2;
		if (lightMode === "torch" || lightMode === "hybrid") n += .3;
		if (lightShow) n += .15;
		if (pureLight) n += .15;
		if (spectacular) n += .25;
		if (ambient) n += .08;
		return Math.min(1, n);
	}, [
		lightMode,
		lightShow,
		pureLight,
		spectacular,
		ambient
	]);
	(0, import_react.useEffect)(() => {
		startLightEngine();
		detectTorchSupport().then(setTorchOk);
		setHapticsEnabled(haptics);
		return () => {
			if (progTimer.current) window.clearTimeout(progTimer.current);
			if (pulseTimer.current) window.clearInterval(pulseTimer.current);
			stopAll();
			stopAmbient();
			stopMic();
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
	}, [haptics]);
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
	const playRoot = (0, import_react.useCallback)((root, q = quality, velocity = .85, step = 0) => {
		unlockAudio();
		const tones = chordPitches(root, q);
		setActiveRoot(root);
		setActiveTones(tones);
		setActiveStep(step);
		lastQuality.current = q;
		triggerPulse();
		const duration = q === "note" ? 1.15 : 1.75;
		fireLights(tones, q, duration);
		if (!muted) playChord(tones.map((p) => p.midi), {
			duration,
			velocity,
			voice
		});
		if (ambient) startAmbient(tones.map((p) => p.midi), .07);
	}, [
		quality,
		muted,
		voice,
		ambient,
		triggerPulse,
		fireLights
	]);
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
	const toggleMic = async () => {
		if (micOn || isMicRunning()) {
			await stopMic();
			setMicOn(false);
			setMicLabel(null);
			lastMicId.current = null;
			await resumeAudio();
			setMasterVolume(muted ? 0 : .9);
			return;
		}
		await resumeAudio();
		const ok = await startMic((r) => {
			if (!r || r.clarity < .4) {
				setMicLabel(null);
				return;
			}
			setMicLabel(`${r.pitch.label} ${r.pitch.colorName} · ${Math.round(r.frequency)} Hz`);
			const now = performance.now();
			if (lastMicId.current === r.pitch.id && now - lastMicAt.current < 700) return;
			lastMicId.current = r.pitch.id;
			lastMicAt.current = now;
			playRoot(r.pitch, "note", .5 + r.clarity * .45);
		});
		setMicOn(ok);
		if (!ok) {
			setMicLabel("Mic unavailable");
			await resumeAudio();
			setMasterVolume(muted ? 0 : .9);
		}
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
			await resumeAudio();
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
	const exportPng = () => {
		const canvas = document.querySelector("canvas");
		if (!canvas) return;
		const a = document.createElement("a");
		a.download = `color-chord-${activeRoot?.id ?? "wheel"}.png`;
		a.href = canvas.toDataURL("image/png");
		a.click();
	};
	const shareApp = async () => {
		const url = typeof window !== "undefined" ? window.location.href : "https://colorchord.grok.me";
		const data = {
			title: "Color Chord",
			text: "Play harmony as color — Circle of Fifths mapped to the spectrum.",
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
		if (micOn && micLabel) return `Listening · ${micLabel}`;
		if (!activeRoot) return "Tap a note · or ask a chord color below";
		const q = lastQuality.current;
		if (q === "note") {
			const comp = complementaryPitch(activeRoot);
			return `${activeRoot.label} ${activeRoot.colorName} (~${activeRoot.wavelengthNm} nm) · opposite ${comp.label} ${comp.colorName}`;
		}
		const roman = romanDegree(activeStep, q);
		const mix = mixColorName(activeTones);
		return `${roman}  ·  ${activeRoot.label} ${QUALITY_LABELS[q]}  ·  ${mix}`;
	}, [
		activeRoot,
		activeTones,
		activeStep,
		micOn,
		micLabel,
		burstKey
	]);
	const blurb = (0, import_react.useMemo)(() => {
		if (chordAnswer) return chordAnswer;
		if (!activeRoot || activeTones.length === 0) return "Ask any chord (Am7, G7, F#maj7) — Color Chord answers with its spectral colors. One circle: fifths = hue.";
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
	const uiHidden = pureLight && !dockOpen;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex h-[calc(100dvh-var(--grok-banner-h,0px))] flex-col overflow-hidden bg-[var(--color-bg)] text-[var(--color-fg)]",
		style: { marginTop: "var(--grok-banner-h, 0px)" },
		children: [
			!uiHidden && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-2 p-2.5 pt-[max(0.5rem,env(safe-area-inset-top))] sm:p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pointer-events-auto max-w-[min(100%,20rem)] rounded-[var(--radius-md)] bg-[var(--color-bg)]/75 px-2.5 py-1.5 shadow-lg backdrop-blur-md sm:bg-transparent sm:px-0 sm:py-0 sm:shadow-none sm:backdrop-blur-none",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[0.55rem] font-medium tracking-[0.2em] text-[var(--color-fg-subtle)] uppercase sm:text-[0.6rem]",
							children: "Dual harmonic instrument"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-0.5 text-base font-semibold tracking-[-0.03em] sm:text-2xl",
							children: "Color Chord"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 hidden text-xs leading-snug text-[var(--color-fg-muted)] sm:block",
							children: "Circle of Fifths · color wheel · living light"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-1.5 flex flex-wrap items-center gap-1.5 sm:mt-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
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
								className: cn("inline-flex min-h-9 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[0.7rem] font-medium transition-colors", muted ? "border-[var(--color-border)] text-[var(--color-fg-muted)]" : "border-[var(--color-fg)]/30 bg-white/5 text-[var(--color-fg)]"),
								children: [muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-3.5" }), muted ? "Muted" : "Sound on"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => void toggleMic(),
								"aria-label": micOn ? "Turn off microphone pitch detect" : "Microphone pitch detect (optional)",
								"aria-pressed": micOn,
								title: "Optional: sing or play into the mic to light notes. Not required for sound.",
								className: cn("inline-flex min-h-9 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[0.7rem] font-medium transition-colors", micOn ? "border-[var(--color-fg)] bg-white/10 text-[var(--color-fg)]" : "border-[var(--color-border)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"),
								children: [micOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MicOff, { className: "size-3.5" }), "Mic"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "mt-1.5 flex w-full max-w-[18rem] items-center gap-1.5 sm:mt-2",
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
								placeholder: "Ask a chord… Am7",
								"aria-label": "Ask what color a chord is",
								className: "min-h-9 min-w-0 flex-1 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)]/90 px-3 text-xs text-[var(--color-fg)] outline-none placeholder:text-[var(--color-fg-subtle)] focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]",
								autoCapitalize: "off",
								autoCorrect: "off",
								spellCheck: false
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "submit",
								className: "min-h-9 shrink-0 rounded-full border border-[var(--color-fg)] bg-[var(--color-fg)] px-3 text-[0.7rem] font-medium text-[var(--color-accent-fg)]",
								children: "Look up"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 flex flex-wrap gap-1",
							children: [
								"C",
								"Am",
								"G7",
								"F#maj7",
								"Dm7"
							].map((ex) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									setChordQuery(ex);
									askChordColor(ex);
								},
								className: "rounded-full border border-[var(--color-border)] px-2 py-0.5 text-[0.62rem] font-medium text-[var(--color-fg-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-fg)]",
								children: ex
							}, ex))
						}),
						chordError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 max-w-[18rem] text-[0.65rem] leading-snug text-red-300/90",
							children: chordError
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pointer-events-auto flex flex-wrap items-center justify-end gap-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: spectacular ? "default" : "secondary",
							size: "sm",
							className: "gap-1.5",
							onClick: () => void enableSpectacular(),
							"aria-pressed": spectacular,
							title: "Opt-in max intensity: light + pure mode + ambient",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden sm:inline",
								children: spectacular ? "Calm" : "Intensify"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							size: "icon",
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
							"aria-label": "Share",
							onClick: () => void shareApp(),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							size: "icon",
							"aria-label": "About Color Chord",
							onClick: () => setInfoOpen(true),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							size: "icon",
							"aria-label": "Export PNG",
							onClick: exportPng,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" })
						})
					]
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
					setDockOpen(false);
					setSpectacular(false);
					setLightShowState(false);
					setLightModeState("off");
					setAmbient(false);
					stopAmbient();
				},
				"aria-label": "Exit pure light",
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
					pureLight,
					pulse,
					visionMode,
					tilt,
					burstKey,
					intensity,
					onSelectRoot: (p, vel) => {
						unlockAudio();
						playRoot(p, quality, vel);
					},
					onRotationChange: setRotation
				}), !uiHidden && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pointer-events-none absolute inset-x-0 bottom-2 z-10 flex flex-col items-center gap-2 px-3 sm:bottom-3",
					children: [theoryOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pointer-events-auto max-w-[min(100%,34rem)] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)]/93 px-3.5 py-2.5 text-center shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-tight text-[var(--color-fg)] sm:text-sm",
								children: statusLine
							}),
							headline && activeRoot && lastQuality.current !== "note" && !chordAnswer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-0.5 text-[0.65rem] text-[var(--color-fg-subtle)] sm:text-xs",
								children: headline
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-[0.65rem] leading-relaxed text-[var(--color-fg-muted)] sm:text-xs",
								children: blurb
							})
						]
					}), !theoryOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "pointer-events-auto rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)]/92 px-3.5 py-1.5 text-xs font-medium shadow-lg backdrop-blur-md",
						children: statusLine
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "z-20 shrink-0 border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)]/96 pb-[env(safe-area-inset-bottom)] backdrop-blur-md",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "flex w-full flex-col items-center justify-center gap-0.5 py-2.5 text-[var(--color-fg-subtle)]",
					onClick: () => setDockOpen((v) => !v),
					"aria-expanded": dockOpen,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-1.5 text-[0.62rem] font-medium tracking-[0.14em] uppercase",
						children: [dockOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "size-3.5" }), dockOpen ? "Hide controls" : "Show controls"]
					}), !dockOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[0.6rem] font-normal tracking-normal text-[var(--color-fg-subtle)] normal-case",
						children: "Light, voice, progressions · optional intensity"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("cc-scroll mx-auto max-w-3xl flex-col gap-2.5 overflow-y-auto px-3 pb-3 sm:gap-3 sm:px-4 sm:pb-4", dockOpen ? "flex max-h-[42dvh] sm:max-h-none" : "hidden"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-[0.65rem] leading-relaxed text-[var(--color-fg-subtle)]",
							children: [
								"Calm by default. Ask a chord under the title for its colors, or turn on",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[var(--color-fg-muted)]",
									children: "Screen beam"
								}),
								" /",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[var(--color-fg-muted)]",
									children: "Intensify"
								}),
								" to paint the room."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "w-full text-[0.6rem] font-medium tracking-[0.14em] text-[var(--color-fg-subtle)] uppercase sm:mr-1 sm:w-auto",
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
									className: cn("min-h-9 rounded-full border px-2.5 py-1.5 text-[0.7rem] font-medium transition-colors", lightMode === id ? "border-[var(--color-fg)] bg-[var(--color-fg)] text-[var(--color-accent-fg)]" : "border-[var(--color-border)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]", (id === "torch" || id === "hybrid") && torchOk === false && "opacity-40"),
									children: id === "torch" || id === "hybrid" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flashlight, { className: "size-3" }), label]
									}) : label
								}, id)),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setLightShowState((v) => !v),
									className: cn("min-h-9 rounded-full border px-2.5 py-1.5 text-[0.7rem] font-medium", lightShow ? "border-[var(--color-fg)] bg-white/10 text-[var(--color-fg)]" : "border-[var(--color-border)] text-[var(--color-fg-muted)]"),
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
									className: cn("min-h-9 rounded-full border px-2.5 py-1.5 text-[0.7rem] font-medium", voice === v ? "border-[var(--color-fg)] bg-[var(--color-fg)] text-[var(--color-accent-fg)]" : "border-[var(--color-border)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"),
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
									className: cn("min-h-9 rounded-full border px-2.5 py-1.5 text-[0.7rem] font-medium", quality === q ? "border-[var(--color-fg)] bg-[var(--color-fg)] text-[var(--color-accent-fg)]" : "border-[var(--color-border)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"),
									children: QUALITY_LABELS[q]
								}, q))
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
										className: "min-h-9 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-2 py-1.5 text-xs text-[var(--color-fg)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]",
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
										className: cn("inline-flex min-h-9 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[0.7rem] font-medium", active ? "border-[var(--color-fg)] bg-white/10 text-[var(--color-fg)]" : "border-[var(--color-border)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"),
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
									className: "gap-1",
									children: [expandedSpectrum ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-3.5" }), "UV/IR"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "ghost",
									size: "sm",
									onClick: () => setShowGeometry((v) => !v),
									className: "gap-1",
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
									className: "gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "size-3.5" }), "Ambient"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "sm",
									onClick: () => setTheoryOpen((v) => !v),
									className: "gap-1",
									children: "Theory"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "ghost",
									size: "sm",
									onClick: () => setVisionMode((m) => m === "full" ? "deuteranopia" : m === "deuteranopia" ? "luminance" : "full"),
									className: "gap-1",
									children: ["Vision: ", visionMode === "full" ? "full" : visionMode === "luminance" ? "luma" : "CVD"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "ghost",
									size: "sm",
									onClick: () => setHaptics((v) => !v),
									className: "gap-1",
									children: ["Haptics ", haptics ? "on" : "off"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "ghost",
									size: "sm",
									onClick: () => setRotation(0),
									className: "gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-3.5" }), "Reset"]
								})
							]
						}),
						torchOk === false && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[0.65rem] text-[var(--color-fg-subtle)]",
							children: "Torch not available here — Screen beam still paints full-screen chord color."
						})
					]
				})]
			}),
			infoOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-40 flex items-end justify-center bg-black/65 p-3 sm:items-center",
				role: "dialog",
				"aria-modal": "true",
				"aria-label": "About Color Chord",
				onClick: () => setInfoOpen(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-h-[min(85dvh,40rem)] w-full max-w-md overflow-y-auto rounded-[var(--radius-xl)] border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] p-5 shadow-2xl",
					onClick: (e) => e.stopPropagation(),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[0.65rem] font-medium tracking-[0.18em] text-[var(--color-fg-subtle)] uppercase",
							children: "Color Chord"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-1 text-lg font-semibold tracking-tight",
							children: "Musical chords for light"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 space-y-3 text-sm leading-relaxed text-[var(--color-fg-muted)]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "The Circle of Fifths is permanently mapped onto the color wheel: one step = a perfect fifth ≈ 30° of hue. Opposite notes are tritones and complementary colors." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										className: "font-medium text-[var(--color-fg)]",
										children: "Ask a chord"
									}),
									" under the title (or via",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
										className: "text-[var(--color-fg)]",
										children: "/api/chord-color?q=Am7"
									}),
									") to get its exact Color Chord colors — e.g. Am7 → Chartreuse · Magenta · Vermilion · Cyan."
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Starts calm. Open controls for Screen beam, or tap Intensify for a pocket color organ." })
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
