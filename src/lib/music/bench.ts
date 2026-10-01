/** On-device bench memory. No account. Mic hits are not stored. */

import type { ChordQuality, NoteId, SynthVoice, VisionMode } from "./theory";
import type { ScaleId } from "./scales";

export const BENCH_KEY = "colorchord-bench-v1";
export const RECENT_CAP = 6;

const NOTE_IDS = new Set<NoteId>([
  "C",
  "G",
  "D",
  "A",
  "E",
  "B",
  "F#",
  "Db",
  "Ab",
  "Eb",
  "Bb",
  "F",
]);

const QUALITIES = new Set<ChordQuality>([
  "note",
  "major",
  "minor",
  "dom7",
  "maj7",
  "min7",
  "sus4",
  "dim",
  "aug",
]);

const VOICES = new Set<SynthVoice>(["pure", "pad", "organ", "piano", "strings"]);

const VISIONS = new Set<VisionMode>(["full", "deuteranopia", "protanopia", "luminance"]);

const SCALES = new Set<ScaleId | "off">([
  "off",
  "major",
  "naturalMinor",
  "harmonicMinor",
  "melodicMinor",
  "dorian",
  "phrygian",
  "lydian",
  "mixolydian",
  "locrian",
  "pentatonic",
  "blues",
]);

export interface BenchChord {
  rootId: NoteId;
  quality: ChordQuality;
  label: string;
}

export interface BenchMemory {
  v: 1;
  voice: SynthVoice;
  quality: ChordQuality;
  keyRootId: NoteId;
  vision: VisionMode;
  scaleId: ScaleId | "off";
  recent: BenchChord[];
}

export function chordChipLabel(rootLabel: string, quality: ChordQuality): string {
  switch (quality) {
    case "note":
    case "major":
      return rootLabel;
    case "minor":
      return `${rootLabel}m`;
    case "dom7":
      return `${rootLabel}7`;
    case "maj7":
      return `${rootLabel}maj7`;
    case "min7":
      return `${rootLabel}m7`;
    case "sus4":
      return `${rootLabel}sus4`;
    case "dim":
      return `${rootLabel}dim`;
    case "aug":
      return `${rootLabel}aug`;
  }
}

/** Newest first. A repeat of the newest chord stays put. Older copies move forward. */
export function pushRecent(prev: BenchChord[], next: BenchChord, cap = RECENT_CAP): BenchChord[] {
  const head = prev[0];
  if (head && head.rootId === next.rootId && head.quality === next.quality) return prev;
  const rest = prev.filter((c) => !(c.rootId === next.rootId && c.quality === next.quality));
  return [next, ...rest].slice(0, cap);
}

function asNote(value: unknown): NoteId | null {
  return typeof value === "string" && NOTE_IDS.has(value as NoteId) ? (value as NoteId) : null;
}

function asQuality(value: unknown): ChordQuality | null {
  return typeof value === "string" && QUALITIES.has(value as ChordQuality)
    ? (value as ChordQuality)
    : null;
}

export function parseBench(raw: unknown): BenchMemory | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  if (row.v !== 1) return null;
  const voice = typeof row.voice === "string" && VOICES.has(row.voice as SynthVoice)
    ? (row.voice as SynthVoice)
    : null;
  const quality = asQuality(row.quality);
  const keyRootId = asNote(row.keyRootId);
  const vision = typeof row.vision === "string" && VISIONS.has(row.vision as VisionMode)
    ? (row.vision as VisionMode)
    : null;
  const scaleId =
    typeof row.scaleId === "string" && SCALES.has(row.scaleId as ScaleId | "off")
      ? (row.scaleId as ScaleId | "off")
      : null;
  if (!voice || !quality || !keyRootId || !vision || !scaleId) return null;

  const recent: BenchChord[] = [];
  if (Array.isArray(row.recent)) {
    for (const item of row.recent) {
      if (!item || typeof item !== "object") continue;
      const chord = item as Record<string, unknown>;
      const rootId = asNote(chord.rootId);
      const q = asQuality(chord.quality);
      const label = typeof chord.label === "string" ? chord.label.trim() : "";
      if (!rootId || !q || label.length < 1 || label.length > 16) continue;
      recent.push({ rootId, quality: q, label });
      if (recent.length >= RECENT_CAP) break;
    }
  }

  return { v: 1, voice, quality, keyRootId, vision, scaleId, recent };
}

export function readStoredBench(): BenchMemory | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(BENCH_KEY);
    if (!raw) return null;
    return parseBench(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

export function writeStoredBench(mem: BenchMemory): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(BENCH_KEY, JSON.stringify(mem));
  } catch {
    /* private mode or a full disk: the instrument still plays */
  }
}
