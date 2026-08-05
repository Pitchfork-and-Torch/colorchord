//#region node_modules/.nitro/vite/services/ssr/assets/theory-C76ANaGL.js
/** Circle of fifths order starting at C (top), clockwise. Hue maps 1:1 to fifths position. */
var FIFTHS = [
	{
		id: "C",
		label: "C",
		midi: 0,
		fifthsIndex: 0,
		hue: 0,
		wavelengthNm: 650,
		colorName: "Crimson"
	},
	{
		id: "G",
		label: "G",
		midi: 7,
		fifthsIndex: 1,
		hue: 30,
		wavelengthNm: 610,
		colorName: "Vermilion"
	},
	{
		id: "D",
		label: "D",
		midi: 2,
		fifthsIndex: 2,
		hue: 60,
		wavelengthNm: 580,
		colorName: "Amber"
	},
	{
		id: "A",
		label: "A",
		midi: 9,
		fifthsIndex: 3,
		hue: 90,
		wavelengthNm: 555,
		colorName: "Chartreuse"
	},
	{
		id: "E",
		label: "E",
		midi: 4,
		fifthsIndex: 4,
		hue: 120,
		wavelengthNm: 530,
		colorName: "Emerald"
	},
	{
		id: "B",
		label: "B",
		midi: 11,
		fifthsIndex: 5,
		hue: 150,
		wavelengthNm: 500,
		colorName: "Spring"
	},
	{
		id: "F#",
		label: "F♯",
		alt: "G♭",
		midi: 6,
		fifthsIndex: 6,
		hue: 180,
		wavelengthNm: 485,
		colorName: "Cyan"
	},
	{
		id: "Db",
		label: "D♭",
		alt: "C♯",
		midi: 1,
		fifthsIndex: 7,
		hue: 210,
		wavelengthNm: 470,
		colorName: "Azure"
	},
	{
		id: "Ab",
		label: "A♭",
		alt: "G♯",
		midi: 8,
		fifthsIndex: 8,
		hue: 240,
		wavelengthNm: 450,
		colorName: "Sapphire"
	},
	{
		id: "Eb",
		label: "E♭",
		alt: "D♯",
		midi: 3,
		fifthsIndex: 9,
		hue: 270,
		wavelengthNm: 430,
		colorName: "Violet"
	},
	{
		id: "Bb",
		label: "B♭",
		alt: "A♯",
		midi: 10,
		fifthsIndex: 10,
		hue: 300,
		wavelengthNm: 420,
		colorName: "Magenta"
	},
	{
		id: "F",
		label: "F",
		midi: 5,
		fifthsIndex: 11,
		hue: 330,
		wavelengthNm: 680,
		colorName: "Rose"
	}
];
var BY_MIDI = new Map(FIFTHS.map((p) => [p.midi, p]));
new Map(FIFTHS.map((p) => [p.id, p]));
function pitchByMidi(midi) {
	return BY_MIDI.get((midi % 12 + 12) % 12);
}
function frequencyOf(midiPc, octave = 4) {
	const midi = octave * 12 + 12 + midiPc;
	return 440 * Math.pow(2, (midi - 69) / 12);
}
function chordMidis(rootMidi, quality) {
	const r = (rootMidi % 12 + 12) % 12;
	switch (quality) {
		case "note": return [r];
		case "major": return [
			r,
			(r + 4) % 12,
			(r + 7) % 12
		];
		case "minor": return [
			r,
			(r + 3) % 12,
			(r + 7) % 12
		];
		case "dom7": return [
			r,
			(r + 4) % 12,
			(r + 7) % 12,
			(r + 10) % 12
		];
		case "maj7": return [
			r,
			(r + 4) % 12,
			(r + 7) % 12,
			(r + 11) % 12
		];
		case "min7": return [
			r,
			(r + 3) % 12,
			(r + 7) % 12,
			(r + 10) % 12
		];
		case "sus4": return [
			r,
			(r + 5) % 12,
			(r + 7) % 12
		];
		case "dim": return [
			r,
			(r + 3) % 12,
			(r + 6) % 12
		];
		case "aug": return [
			r,
			(r + 4) % 12,
			(r + 8) % 12
		];
		default: return [r];
	}
}
function chordPitches(root, quality) {
	return chordMidis(root.midi, quality).map(pitchByMidi);
}
function fifthsAngle(index, rotationRad = 0) {
	return -Math.PI / 2 + index / 12 * Math.PI * 2 + rotationRad;
}
function polar(cx, cy, r, angle) {
	return {
		x: cx + Math.cos(angle) * r,
		y: cy + Math.sin(angle) * r
	};
}
/** Opposite on both wheels: tritone = 6 fifths = 180° hue. */
function complementaryPitch(p) {
	return FIFTHS[(p.fifthsIndex + 6) % 12];
}
/** Neighboring fifths (dominant / subdominant). */
function neighboringFifths(p) {
	return {
		dominant: FIFTHS[(p.fifthsIndex + 1) % 12],
		subdominant: FIFTHS[(p.fifthsIndex + 11) % 12]
	};
}
/** Angular span of chord tones on the dual wheel (0–180°). */
function chordHueSpan(tones) {
	if (tones.length < 2) return 0;
	const hues = tones.map((t) => t.hue);
	let max = 0;
	for (let i = 0; i < hues.length; i++) for (let j = i + 1; j < hues.length; j++) {
		let d = Math.abs(hues[i] - hues[j]);
		if (d > 180) d = 360 - d;
		if (d > max) max = d;
	}
	return max;
}
function displayHue(baseHue, mode) {
	if (mode === "full") return baseHue;
	if (mode === "luminance") return 0;
	if (mode === "deuteranopia" || mode === "protanopia") return (200 + (baseHue % 360 + 360) % 360 / 360 * 220) % 360;
	return baseHue;
}
function hsl(h, s = 85, l = 55, a = 1, mode = "full") {
	if (mode === "luminance") return `hsla(0 0% ${25 + (h % 360 + 360) % 360 / 360 * 55}% / ${a})`;
	const hue = displayHue(h, mode);
	const sat = mode === "full" ? s : Math.min(s, 70);
	return `hsla(${(hue % 360 + 360) % 360} ${sat}% ${l}% / ${a})`;
}
function mixHues(hues, alpha = .95, mode = "full") {
	if (hues.length === 0) return "hsla(0 0% 100% / 0.9)";
	if (hues.length === 1) return hsl(hues[0], 72, 58, alpha, mode);
	let x = 0;
	let y = 0;
	for (const h of hues) {
		const rad = displayHue(h, mode) * Math.PI / 180;
		x += Math.cos(rad);
		y += Math.sin(rad);
	}
	return hsl(Math.atan2(y, x) * 180 / Math.PI, mode === "luminance" ? 0 : Math.min(78, 42 + hues.length * 8), Math.min(76, 50 + hues.length * 5), alpha, mode);
}
function beamColor(hues, intensity = 1, mode = "full") {
	if (hues.length === 0) return `hsla(0 0% ${90 * intensity}% / 1)`;
	if (mode === "luminance") return `hsla(0 0% ${Math.round(40 + 50 * intensity)}% / 1)`;
	let x = 0;
	let y = 0;
	for (const h of hues) {
		const rad = displayHue(h, mode) * Math.PI / 180;
		x += Math.cos(rad);
		y += Math.sin(rad);
	}
	const avg = Math.atan2(y, x) * 180 / Math.PI;
	const l = 42 + 28 * intensity;
	return `hsl(${(avg % 360 + 360) % 360} 90% ${l}%)`;
}
/** Additive-style mix description for theory UI. */
function mixColorName(tones) {
	if (tones.length === 0) return "White light";
	if (tones.length === 1) return tones[0].colorName;
	const span = chordHueSpan(tones);
	if (span >= 150) return "Near-white (wide spectrum blend)";
	if (span >= 90) return "Complex prismatic mix";
	if (span >= 50) return "Warm spectral blend";
	return "Close-hue glow";
}
var QUALITY_LABELS = {
	note: "Single",
	major: "Major",
	minor: "Minor",
	dom7: "Dom 7",
	maj7: "Maj 7",
	min7: "Min 7",
	sus4: "Sus 4",
	dim: "Dim",
	aug: "Aug"
};
var VOICE_LABELS = {
	pure: "Pure light",
	pad: "Pad",
	organ: "Organ",
	piano: "Piano",
	strings: "Strings"
};
var PROGRESSIONS = [
	{
		id: "pop",
		name: "I–V–vi–IV",
		steps: [
			0,
			7,
			9,
			5
		]
	},
	{
		id: "jazz",
		name: "ii–V–I",
		steps: [
			2,
			7,
			0
		],
		qualities: [
			"min7",
			"dom7",
			"maj7"
		]
	},
	{
		id: "canon",
		name: "Pachelbel",
		steps: [
			0,
			7,
			9,
			4,
			5,
			0,
			5,
			7
		]
	},
	{
		id: "andalusian",
		name: "Andalusian",
		steps: [
			0,
			10,
			8,
			7
		]
	},
	{
		id: "fifths",
		name: "Circle of 5ths",
		steps: [
			0,
			7,
			2,
			9,
			4,
			11,
			6,
			1,
			8,
			3,
			10,
			5
		]
	},
	{
		id: "turnaround",
		name: "I–vi–ii–V",
		steps: [
			0,
			9,
			2,
			7
		],
		qualities: [
			"major",
			"minor",
			"min7",
			"dom7"
		]
	},
	{
		id: "sad",
		name: "vi–IV–I–V",
		steps: [
			9,
			5,
			0,
			7
		]
	},
	{
		id: "secondary",
		name: "V/V–V–I",
		steps: [
			2,
			7,
			0
		],
		qualities: [
			"dom7",
			"dom7",
			"major"
		]
	},
	{
		id: "modal",
		name: "I–♭VII–IV",
		steps: [
			0,
			10,
			5
		],
		qualities: [
			"major",
			"major",
			"major"
		]
	},
	{
		id: "rhythm",
		name: "Rhythm changes A",
		steps: [
			0,
			9,
			2,
			7,
			5,
			0,
			5,
			7
		],
		qualities: [
			"maj7",
			"min7",
			"min7",
			"dom7",
			"maj7",
			"maj7",
			"dom7",
			"dom7"
		]
	}
];
function romanDegree(step, quality) {
	const majors = [
		"I",
		"♭II",
		"II",
		"♭III",
		"III",
		"IV",
		"♯IV",
		"V",
		"♭VI",
		"VI",
		"♭VII",
		"VII"
	];
	const minors = [
		"i",
		"♭ii",
		"ii",
		"♭iii",
		"iii",
		"iv",
		"♯iv",
		"v",
		"♭vi",
		"vi",
		"♭vii",
		"vii"
	];
	const dims = [
		"i°",
		"♭ii°",
		"ii°",
		"♭iii°",
		"iii°",
		"iv°",
		"♯iv°",
		"v°",
		"♭vi°",
		"vi°",
		"♭vii°",
		"vii°"
	];
	const s = (step % 12 + 12) % 12;
	const q = quality ?? (s === 2 || s === 4 || s === 9 || s === 11 ? "minor" : "major");
	if (q === "dim") return dims[s];
	if (q === "aug") return majors[s] + "+";
	if (q === "dom7") return majors[s] + "⁷";
	if (q === "maj7") return majors[s] + "Δ";
	if (q === "min7") return minors[s] + "⁷";
	if (q === "sus4") return majors[s] + "sus";
	if (q === "minor") return minors[s];
	return majors[s];
}
function inferQuality(step, preferred) {
	if (preferred !== "major" && preferred !== "minor") return preferred;
	const s = (step % 12 + 12) % 12;
	if (s === 9 || s === 2 || s === 4) return "minor";
	if (s === 11) return "dim";
	return "major";
}
function theoryBlurb(root, quality, tones) {
	const comp = complementaryPitch(root);
	const { dominant, subdominant } = neighboringFifths(root);
	const span = chordHueSpan(tones);
	const mix = mixColorName(tones);
	if (quality === "note") return `${root.label} = ${root.colorName} (~${root.wavelengthNm} nm). One step on the fifths ring is a perfect fifth in pitch and ~30° on the color wheel. Opposite is ${comp.label} (${comp.colorName}) — the tritone / complementary hue. Neighbors: ${subdominant.label} ← ${root.label} → ${dominant.label}.`;
	const names = tones.map((t) => `${t.label} ${t.colorName}`).join(" · ");
	const labels = tones.map((t) => t.label).join("–");
	if (quality === "major") return `Major ${labels}: root + M3 + P5. Geometry is a triangle on the dual wheel. Spectral mix ≈ ${mix}. Tones: ${names}. Consonance ≈ close fifths neighbors; the fifth (${tones[2]?.label ?? ""}) is the nearest warm hue step from the root.`;
	if (quality === "minor") return `Minor ${labels}: flattened third cools the harmony — the minor third sits a different fifths distance than the major third, so the triangle tilts toward cooler / more distant hues. Mix ≈ ${mix}. ${names}.`;
	if (quality === "dom7") return `Dominant 7 ${labels} wants to fall a fifth (resolve). Tritone tension inside the chord mirrors complementary-color pull (${comp.label} opposite ${root.label}). Wide hue span (~${Math.round(span)}°) = dissonance you can see. Mix ≈ ${mix}.`;
	if (quality === "maj7") return `Maj7 ${labels}: stacked thirds = stacked near-hues. Soft luminous wash (${mix}). Adjacent fifths colors ${names} blend like slow additive light.`;
	if (quality === "min7") return `Min7 ${labels}: mellow tetrad across the ring. Hue span ~${Math.round(span)}° — less polar than a dominant, more prismatic than a triad. ${names}.`;
	if (quality === "sus4") return `Sus4 ${labels} freezes the third — neither major warmth nor minor cool. Open fifths geometry; colors ${names} hang between resolution paths. Mix ≈ ${mix}.`;
	if (quality === "dim") return `Dim ${labels}: minor thirds stack into high tension. Colors sit at unstable intervals (span ~${Math.round(span)}°). Visually restless — like beating wavelengths. ${names}.`;
	if (quality === "aug") return `Aug ${labels}: major thirds trisect the octave and nearly trisect the color circle — symmetric, bright, unresolved. ${names}. Mix ≈ ${mix}.`;
	return `${root.label} ${QUALITY_LABELS[quality]} → ${names}. Complementary pole: ${comp.label} ${comp.colorName}.`;
}
/** Compact one-line theory for collapsed UI. */
function theoryHeadline(root, quality, tones) {
	const mix = mixColorName(tones);
	if (quality === "note") {
		const comp = complementaryPitch(root);
		return `${root.label} ${root.colorName} · opposite ${comp.label} ${comp.colorName}`;
	}
	return `${tones.map((t) => t.colorName).join(" · ")} → ${mix}`;
}
function nearestPitchFromFrequency(freq) {
	if (!freq || freq < 40 || freq > 4e3) return null;
	const midi = 69 + 12 * Math.log2(freq / 440);
	const rounded = Math.round(midi);
	const cents = (midi - rounded) * 100;
	const pc = (rounded % 12 + 12) % 12;
	const octave = Math.floor(rounded / 12) - 1;
	return {
		pitch: pitchByMidi(pc),
		octave,
		cents
	};
}
var NOTE_ALIASES = {
	c: 0,
	"c#": 1,
	db: 1,
	"d♭": 1,
	"c♯": 1,
	d: 2,
	"d#": 3,
	eb: 3,
	"e♭": 3,
	"d♯": 3,
	e: 4,
	fb: 4,
	"e#": 5,
	f: 5,
	"f#": 6,
	gb: 6,
	"g♭": 6,
	"f♯": 6,
	g: 7,
	"g#": 8,
	ab: 8,
	"a♭": 8,
	"g♯": 8,
	a: 9,
	"a#": 10,
	bb: 10,
	"b♭": 10,
	"a♯": 10,
	b: 11,
	cb: 11
};
function normalizeChordInput(raw) {
	return raw.trim().replace(/\u266f/g, "#").replace(/\u266d/g, "b").replace(/♯/g, "#").replace(/♭/g, "b").replace(/Δ/g, "maj").replace(/°/g, "dim").replace(/ø/g, "m7b5").replace(/\s+/g, " ");
}
function parseQualityToken(token) {
	const t = token.toLowerCase().replace(/\s+/g, "");
	if (t === "" || t === "maj" || t === "major" || t === "ma") return "major";
	if (t === "m" || t === "min" || t === "minor" || t === "-" || t === "mi") return "minor";
	if (t === "7" || t === "dom" || t === "dom7" || t === "dominant" || t === "dominant7") return "dom7";
	if (t === "maj7" || t === "major7" || t === "ma7" || t === "j7") return "maj7";
	if (t === "m7" || t === "min7" || t === "minor7" || t === "-7" || t === "mi7") return "min7";
	if (t === "sus" || t === "sus4" || t === "suspension") return "sus4";
	if (t === "dim" || t === "diminished" || t === "o" || t === "mb5") return "dim";
	if (t === "aug" || t === "augmented" || t === "+" || t === "+5") return "aug";
	if (t === "note" || t === "tone" || t === "single" || t === "unison") return "note";
	return null;
}
/** Parse chord symbols like C, Am, F#maj7, Bb7, Dsus4, E°, G+. */
function parseChordSymbol(raw) {
	const cleaned = normalizeChordInput(raw);
	if (!cleaned) return null;
	let noteToken = "";
	let qualToken = "";
	const words = cleaned.match(/^([A-Ga-g])([#b]?)\s+(.+)$/);
	if (words) {
		noteToken = words[1] + (words[2] || "");
		const rest = words[3].toLowerCase().trim();
		if (/^(major|maj)$/.test(rest)) qualToken = "maj";
		else if (/^(minor|min)$/.test(rest)) qualToken = "m";
		else if (/^(dominant\s*7|dom\s*7|7)$/.test(rest)) qualToken = "7";
		else if (/^(major\s*7|maj\s*7)$/.test(rest)) qualToken = "maj7";
		else if (/^(minor\s*7|min\s*7)$/.test(rest)) qualToken = "m7";
		else if (/^(diminished|dim)$/.test(rest)) qualToken = "dim";
		else if (/^(augmented|aug)$/.test(rest)) qualToken = "aug";
		else if (/^(sus|sus4)$/.test(rest)) qualToken = "sus4";
		else qualToken = rest.replace(/\s+/g, "");
	} else {
		const m = cleaned.match(/^([A-Ga-g])([#b]?)(.*)$/);
		if (!m) return null;
		noteToken = m[1] + (m[2] || "");
		qualToken = (m[3] || "").trim();
	}
	const midi = NOTE_ALIASES[noteToken.toLowerCase()];
	if (midi === void 0) return null;
	let quality = null;
	if (qualToken === "M") quality = "major";
	else if (qualToken === "M7") quality = "maj7";
	else quality = parseQualityToken(qualToken);
	if (!quality) return null;
	const root = pitchByMidi(midi);
	const tones = chordPitches(root, quality);
	const symbol = quality === "note" ? root.label : quality === "major" ? root.label : quality === "minor" ? `${root.label}m` : quality === "dom7" ? `${root.label}7` : quality === "maj7" ? `${root.label}maj7` : quality === "min7" ? `${root.label}m7` : quality === "sus4" ? `${root.label}sus4` : quality === "dim" ? `${root.label}dim` : `${root.label}aug`;
	return {
		root,
		quality,
		symbol,
		tones
	};
}
/** Full color answer for a chord symbol — what Grok / the app should say. */
function chordColorLookup(raw) {
	const input = raw.trim();
	const parsed = parseChordSymbol(input);
	if (!parsed) return {
		ok: false,
		input,
		error: "Could not parse that chord.",
		hint: "Try symbols like C, Am, F#maj7, Bb7, Dsus4, E°, G+."
	};
	const { root, quality, symbol, tones } = parsed;
	const colors = tones.map((t) => t.colorName);
	const mix = mixColorName(tones);
	const toneLine = tones.map((t) => `${t.label} → ${t.colorName} (~${t.wavelengthNm} nm)`).join("; ");
	let answer;
	if (quality === "note") answer = `${symbol} is ${root.colorName} on Color Chord (~${root.wavelengthNm} nm, hue ${root.hue}°).`;
	else if (tones.length === 1) answer = `${symbol} maps to ${colors[0]}.`;
	else answer = `${symbol} maps to ${colors.join(" · ")}. Additive mix ≈ ${mix}. (${toneLine})`;
	return {
		ok: true,
		input,
		symbol,
		quality,
		qualityLabel: QUALITY_LABELS[quality],
		root: {
			label: root.label,
			colorName: root.colorName,
			hue: root.hue,
			wavelengthNm: root.wavelengthNm,
			id: root.id
		},
		tones: tones.map((t) => ({
			label: t.label,
			colorName: t.colorName,
			hue: t.hue,
			wavelengthNm: t.wavelengthNm
		})),
		colors,
		mix,
		answer,
		blurb: theoryBlurb(root, quality, tones)
	};
}
//#endregion
export { pitchByMidi as _, beamColor as a, theoryBlurb as b, complementaryPitch as c, hsl as d, inferQuality as f, parseChordSymbol as g, nearestPitchFromFrequency as h, VOICE_LABELS as i, fifthsAngle as l, mixHues as m, PROGRESSIONS as n, chordColorLookup as o, mixColorName as p, QUALITY_LABELS as r, chordPitches as s, FIFTHS as t, frequencyOf as u, polar as v, theoryHeadline as x, romanDegree as y };
