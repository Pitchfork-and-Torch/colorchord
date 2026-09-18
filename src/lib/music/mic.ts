/** Legacy mic API — thin wrapper around Live Resonance. */

import {
  isResonanceRunning,
  startMicResonance,
  stopResonance,
  subscribeResonance,
  type ResonanceFrame,
} from "./resonance";
import type { PitchClass } from "./theory";

export type MicResult = {
  pitch: PitchClass;
  octave: number;
  cents: number;
  frequency: number;
  clarity: number;
};

let unsub: (() => void) | null = null;

export async function startMic(cb: (r: MicResult | null) => void): Promise<boolean> {
  unsub?.();
  unsub = subscribeResonance((frame: ResonanceFrame) => {
    if (!frame.fundamental || frame.clarity < 0.3) {
      cb(null);
      return;
    }
    cb({
      pitch: frame.fundamental,
      octave: 4,
      cents: 0,
      frequency: frame.frequency ?? 0,
      clarity: frame.clarity,
    });
  });
  const ok = await startMicResonance();
  if (!ok) {
    unsub?.();
    unsub = null;
  }
  return ok;
}

export async function stopMic(): Promise<void> {
  unsub?.();
  unsub = null;
  await stopResonance();
}

export function isMicRunning() {
  return isResonanceRunning();
}
