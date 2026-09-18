import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  CircleDot,
  Download,
  Eye,
  EyeOff,
  Flashlight,
  Info,
  Maximize2,
  Mic,
  MicOff,
  Moon,
  Pause,
  Play,
  Radio,
  RotateCcw,
  Share2,
  Sparkles,
  Square,
  Upload,
  Volume2,
  VolumeX,
  Waves,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LumenCanvas } from "@/components/lumen-wheel/LumenCanvas";
import {
  playChord,
  resumeAudio,
  setMasterVolume,
  setRotationPan,
  setSynthVoice,
  startAmbient,
  stopAll,
  stopAmbient,
  unlockAudio,
} from "@/lib/music/audio";
import {
  detectTorchSupport,
  holdLight,
  pulseLight,
  releaseTorch,
  setLightMode,
  setLightShow,
  startLightEngine,
  stopLightEngine,
  type LightMode,
} from "@/lib/music/lights";
import { hapticChord, hapticJourneyMark, setHapticsEnabled, setHapticsIntensity } from "@/lib/music/haptics";
import {
  clearJourney,
  decodeJourneyUrl,
  encodeJourneyUrl,
  exportJourneyJson,
  exportJourneyMidi,
  isRecording,
  journeyEvents,
  playJourney,
  recordEvent,
  startJourney,
  stopJourney,
  type JourneySnapshot,
  type PlaybackHandle,
} from "@/lib/music/journey";
import {
  getResonanceConfig,
  isResonanceRunning,
  setResonanceConfig,
  startFileResonance,
  startMicResonance,
  stopResonance,
  subscribeResonance,
  type ResonanceMode,
} from "@/lib/music/resonance";
import { progressionForMood, suggestionsForKey, type MoodHint } from "@/lib/music/ambient-gen";
import { SCALES, scalePitches, type ScaleId } from "@/lib/music/scales";
import {
  FIFTHS,
  PROGRESSIONS,
  QUALITY_LABELS,
  VOICE_LABELS,
  beamColor,
  chordColorLookup,
  chordPitches,
  complementaryPitch,
  inferQuality,
  mixColorName,
  parseChordSymbol,
  romanDegree,
  theoryBlurb,
  theoryHeadline,
  type ChordQuality,
  type PitchClass,
  type SynthVoice,
  type VisionMode,
} from "@/lib/music/theory";
import { cn } from "@/lib/utils";
import {
  APP_DESCRIPTION,
  APP_INSTRUMENT,
  APP_NAME,
  APP_THESIS,
  APP_VERSION,
  PLAY_URL,
  THEORY_URL,
} from "@/lib/app-meta";

const QUALITIES: ChordQuality[] = [
  "note",
  "major",
  "minor",
  "dom7",
  "maj7",
  "min7",
  "m7b5",
  "sus4",
  "dim",
  "dim7",
  "aug",
];

const VOICES: SynthVoice[] = ["pure", "pad", "organ", "piano", "strings"];

export function LumenApp() {
  const [rotation, setRotation] = useState(0);
  const [quality, setQuality] = useState<ChordQuality>("major");
  const [voice, setVoice] = useState<SynthVoice>("pad");
  const [activeRoot, setActiveRoot] = useState<PitchClass | null>(null);
  const [activeTones, setActiveTones] = useState<PitchClass[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [expandedSpectrum, setExpandedSpectrum] = useState(true);
  const [showGeometry, setShowGeometry] = useState(true);
  const [muted, setMuted] = useState(false);
  const [pulse, setPulse] = useState(0);
  const [infoOpen, setInfoOpen] = useState(false);
  const [theoryOpen, setTheoryOpen] = useState(true);
  const [dockOpen, setDockOpen] = useState(false);
  const [playingProgression, setPlayingProgression] = useState<string | null>(null);
  const [keyRoot, setKeyRoot] = useState<PitchClass>(FIFTHS[0]!);
  const [lightMode, setLightModeState] = useState<LightMode>("off");
  const [lightShow, setLightShowState] = useState(false);
  const [pureLight, setPureLight] = useState(false);
  const [spectacular, setSpectacular] = useState(false);
  const [ambient, setAmbient] = useState(false);
  const [resonanceOn, setResonanceOn] = useState(false);
  const [resonanceMode, setResonanceMode] = useState<ResonanceMode>("listen");
  const [sensitivity, setSensitivity] = useState(0.55);
  const [micLabel, setMicLabel] = useState<string | null>(null);
  const [torchOk, setTorchOk] = useState<boolean | null>(null);
  const [visionMode, setVisionMode] = useState<VisionMode>("full");
  const [burstKey, setBurstKey] = useState(0);
  const [tilt, setTilt] = useState({ beta: 0, gamma: 0 });
  const [haptics, setHaptics] = useState(true);
  const [shareHint, setShareHint] = useState<string | null>(null);
  const [chordQuery, setChordQuery] = useState("");
  const [chordAnswer, setChordAnswer] = useState<string | null>(null);
  const [chordError, setChordError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [journeyCount, setJourneyCount] = useState(0);
  const [playingJourney, setPlayingJourney] = useState(false);
  const [scaleId, setScaleId] = useState<ScaleId | "off">("off");
  const [multiSelect, setMultiSelect] = useState<PitchClass[]>([]);
  const [trailTones, setTrailTones] = useState<PitchClass[]>([]);
  const [resonanceEnergy, setResonanceEnergy] = useState<number[]>(() => Array(12).fill(0));
  const [perfMode, setPerfMode] = useState(false);
  const [shaders, setShaders] = useState(true);

  const progTimer = useRef<number | null>(null);
  const pulseTimer = useRef<number | null>(null);
  const lastQuality = useRef<ChordQuality>("major");
  const lastMicId = useRef<string | null>(null);
  const lastMicAt = useRef(0);
  const userPlayUntil = useRef(0);
  const journeyPlayRef = useRef<PlaybackHandle | null>(null);
  const ambientGenRef = useRef<number | null>(null);
  const lastAmbientStep = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const intensity = useMemo(() => {
    let n = 0.25;
    if (lightMode === "screen") n += 0.2;
    if (lightMode === "torch" || lightMode === "hybrid") n += 0.3;
    if (lightShow) n += 0.15;
    if (pureLight) n += 0.15;
    if (spectacular) n += 0.25;
    if (ambient) n += 0.08;
    if (resonanceOn) n += 0.1;
    return Math.min(1, n);
  }, [lightMode, lightShow, pureLight, spectacular, ambient, resonanceOn]);

  const scaleOverlay = useMemo(() => {
    if (scaleId === "off") return [];
    return scalePitches(keyRoot.midi, scaleId);
  }, [scaleId, keyRoot]);

  const suggestions = useMemo(() => suggestionsForKey(keyRoot), [keyRoot]);

  useEffect(() => {
    startLightEngine();
    void detectTorchSupport().then(setTorchOk);
    setHapticsEnabled(haptics);
    // Deep-link journey
    if (typeof window !== "undefined") {
      const h = window.location.hash.replace(/^#j=/, "");
      if (h && h.length > 8) {
        const snap = decodeJourneyUrl(h);
        if (snap) {
          setShareHint("Shared journey ready — open Journey to play");
          (window as unknown as { __ccJourney?: JourneySnapshot }).__ccJourney = snap;
        }
      }
    }
    return () => {
      if (progTimer.current) window.clearTimeout(progTimer.current);
      if (pulseTimer.current) window.clearInterval(pulseTimer.current);
      if (ambientGenRef.current) window.clearTimeout(ambientGenRef.current);
      journeyPlayRef.current?.stop();
      stopAll();
      stopAmbient();
      void stopResonance();
      stopLightEngine();
      releaseTorch();
    };
  }, []);

  useEffect(() => {
    setMasterVolume(muted ? 0 : 0.9);
  }, [muted]);

  useEffect(() => {
    setSynthVoice(voice);
  }, [voice]);

  useEffect(() => {
    setRotationPan(rotation);
  }, [rotation]);

  useEffect(() => {
    setLightMode(lightMode);
  }, [lightMode]);

  useEffect(() => {
    setLightShow(lightShow);
  }, [lightShow]);

  useEffect(() => {
    setHapticsEnabled(haptics);
    setHapticsIntensity(haptics ? 1 : 0);
  }, [haptics]);

  useEffect(() => {
    setResonanceConfig({ sensitivity, mode: resonanceMode });
  }, [sensitivity, resonanceMode]);

  useEffect(() => {
    const onOrient = (e: DeviceOrientationEvent) => {
      setTilt({
        beta: Math.max(-45, Math.min(45, e.beta ?? 0)),
        gamma: Math.max(-45, Math.min(45, e.gamma ?? 0)),
      });
    };
    window.addEventListener("deviceorientation", onOrient);
    return () => window.removeEventListener("deviceorientation", onOrient);
  }, []);

  const triggerPulse = useCallback(() => {
    setPulse(1);
    setBurstKey((k) => k + 1);
    if (pulseTimer.current) window.clearInterval(pulseTimer.current);
    const start = performance.now();
    pulseTimer.current = window.setInterval(() => {
      const t = (performance.now() - start) / 1000;
      if (t >= 1) {
        setPulse(0);
        if (pulseTimer.current) window.clearInterval(pulseTimer.current);
        pulseTimer.current = null;
        return;
      }
      setPulse(Math.max(0, 1 - t));
    }, 32);
  }, []);

  const fireLights = useCallback(
    (tones: PitchClass[], q: ChordQuality, duration: number) => {
      if (lightMode === "off") return;
      const color = beamColor(
        tones.map((t) => t.hue),
        1,
        visionMode,
      );
      if (lightShow) {
        holdLight(color, 0.55 + intensity * 0.35);
      } else {
        pulseLight(color, {
          attack: 0.03,
          hold: Math.max(0.35, duration * 0.55),
          release: 0.4,
          sustain: 0.75,
          peak: 0.55 + intensity * 0.4,
        });
      }
      const kind =
        q === "note"
          ? "note"
          : q === "dom7" || q === "dim" || q === "dim7" || q === "aug"
            ? q === "dom7"
              ? "dominant"
              : "dissonant"
            : "consonant";
      hapticChord(kind);
    },
    [lightMode, lightShow, visionMode, intensity],
  );

  const playRoot = useCallback(
    (
      root: PitchClass,
      q: ChordQuality = quality,
      velocity = 0.85,
      step = 0,
      opts?: { fromMic?: boolean },
    ) => {
      if (opts?.fromMic && performance.now() < userPlayUntil.current) return;

      unlockAudio();
      if (!opts?.fromMic) {
        userPlayUntil.current = performance.now() + 1400;
      }

      const tones = chordPitches(root, q);
      setTrailTones(activeTones);
      setActiveRoot(root);
      setActiveTones(tones);
      setActiveStep(step);
      lastQuality.current = q;
      triggerPulse();
      const duration = q === "note" ? 1.15 : 1.75;
      fireLights(tones, q, duration);
      if (!muted && (!opts?.fromMic || resonanceMode === "listenSynth")) {
        playChord(
          tones.map((p) => p.midi),
          {
            duration: opts?.fromMic ? Math.min(duration, 1.05) : duration,
            velocity: opts?.fromMic ? Math.min(velocity, 0.55) : velocity,
            voice,
          },
        );
      }
      if (ambient && !opts?.fromMic) {
        startAmbient(
          tones.map((p) => p.midi),
          0.07,
        );
      }
      if (!opts?.fromMic && isRecording()) {
        recordEvent(root, q);
        setJourneyCount(journeyEvents().length);
        hapticJourneyMark();
      }
    },
    [quality, muted, voice, ambient, triggerPulse, fireLights, activeTones, resonanceMode],
  );

  // Live Resonance subscription
  useEffect(() => {
    if (!resonanceOn) {
      setResonanceEnergy(Array(12).fill(0));
      return;
    }
    const unsub = subscribeResonance((frame) => {
      const energies = Array(12).fill(0) as number[];
      for (const p of frame.pitches) {
        energies[p.pitch.midi] = p.energy;
      }
      setResonanceEnergy(energies);
      if (!frame.fundamental || frame.clarity < 0.35) {
        setMicLabel(null);
        return;
      }
      const label = frame.frequency
        ? `${frame.fundamental.label} ${frame.fundamental.colorName} · ${Math.round(frame.frequency)} Hz`
        : `${frame.fundamental.label} ${frame.fundamental.colorName}`;
      setMicLabel(label);
      const now = performance.now();
      if (lastMicId.current === frame.fundamental.id && now - lastMicAt.current < 850) return;
      if (now < userPlayUntil.current) return;
      lastMicId.current = frame.fundamental.id;
      lastMicAt.current = now;
      const q =
        frame.pitches.length >= 3 ? frame.estimatedQuality : ("note" as ChordQuality);
      playRoot(frame.fundamental, q === "note" ? "note" : q, 0.4 + frame.clarity * 0.2, 0, {
        fromMic: true,
      });
    });
    return () => {
      unsub();
    };
  }, [resonanceOn, playRoot]);

  const stopProgression = useCallback(() => {
    if (progTimer.current) {
      window.clearTimeout(progTimer.current);
      progTimer.current = null;
    }
    setPlayingProgression(null);
  }, []);

  const playProgression = useCallback(
    async (progId: string) => {
      const prog = PROGRESSIONS.find((p) => p.id === progId);
      if (!prog) return;
      if (playingProgression === progId) {
        stopProgression();
        return;
      }
      unlockAudio();
      stopProgression();
      setPlayingProgression(progId);
      await resumeAudio();

      const run = (i: number) => {
        if (i >= prog.steps.length) {
          setPlayingProgression(null);
          return;
        }
        const step = prog.steps[i]!;
        const midi = (keyRoot.midi + step) % 12;
        const root = FIFTHS.find((p) => p.midi === midi) ?? keyRoot;
        const q =
          prog.qualities?.[i] ??
          (quality === "note" ? "major" : inferQuality(step, quality));
        playRoot(root, q, 0.88, step);
        progTimer.current = window.setTimeout(() => run(i + 1), 1050);
      };
      run(0);
    },
    [keyRoot, playRoot, playingProgression, quality, stopProgression],
  );

  const toggleResonance = async () => {
    unlockAudio();
    if (resonanceOn || isResonanceRunning()) {
      await stopResonance();
      setResonanceOn(false);
      setMicLabel(null);
      lastMicId.current = null;
      unlockAudio();
      setMasterVolume(muted ? 0 : 0.9);
      return;
    }
    setResonanceConfig({ mode: resonanceMode, sensitivity });
    const ok = await startMicResonance();
    setResonanceOn(ok);
    unlockAudio();
    setMasterVolume(muted ? 0 : 0.9);
    if (!ok) setMicLabel("Mic unavailable");
  };

  const onFileAudio = async (file: File | null) => {
    if (!file) return;
    unlockAudio();
    setResonanceConfig({ mode: resonanceMode, sensitivity });
    const ok = await startFileResonance(file);
    setResonanceOn(ok);
    if (!ok) setMicLabel("Could not open file");
    else setMicLabel(`File · ${file.name}`);
  };

  const askChordColor = useCallback(
    (raw?: string) => {
      unlockAudio();
      const q = (raw ?? chordQuery).trim();
      if (!q) {
        setChordError("Type a chord — e.g. Am7, G7, F#maj7");
        setChordAnswer(null);
        return;
      }
      const result = chordColorLookup(q);
      if (!result.ok) {
        setChordError(`${result.error} ${result.hint}`);
        setChordAnswer(null);
        return;
      }
      setChordError(null);
      setChordAnswer(result.answer);
      setTheoryOpen(true);
      if (result.quality !== "note") setQuality(result.quality);
      else setQuality("note");
      const parsed = parseChordSymbol(q);
      if (parsed) playRoot(parsed.root, parsed.quality, 0.9, 0);
    },
    [chordQuery, playRoot],
  );

  const enableSpectacular = async () => {
    const next = !spectacular;
    setSpectacular(next);
    unlockAudio();
    if (next) {
      setLightModeState(torchOk ? "hybrid" : "screen");
      setLightShowState(true);
      setPureLight(true);
      setExpandedSpectrum(true);
      setShowGeometry(true);
      setVoice("pad");
      setAmbient(true);
      setDockOpen(false);
      setTheoryOpen(true);
      const root = keyRoot;
      playRoot(root, "major", 0.9, 0);
      startAmbient([root.midi, (root.midi + 4) % 12, (root.midi + 7) % 12], 0.06);
      if (torchOk) setLightMode("hybrid");
    } else {
      setPureLight(false);
      setLightShowState(false);
      setLightModeState("off");
      setAmbient(false);
      stopAmbient();
      setDockOpen(false);
    }
  };

  const toggleRecord = () => {
    if (recording) {
      stopJourney();
      setRecording(false);
      setShareHint(`Journey · ${journeyEvents().length} events`);
      window.setTimeout(() => setShareHint(null), 2000);
    } else {
      startJourney();
      setRecording(true);
      setJourneyCount(0);
      hapticJourneyMark();
    }
  };

  const playRecordedJourney = () => {
    const events = journeyEvents();
    const shared = (window as unknown as { __ccJourney?: JourneySnapshot }).__ccJourney;
    const snap: JourneySnapshot =
      events.length > 0
        ? {
            v: 1,
            name: "Session",
            createdAt: new Date().toISOString(),
            keyRootId: keyRoot.id,
            voice,
            events,
          }
        : shared ?? {
            v: 1,
            name: "Empty",
            createdAt: new Date().toISOString(),
            keyRootId: keyRoot.id,
            voice,
            events: [],
          };
    if (snap.events.length === 0) {
      setShareHint("No journey recorded yet");
      window.setTimeout(() => setShareHint(null), 1600);
      return;
    }
    journeyPlayRef.current?.stop();
    setPlayingJourney(true);
    setPerfMode(true);
    unlockAudio();
    journeyPlayRef.current = playJourney(
      snap,
      (root, q) => playRoot(root, q, 0.88, 0),
      () => {
        setPlayingJourney(false);
        setPerfMode(false);
      },
    );
  };

  const exportJson = () => {
    const json = exportJourneyJson(keyRoot.id, voice);
    const blob = new Blob([json], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "colorchord-journey.json";
    a.click();
  };

  const exportMidi = () => {
    const bytes = exportJourneyMidi({
      v: 1,
      name: "journey",
      createdAt: new Date().toISOString(),
      keyRootId: keyRoot.id,
      voice,
      events: journeyEvents(),
    });
    const blob = new Blob([bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer], {
      type: "audio/midi",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "colorchord-journey.mid";
    a.click();
  };

  const shareJourneyLink = async () => {
    const enc = encodeJourneyUrl(keyRoot.id, voice);
    if (!enc) return;
    const url = `${window.location.origin}${window.location.pathname}#j=${enc}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "ColorChord Journey", url });
      } else {
        await navigator.clipboard.writeText(url);
        setShareHint("Journey link copied");
        window.setTimeout(() => setShareHint(null), 1800);
      }
    } catch {
      /* */
    }
  };

  const runMood = (mood: MoodHint) => {
    const steps = progressionForMood(mood, keyRoot);
    unlockAudio();
    let i = 0;
    const tick = () => {
      if (i >= steps.length) return;
      const s = steps[i]!;
      playRoot(s.root, s.quality, 0.88, 0);
      i++;
      if (i < steps.length) window.setTimeout(tick, 1000);
    };
    tick();
  };

  const exportPng = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = `colorchord-${activeRoot?.id ?? "wheel"}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  };

  const shareApp = async () => {
    const url = typeof window !== "undefined" ? window.location.href : `${PLAY_URL}/`;
    const data = {
      title: `${APP_NAME} ${APP_VERSION}`,
      text: APP_DESCRIPTION,
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareHint("Link copied");
      window.setTimeout(() => setShareHint(null), 1800);
    } catch {
      /* cancelled */
    }
  };

  const statusLine = useMemo(() => {
    if (resonanceOn && micLabel) return `Living · ${micLabel}`;
    if (recording) return `Recording journey · ${journeyCount} events`;
    if (!activeRoot) return `${APP_THESIS} · tap, ask, or listen`;
    const q = lastQuality.current;
    if (q === "note") {
      const comp = complementaryPitch(activeRoot);
      return `${activeRoot.label} ${activeRoot.colorName} · opposite ${comp.label} ${comp.colorName}`;
    }
    const roman = romanDegree(activeStep, q);
    const mix = mixColorName(activeTones);
    return `${roman}  ·  ${activeRoot.label} ${QUALITY_LABELS[q]}  ·  ${mix}`;
  }, [activeRoot, activeTones, activeStep, resonanceOn, micLabel, burstKey, recording, journeyCount]);

  const blurb = useMemo(() => {
    if (chordAnswer) return chordAnswer;
    if (!activeRoot || activeTones.length === 0) {
      return "Fifths = hue. Ask Am7, open Live Resonance, or record a journey.";
    }
    return theoryBlurb(activeRoot, lastQuality.current, activeTones);
  }, [activeRoot, activeTones, burstKey, chordAnswer]);

  const headline = useMemo(() => {
    if (!activeRoot) return null;
    return theoryHeadline(activeRoot, lastQuality.current, activeTones);
  }, [activeRoot, activeTones, burstKey]);

  const uiHidden = (pureLight && !dockOpen) || (perfMode && !dockOpen);

  return (
    <div
      className="relative flex h-[calc(100dvh-var(--grok-banner-h,0px))] flex-col overflow-hidden bg-[var(--color-bg)] text-[var(--color-fg)]"
      style={{ marginTop: "var(--grok-banner-h, 0px)" }}
      role="application"
      aria-label={`${APP_NAME} ${APP_INSTRUMENT}`}
    >
      {!uiHidden && (
        <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-1.5 p-2 pt-[max(0.4rem,env(safe-area-inset-top))] sm:gap-2 sm:p-5">
          <div className="pointer-events-auto max-w-[min(100%,17.5rem)] rounded-[var(--radius-md)] bg-[var(--color-bg)]/80 px-2 py-1.5 shadow-lg backdrop-blur-md sm:max-w-[min(100%,20rem)] sm:bg-transparent sm:px-0 sm:py-0 sm:shadow-none sm:backdrop-blur-none">
            <p className="text-[0.5rem] font-medium tracking-[0.18em] text-[var(--color-fg-subtle)] uppercase sm:text-[0.6rem]">
              {APP_INSTRUMENT} · {APP_VERSION}
            </p>
            <h1 className="mt-0.5 text-[0.95rem] font-semibold tracking-[-0.03em] sm:text-2xl">
              {APP_NAME}
            </h1>
            <p className="mt-0.5 hidden text-xs leading-snug text-[var(--color-fg-muted)] sm:block">
              {APP_THESIS}
            </p>
            <a
              href={THEORY_URL}
              className="mt-1 inline-block text-[0.65rem] font-medium tracking-wide text-[var(--color-fg-subtle)] underline-offset-2 hover:text-[var(--color-fg)] hover:underline sm:text-xs"
            >
              Theory landing
            </a>
            <div className="mt-1 flex flex-wrap items-center gap-1 sm:mt-2 sm:gap-1.5">
              <button
                type="button"
                onClick={() => {
                  unlockAudio();
                  setMuted((m) => {
                    const next = !m;
                    setMasterVolume(next ? 0 : 0.9);
                    return next;
                  });
                }}
                aria-label={muted ? "Unmute speakers" : "Mute speakers"}
                aria-pressed={muted}
                className={cn(
                  "inline-flex min-h-10 items-center gap-1 rounded-full border px-2.5 py-1.5 text-[0.68rem] font-medium transition-colors sm:min-h-9",
                  muted
                    ? "border-[var(--color-border)] text-[var(--color-fg-muted)]"
                    : "border-[var(--color-fg)]/30 bg-white/5 text-[var(--color-fg)]",
                )}
              >
                {muted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
                {muted ? "Muted" : "Sound"}
              </button>
              <button
                type="button"
                onClick={() => void toggleResonance()}
                aria-label={resonanceOn ? "Stop live resonance" : "Start live resonance"}
                aria-pressed={resonanceOn}
                title="Listen to the world — optional. Main sound works without this."
                className={cn(
                  "inline-flex min-h-10 items-center gap-1 rounded-full border px-2.5 py-1.5 text-[0.68rem] font-medium transition-colors sm:min-h-9",
                  resonanceOn
                    ? "border-[var(--color-fg)] bg-white/10 text-[var(--color-fg)]"
                    : "border-[var(--color-border)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]",
                )}
              >
                {resonanceOn ? <Radio className="size-3.5" /> : <MicOff className="size-3.5" />}
                Live
              </button>
              <button
                type="button"
                onClick={toggleRecord}
                aria-pressed={recording}
                className={cn(
                  "inline-flex min-h-10 items-center gap-1 rounded-full border px-2.5 py-1.5 text-[0.68rem] font-medium sm:min-h-9",
                  recording
                    ? "border-red-400/50 bg-red-500/15 text-red-200"
                    : "border-[var(--color-border)] text-[var(--color-fg-muted)]",
                )}
              >
                {recording ? <Square className="size-3.5" /> : <CircleDot className="size-3.5" />}
                {recording ? "Stop" : "Rec"}
              </button>
            </div>
            <form
              className="mt-1 flex w-full max-w-[17rem] items-center gap-1 sm:mt-2 sm:max-w-[18rem]"
              onSubmit={(e) => {
                e.preventDefault();
                askChordColor();
              }}
            >
              <input
                type="text"
                value={chordQuery}
                onChange={(e) => {
                  setChordQuery(e.target.value);
                  setChordError(null);
                }}
                placeholder="Chord… Am7"
                aria-label="Ask what color a chord is"
                enterKeyHint="search"
                className="min-h-10 min-w-0 flex-1 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)]/90 px-2.5 text-xs text-[var(--color-fg)] outline-none placeholder:text-[var(--color-fg-subtle)] focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] sm:min-h-9"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
              />
              <button
                type="submit"
                className="min-h-10 shrink-0 rounded-full border border-[var(--color-fg)] bg-[var(--color-fg)] px-2.5 text-[0.68rem] font-medium text-[var(--color-accent-fg)] sm:min-h-9"
              >
                Color
              </button>
            </form>
            <div className="mt-1 flex flex-wrap gap-1">
              {["C", "Am", "G7", "Dm7"].map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => {
                    setChordQuery(ex);
                    askChordColor(ex);
                  }}
                  className="min-h-8 rounded-full border border-[var(--color-border)] px-2 py-0.5 text-[0.62rem] font-medium text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
                >
                  {ex}
                </button>
              ))}
            </div>
            {chordError && (
              <p className="mt-1 max-w-[17rem] text-[0.62rem] leading-snug text-red-300/90">{chordError}</p>
            )}
          </div>
          <div className="pointer-events-auto flex flex-col items-end gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-1.5">
            <Button
              variant={spectacular ? "default" : "secondary"}
              size="sm"
              className="min-h-10 gap-1 px-2.5 sm:min-h-9"
              onClick={() => void enableSpectacular()}
              aria-pressed={spectacular}
            >
              <Sparkles className="size-3.5" />
              <span className="text-[0.68rem] sm:text-sm">{spectacular ? "Calm" : "Boost"}</span>
            </Button>
            <div className="flex gap-1">
              <Button
                variant="secondary"
                size="icon"
                className="size-10"
                aria-label={pureLight ? "Exit pure light" : "Pure light mode"}
                onClick={() => {
                  setPureLight((v) => !v);
                  if (!pureLight) setDockOpen(false);
                }}
              >
                {pureLight ? <X className="size-4" /> : <Maximize2 className="size-4" />}
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="size-10 hidden sm:inline-flex"
                aria-label="Share"
                onClick={() => void shareApp()}
              >
                <Share2 className="size-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="size-10"
                aria-label={`About ${APP_NAME}`}
                onClick={() => setInfoOpen(true)}
              >
                <Info className="size-4" />
              </Button>
            </div>
          </div>
        </header>
      )}

      {shareHint && (
        <div className="pointer-events-none absolute top-16 left-1/2 z-30 -translate-x-1/2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-1.5 text-xs text-[var(--color-fg)] shadow-lg">
          {shareHint}
        </div>
      )}

      {uiHidden && (
        <button
          type="button"
          className="absolute top-[max(0.75rem,env(safe-area-inset-top))] right-3 z-30 min-h-11 min-w-11 rounded-full border border-white/20 bg-black/45 text-white backdrop-blur-sm"
          onClick={() => {
            setPureLight(false);
            setPerfMode(false);
            setDockOpen(false);
            setSpectacular(false);
            setLightShowState(false);
            setLightModeState("off");
            setAmbient(false);
            stopAmbient();
          }}
          aria-label="Exit pure mode"
        >
          <X className="mx-auto size-4" />
        </button>
      )}

      <div className="relative min-h-[50dvh] min-h-0 flex-1">
        <LumenCanvas
          className="absolute inset-0 h-full w-full"
          rotation={rotation}
          quality={lastQuality.current}
          activeRoot={activeRoot}
          activeTones={activeTones}
          expandedSpectrum={expandedSpectrum}
          showGeometry={showGeometry}
          pureLight={pureLight || perfMode}
          pulse={pulse}
          visionMode={visionMode}
          tilt={tilt}
          burstKey={burstKey}
          intensity={intensity}
          resonanceEnergy={resonanceEnergy}
          scalePitches={scaleOverlay}
          multiSelect={multiSelect}
          trailTones={trailTones}
          shaders={shaders}
          onSelectRoot={(p, vel) => {
            unlockAudio();
            // Shift-like multi-select via second tap while holding multi mode if already selected
            if (multiSelect.length > 0 && multiSelect.some((m) => m.id === p.id)) {
              setMultiSelect((ms) => ms.filter((m) => m.id !== p.id));
            } else if (multiSelect.length > 0) {
              const next = [...multiSelect, p].slice(-4);
              setMultiSelect(next);
              if (next.length >= 2) {
                // Form chord from multi-select as simultaneous notes
                setActiveRoot(next[0]!);
                setActiveTones(next);
                lastQuality.current = "note";
                triggerPulse();
                if (!muted) {
                  playChord(
                    next.map((x) => x.midi),
                    { duration: 1.6, velocity: vel, voice },
                  );
                }
                fireLights(next, "note", 1.6);
              } else {
                playRoot(p, quality, vel);
              }
            } else {
              playRoot(p, quality, vel);
            }
          }}
          onRotationChange={setRotation}
        />

        {!uiHidden && (
          <div className="pointer-events-none absolute inset-x-0 bottom-1.5 z-10 flex flex-col items-center gap-1.5 px-2 sm:bottom-3 sm:px-3">
            {theoryOpen && (
              <div
                className="pointer-events-auto max-w-[min(100%,34rem)] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)]/93 px-3 py-2 text-center shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md sm:px-3.5 sm:py-2.5"
                aria-live="polite"
              >
                <p className="line-clamp-2 text-[0.7rem] font-medium tracking-tight text-[var(--color-fg)] sm:text-sm">
                  {statusLine}
                </p>
                {headline && activeRoot && lastQuality.current !== "note" && !chordAnswer && (
                  <p className="mt-0.5 hidden text-[0.65rem] text-[var(--color-fg-subtle)] sm:block sm:text-xs">
                    {headline}
                  </p>
                )}
                <p className="mt-0.5 line-clamp-3 text-[0.62rem] leading-relaxed text-[var(--color-fg-muted)] sm:line-clamp-4 sm:text-xs">
                  {blurb}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="z-20 shrink-0 border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)]/96 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
        <button
          type="button"
          className="flex min-h-11 w-full flex-col items-center justify-center gap-0.5 py-2 text-[var(--color-fg-subtle)]"
          onClick={() => setDockOpen((v) => !v)}
          aria-expanded={dockOpen}
        >
          <span className="inline-flex items-center gap-1.5 text-[0.62rem] font-medium tracking-[0.14em] uppercase">
            {dockOpen ? <ChevronDown className="size-3.5" /> : <ChevronUp className="size-3.5" />}
            {dockOpen ? "Hide controls" : "Show controls"}
          </span>
          {!dockOpen && (
            <span className="text-[0.58rem] normal-case">
              Live · Light · Voice · Journey · Theory
            </span>
          )}
        </button>

        <div
          className={cn(
            "cc-scroll mx-auto max-w-3xl flex-col gap-2 overflow-y-auto overscroll-contain px-3 pb-3 sm:gap-3 sm:px-4",
            dockOpen ? "flex max-h-[40dvh] sm:max-h-[48dvh]" : "hidden",
          )}
        >
          {/* Live Resonance */}
          <div className="flex flex-col gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)]/40 p-2.5">
            <span className="text-[0.6rem] font-medium tracking-[0.14em] text-[var(--color-fg-subtle)] uppercase">
              Live Resonance
            </span>
            <p className="text-[0.62rem] text-[var(--color-fg-subtle)]">
              Optional. Main sound never depends on the mic.
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => void toggleResonance()}
                className={cn(
                  "inline-flex min-h-10 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[0.7rem] font-medium",
                  resonanceOn
                    ? "border-[var(--color-fg)] bg-white/10 text-[var(--color-fg)]"
                    : "border-[var(--color-border)] text-[var(--color-fg-muted)]",
                )}
              >
                {resonanceOn ? <Mic className="size-3.5" /> : <MicOff className="size-3.5" />}
                {resonanceOn ? "Listening" : "Start mic"}
              </button>
              <button
                type="button"
                onClick={() =>
                  setResonanceMode((m) => (m === "listen" ? "listenSynth" : "listen"))
                }
                className="min-h-10 rounded-full border border-[var(--color-border)] px-2.5 py-1.5 text-[0.7rem] text-[var(--color-fg-muted)]"
              >
                {resonanceMode === "listenSynth" ? "Listen + synth" : "Listen only"}
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex min-h-10 items-center gap-1 rounded-full border border-[var(--color-border)] px-2.5 py-1.5 text-[0.7rem] text-[var(--color-fg-muted)]"
              >
                <Upload className="size-3.5" />
                Audio file
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => void onFileAudio(e.target.files?.[0] ?? null)}
              />
            </div>
            <label className="flex items-center gap-2 text-[0.65rem] text-[var(--color-fg-muted)]">
              Sensitivity
              <input
                type="range"
                min={0.15}
                max={0.95}
                step={0.05}
                value={sensitivity}
                onChange={(e) => setSensitivity(Number(e.target.value))}
                className="min-h-10 flex-1 accent-[var(--color-fg)]"
              />
            </label>
          </div>

          {/* Journey */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[0.6rem] font-medium tracking-[0.14em] text-[var(--color-fg-subtle)] uppercase">
              Journey
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={toggleRecord}
                className={cn(
                  "min-h-10 rounded-full border px-2.5 py-1.5 text-[0.7rem] font-medium",
                  recording
                    ? "border-red-400/50 text-red-200"
                    : "border-[var(--color-border)] text-[var(--color-fg-muted)]",
                )}
              >
                {recording ? "Stop rec" : "Record"}
              </button>
              <button
                type="button"
                onClick={playRecordedJourney}
                className="inline-flex min-h-10 items-center gap-1 rounded-full border border-[var(--color-border)] px-2.5 py-1.5 text-[0.7rem] text-[var(--color-fg-muted)]"
              >
                {playingJourney ? <Pause className="size-3" /> : <Play className="size-3" />}
                Playback
              </button>
              <button
                type="button"
                onClick={() => void shareJourneyLink()}
                className="min-h-10 rounded-full border border-[var(--color-border)] px-2.5 py-1.5 text-[0.7rem] text-[var(--color-fg-muted)]"
              >
                Share link
              </button>
              <button
                type="button"
                onClick={exportJson}
                className="min-h-10 rounded-full border border-[var(--color-border)] px-2.5 py-1.5 text-[0.7rem] text-[var(--color-fg-muted)]"
              >
                JSON
              </button>
              <button
                type="button"
                onClick={exportMidi}
                className="min-h-10 rounded-full border border-[var(--color-border)] px-2.5 py-1.5 text-[0.7rem] text-[var(--color-fg-muted)]"
              >
                MIDI
              </button>
              <button
                type="button"
                onClick={() => {
                  clearJourney();
                  setJourneyCount(0);
                  setRecording(false);
                }}
                className="min-h-10 rounded-full border border-[var(--color-border)] px-2.5 py-1.5 text-[0.7rem] text-[var(--color-fg-muted)]"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setPerfMode((v) => !v)}
                className={cn(
                  "min-h-10 rounded-full border px-2.5 py-1.5 text-[0.7rem]",
                  perfMode
                    ? "border-[var(--color-fg)] text-[var(--color-fg)]"
                    : "border-[var(--color-border)] text-[var(--color-fg-muted)]",
                )}
              >
                Performance
              </button>
            </div>
          </div>

          {/* Light */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="w-full text-[0.6rem] font-medium tracking-[0.14em] text-[var(--color-fg-subtle)] uppercase sm:w-auto">
              Light
            </span>
            {(
              [
                ["off", "Off"],
                ["screen", "Screen beam"],
                ["torch", "Flash"],
                ["hybrid", "Hybrid"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                disabled={id === "torch" || id === "hybrid" ? torchOk === false : false}
                onClick={() => setLightModeState(id)}
                className={cn(
                  "min-h-10 rounded-full border px-2.5 py-1.5 text-[0.7rem] font-medium sm:min-h-9",
                  lightMode === id
                    ? "border-[var(--color-fg)] bg-[var(--color-fg)] text-[var(--color-accent-fg)]"
                    : "border-[var(--color-border)] text-[var(--color-fg-muted)]",
                  (id === "torch" || id === "hybrid") && torchOk === false && "opacity-40",
                )}
              >
                {id === "torch" || id === "hybrid" ? (
                  <span className="inline-flex items-center gap-1">
                    <Flashlight className="size-3" />
                    {label}
                  </span>
                ) : (
                  label
                )}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setLightShowState((v) => !v)}
              className={cn(
                "min-h-10 rounded-full border px-2.5 py-1.5 text-[0.7rem] font-medium sm:min-h-9",
                lightShow
                  ? "border-[var(--color-fg)] bg-white/10 text-[var(--color-fg)]"
                  : "border-[var(--color-border)] text-[var(--color-fg-muted)]",
              )}
            >
              Light show
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[0.6rem] font-medium tracking-[0.14em] text-[var(--color-fg-subtle)] uppercase">
              Voice
            </span>
            <div className="flex flex-wrap gap-1.5">
              {VOICES.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVoice(v)}
                  className={cn(
                    "min-h-10 rounded-full border px-2.5 py-1.5 text-[0.7rem] font-medium sm:min-h-9",
                    voice === v
                      ? "border-[var(--color-fg)] bg-[var(--color-fg)] text-[var(--color-accent-fg)]"
                      : "border-[var(--color-border)] text-[var(--color-fg-muted)]",
                  )}
                >
                  {VOICE_LABELS[v]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[0.6rem] font-medium tracking-[0.14em] text-[var(--color-fg-subtle)] uppercase">
              Voicing
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUALITIES.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => {
                    setQuality(q);
                    if (activeRoot) playRoot(activeRoot, q);
                  }}
                  className={cn(
                    "min-h-10 rounded-full border px-2.5 py-1.5 text-[0.7rem] font-medium sm:min-h-9",
                    quality === q
                      ? "border-[var(--color-fg)] bg-[var(--color-fg)] text-[var(--color-accent-fg)]"
                      : "border-[var(--color-border)] text-[var(--color-fg-muted)]",
                  )}
                >
                  {QUALITY_LABELS[q]}
                </button>
              ))}
            </div>
          </div>

          {/* Scales */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[0.6rem] font-medium tracking-[0.14em] text-[var(--color-fg-subtle)] uppercase">
              Scale overlay
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setScaleId("off")}
                className={cn(
                  "min-h-9 rounded-full border px-2.5 py-1.5 text-[0.7rem]",
                  scaleId === "off"
                    ? "border-[var(--color-fg)] text-[var(--color-fg)]"
                    : "border-[var(--color-border)] text-[var(--color-fg-muted)]",
                )}
              >
                Off
              </button>
              {SCALES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setScaleId(s.id)}
                  className={cn(
                    "min-h-9 rounded-full border px-2.5 py-1.5 text-[0.7rem]",
                    scaleId === s.id
                      ? "border-[var(--color-fg)] text-[var(--color-fg)]"
                      : "border-[var(--color-border)] text-[var(--color-fg-muted)]",
                  )}
                >
                  {s.name}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                setMultiSelect((m) => (m.length ? [] : activeRoot ? [activeRoot] : []))
              }
              className={cn(
                "min-h-9 self-start rounded-full border px-2.5 py-1.5 text-[0.7rem]",
                multiSelect.length
                  ? "border-[var(--color-fg)] text-[var(--color-fg)]"
                  : "border-[var(--color-border)] text-[var(--color-fg-muted)]",
              )}
            >
              Multi-select {multiSelect.length ? `(${multiSelect.length})` : "off"}
            </button>
          </div>

          {/* Suggestions */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[0.6rem] font-medium tracking-[0.14em] text-[var(--color-fg-subtle)] uppercase">
              Suggest
            </span>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  title={s.blurb}
                  onClick={() => runMood(s.mood)}
                  className="min-h-9 rounded-full border border-[var(--color-border)] px-2.5 py-1.5 text-[0.7rem] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[0.6rem] font-medium tracking-[0.14em] text-[var(--color-fg-subtle)] uppercase">
                Progressions
              </span>
              <label className="flex items-center gap-2 text-xs text-[var(--color-fg-muted)]">
                Key
                <select
                  value={keyRoot.id}
                  onChange={(e) => {
                    const p = FIFTHS.find((x) => x.id === e.target.value);
                    if (p) setKeyRoot(p);
                  }}
                  className="min-h-10 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-2 py-1.5 text-xs text-[var(--color-fg)] outline-none sm:min-h-9"
                >
                  {FIFTHS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label} · {p.colorName}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PROGRESSIONS.map((p) => {
                const active = playingProgression === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => void playProgression(p.id)}
                    className={cn(
                      "inline-flex min-h-10 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[0.7rem] font-medium sm:min-h-9",
                      active
                        ? "border-[var(--color-fg)] bg-white/10 text-[var(--color-fg)]"
                        : "border-[var(--color-border)] text-[var(--color-fg-muted)]",
                    )}
                  >
                    {active ? <Pause className="size-3" /> : <Play className="size-3" />}
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1 border-t border-[var(--color-border)] pt-2">
            <Button variant="ghost" size="sm" onClick={() => setExpandedSpectrum((v) => !v)} className="gap-1 min-h-10">
              {expandedSpectrum ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
              UV/IR
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowGeometry((v) => !v)} className="gap-1 min-h-10">
              <Waves className="size-3.5" />
              Geometry
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShaders((v) => !v)}
              className="gap-1 min-h-10"
              aria-pressed={shaders}
            >
              Shaders {shaders ? "on" : "off"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setAmbient((v) => {
                  const next = !v;
                  if (next && activeTones.length) {
                    startAmbient(
                      activeTones.map((t) => t.midi),
                      0.07,
                    );
                  } else stopAmbient();
                  return next;
                });
              }}
              className="gap-1 min-h-10"
            >
              <Moon className="size-3.5" />
              Ambient
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setTheoryOpen((v) => !v)} className="gap-1 min-h-10">
              Theory
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setVisionMode((m) =>
                  m === "full" ? "deuteranopia" : m === "deuteranopia" ? "luminance" : "full",
                )
              }
              className="gap-1 min-h-10"
            >
              Vision: {visionMode === "full" ? "full" : visionMode === "luminance" ? "luma" : "CVD"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setHaptics((v) => !v)} className="gap-1 min-h-10">
              Haptics {haptics ? "on" : "off"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setRotation(0)} className="gap-1 min-h-10">
              <RotateCcw className="size-3.5" />
              Reset
            </Button>
            <Button variant="ghost" size="sm" onClick={exportPng} className="gap-1 min-h-10">
              <Download className="size-3.5" />
              PNG
            </Button>
          </div>
        </div>
      </div>

      {infoOpen && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/65 p-3 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label={`About ${APP_NAME} ${APP_INSTRUMENT}`}
          onClick={() => setInfoOpen(false)}
        >
          <div
            className="max-h-[min(85dvh,40rem)] w-full max-w-md overflow-y-auto rounded-[var(--radius-xl)] border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[0.65rem] font-medium tracking-[0.18em] text-[var(--color-fg-subtle)] uppercase">
              {APP_NAME} {APP_VERSION}
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight">{APP_INSTRUMENT}</h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-[var(--color-fg-muted)]">
              <p>
                <strong className="font-medium text-[var(--color-fg)]">{APP_THESIS}</strong> One
                tone, one wavelength. Mix either, and the Circle of Fifths is the color wheel.
              </p>
              <p>
                <strong className="font-medium text-[var(--color-fg)]">Why this color?</strong> One
                step on the Circle of Fifths is 30° of hue. C is crimson by design, not by law.
                Opposite notes are tritones and complementary colors.
              </p>
              <p>
                <strong className="font-medium text-[var(--color-fg)]">Live Resonance</strong>{" "}
                listens (YIN pitch + chroma) and paints the wheel — optional, never required for
                sound.
              </p>
              <p>
                Record a <strong className="font-medium text-[var(--color-fg)]">Journey</strong>,
                share a deep link, export JSON or MIDI. Scale overlays and multi-select are on the
                wheel.
              </p>
              <p className="text-xs text-[var(--color-fg-subtle)]">
                A nod to Newton’s color circle and Scriabin’s color organ — a designed instrument,
                not doctrine.
              </p>
            </div>
            <div className="mt-5 flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => void shareApp()}>
                Share
              </Button>
              <Button className="flex-1" onClick={() => setInfoOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
