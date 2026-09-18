/** Chord-aware haptic patterns for Living Spectrum */

let enabled = true;
let intensityScale = 1; // 0–1

export function setHapticsEnabled(on: boolean) {
  enabled = on;
}

export function setHapticsIntensity(v: number) {
  intensityScale = Math.max(0, Math.min(1, v));
}

export function hapticsAvailable() {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
}

function scalePattern(pattern: number | number[]): number | number[] {
  if (typeof pattern === "number") return Math.max(4, Math.round(pattern * (0.4 + 0.6 * intensityScale)));
  return pattern.map((n, i) => (i % 2 === 1 ? n : Math.max(4, Math.round(n * (0.4 + 0.6 * intensityScale)))));
}

export function hapticAttack(intensity: "soft" | "medium" | "hard" = "medium") {
  if (!enabled || !hapticsAvailable() || intensityScale <= 0) return;
  const map = { soft: 8, medium: 16, hard: 28 };
  navigator.vibrate(scalePattern(map[intensity]) as number);
}

export function hapticChord(kind: "consonant" | "dominant" | "dissonant" | "note" | "listen") {
  if (!enabled || !hapticsAvailable() || intensityScale <= 0) return;
  switch (kind) {
    case "note":
      navigator.vibrate(scalePattern(12) as number);
      break;
    case "consonant":
      navigator.vibrate(scalePattern([14, 30, 10]) as number[]);
      break;
    case "dominant":
      navigator.vibrate(scalePattern([18, 40, 18, 40, 28]) as number[]);
      break;
    case "dissonant":
      navigator.vibrate(scalePattern([10, 20, 10, 20, 10, 20, 24]) as number[]);
      break;
    case "listen":
      navigator.vibrate(scalePattern(6) as number);
      break;
  }
}

export function hapticPulse() {
  if (!enabled || !hapticsAvailable() || intensityScale <= 0) return;
  navigator.vibrate(scalePattern(10) as number);
}

export function hapticJourneyMark() {
  if (!enabled || !hapticsAvailable() || intensityScale <= 0) return;
  navigator.vibrate(scalePattern([8, 40, 16]) as number[]);
}
