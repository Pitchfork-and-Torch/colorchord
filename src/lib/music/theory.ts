/** Circle of fifths + spectral color dual mapping - core of Color Chord */

export type NoteId =
  | "C"
  | "G"
  | "D"
  | "A"
  | "E"
  | "B"
  | "F#"
  | "Db"
  | "Ab"
  | "Eb"
  | "Bb"
  | "F";

export type ChordQuality =
  | "note"
  | "major"
  | "minor"
  | "dom7"
  | "dom9"
  | "maj7"
  | "maj9"
  | "min7"
  | "maj6"
  | "min6"
  | "add9"
  | "sus4"
  | "dim"
  | "aug";

export type SynthVoice = "pure" | "pad" | "organ" | "piano" | "strings";

export type VisionMode = "full" | "deuteranopia" | "protanopia" | "luminance";

export interface PitchClass {
  id: NoteId;
  label: string;
  alt?: string;
  midi: number;
  fifthsIndex: number;
  hue: number;
  wavelengthNm: number;
  colorName: string;
}

/** Circle of fifths order starting at C (top), clockwise. Hue maps 1:1 to fifths position. */
export const FIFTHS: PitchClass[] = [
  { id: "C", label: "C", midi: 0, fifthsIndex: 0, hue: 0, wavelengthNm: 650, colorName: "Crimson" },
  { id: "G", label: "G", midi: 7, fifthsIndex: 1, hue: 30, wavelengthNm: 610, colorName: "Vermilion" },
  { id: "D", label: "D", midi: 2, fifthsIndex: 2, hue: 60, wavelengthNm: 580, colorName: "Amber" },
  { id: "A", label: "A", midi: 9, fifthsIndex: 3, hue: 90, wavelengthNm: 555, colorName: "Chartreuse" },
  { id: "E", label: "E", midi: 4, fifthsIndex: 4, hue: 120, wavelengthNm: 530, colorName: "Emerald" },
  { id: "B", label: "B", midi: 11, fifthsIndex: 5, hue: 150, wavelengthNm: 500, colorName: "Spring" },
  { id: "F#", label: "F♯", alt: "G♭", midi: 6, fifthsIndex: 6, hue: 180, wavelengthNm: 485, colorName: "Cyan" },
  { id: "Db", label: "D♭", alt: "C♯", midi: 1, fifthsIndex: 7, hue: 210, wavelengthNm: 470, colorName: "Azure" },
  { id: "Ab", label: "A♭", alt: "G♯", midi: 8, fifthsIndex: 8, hue: 240, wavelengthNm: 450, colorName: "Sapphire" },
  { id: "Eb", label: "E♭", alt: "D♯", midi: 3, fifthsIndex: 9, hue: 270, wavelengthNm: 430, colorName: "Violet" },
  { id: "Bb", label: "B♭", alt: "A♯", midi: 10, fifthsIndex: 10, hue: 300, wavelengthNm: 420, colorName: "Magenta" },
  { id: "F", label: "F", midi: 5, fifthsIndex: 11, hue: 330, wavelengthNm: 680, colorName: "Rose" },
];

const BY_MIDI = new Map(FIFTHS.map((p) => [p.midi, p]));
const BY_ID = new Map(FIFTHS.map((p) => [p.id, p]));

export function pitchById(id: NoteId): PitchClass {
  return BY_ID.get(id)!;
}

export function pitchByMidi(midi: number): PitchClass {
  return BY_MIDI.get(((midi % 12) + 12) % 12)!;
}

export function frequencyOf(midiPc: number, octave = 4): number {
  const midi = octave * 12 + 12 + midiPc;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function chordMidis(rootMidi: number, quality: ChordQuality): number[] {
  const r = ((rootMidi % 12) + 12) % 12;
  switch (quality) {
    case "note":
      return [r];
    case "major":
      return [r, (r + 4) % 12, (r + 7) % 12];
    case "minor":
      return [r, (r + 3) % 12, (r + 7) % 12];
    case "dom7":
      return [r, (r + 4) % 12, (r + 7) % 12, (r + 10) % 12];
    case "dom9":
      return [r, (r + 4) % 12, (r + 7) % 12, (r + 10) % 12, (r + 2) % 12];
    case "maj7":
      return [r, (r + 4) % 12, (r + 7) % 12, (r + 11) % 12];
    case "maj9":
      return [r, (r + 4) % 12, (r + 7) % 12, (r + 11) % 12, (r + 2) % 12];
    case "min7":
      return [r, (r + 3) % 12, (r + 7) % 12, (r + 10) % 12];
    case "maj6":
      return [r, (r + 4) % 12, (r + 7) % 12, (r + 9) % 12];
    case "min6":
      return [r, (r + 3) % 12, (r + 7) % 12, (r + 9) % 12];
    case "add9":
      return [r, (r + 4) % 12, (r + 7) % 12, (r + 2) % 12];
    case "sus4":
      return [r, (r + 5) % 12, (r + 7) % 12];
    case "dim":
      return [r, (r + 3) % 12, (r + 6) % 12];
    case "aug":
      return [r, (r + 4) % 12, (r + 8) % 12];
    default:
      return [r];
  }
}

export function chordPitches(root: PitchClass, quality: ChordQuality): PitchClass[] {
  return chordMidis(root.midi, quality).map(pitchByMidi);
}

export function fifthsAngle(index: number, rotationRad = 0): number {
  return -Math.PI / 2 + (index / 12) * Math.PI * 2 + rotationRad;
}

export function polar(cx: number, cy: number, r: number, angle: number) {
  return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
}

/** Opposite on both wheels: tritone = 6 fifths = 180° hue. */
export function complementaryPitch(p: PitchClass): PitchClass {
  return FIFTHS[(p.fifthsIndex + 6) % 12]!;
}

/** Neighboring fifths (dominant / subdominant). */
export function neighboringFifths(p: PitchClass): { dominant: PitchClass; subdominant: PitchClass } {
  return {
    dominant: FIFTHS[(p.fifthsIndex + 1) % 12]!,
    subdominant: FIFTHS[(p.fifthsIndex + 11) % 12]!,
  };
}

/** Angular span of chord tones on the dual wheel (0 - 180°). */
export function chordHueSpan(tones: PitchClass[]): number {
  if (tones.length < 2) return 0;
  const hues = tones.map((t) => t.hue);
  let max = 0;
  for (let i = 0; i < hues.length; i++) {
    for (let j = i + 1; j < hues.length; j++) {
      let d = Math.abs(hues[i]! - hues[j]!);
      if (d > 180) d = 360 - d;
      if (d > max) max = d;
    }
  }
  return max;
}

export function displayHue(baseHue: number, mode: VisionMode): number {
  if (mode === "full") return baseHue;
  if (mode === "luminance") return 0;
  if (mode === "deuteranopia" || mode === "protanopia") {
    const t = (((baseHue % 360) + 360) % 360) / 360;
    return (200 + t * 220) % 360;
  }
  return baseHue;
}

export function hsl(h: number, s = 85, l = 55, a = 1, mode: VisionMode = "full"): string {
  if (mode === "luminance") {
    const light = 25 + ((((h % 360) + 360) % 360) / 360) * 55;
    return `hsla(0 0% ${light}% / ${a})`;
  }
  const hue = displayHue(h, mode);
  const sat = mode === "full" ? s : Math.min(s, 70);
  return `hsla(${((hue % 360) + 360) % 360} ${sat}% ${l}% / ${a})`;
}

export function mixHues(hues: number[], alpha = 0.95, mode: VisionMode = "full"): string {
  if (hues.length === 0) return "hsla(0 0% 100% / 0.9)";
  if (hues.length === 1) return hsl(hues[0], 72, 58, alpha, mode);
  let x = 0;
  let y = 0;
  for (const h of hues) {
    const rad = (displayHue(h, mode) * Math.PI) / 180;
    x += Math.cos(rad);
    y += Math.sin(rad);
  }
  const avg = (Math.atan2(y, x) * 180) / Math.PI;
  const sat = mode === "luminance" ? 0 : Math.min(78, 42 + hues.length * 8);
  const light = Math.min(76, 50 + hues.length * 5);
  return hsl(avg, sat, light, alpha, mode);
}

export function beamColor(hues: number[], intensity = 1, mode: VisionMode = "full"): string {
  if (hues.length === 0) return `hsla(0 0% ${90 * intensity}% / 1)`;
  if (mode === "luminance") {
    return `hsla(0 0% ${Math.round(40 + 50 * intensity)}% / 1)`;
  }
  let x = 0;
  let y = 0;
  for (const h of hues) {
    const rad = (displayHue(h, mode) * Math.PI) / 180;
    x += Math.cos(rad);
    y += Math.sin(rad);
  }
  const avg = (Math.atan2(y, x) * 180) / Math.PI;
  const l = 42 + 28 * intensity;
  return `hsl(${((avg % 360) + 360) % 360} 90% ${l}%)`;
}

/** Circular mean of tones' hues (degrees 0 - 360). */
export function mixHue(tones: PitchClass[]): number {
  if (tones.length === 0) return 0;
  if (tones.length === 1) return tones[0]!.hue;
  let x = 0;
  let y = 0;
  for (const t of tones) {
    const rad = (t.hue * Math.PI) / 180;
    x += Math.cos(rad);
    y += Math.sin(rad);
  }
  const deg = (Math.atan2(y, x) * 180) / Math.PI;
  return ((deg % 360) + 360) % 360;
}

/** Named color for a single hue on the dual wheel. */
export function colorNameFromHue(hue: number): string {
  const h = ((hue % 360) + 360) % 360;
  // Match / interpolate the twelve named spectral points
  const names: { hue: number; name: string }[] = [
    { hue: 0, name: "Crimson" },
    { hue: 30, name: "Vermilion" },
    { hue: 60, name: "Amber" },
    { hue: 90, name: "Chartreuse" },
    { hue: 120, name: "Emerald" },
    { hue: 150, name: "Spring" },
    { hue: 180, name: "Cyan" },
    { hue: 210, name: "Azure" },
    { hue: 240, name: "Sapphire" },
    { hue: 270, name: "Violet" },
    { hue: 300, name: "Magenta" },
    { hue: 330, name: "Rose" },
    { hue: 360, name: "Crimson" },
  ];
  // Mid-step names for between-fifths hues
  const between: Record<number, string> = {
    15: "Scarlet",
    45: "Gold",
    75: "Lime",
    105: "Leaf",
    135: "Jade",
    165: "Teal",
    195: "Sky",
    225: "Cobalt",
    255: "Indigo",
    285: "Orchid",
    315: "Fuchsia",
    345: "Carmine",
  };

  let best = names[0]!;
  let bestD = 360;
  for (const n of names) {
    let d = Math.abs(h - n.hue);
    if (d > 180) d = 360 - d;
    if (d < bestD) {
      bestD = d;
      best = n;
    }
  }
  // Prefer between-name if closer to a mid point
  for (const [key, name] of Object.entries(between)) {
    const mid = Number(key);
    let d = Math.abs(h - mid);
    if (d > 180) d = 360 - d;
    if (d < bestD) {
      bestD = d;
      best = { hue: mid, name };
    }
  }
  return best.name;
}

/**
 * Name of the additive center color for a set of tones.
 * Wide span → pale / white names; otherwise the circular-mean hue name.
 */
export function mixColorName(tones: PitchClass[]): string {
  if (tones.length === 0) return "White light";
  if (tones.length === 1) return tones[0]!.colorName;
  const span = chordHueSpan(tones);
  const hue = mixHue(tones);
  const base = colorNameFromHue(hue);
  if (span >= 150) return "Pearl white";
  if (span >= 110) return `Pale ${base}`;
  if (span >= 75) return `Soft ${base}`;
  if (span >= 45) return base;
  return base;
}

export const QUALITY_LABELS: Record<ChordQuality, string> = {
  note: "Single",
  major: "Major",
  minor: "Minor",
  dom7: "Dom 7",
  dom9: "Dom 9",
  maj7: "Maj 7",
  maj9: "Maj 9",
  min7: "Min 7",
  maj6: "Maj 6",
  min6: "Min 6",
  add9: "Add 9",
  sus4: "Sus 4",
  dim: "Dim",
  aug: "Aug",
};

export const VOICE_LABELS: Record<SynthVoice, string> = {
  pure: "Pure light",
  pad: "Pad",
  organ: "Organ",
  piano: "Piano",
  strings: "Strings",
};

export interface Progression {
  id: string;
  name: string;
  steps: number[];
  qualities?: ChordQuality[];
}

export const PROGRESSIONS: Progression[] = [
  { id: "pop", name: "I - V - vi - IV", steps: [0, 7, 9, 5] },
  { id: "jazz", name: "ii - V - I", steps: [2, 7, 0], qualities: ["min7", "dom7", "maj7"] },
  { id: "canon", name: "Pachelbel", steps: [0, 7, 9, 4, 5, 0, 5, 7] },
  { id: "andalusian", name: "Andalusian", steps: [0, 10, 8, 7] },
  { id: "fifths", name: "Circle of 5ths", steps: [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5] },
  { id: "turnaround", name: "I - vi - ii - V", steps: [0, 9, 2, 7], qualities: ["major", "minor", "min7", "dom7"] },
  { id: "sad", name: "vi - IV - I - V", steps: [9, 5, 0, 7] },
  {
    id: "secondary",
    name: "V/V - V - I",
    steps: [2, 7, 0],
    qualities: ["dom7", "dom7", "major"],
  },
  {
    id: "modal",
    name: "I - ♭VII - IV",
    steps: [0, 10, 5],
    qualities: ["major", "major", "major"],
  },
  {
    id: "rhythm",
    name: "Rhythm changes A",
    steps: [0, 9, 2, 7, 5, 0, 5, 7],
    qualities: ["maj7", "min7", "min7", "dom7", "maj7", "maj7", "dom7", "dom7"],
  },
];

export function romanDegree(step: number, quality?: ChordQuality): string {
  const majors = ["I", "♭II", "II", "♭III", "III", "IV", "♯IV", "V", "♭VI", "VI", "♭VII", "VII"];
  const minors = ["i", "♭ii", "ii", "♭iii", "iii", "iv", "♯iv", "v", "♭vi", "vi", "♭vii", "vii"];
  const dims = ["i°", "♭ii°", "ii°", "♭iii°", "iii°", "iv°", "♯iv°", "v°", "♭vi°", "vi°", "♭vii°", "vii°"];
  const s = ((step % 12) + 12) % 12;
  const q =
    quality ??
    (s === 2 || s === 4 || s === 9 || s === 11 ? "minor" : "major");
  if (q === "dim") return dims[s]!;
  if (q === "aug") return majors[s]! + "+";
  if (q === "dom7") return majors[s]! + "⁷";
  if (q === "dom9") return majors[s]! + "⁹";
  if (q === "maj7") return majors[s]! + "Δ";
  if (q === "maj9") return majors[s]! + "Δ⁹";
  if (q === "min7") return minors[s]! + "⁷";
  if (q === "sus4") return majors[s]! + "sus";
  if (q === "maj6") return majors[s]! + "⁶";
  if (q === "min6") return minors[s]! + "⁶";
  if (q === "add9") return majors[s]! + "add9";
  if (q === "minor") return minors[s]!;
  return majors[s]!;
}

export function inferQuality(step: number, preferred: ChordQuality): ChordQuality {
  if (preferred !== "major" && preferred !== "minor") return preferred;
  const s = ((step % 12) + 12) % 12;
  if (s === 9 || s === 2 || s === 4) return "minor";
  if (s === 11) return "dim";
  return "major";
}

export function theoryBlurb(root: PitchClass, quality: ChordQuality, tones: PitchClass[]): string {
  const comp = complementaryPitch(root);
  const { dominant, subdominant } = neighboringFifths(root);
  const span = chordHueSpan(tones);
  const mix = mixColorName(tones);

  if (quality === "note") {
    return `${root.label} = ${root.colorName} (~${root.wavelengthNm} nm). One step on the fifths ring is a perfect fifth in pitch and ~30° on the color wheel. Opposite is ${comp.label} (${comp.colorName}) - the tritone / complementary hue. Neighbors: ${subdominant.label} ← ${root.label} → ${dominant.label}.`;
  }

  const names = tones.map((t) => `${t.label} ${t.colorName}`).join(" · ");
  const labels = tones.map((t) => t.label).join(" - ");

  if (quality === "major") {
    return `Major ${labels}: root + M3 + P5. Geometry is a triangle on the dual wheel. Center light ≈ ${mix}. Tones: ${names}. Consonance ≈ close fifths neighbors; the fifth (${tones[2]?.label ?? ""}) is the nearest warm hue step from the root.`;
  }
  if (quality === "minor") {
    return `Minor ${labels}: flattened third cools the harmony - the minor third sits a different fifths distance than the major third, so the triangle tilts toward cooler / more distant hues. Center light ≈ ${mix}. ${names}.`;
  }
  if (quality === "dom7") {
    return `Dominant 7 ${labels} wants to fall a fifth (resolve). Tritone tension inside the chord mirrors complementary-color pull (${comp.label} opposite ${root.label}). Wide hue span (~${Math.round(span)}°) = dissonance you can see. Center light ≈ ${mix}.`;
  }
  if (quality === "dom9") {
    return `Dominant 9 ${labels}: dominant seventh plus the ninth - brighter pull to resolve, wider color spread (~${Math.round(span)}°). Center light ≈ ${mix}. ${names}.`;
  }
  if (quality === "maj7") {
    return `Maj7 ${labels}: stacked thirds = stacked near-hues. Soft luminous wash of ${mix}. Adjacent fifths colors ${names}.`;
  }
  if (quality === "maj9") {
    return `Maj9 ${labels}: major seventh plus the ninth - open luminous color without dominant pull. Hue span ~${Math.round(span)}°; center light ≈ ${mix}. ${names}.`;
  }
  if (quality === "min7") {
    return `Min7 ${labels}: mellow tetrad across the ring. Hue span ~${Math.round(span)}° - center settles as ${mix}. ${names}.`;
  }
  if (quality === "maj6") {
    return `Maj6 ${labels}: major triad plus major sixth - warm added color without seventh tension. Hue span ~${Math.round(span)}°; center light ≈ ${mix}. ${names}.`;
  }
  if (quality === "min6") {
    return `Min6 ${labels}: minor triad plus major sixth - cooler color with an open lift. Hue span ~${Math.round(span)}°; center light ≈ ${mix}. ${names}.`;
  }
  if (quality === "add9") {
    return `Add9 ${labels}: major triad plus the ninth - bright open color without seventh tension. Hue span ~${Math.round(span)}°; center light ≈ ${mix}. ${names}.`;
  }
  if (quality === "sus4") {
    return `Sus4 ${labels} freezes the third - neither major warmth nor minor cool. Open fifths geometry; colors ${names} hang between resolution paths. Center light ≈ ${mix}.`;
  }
  if (quality === "dim") {
    return `Dim ${labels}: minor thirds stack into high tension. Colors sit at unstable intervals (span ~${Math.round(span)}°). Visually restless - center reads as ${mix}. ${names}.`;
  }
  if (quality === "aug") {
    return `Aug ${labels}: major thirds trisect the octave and nearly trisect the color circle - symmetric, bright, unresolved. ${names}. Center light ≈ ${mix}.`;
  }
  return `${root.label} ${QUALITY_LABELS[quality]} → ${names}. Complementary pole: ${comp.label} ${comp.colorName}.`;
}

/** Compact one-line theory for collapsed UI. */
export function theoryHeadline(root: PitchClass, quality: ChordQuality, tones: PitchClass[]): string {
  const mix = mixColorName(tones);
  if (quality === "note") {
    const comp = complementaryPitch(root);
    return `${root.label} ${root.colorName} · opposite ${comp.label} ${comp.colorName}`;
  }
  return `${tones.map((t) => t.colorName).join(" · ")} → ${mix}`;
}

export function nearestPitchFromFrequency(
  freq: number,
): { pitch: PitchClass; octave: number; cents: number } | null {
  if (!freq || freq < 40 || freq > 4000) return null;
  const midi = 69 + 12 * Math.log2(freq / 440);
  const rounded = Math.round(midi);
  const cents = (midi - rounded) * 100;
  const pc = ((rounded % 12) + 12) % 12;
  const octave = Math.floor(rounded / 12) - 1;
  return { pitch: pitchByMidi(pc), octave, cents };
}

/* ── Chord symbol → color (for app + Grok lookup) ─────────────────────── */

const NOTE_ALIASES: Record<string, number> = {
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
  cb: 11,
};

export interface ParsedChord {
  root: PitchClass;
  quality: ChordQuality;
  symbol: string;
  tones: PitchClass[];
}

export interface ChordColorAnswer {
  ok: true;
  input: string;
  symbol: string;
  quality: ChordQuality;
  qualityLabel: string;
  root: { label: string; colorName: string; hue: number; wavelengthNm: number; id: string };
  tones: { label: string; colorName: string; hue: number; wavelengthNm: number }[];
  colors: string[];
  mix: string;
  /** Natural-language answer for humans / Grok */
  answer: string;
  blurb: string;
}

export interface ChordColorError {
  ok: false;
  input: string;
  error: string;
  hint: string;
}

export type ChordColorResult = ChordColorAnswer | ChordColorError;

function normalizeChordInput(raw: string): string {
  return raw
    .trim()
    .replace(/\u266f/g, "#")
    .replace(/\u266d/g, "b")
    .replace(/♯/g, "#")
    .replace(/♭/g, "b")
    .replace(/Δ/g, "maj")
    .replace(/°/g, "dim")
    .replace(/ø/g, "m7b5")
    .replace(/\s+/g, " ");
}

function parseQualityToken(token: string): ChordQuality | null {
  const t = token.toLowerCase().replace(/\s+/g, "");
  if (t === "" || t === "maj" || t === "major" || t === "ma") return "major";
  if (t === "m" || t === "min" || t === "minor" || t === "-" || t === "mi") return "minor";
  if (t === "maj9" || t === "major9" || t === "ma9" || t === "majorninth") return "maj9";
  if (t === "9" || t === "dom9" || t === "dominant9") return "dom9";
  if (t === "7" || t === "dom" || t === "dom7" || t === "dominant" || t === "dominant7") return "dom7";
  if (t === "maj7" || t === "major7" || t === "ma7" || t === "j7") return "maj7";
  if (t === "m7" || t === "min7" || t === "minor7" || t === "-7" || t === "mi7") return "min7";
  if (t === "m6" || t === "min6" || t === "minor6" || t === "-6" || t === "mi6") return "min6";
  if (t === "6" || t === "maj6" || t === "major6" || t === "add6") return "maj6";
  if (t === "add9" || t === "add9th" || t === "(add9)") return "add9";
  if (t === "sus" || t === "sus4" || t === "suspension") return "sus4";
  if (t === "dim" || t === "diminished" || t === "o" || t === "mb5") return "dim";
  if (t === "aug" || t === "augmented" || t === "+" || t === "+5") return "aug";
  if (t === "note" || t === "tone" || t === "single" || t === "unison") return "note";
  return null;
}

/** Parse chord symbols like C, Am, F#maj7, Bb7, Dsus4, E°, G+. */
export function parseChordSymbol(raw: string): ParsedChord | null {
  const cleaned = normalizeChordInput(raw);
  if (!cleaned) return null;

  let noteToken = "";
  let qualToken = "";

  // "C major", "A minor", "G dominant 7"
  const words = cleaned.match(/^([A-Ga-g])([#b]?)\s+(.+)$/);
  if (words) {
    noteToken = words[1]! + (words[2] || "");
    const rest = words[3]!.toLowerCase().trim();
    if (/^(major|maj)$/.test(rest)) qualToken = "maj";
    else if (/^(minor|min)$/.test(rest)) qualToken = "m";
    else if (/^(major\s*9|maj\s*9)$/.test(rest)) qualToken = "maj9";
    else if (/^(dominant\s*9|dom\s*9|9)$/.test(rest)) qualToken = "9";
    else if (/^(dominant\s*7|dom\s*7|7)$/.test(rest)) qualToken = "7";
    else if (/^(major\s*7|maj\s*7)$/.test(rest)) qualToken = "maj7";
    else if (/^(minor\s*7|min\s*7)$/.test(rest)) qualToken = "m7";
    else if (/^(diminished|dim)$/.test(rest)) qualToken = "dim";
    else if (/^(augmented|aug)$/.test(rest)) qualToken = "aug";
    else if (/^(sus|sus4)$/.test(rest)) qualToken = "sus4";
    else if (/^(major\s*6|maj\s*6|6)$/.test(rest)) qualToken = "maj6";
    else if (/^(minor\s*6|min\s*6|m\s*6)$/.test(rest)) qualToken = "min6";
    else if (/^(add\s*9|add9)$/.test(rest)) qualToken = "add9";
    else qualToken = rest.replace(/\s+/g, "");
  } else {
    const m = cleaned.match(/^([A-Ga-g])([#b]?)(.*)$/);
    if (!m) return null;
    noteToken = m[1]! + (m[2] || "");
    qualToken = (m[3] || "").trim();
  }

  const midi = NOTE_ALIASES[noteToken.toLowerCase()];
  if (midi === undefined) return null;

  // Case-sensitive: M / M7 = major family
  let quality: ChordQuality | null = null;
  if (qualToken === "M") quality = "major";
  else if (qualToken === "M7") quality = "maj7";
  else if (qualToken === "M9") quality = "maj9";
  else quality = parseQualityToken(qualToken);

  if (!quality) return null;

  const root = pitchByMidi(midi);
  const tones = chordPitches(root, quality);
  const symbol =
    quality === "note"
      ? root.label
      : quality === "major"
        ? root.label
        : quality === "minor"
          ? `${root.label}m`
          : quality === "dom7"
            ? `${root.label}7`
            : quality === "dom9"
              ? `${root.label}9`
              : quality === "maj7"
              ? `${root.label}maj7`
              : quality === "maj9"
                ? `${root.label}maj9`
              : quality === "min7"
                ? `${root.label}m7`
                : quality === "maj6"
                  ? `${root.label}6`
                  : quality === "min6"
                    ? `${root.label}m6`
                    : quality === "add9"
                      ? `${root.label}add9`
                      : quality === "sus4"
                        ? `${root.label}sus4`
                        : quality === "dim"
                          ? `${root.label}dim`
                          : `${root.label}aug`;

  return { root, quality, symbol, tones };
}

/** Full color answer for a chord symbol - what Grok / the app should say. */
export function chordColorLookup(raw: string): ChordColorResult {
  const input = raw.trim();
  const parsed = parseChordSymbol(input);
  if (!parsed) {
    return {
      ok: false,
      input,
      error: "Could not parse that chord.",
      hint: "Try symbols like C, Am, F#maj7, Bb7, C9, Cmaj9, C6, Am6, Cadd9, Dsus4, E°, G+.",
    };
  }

  const { root, quality, symbol, tones } = parsed;
  const colors = tones.map((t) => t.colorName);
  const mix = mixColorName(tones);
  const toneLine = tones.map((t) => `${t.label} → ${t.colorName} (~${t.wavelengthNm} nm)`).join("; ");

  let answer: string;
  if (quality === "note") {
    answer = `${symbol} is ${root.colorName} on Color Chord (~${root.wavelengthNm} nm, hue ${root.hue}°).`;
  } else if (tones.length === 1) {
    answer = `${symbol} maps to ${colors[0]}.`;
  } else {
    answer = `${symbol} maps to ${colors.join(" · ")}. Additive mix ≈ ${mix}. (${toneLine})`;
  }

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
      id: root.id,
    },
    tones: tones.map((t) => ({
      label: t.label,
      colorName: t.colorName,
      hue: t.hue,
      wavelengthNm: t.wavelengthNm,
    })),
    colors,
    mix,
    answer,
    blurb: theoryBlurb(root, quality, tones),
  };
}
