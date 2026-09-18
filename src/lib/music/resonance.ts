/**
 * Live Resonance - microphone / file analysis driving the dual wheel.
 * Main synth audio always takes priority; resonance is opt-in and isolated.
 */

import { getAudioContext, getMasterVolume, resumeAudio, setMasterVolume, unlockAudio } from "./audio";
import { chromaEnergies, yinPitch } from "./yin";
import { nearestPitchFromFrequency, pitchByMidi, type ChordQuality, type PitchClass } from "./theory";
import { chordMidis } from "./theory";

export type ResonanceMode = "off" | "listen" | "listenSynth";

export type ResonanceConfig = {
  sensitivity: number; // 0 - 1 threshold inverse
  decayMs: number;
  mode: ResonanceMode;
};

export type ResonanceFrame = {
  pitches: { pitch: PitchClass; energy: number }[];
  fundamental: PitchClass | null;
  estimatedQuality: ChordQuality;
  frequency: number | null;
  clarity: number;
};

type Listener = (frame: ResonanceFrame) => void;

let stream: MediaStream | null = null;
let source: MediaStreamAudioSourceNode | MediaElementAudioSourceNode | null = null;
let analyser: AnalyserNode | null = null;
let raf: number | null = null;
let running = false;
let listeners = new Set<Listener>();
let config: ResonanceConfig = { sensitivity: 0.55, decayMs: 420, mode: "listen" };
let fileAudio: HTMLAudioElement | null = null;
let savedMaster = 0.9;
let energySmoothed = new Float32Array(12);

function emptyFrame(): ResonanceFrame {
  return {
    pitches: [],
    fundamental: null,
    estimatedQuality: "note",
    frequency: null,
    clarity: 0,
  };
}

function estimateChord(active: { pitch: PitchClass; energy: number }[]): ChordQuality {
  if (active.length <= 1) return "note";
  const midis = active.map((a) => a.pitch.midi).sort((a, b) => a - b);
  const root = midis[0]!;
  const rel = midis.map((m) => (m - root + 12) % 12).sort((a, b) => a - b);
  const has = (n: number) => rel.includes(n);
  if (has(4) && has(7) && has(10)) return "dom7";
  if (has(4) && has(7) && has(11)) return "maj7";
  if (has(3) && has(7) && has(10)) return "min7";
  if (has(4) && has(7) && has(9)) return "maj6";
  if (has(3) && has(7) && has(9)) return "min6";
  if (has(4) && has(7) && has(2)) return "add9";
  if (has(4) && has(7)) return "major";
  if (has(3) && has(7)) return "minor";
  if (has(5) && has(7)) return "sus4";
  if (has(3) && has(6)) return "dim";
  if (has(4) && has(8)) return "aug";
  return active.length >= 3 ? "major" : "note";
}

function processBuffer(buf: Float32Array, sampleRate: number): ResonanceFrame {
  const thr = 0.22 - config.sensitivity * 0.18;
  const { frequency, probability } = yinPitch(buf, sampleRate, thr);
  const chroma = chromaEnergies(buf, sampleRate);
  const gate = 0.35 - config.sensitivity * 0.2;

  // Smooth chroma
  const alpha = 0.35;
  for (let i = 0; i < 12; i++) {
    energySmoothed[i] = energySmoothed[i]! * (1 - alpha) + chroma[i]! * alpha;
  }

  const pitches: { pitch: PitchClass; energy: number }[] = [];
  for (let i = 0; i < 12; i++) {
    const e = energySmoothed[i]!;
    if (e >= gate) pitches.push({ pitch: pitchByMidi(i), energy: e });
  }
  pitches.sort((a, b) => b.energy - a.energy);

  let fundamental: PitchClass | null = null;
  let clarity = 0;
  let freqOut: number | null = null;
  if (frequency > 0 && probability > 0.25) {
    const near = nearestPitchFromFrequency(frequency);
    if (near) {
      fundamental = near.pitch;
      clarity = probability;
      freqOut = frequency;
      // Ensure fundamental is in list
      if (!pitches.some((p) => p.pitch.midi === near.pitch.midi)) {
        pitches.unshift({ pitch: near.pitch, energy: Math.max(0.6, probability) });
      }
    }
  } else if (pitches[0]) {
    fundamental = pitches[0].pitch;
    clarity = pitches[0].energy;
  }

  const top = pitches.slice(0, 4);
  return {
    pitches: top,
    fundamental,
    estimatedQuality: estimateChord(top),
    frequency: freqOut,
    clarity,
  };
}

function loop() {
  if (!running || !analyser) return;
  try {
    const ctx = getAudioContext();
    const buf = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buf);
    const frame = processBuffer(buf, ctx.sampleRate);
    listeners.forEach((fn) => fn(frame));
  } catch {
    /* never break main app */
  }
  raf = requestAnimationFrame(loop);
}

function restoreMain() {
  unlockAudio();
  setMasterVolume(savedMaster);
  void resumeAudio();
}

export function setResonanceConfig(partial: Partial<ResonanceConfig>) {
  config = { ...config, ...partial };
}

export function getResonanceConfig() {
  return { ...config };
}

export function subscribeResonance(fn: Listener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function isResonanceRunning() {
  return running;
}

export async function startMicResonance(): Promise<boolean> {
  if (running && stream) return true;
  await stopResonance();
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
    source = audioCtx.createMediaStreamSource(stream);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.2;
    source.connect(analyser);
    running = true;
    energySmoothed = new Float32Array(12);
    restoreMain();
    loop();
    return true;
  } catch {
    await stopResonance();
    restoreMain();
    return false;
  }
}

/** Analyze an uploaded audio file (secondary path). */
export async function startFileResonance(file: File): Promise<boolean> {
  await stopResonance();
  savedMaster = getMasterVolume() > 0 ? getMasterVolume() : 0.9;
  try {
    unlockAudio();
    const audioCtx = getAudioContext();
    const url = URL.createObjectURL(file);
    fileAudio = new Audio(url);
    fileAudio.crossOrigin = "anonymous";
    fileAudio.loop = true;
    await fileAudio.play();
    source = audioCtx.createMediaElementSource(fileAudio);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    // Route file to speakers softly + analyse
    const gain = audioCtx.createGain();
    gain.gain.value = 0.35;
    source.connect(analyser);
    source.connect(gain);
    gain.connect(audioCtx.destination);
    running = true;
    energySmoothed = new Float32Array(12);
    restoreMain();
    loop();
    return true;
  } catch {
    await stopResonance();
    restoreMain();
    return false;
  }
}

export async function stopResonance(): Promise<void> {
  running = false;
  if (raf != null) cancelAnimationFrame(raf);
  raf = null;
  try {
    source?.disconnect();
  } catch {
    /* */
  }
  try {
    analyser?.disconnect();
  } catch {
    /* */
  }
  stream?.getTracks().forEach((t) => {
    try {
      t.stop();
    } catch {
      /* */
    }
  });
  if (fileAudio) {
    try {
      fileAudio.pause();
      fileAudio.src = "";
    } catch {
      /* */
    }
    fileAudio = null;
  }
  stream = null;
  source = null;
  analyser = null;
  listeners.forEach((fn) => fn(emptyFrame()));
  restoreMain();
}

/** Match template chord midis against active pcs for UI helpers. */
export function matchQualityTemplate(pcs: number[], root: number): ChordQuality {
  const set = new Set(pcs.map((p) => (p - root + 12) % 12));
  const qualities: ChordQuality[] = ["maj9", "maj7", "dom9", "dom7", "min7", "maj6", "min6", "add9", "major", "minor", "sus4", "dim", "aug"];
  for (const q of qualities) {
    const need = chordMidis(root, q);
    if (need.every((m) => set.has((m - root + 12) % 12))) return q;
  }
  return "note";
}
