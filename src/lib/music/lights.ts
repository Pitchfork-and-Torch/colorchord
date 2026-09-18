/** Device torch + screen light-beam engine */

export type LightMode = "off" | "screen" | "torch" | "hybrid";

type TorchTrack = MediaStreamTrack & {
  getCapabilities?: () => { torch?: boolean };
  applyConstraints: (c: MediaTrackConstraints) => Promise<void>;
};

let stream: MediaStream | null = null;
let torchTrack: TorchTrack | null = null;
let torchSupported: boolean | null = null;
let torchOn = false;
let lightShow = false;
let mode: LightMode = "off";

let beamEl: HTMLDivElement | null = null;
let beamIntensity = 0;
let beamColor = "hsl(0 0% 100%)";
let anim: number | null = null;
let envelope = { attack: 0.04, sustain: 0.85, release: 0.45, hold: 1.2, peak: 0.92 };
let envStart = 0;
let envActive = false;

export function getLightMode() {
  return mode;
}

export function setLightMode(m: LightMode) {
  mode = m;
  if (m === "off") {
    void setTorch(false);
    setBeamInstant(0);
  }
}

export function setLightShow(on: boolean) {
  lightShow = on;
  if (!on && !envActive) {
    void setTorch(false);
    setBeamInstant(0);
  }
}

export function isLightShow() {
  return lightShow;
}

export async function detectTorchSupport(): Promise<boolean> {
  if (torchSupported != null) return torchSupported;
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    torchSupported = false;
    return false;
  }
  try {
    // Probe without keeping stream if unsupported
    const s = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false,
    });
    const track = s.getVideoTracks()[0] as TorchTrack | undefined;
    const caps = track?.getCapabilities?.();
    const ok = Boolean(caps && "torch" in caps && caps.torch);
    s.getTracks().forEach((t) => t.stop());
    torchSupported = ok;
    return ok;
  } catch {
    torchSupported = false;
    return false;
  }
}

async function ensureTorchTrack(): Promise<TorchTrack | null> {
  if (torchTrack && torchTrack.readyState === "live") return torchTrack;
  if (!(await detectTorchSupport())) return null;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false,
    });
    torchTrack = (stream.getVideoTracks()[0] as TorchTrack) ?? null;
    return torchTrack;
  } catch {
    torchSupported = false;
    return null;
  }
}

export async function setTorch(on: boolean) {
  if (mode !== "torch" && mode !== "hybrid" && on) return;
  if (!on && !torchOn) return;
  const track = await ensureTorchTrack();
  if (!track) return;
  try {
    await track.applyConstraints({ advanced: [{ torch: on } as MediaTrackConstraintSet] });
    torchOn = on;
  } catch {
    // Some browsers require continuous constraint retry
    try {
      await track.applyConstraints({ advanced: [{ torch: on } as MediaTrackConstraintSet] });
      torchOn = on;
    } catch {
      torchSupported = false;
    }
  }
}

export function releaseTorch() {
  void setTorch(false);
  stream?.getTracks().forEach((t) => t.stop());
  stream = null;
  torchTrack = null;
}

function ensureBeamEl() {
  if (typeof document === "undefined") return null;
  if (beamEl && document.body.contains(beamEl)) return beamEl;
  beamEl = document.createElement("div");
  beamEl.id = "color-chord-beam";
  beamEl.setAttribute("aria-hidden", "true");
  Object.assign(beamEl.style, {
    position: "fixed",
    inset: "0",
    zIndex: "50",
    pointerEvents: "none",
    opacity: "0",
    transition: "opacity 40ms linear",
    background: beamColor,
    mixBlendMode: "normal",
  });
  document.body.appendChild(beamEl);
  return beamEl;
}

function setBeamInstant(intensity: number) {
  beamIntensity = Math.max(0, Math.min(1, intensity));
  const el = ensureBeamEl();
  if (!el) return;
  el.style.background = beamColor;
  el.style.opacity = String(beamIntensity);
  if (beamIntensity <= 0.001 && !lightShow) {
    el.style.opacity = "0";
  }
}

export function setBeamColor(cssColor: string) {
  beamColor = cssColor;
  if (beamEl) beamEl.style.background = cssColor;
}

function envLevel(now: number) {
  const t = (now - envStart) / 1000;
  const { attack, sustain, release, hold, peak } = envelope;
  if (t < 0) return 0;
  let level = 0;
  if (t < attack) level = t / attack;
  else if (t < attack + hold) level = sustain + (1 - sustain) * Math.exp(-(t - attack) * 2);
  else {
    const rt = t - attack - hold;
    if (rt < release) level = sustain * (1 - rt / release);
    else level = 0;
  }
  return level * peak;
}

function tick() {
  const now = performance.now();
  let level = envActive ? envLevel(now) : lightShow ? Math.max(beamIntensity * 0.35, 0.08) : 0;

  // Soft pulse while light show holds a chord color
  if (lightShow && !envActive) {
    level = 0.38 + 0.1 * Math.sin(now / 450);
  }

  if (mode === "screen" || mode === "hybrid") {
    setBeamInstant(level);
  } else if (mode === "off") {
    setBeamInstant(0);
  }

  if (mode === "torch" || mode === "hybrid") {
    const should = level > 0.35;
    if (should !== torchOn) void setTorch(should);
  }

  if (envActive && envLevel(now) <= 0 && now - envStart > 50) {
    envActive = false;
    if (!lightShow) {
      void setTorch(false);
      if (mode !== "off") setBeamInstant(0);
    }
  }

  anim = requestAnimationFrame(tick);
}

export function startLightEngine() {
  if (anim != null) return;
  ensureBeamEl();
  anim = requestAnimationFrame(tick);
}

export function stopLightEngine() {
  if (anim != null) cancelAnimationFrame(anim);
  anim = null;
  envActive = false;
  setBeamInstant(0);
  releaseTorch();
}

/** Fire a light envelope synced to audio attack/sustain. */
export function pulseLight(
  cssColor: string,
  opts: { attack?: number; hold?: number; release?: number; sustain?: number; peak?: number } = {},
) {
  if (mode === "off") return;
  startLightEngine();
  setBeamColor(cssColor);
  envelope = {
    attack: opts.attack ?? 0.04,
    hold: opts.hold ?? 1.0,
    release: opts.release ?? 0.45,
    sustain: opts.sustain ?? 0.82,
    peak: opts.peak ?? 0.92,
  };
  const peak = opts.peak ?? 0.92;
  envStart = performance.now();
  envActive = true;

  if (mode === "screen" || mode === "hybrid") setBeamInstant(peak);
  if (mode === "torch" || mode === "hybrid") void setTorch(true);
}

export function holdLight(cssColor: string, intensity = 0.7) {
  if (mode === "off") return;
  startLightEngine();
  setBeamColor(cssColor);
  lightShow = true;
  setBeamInstant(intensity);
  if (mode === "torch" || mode === "hybrid") void setTorch(true);
}

export function getTorchSupported() {
  return torchSupported;
}
