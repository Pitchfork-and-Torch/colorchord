/** Chord-aware haptic patterns */

let enabled = true;

export function setHapticsEnabled(on: boolean) {
  enabled = on;
}

export function hapticsAvailable() {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
}

/** Short attack tick */
export function hapticAttack(intensity: "soft" | "medium" | "hard" = "medium") {
  if (!enabled || !hapticsAvailable()) return;
  const map = { soft: 8, medium: 16, hard: 28 };
  navigator.vibrate(map[intensity]);
}

/** Tension → resolution patterns */
export function hapticChord(kind: "consonant" | "dominant" | "dissonant" | "note") {
  if (!enabled || !hapticsAvailable()) return;
  switch (kind) {
    case "note":
      navigator.vibrate(12);
      break;
    case "consonant":
      navigator.vibrate([14, 30, 10]);
      break;
    case "dominant":
      navigator.vibrate([18, 40, 18, 40, 28]);
      break;
    case "dissonant":
      navigator.vibrate([10, 20, 10, 20, 10, 20, 24]);
      break;
  }
}

export function hapticPulse() {
  if (!enabled || !hapticsAvailable()) return;
  navigator.vibrate(10);
}
