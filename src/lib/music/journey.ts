/** Journey recorder — timeline of chords, colors, optional export / URL state. */

import type { ChordQuality, PitchClass, SynthVoice } from "./theory";
import { FIFTHS, QUALITY_LABELS, mixColorName, chordPitches } from "./theory";

export type JourneyEvent = {
  t: number; // ms from journey start
  rootId: string;
  quality: ChordQuality;
  colors: string[];
  mix: string;
  symbol: string;
};

export type JourneySnapshot = {
  v: 1;
  name: string;
  createdAt: string;
  keyRootId: string;
  voice: SynthVoice;
  events: JourneyEvent[];
};

let recording = false;
let startMs = 0;
let events: JourneyEvent[] = [];
let name = "Living spectrum journey";

export function isRecording() {
  return recording;
}

export function journeyEvents() {
  return events.slice();
}

export function startJourney(label?: string) {
  recording = true;
  startMs = performance.now();
  events = [];
  if (label) name = label;
  else name = `Journey ${new Date().toLocaleTimeString()}`;
}

export function stopJourney() {
  recording = false;
}

export function clearJourney() {
  recording = false;
  events = [];
}

export function recordEvent(root: PitchClass, quality: ChordQuality) {
  if (!recording) return;
  const tones = chordPitches(root, quality);
  events.push({
    t: Math.round(performance.now() - startMs),
    rootId: root.id,
    quality,
    colors: tones.map((t) => t.colorName),
    mix: mixColorName(tones),
    symbol:
      quality === "note"
        ? root.label
        : quality === "major"
          ? root.label
          : quality === "minor"
            ? `${root.label}m`
            : `${root.label} ${QUALITY_LABELS[quality]}`,
  });
}

export function snapshotJourney(keyRootId: string, voice: SynthVoice): JourneySnapshot {
  return {
    v: 1,
    name,
    createdAt: new Date().toISOString(),
    keyRootId,
    voice,
    events: events.slice(),
  };
}

export function exportJourneyJson(keyRootId: string, voice: SynthVoice): string {
  return JSON.stringify(snapshotJourney(keyRootId, voice), null, 2);
}

/** Compact share hash for deep-link (events truncated if huge). */
export function encodeJourneyUrl(keyRootId: string, voice: SynthVoice): string {
  const snap = snapshotJourney(keyRootId, voice);
  const slim = {
    v: 1 as const,
    k: keyRootId,
    voice,
    e: snap.events.slice(0, 80).map((ev) => [ev.t, ev.rootId, ev.quality] as const),
  };
  try {
    return btoa(JSON.stringify(slim)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  } catch {
    return "";
  }
}

export function decodeJourneyUrl(hash: string): JourneySnapshot | null {
  try {
    const pad = hash.length % 4 === 0 ? "" : "=".repeat(4 - (hash.length % 4));
    const raw = atob(hash.replace(/-/g, "+").replace(/_/g, "/") + pad);
    const slim = JSON.parse(raw) as {
      v: 1;
      k: string;
      voice: SynthVoice;
      e: [number, string, ChordQuality][];
    };
    if (!slim?.e) return null;
    const events: JourneyEvent[] = slim.e.map(([t, rootId, quality]) => {
      const root = FIFTHS.find((p) => p.id === rootId) ?? FIFTHS[0]!;
      const tones = chordPitches(root, quality);
      return {
        t,
        rootId,
        quality,
        colors: tones.map((x) => x.colorName),
        mix: mixColorName(tones),
        symbol: root.label,
      };
    });
    return {
      v: 1,
      name: "Shared journey",
      createdAt: new Date().toISOString(),
      keyRootId: slim.k,
      voice: slim.voice,
      events,
    };
  } catch {
    return null;
  }
}

export type PlaybackHandle = { stop: () => void };

export function playJourney(
  snap: JourneySnapshot,
  onEvent: (root: PitchClass, quality: ChordQuality, index: number) => void,
  onDone?: () => void,
): PlaybackHandle {
  let cancelled = false;
  const timers: number[] = [];
  snap.events.forEach((ev, i) => {
    const id = window.setTimeout(() => {
      if (cancelled) return;
      const root = FIFTHS.find((p) => p.id === ev.rootId) ?? FIFTHS[0]!;
      onEvent(root, ev.quality, i);
      if (i === snap.events.length - 1) onDone?.();
    }, ev.t);
    timers.push(id);
  });
  if (snap.events.length === 0) onDone?.();
  return {
    stop: () => {
      cancelled = true;
      timers.forEach((t) => clearTimeout(t));
    },
  };
}

const MIDI_PPQ = 0x01e0; // 480, must match the division bytes in the MThd header below
const MIDI_US_PER_QUARTER = 500_000; // 120 bpm
const MIDI_TICKS_PER_MS = MIDI_PPQ / (MIDI_US_PER_QUARTER / 1000);
const MIDI_WHOLE_NOTE_TICKS = MIDI_PPQ * 4;

/**
 * Minimal type-0 MIDI of roots (export heuristic). Each root sounds until the
 * next event, capped at a whole note; the last root holds a whole note.
 * Event timestamps are placed on an absolute tick timeline so the file plays
 * back at the recorded wall-clock spacing.
 */
export function exportJourneyMidi(snap: JourneySnapshot): Uint8Array {
  // Very small MIDI file writer for pitch-class events
  const track: number[] = [];
  const pushVar = (n: number) => {
    const bytes: number[] = [];
    let v = n;
    bytes.unshift(v & 0x7f);
    v >>= 7;
    while (v > 0) {
      bytes.unshift((v & 0x7f) | 0x80);
      v >>= 7;
    }
    track.push(...bytes);
  };

  // Explicit tempo so players do not have to assume the 120 bpm default.
  pushVar(0);
  track.push(
    0xff,
    0x51,
    0x03,
    (MIDI_US_PER_QUARTER >> 16) & 0xff,
    (MIDI_US_PER_QUARTER >> 8) & 0xff,
    MIDI_US_PER_QUARTER & 0xff,
  );

  const events = snap.events;
  let cursor = 0; // absolute tick of the last written event
  for (let i = 0; i < events.length; i++) {
    const ev = events[i]!;
    const root = FIFTHS.find((p) => p.id === ev.rootId) ?? FIFTHS[0]!;
    const note = 60 + root.midi;
    const onTick = Math.max(cursor, Math.round(ev.t * MIDI_TICKS_PER_MS));
    const next = events[i + 1];
    const gap = next ? Math.round(next.t * MIDI_TICKS_PER_MS) - onTick : MIDI_WHOLE_NOTE_TICKS;
    const duration = Math.max(1, Math.min(MIDI_WHOLE_NOTE_TICKS, gap));
    pushVar(onTick - cursor);
    track.push(0x90, note, 0x50); // note on
    pushVar(duration);
    track.push(0x80, note, 0x00); // note off
    cursor = onTick + duration;
  }
  pushVar(0);
  track.push(0xff, 0x2f, 0x00); // end of track

  // MThd, length 6, format 0, one track, division 0x01e0 = MIDI_PPQ (480).
  const header = [
    0x4d, 0x54, 0x68, 0x64, 0x00, 0x00, 0x00, 0x06, 0x00, 0x00, 0x00, 0x01, 0x01, 0xe0,
  ];
  const trackHeader = [0x4d, 0x54, 0x72, 0x6b];
  const len = track.length;
  const lenBytes = [(len >> 24) & 0xff, (len >> 16) & 0xff, (len >> 8) & 0xff, len & 0xff];
  return new Uint8Array([...header, ...trackHeader, ...lenBytes, ...track]);
}
