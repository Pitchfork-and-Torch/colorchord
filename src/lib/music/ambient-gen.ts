/** Lightweight generative harmonic suggestions (local heuristics). */

import type { ChordQuality, PitchClass } from "./theory";
import { FIFTHS, inferQuality } from "./theory";

export type MoodHint = "resolve" | "tension" | "melancholy" | "lift" | "wander";

export type Suggestion = {
  id: string;
  label: string;
  mood: MoodHint;
  root: PitchClass;
  quality: ChordQuality;
  blurb: string;
};

const MOOD_STEPS: Record<MoodHint, { steps: number[]; qualities: ChordQuality[]; blurb: string }> = {
  resolve: {
    steps: [7, 0],
    qualities: ["dom7", "major"],
    blurb: "Dominant pulls home — hue falls a fifth into rest.",
  },
  tension: {
    steps: [2, 7],
    qualities: ["min7", "dom7"],
    blurb: "ii–V tension widens the spectral span before release.",
  },
  melancholy: {
    steps: [9, 5, 0],
    qualities: ["minor", "major", "major"],
    blurb: "vi–IV–I cools then warms — minor green toward crimson rest.",
  },
  lift: {
    steps: [5, 0, 7],
    qualities: ["major", "major", "major"],
    blurb: "Subdominant lift, then tonic and bright dominant open the wheel.",
  },
  wander: {
    steps: [0, 10, 8, 7],
    qualities: ["minor", "major", "major", "major"],
    blurb: "Andalusian descent — colors walk counter-clockwise around the ring.",
  },
};

export function suggestionsForKey(keyRoot: PitchClass): Suggestion[] {
  const moods = Object.keys(MOOD_STEPS) as MoodHint[];
  return moods.map((mood) => {
    const def = MOOD_STEPS[mood];
    const step = def.steps[0]!;
    const midi = (keyRoot.midi + step) % 12;
    const root = FIFTHS.find((p) => p.midi === midi) ?? keyRoot;
    const quality = def.qualities[0] ?? inferQuality(step, "major");
    return {
      id: mood,
      label:
        mood === "resolve"
          ? "Resolve"
          : mood === "tension"
            ? "More tension"
            : mood === "melancholy"
              ? "Melancholic bridge"
              : mood === "lift"
                ? "Lift"
                : "Wander",
      mood,
      root,
      quality,
      blurb: def.blurb,
    };
  });
}

/** Next chord in a gentle Markov walk around the key. */
export function markovNext(
  keyRoot: PitchClass,
  prevStep: number,
): { step: number; quality: ChordQuality } {
  const chains: Record<number, number[]> = {
    0: [7, 5, 9, 2],
    7: [0, 9, 5],
    9: [5, 0, 2],
    5: [0, 7, 2],
    2: [7, 0, 9],
    4: [0, 9, 5],
    10: [5, 0, 8],
    8: [7, 3, 0],
  };
  const opts = chains[prevStep] ?? [0, 7, 5, 9];
  const step = opts[Math.floor(Math.random() * opts.length)]!;
  const quality = inferQuality(step, "major");
  return { step, quality };
}

export function progressionForMood(mood: MoodHint, keyRoot: PitchClass): { root: PitchClass; quality: ChordQuality }[] {
  const def = MOOD_STEPS[mood];
  return def.steps.map((step, i) => {
    const midi = (keyRoot.midi + step) % 12;
    const root = FIFTHS.find((p) => p.midi === midi) ?? keyRoot;
    return { root, quality: def.qualities[i] ?? "major" };
  });
}
