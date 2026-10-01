/** YIN pitch detection (de Cheveigne and Kawahara). Pure JS, low latency. */

import { frequencyOf } from "./theory";

/**
 * Estimate fundamental frequency from a mono float buffer.
 * @returns frequency in Hz, or -1 if unvoiced / below threshold
 */
export function yinPitch(
  buf: Float32Array,
  sampleRate: number,
  threshold = 0.12,
): { frequency: number; probability: number } {
  const n = buf.length;
  if (n < 64) return { frequency: -1, probability: 0 };

  // RMS gate
  let rms = 0;
  for (let i = 0; i < n; i++) rms += buf[i]! * buf[i]!;
  rms = Math.sqrt(rms / n);
  if (rms < 0.008) return { frequency: -1, probability: 0 };

  const half = Math.floor(n / 2);
  const yinBuf = new Float32Array(half);
  // Search only periods that can map to 50-2000 Hz. Skipping tau=1..tauMin
  // stops the global-min fallback from locking onto sub-sample junk.
  const tauMin = Math.max(2, Math.floor(sampleRate / 2000));
  const tauMax = Math.max(tauMin + 1, Math.min(half, Math.floor(sampleRate / 50)));

  // Difference function
  for (let tau = 0; tau < half; tau++) {
    let sum = 0;
    for (let i = 0; i < half; i++) {
      const d = buf[i]! - buf[i + tau]!;
      sum += d * d;
    }
    yinBuf[tau] = sum;
  }

  // Cumulative mean normalized difference
  yinBuf[0] = 1;
  let running = 0;
  for (let tau = 1; tau < half; tau++) {
    running += yinBuf[tau]!;
    yinBuf[tau] = (yinBuf[tau]! * tau) / (running || 1);
  }

  // Absolute threshold
  let tauEstimate = -1;
  for (let tau = tauMin; tau < tauMax; tau++) {
    if (yinBuf[tau]! < threshold) {
      while (tau + 1 < tauMax && yinBuf[tau + 1]! < yinBuf[tau]!) tau++;
      tauEstimate = tau;
      break;
    }
  }
  if (tauEstimate < 0) {
    // fallback: global min inside the voiced band
    let minV = 1;
    let minT = -1;
    for (let tau = tauMin; tau < tauMax; tau++) {
      if (yinBuf[tau]! < minV) {
        minV = yinBuf[tau]!;
        minT = tau;
      }
    }
    if (minV < 0.35) tauEstimate = minT;
  }
  if (tauEstimate < 0) return { frequency: -1, probability: 0 };

  // Parabolic interpolation
  const x0 = tauEstimate > 0 ? yinBuf[tauEstimate - 1]! : yinBuf[tauEstimate]!;
  const x1 = yinBuf[tauEstimate]!;
  const x2 = tauEstimate + 1 < half ? yinBuf[tauEstimate + 1]! : x1;
  const denom = 2 * (2 * x1 - x2 - x0);
  let better = tauEstimate;
  if (denom !== 0) better = tauEstimate + (x2 - x0) / denom;

  const frequency = sampleRate / better;
  if (frequency < 50 || frequency > 2000) return { frequency: -1, probability: 0 };
  const probability = Math.max(0, Math.min(1, 1 - x1));
  return { frequency, probability };
}

/** Peak-pick chroma energies from time-domain via simple Goertzel-ish bins. */
export function chromaEnergies(buf: Float32Array, sampleRate: number): Float32Array {
  const chroma = new Float32Array(12);
  // Energy near each pitch class across octaves 2-6
  for (let pc = 0; pc < 12; pc++) {
    let e = 0;
    for (let oct = 2; oct <= 6; oct++) {
      const freq = frequencyOf(pc, oct);
      // Single-bin magnitude approx via DFT at freq
      let re = 0;
      let im = 0;
      const w = (2 * Math.PI * freq) / sampleRate;
      const len = Math.min(buf.length, 2048);
      for (let i = 0; i < len; i++) {
        re += buf[i]! * Math.cos(w * i);
        im -= buf[i]! * Math.sin(w * i);
      }
      e += (re * re + im * im) / len;
    }
    chroma[pc] = e;
  }
  // Normalize
  let max = 0;
  for (let i = 0; i < 12; i++) if (chroma[i]! > max) max = chroma[i]!;
  if (max > 0) for (let i = 0; i < 12; i++) chroma[i]! /= max;
  return chroma;
}
