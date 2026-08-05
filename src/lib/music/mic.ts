/** Optional pitch detect. Must never break main synth playback. */

import { getAudioContext, getMasterVolume, resumeAudio, setMasterVolume, unlockAudio } from "./audio";
import { nearestPitchFromFrequency, type PitchClass } from "./theory";

export type MicResult = {
  pitch: PitchClass;
  octave: number;
  cents: number;
  frequency: number;
  clarity: number;
};

let stream: MediaStream | null = null;
let analyser: AnalyserNode | null = null;
let source: MediaStreamAudioSourceNode | null = null;
let raf: number | null = null;
let running = false;
let onPitch: ((r: MicResult | null) => void) | null = null;
/** Saved volume while mic starts — restored after permission / stop */
let savedMaster = 0.9;

function autoCorrelate(buf: Float32Array, sampleRate: number): number {
  let size = buf.length;
  let rms = 0;
  for (let i = 0; i < size; i++) rms += buf[i]! * buf[i]!;
  rms = Math.sqrt(rms / size);
  if (rms < 0.012) return -1;

  let r1 = 0;
  let r2 = size - 1;
  const thres = 0.2;
  for (let i = 0; i < size / 2; i++) {
    if (Math.abs(buf[i]!) < thres) {
      r1 = i;
      break;
    }
  }
  for (let i = 1; i < size / 2; i++) {
    if (Math.abs(buf[size - i]!) < thres) {
      r2 = size - i;
      break;
    }
  }

  const slice = buf.slice(r1, r2);
  size = slice.length;
  if (size < 32) return -1;

  const c = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    let sum = 0;
    for (let j = 0; j < size - i; j++) sum += slice[j]! * slice[j + i]!;
    c[i] = sum;
  }

  let d = 0;
  while (d + 1 < size && c[d]! > c[d + 1]!) d++;
  let maxval = -1;
  let maxpos = -1;
  for (let i = d; i < size; i++) {
    if (c[i]! > maxval) {
      maxval = c[i]!;
      maxpos = i;
    }
  }
  let T0 = maxpos;
  if (T0 <= 0) return -1;

  const x1 = c[T0 - 1] ?? c[T0]!;
  const x2 = c[T0]!;
  const x3 = c[T0 + 1] ?? x2;
  const a = (x1 + x3 - 2 * x2) / 2;
  const b = (x3 - x1) / 2;
  if (a) T0 = T0 - b / (2 * a);

  return sampleRate / T0;
}

function loop() {
  if (!running || !analyser) return;
  try {
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
          clarity,
        });
      } else onPitch?.(null);
    } else {
      onPitch?.(null);
    }
  } catch {
    /* never let mic analysis kill the app */
  }
  raf = requestAnimationFrame(loop);
}

function restoreMainAudio() {
  unlockAudio();
  setMasterVolume(savedMaster);
  void resumeAudio();
}

export async function startMic(cb: (r: MicResult | null) => void): Promise<boolean> {
  if (running) {
    onPitch = cb;
    return true;
  }
  // Capture current intended volume before permission UI can interrupt
  savedMaster = getMasterVolume() > 0 ? getMasterVolume() : 0.9;
  try {
    unlockAudio();
    const audioCtx = getAudioContext();

    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: false,
    });

    // Shared context only — never create/close a second AudioContext
    source = audioCtx.createMediaStreamSource(stream);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.85;
    // Analyse only — do NOT connect to destination (avoids routing side-effects)
    source.connect(analyser);

    onPitch = cb;
    running = true;
    restoreMainAudio();
    loop();
    return true;
  } catch {
    await stopMic();
    restoreMainAudio();
    return false;
  }
}

export async function stopMic(): Promise<void> {
  running = false;
  if (raf != null) cancelAnimationFrame(raf);
  raf = null;
  onPitch = null;

  try {
    source?.disconnect();
  } catch {
    /* ignore */
  }
  try {
    analyser?.disconnect();
  } catch {
    /* ignore */
  }

  stream?.getTracks().forEach((t) => {
    try {
      t.stop();
    } catch {
      /* ignore */
    }
  });

  stream = null;
  analyser = null;
  source = null;

  // Main audio always wins after mic teardown
  restoreMainAudio();
}

export function isMicRunning() {
  return running;
}
