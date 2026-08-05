/** High-quality multi-voice Web Audio engine for Color Chord */

import { frequencyOf, type SynthVoice } from "./theory";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let compressor: DynamicsCompressorNode | null = null;
let dryGain: GainNode | null = null;
let wetGain: GainNode | null = null;
let convolver: ConvolverNode | null = null;
let ambientGain: GainNode | null = null;
let ambientNodes: OscillatorNode[] = [];
let voice: SynthVoice = "pad";
let rotationPan = 0;
let masterVol = 0.85;

type VoiceHandle = {
  stop: (release?: number) => void;
  panner: StereoPannerNode;
};

const active = new Map<string, VoiceHandle>();

function ensure(): AudioContext {
  if (!ctx || ctx.state === "closed") {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0.001;

    compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.knee.value = 18;
    compressor.ratio.value = 3.5;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.18;

    dryGain = ctx.createGain();
    dryGain.gain.value = 0.52;
    wetGain = ctx.createGain();
    wetGain.gain.value = 0.48;

    convolver = ctx.createConvolver();
    convolver.buffer = makeImpulse(ctx, 2.4, 1.85);

    dryGain.connect(compressor);
    wetGain.connect(compressor);
    convolver.connect(wetGain);
    compressor.connect(master);
    master.connect(ctx.destination);

    ambientGain = ctx.createGain();
    ambientGain.gain.value = 0;
    ambientGain.connect(dryGain);
    ambientGain.connect(convolver);

    master.gain.setValueAtTime(0.32 * masterVol, ctx.currentTime);
  }
  return ctx;
}

function makeImpulse(c: AudioContext, seconds: number, decay: number) {
  const rate = c.sampleRate;
  const len = Math.floor(rate * seconds);
  const buffer = c.createBuffer(2, len, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
  }
  return buffer;
}

function assertMasterGain() {
  if (!master || !ctx || ctx.state === "closed") return;
  const target = 0.32 * masterVol;
  try {
    const t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    // Hard set so we never stay near-silent after unlock
    master.gain.setValueAtTime(Math.max(master.gain.value, target * 0.01), t);
    master.gain.linearRampToValueAtTime(target, t + 0.03);
  } catch {
    /* ignore */
  }
}

/**
 * Must be called synchronously inside a user gesture (tap/click).
 * Do NOT await anything before calling this — browsers drop the gesture chain.
 */
export function unlockAudio(): AudioContext {
  const c = ensure();
  if (c.state === "suspended" || (c.state as string) === "interrupted") {
    void c.resume().then(() => assertMasterGain());
  }
  assertMasterGain();
  return c;
}

export async function resumeAudio() {
  const c = ensure();
  if (c.state === "suspended" || (c.state as string) === "interrupted") {
    try {
      await c.resume();
    } catch {
      /* may need another user gesture */
    }
  }
  assertMasterGain();
  return c;
}

export function setMasterVolume(v: number) {
  masterVol = Math.max(0, Math.min(1, v));
  ensure();
  assertMasterGain();
}

/** Current intended master (0–1) for mic restore paths. */
export function getMasterVolume() {
  return masterVol;
}

export function setSynthVoice(v: SynthVoice) {
  voice = v;
}

export function setRotationPan(rotationRad: number) {
  rotationPan = Math.sin(rotationRad) * 0.55;
  const c = ensure();
  for (const h of active.values()) {
    h.panner.pan.setTargetAtTime(rotationPan, c.currentTime, 0.05);
  }
}

function keyFor(midiPc: number, octave: number) {
  return `${midiPc}:${octave}`;
}

function connectOut(node: AudioNode, c: AudioContext) {
  const panner = c.createStereoPanner();
  panner.pan.value = rotationPan;
  node.connect(panner);
  panner.connect(dryGain!);
  panner.connect(convolver!);
  return panner;
}

type PartialSpec = { ratio: number; gain: number; type?: OscillatorType };

function voicePartials(v: SynthVoice): PartialSpec[] {
  switch (v) {
    case "pure":
      return [{ ratio: 1, gain: 1, type: "sine" }];
    case "organ":
      return [
        { ratio: 1, gain: 0.7, type: "sine" },
        { ratio: 2, gain: 0.45, type: "sine" },
        { ratio: 3, gain: 0.22, type: "sine" },
        { ratio: 4, gain: 0.14, type: "sine" },
        { ratio: 6, gain: 0.08, type: "sine" },
      ];
    case "piano":
      return [
        { ratio: 1, gain: 0.85, type: "triangle" },
        { ratio: 2, gain: 0.28, type: "sine" },
        { ratio: 3, gain: 0.12, type: "sine" },
        { ratio: 4.01, gain: 0.06, type: "sine" },
        { ratio: 5.04, gain: 0.04, type: "sine" },
      ];
    case "strings":
      return [
        { ratio: 1, gain: 0.55, type: "sawtooth" },
        { ratio: 1.003, gain: 0.35, type: "sawtooth" },
        { ratio: 2, gain: 0.18, type: "sine" },
        { ratio: 3, gain: 0.08, type: "sine" },
      ];
    case "pad":
    default:
      return [
        { ratio: 1, gain: 0.55, type: "sine" },
        { ratio: 1.01, gain: 0.35, type: "sine" },
        { ratio: 2, gain: 0.2, type: "triangle" },
        { ratio: 3, gain: 0.08, type: "sine" },
        { ratio: 0.5, gain: 0.12, type: "sine" },
      ];
  }
}

function envFor(v: SynthVoice, duration: number) {
  switch (v) {
    case "piano":
      return { attack: 0.008, decay: 0.25, sustain: 0.35, release: Math.min(0.9, duration * 0.45) };
    case "organ":
      return { attack: 0.02, decay: 0.05, sustain: 0.85, release: 0.2 };
    case "strings":
      return { attack: 0.12, decay: 0.2, sustain: 0.7, release: 0.55 };
    case "pure":
      return { attack: 0.025, decay: 0.05, sustain: 0.8, release: 0.4 };
    case "pad":
    default:
      return { attack: 0.08, decay: 0.18, sustain: 0.65, release: 0.55 };
  }
}

export function playTone(
  midiPc: number,
  options: {
    octave?: number;
    duration?: number;
    velocity?: number;
    voice?: SynthVoice;
  } = {},
) {
  // Unlock in the same turn as the call (gesture-safe if caller was a tap)
  const c = unlockAudio();

  const octave = options.octave ?? 4;
  const duration = options.duration ?? 1.4;
  const velocity = Math.max(0.05, Math.min(1, options.velocity ?? 0.85));
  const v = options.voice ?? voice;
  const freq = frequencyOf(midiPc, octave);
  const id = keyFor(midiPc, octave);

  stopTone(midiPc, octave, 0.03);

  const mix = c.createGain();
  mix.gain.value = 0;
  const panner = connectOut(mix, c);

  const partials = voicePartials(v);
  const oscs: OscillatorNode[] = [];

  let mod: OscillatorNode | null = null;
  let modGain: GainNode | null = null;
  if (v === "pad" || v === "strings") {
    mod = c.createOscillator();
    modGain = c.createGain();
    mod.frequency.value = freq * (v === "strings" ? 1.5 : 2);
    modGain.gain.value = freq * (v === "strings" ? 0.8 : 0.35);
    mod.connect(modGain);
  }

  for (const p of partials) {
    const osc = c.createOscillator();
    osc.type = p.type ?? "sine";
    osc.frequency.value = freq * p.ratio;
    if (modGain && p.ratio === 1) {
      modGain.connect(osc.frequency);
    }
    const g = c.createGain();
    g.gain.value = p.gain * velocity;
    if (v === "strings" || v === "pad") {
      const f = c.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.value = v === "strings" ? 3200 : 2400;
      f.Q.value = 0.4;
      osc.connect(f);
      f.connect(g);
    } else {
      osc.connect(g);
    }
    g.connect(mix);
    oscs.push(osc);
  }

  const env = envFor(v, duration);
  const now = c.currentTime;
  const peak = 0.55 * velocity;
  mix.gain.setValueAtTime(0, now);
  mix.gain.linearRampToValueAtTime(peak, now + env.attack);
  mix.gain.linearRampToValueAtTime(peak * env.sustain, now + env.attack + env.decay);
  const relStart = now + Math.max(env.attack + env.decay, duration - env.release);
  mix.gain.setValueAtTime(peak * env.sustain, relStart);
  mix.gain.exponentialRampToValueAtTime(0.001, relStart + env.release);

  for (const osc of oscs) {
    osc.start(now);
    osc.stop(relStart + env.release + 0.05);
  }
  mod?.start(now);
  mod?.stop(relStart + env.release + 0.05);

  const handle: VoiceHandle = {
    panner,
    stop: (release = 0.08) => {
      const t = c.currentTime;
      try {
        const cur = Math.max(mix.gain.value || 0, 0.001);
        mix.gain.cancelScheduledValues(t);
        mix.gain.setValueAtTime(cur, t);
        mix.gain.exponentialRampToValueAtTime(0.001, t + release);
        for (const osc of oscs) {
          try {
            osc.stop(t + release + 0.03);
          } catch {
            /* already stopped */
          }
        }
        try {
          mod?.stop(t + release + 0.03);
        } catch {
          /* already stopped */
        }
      } catch {
        /* already stopped */
      }
    },
  };
  active.set(id, handle);
}

export function playChord(
  midis: number[],
  options: { octave?: number; duration?: number; velocity?: number; voice?: SynthVoice } = {},
) {
  unlockAudio();
  const octave = options.octave ?? 4;
  const duration = options.duration ?? 1.7;
  const velocity = options.velocity ?? 0.85;
  midis.forEach((m, i) => {
    const oct = octave + (i >= 3 ? 1 : 0);
    playTone(m, {
      octave: oct,
      duration: duration + i * 0.03,
      velocity: velocity * (1 - i * 0.06),
      voice: options.voice,
    });
  });
}

export function stopTone(midiPc: number, octave = 4, release = 0.08) {
  const id = keyFor(midiPc, octave);
  const entry = active.get(id);
  if (!entry) return;
  entry.stop(release);
  active.delete(id);
}

export function stopAll(release = 0.06) {
  for (const [id, entry] of active) {
    entry.stop(release);
    active.delete(id);
  }
}

export function startAmbient(midis: number[], level = 0.08) {
  const c = unlockAudio();
  stopAmbient();
  if (!ambientGain || midis.length === 0) return;
  ambientGain.gain.cancelScheduledValues(c.currentTime);
  ambientGain.gain.setTargetAtTime(level * masterVol, c.currentTime, 0.8);

  for (let i = 0; i < midis.length; i++) {
    const freq = frequencyOf(midis[i]!, 3 + (i % 2));
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const lfo = c.createOscillator();
    const lfoG = c.createGain();
    lfo.frequency.value = 0.04 + i * 0.015;
    lfoG.gain.value = 1.5 + i;
    lfo.connect(lfoG);
    lfoG.connect(osc.frequency);
    g.gain.value = 0.25 / midis.length;
    osc.connect(g);
    g.connect(ambientGain);
    osc.start();
    lfo.start();
    ambientNodes.push(osc, lfo);
  }
}

export function stopAmbient() {
  if (!ctx || ctx.state === "closed" || !ambientGain) return;
  ambientGain.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
  for (const n of ambientNodes) {
    try {
      n.stop(ctx.currentTime + 0.6);
    } catch {
      /* ignore */
    }
  }
  ambientNodes = [];
}

/** Shared engine context — mic analysis must use this, never a second AudioContext. */
export function getAudioContext(): AudioContext {
  return ensure();
}
