/** Scales & modes for geometry overlay - degrees relative to root midi. */

import { pitchByMidi, type PitchClass } from "./theory";

export type ScaleId =
  | "major"
  | "naturalMinor"
  | "harmonicMinor"
  | "melodicMinor"
  | "dorian"
  | "phrygian"
  | "lydian"
  | "mixolydian"
  | "locrian"
  | "pentatonic"
  | "blues";

export interface ScaleDef {
  id: ScaleId;
  name: string;
  intervals: number[]; // semitones from root
}

export const SCALES: ScaleDef[] = [
  { id: "major", name: "Major (Ionian)", intervals: [0, 2, 4, 5, 7, 9, 11] },
  { id: "naturalMinor", name: "Natural minor", intervals: [0, 2, 3, 5, 7, 8, 10] },
  { id: "harmonicMinor", name: "Harmonic minor", intervals: [0, 2, 3, 5, 7, 8, 11] },
  { id: "melodicMinor", name: "Melodic minor", intervals: [0, 2, 3, 5, 7, 9, 11] },
  { id: "dorian", name: "Dorian", intervals: [0, 2, 3, 5, 7, 9, 10] },
  { id: "phrygian", name: "Phrygian", intervals: [0, 1, 3, 5, 7, 8, 10] },
  { id: "lydian", name: "Lydian", intervals: [0, 2, 4, 6, 7, 9, 11] },
  { id: "mixolydian", name: "Mixolydian", intervals: [0, 2, 4, 5, 7, 9, 10] },
  { id: "locrian", name: "Locrian", intervals: [0, 1, 3, 5, 6, 8, 10] },
  { id: "pentatonic", name: "Major pentatonic", intervals: [0, 2, 4, 7, 9] },
  { id: "blues", name: "Blues", intervals: [0, 3, 5, 6, 7, 10] },
];

export function scalePitches(rootMidi: number, scaleId: ScaleId): PitchClass[] {
  const def = SCALES.find((s) => s.id === scaleId) ?? SCALES[0]!;
  return def.intervals.map((iv) => pitchByMidi((rootMidi + iv) % 12));
}

export function scaleContains(rootMidi: number, scaleId: ScaleId, midiPc: number): boolean {
  const def = SCALES.find((s) => s.id === scaleId);
  if (!def) return false;
  const rel = ((midiPc - rootMidi) % 12 + 12) % 12;
  return def.intervals.includes(rel);
}
