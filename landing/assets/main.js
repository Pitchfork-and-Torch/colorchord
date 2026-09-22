import {
  FIFTHS,
  QUALITIES,
  chordPitches,
  complementaryPitch,
  neighboringFifths,
  mixHue,
  mixHuesCss,
  chordColorName,
  chordHueSpan,
  parseChordSymbol,
  hsl,
} from "./theory.js?v=1.3.1";
import { unlockAudio, playChord } from "./audio.js";
import { createColorChordWheel } from "./wheel3d.js";
import { createCosmos } from "./cosmos.js";
import { createBiomeEngine } from "./biome-engine.js?v=1.3.0";
import { biomeByPitchId, biomeHoverLine } from "./biomes-data.js?v=1.3.0";

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const reduced =
  typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

const ui = {
  host: $("#wheel-stage"),
  note: $("#active-note"),
  color: $("#active-color"),
  mix: $("#mix-swatch"),
  mixLabel: $("#mix-label"),
  coreLabel: $("#core-color-label"),
  tones: $("#tone-list"),
  span: $("#hue-span"),
  complement: $("#complement-line"),
  neighbors: $("#neighbors-line"),
  quality: $("#quality-select"),
  ask: $("#ask-input"),
  askBtn: $("#ask-btn"),
  askForm: $("#ask-form"),
  askOut: $("#ask-output"),
  tableBody: $("#map-table-body"),
  soundToggle: $("#sound-toggle"),
  biomesToggle: $("#biomes-toggle"),
  captureBiome: $("#capture-biome"),
  journeyBiome: $("#journey-biome"),
  biomeReadout: $("#biome-readout"),
  cosmos: $("#cosmos-bg"),
  siteShell: $("#site-shell"),
};

let soundOn = true;
let biomesOn = false;
let wheel = null;
let cosmos = null;
let biomes = null;

function pushChordLight(root, tones, quality, { pulse = false } = {}) {
  if (!cosmos) return;
  const hues = tones.map((t) => t.hue);
  const mix = mixHue(tones);
  const span = chordHueSpan(tones);
  // Wider chords = more energy in the void; single notes = pure beam
  const energy = quality === "note" ? 0.42 : Math.min(1, 0.48 + tones.length * 0.1 + span / 360);
  if (ui.host) cosmos.setBeamFromElement(ui.host);
  cosmos.setChordLight({
    mixHue: mix,
    hues: hues.length ? hues : [root?.hue ?? 0],
    energy,
    pulse: pulse ? (quality === "note" ? 0.55 : 0.9) : false,
  });
  // CSS accent follows mix for glass highlights
  document.documentElement.style.setProperty("--chord-hue", String(mix));
  document.documentElement.style.setProperty(
    "--chord-glow",
    `hsla(${mix} 85% 55% / 0.22)`
  );
}

function formatTones(tones) {
  return tones.map((t) => t.label).join(" · ");
}

function updatePanel(root, tones, quality) {
  if (!root) return;
  ui.note.textContent = root.label + (quality !== "note" ? ` ${QUALITIES[quality]?.label ?? quality}` : "");
  ui.color.textContent = root.colorName;
  ui.color.style.color = hsl(root.hue, 85, 68);
  const mix = mixHuesCss(tones);
  const colorName = chordColorName(tones);
  ui.mix.style.background = mix;
  ui.mixLabel.textContent = colorName;
  if (ui.coreLabel) {
    ui.coreLabel.textContent = colorName;
    // Tint label border with mix for legibility against core glow
    ui.coreLabel.style.borderColor = mixHuesCss(tones, 0.55);
    ui.coreLabel.style.boxShadow = `0 0 18px ${mixHuesCss(tones, 0.35)}`;
  }
  ui.tones.textContent = formatTones(tones);
  ui.span.textContent = `${Math.round(chordHueSpan(tones))}\u00B0 hue span`;
  const comp = complementaryPitch(root);
  ui.complement.innerHTML = `Tritone / complement: <strong style="color:${hsl(comp.hue, 85, 68)}">${comp.label}</strong> (${comp.colorName})`;
  const n = neighboringFifths(root);
  ui.neighbors.innerHTML = `Neighbors: <strong style="color:${hsl(n.subdominant.hue, 85, 68)}">${n.subdominant.label}</strong> \u2190 root \u2192 <strong style="color:${hsl(n.dominant.hue, 85, 68)}">${n.dominant.label}</strong>`;

  // Table highlight
  $$("[data-note-row]").forEach((row) => {
    row.classList.toggle("is-active", row.dataset.noteRow === root.id);
    row.classList.toggle("is-tone", tones.some((t) => t.id === row.dataset.noteRow));
  });

  // Chip highlights
  $$("[data-note-chip]").forEach((chip) => {
    const on = tones.some((t) => t.id === chip.dataset.noteChip);
    const isRoot = chip.dataset.noteChip === root.id;
    chip.classList.toggle("is-active", on);
    chip.classList.toggle("is-root", isRoot);
  });
}

function pushBiomes(root, tones, quality) {
  if (!biomes || !biomesOn) return;
  biomes.setChord(root, tones, quality);
}

function onSelect(root, tones, quality) {
  updatePanel(root, tones, quality);
  pushChordLight(root, tones, quality, { pulse: true });
  pushBiomes(root, tones, quality);
  if (soundOn) {
    unlockAudio();
    playChord(tones, quality === "note" ? 1.2 : 1.85);
  }
}

function buildMapTable() {
  if (!ui.tableBody) return;
  ui.tableBody.innerHTML = FIFTHS.map((p) => {
    const biome = biomeByPitchId(p.id);
    const title = biome ? biomeHoverLine(biome) : `${p.label} · ${p.colorName}`;
    return `
    <tr data-note-row="${p.id}" tabindex="0" role="button" aria-label="Select ${p.label}" title="${title.replace(/"/g, "&quot;")}">
      <td><span class="swatch" style="--h:${p.hue}"></span></td>
      <td class="mono">${p.fifthsIndex}</td>
      <td class="note-cell">${p.label}${p.alt ? ` <span class="muted">/ ${p.alt}</span>` : ""}${biome ? ` <span class="biome-chip muted">${biome.name}</span>` : ""}</td>
      <td class="mono">${p.hue}\u00B0</td>
      <td>${p.colorName}</td>
      <td class="mono muted">${p.wavelengthNm} nm</td>
    </tr>`;
  }).join("");

  ui.tableBody.addEventListener("click", (e) => {
    const row = e.target.closest("[data-note-row]");
    if (!row || !wheel) return;
    wheel.setRootById(row.dataset.noteRow);
  });
  ui.tableBody.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const row = e.target.closest("[data-note-row]");
    if (!row || !wheel) return;
    e.preventDefault();
    wheel.setRootById(row.dataset.noteRow);
  });
}

function buildNoteChips() {
  const host = $("#note-chips");
  if (!host) return;
  host.innerHTML = FIFTHS.map(
    (p) =>
      `<button type="button" class="note-chip" data-note-chip="${p.id}" style="--h:${p.hue}" aria-label="Play ${p.label}">${p.label}</button>`
  ).join("");
  host.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-note-chip]");
    if (!btn || !wheel) return;
    wheel.setRootById(btn.dataset.noteChip);
  });
}

function buildQualityButtons() {
  const host = $("#quality-bar");
  if (!host) return;
  const keys = ["note", "major", "minor", "dom7", "maj7", "min7", "sus4", "dim", "aug"];
  host.innerHTML = keys
    .map(
      (k) =>
        `<button type="button" class="q-btn${k === "major" ? " is-active" : ""}" data-q="${k}" aria-pressed="${k === "major" ? "true" : "false"}">${QUALITIES[k].label}</button>`
    )
    .join("");
  host.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-q]");
    if (!btn || !wheel) return;
    setActiveQuality(btn.dataset.q);
    wheel.setQuality(btn.dataset.q);
  });
}

function setActiveQuality(q) {
  $$(".q-btn").forEach((b) => {
    const on = b.dataset.q === q;
    b.classList.toggle("is-active", on);
    b.setAttribute("aria-pressed", on ? "true" : "false");
  });
}

function wireAsk() {
  const run = () => {
    const raw = (ui.ask?.value || "").trim();
    if (!raw) {
      ui.askOut.textContent = "Try Am7, G7, F#maj7, or Eb.";
      return;
    }
    const parsed = parseChordSymbol(raw);
    if (!parsed) {
      ui.askOut.textContent = "Could not parse that chord symbol.";
      return;
    }
    if (wheel) {
      setActiveQuality(parsed.quality);
      wheel.setChord(parsed.root.id, parsed.quality);
    } else {
      const tones = chordPitches(parsed.root, parsed.quality);
      updatePanel(parsed.root, tones, parsed.quality);
      pushChordLight(parsed.root, tones, parsed.quality, { pulse: true });
      pushBiomes(parsed.root, tones, parsed.quality);
      if (soundOn) {
        unlockAudio();
        playChord(tones, parsed.quality === "note" ? 1.2 : 1.85);
      }
    }
    const tones = chordPitches(parsed.root, parsed.quality);
    ui.askOut.innerHTML = `<strong>${raw}</strong> \u2192 ${formatTones(tones)} \u00B7 <span style="color:${mixHuesCss(tones)}">${chordColorName(tones)}</span>`;
    // Dismiss keyboard on mobile after submit
    ui.ask?.blur();
  };
  ui.askForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    unlockAudio();
    run();
  });
}

function wireSound() {
  ui.soundToggle?.addEventListener("click", () => {
    soundOn = !soundOn;
    ui.soundToggle.setAttribute("aria-pressed", String(soundOn));
    const label = ui.soundToggle.querySelector(".sound-label");
    if (label) label.textContent = soundOn ? "Sound on" : "Sound off";
    else ui.soundToggle.textContent = soundOn ? "Sound on" : "Sound off";
    ui.soundToggle.classList.toggle("is-off", !soundOn);
    if (soundOn) unlockAudio();
  });
}

function setBiomeExtrasVisible(on) {
  if (ui.captureBiome) ui.captureBiome.hidden = !on;
  if (ui.journeyBiome) ui.journeyBiome.hidden = !on;
  if (ui.biomeReadout) {
    ui.biomeReadout.hidden = !on;
    if (!on) ui.biomeReadout.textContent = "";
  }
}

function wireBiomes() {
  const setLabel = (text) => {
    if (!ui.biomeReadout) return;
    if (!text) {
      ui.biomeReadout.textContent = "";
      return;
    }
    // First line title, rest myth
    const lines = String(text).split("\n");
    ui.biomeReadout.innerHTML = `<strong>${lines[0] || ""}</strong>${lines[1] ? `<span>${lines[1]}</span>` : ""}`;
  };

  if (ui.host) {
    try {
      biomes = createBiomeEngine(ui.host, {
        reducedMotion: reduced,
        onLabel: setLabel,
      });
    } catch (err) {
      console.warn("Living Biomes unavailable", err);
      biomes = null;
    }
  }

  ui.biomesToggle?.addEventListener("click", () => {
    if (!biomes) {
      if (ui.biomeReadout) {
        ui.biomeReadout.hidden = false;
        ui.biomeReadout.textContent = "Living Biomes need a canvas this browser can draw.";
      }
      return;
    }
    biomesOn = !biomesOn;
    ui.biomesToggle.setAttribute("aria-pressed", String(biomesOn));
    ui.biomesToggle.classList.toggle("is-on", biomesOn);
    const label = ui.biomesToggle.querySelector(".biomes-label");
    if (label) label.textContent = biomesOn ? "Living Biomes" : "Awaken Biomes";
    setBiomeExtrasVisible(biomesOn);
    biomes.awaken(biomesOn);
    if (biomesOn) {
      // Seed from current wheel / default C major
      if (wheel) {
        const s = wheel.getState();
        biomes.setChord(s.root, s.tones, s.quality);
        if (s.rotY != null) biomes.setOrbit(s.rotY);
      } else {
        const root = FIFTHS[0];
        biomes.setChord(root, chordPitches(root, "major"), "major");
      }
      // Gentle enter zoom
      if (!reduced) biomes.enterBiome(true);
      setTimeout(() => biomes?.setZoom(1), 1600);
    }
  });

  ui.captureBiome?.addEventListener("click", () => {
    if (!biomes || !biomesOn) return;
    biomes.downloadCapture();
  });

  ui.journeyBiome?.addEventListener("click", () => {
    if (!biomes || !biomesOn) return;
    if (biomes.isRecording()) {
      biomes.stopJourney();
      ui.journeyBiome.setAttribute("aria-pressed", "false");
      ui.journeyBiome.classList.remove("is-recording");
      const jl = ui.journeyBiome.querySelector(".journey-label");
      if (jl) jl.textContent = "Journey";
      // Export JSON after stop (lightweight shareable sequence)
      biomes.downloadJourneyJson();
    } else {
      biomes.startJourney();
      ui.journeyBiome.setAttribute("aria-pressed", "true");
      ui.journeyBiome.classList.add("is-recording");
      const jl = ui.journeyBiome.querySelector(".journey-label");
      if (jl) jl.textContent = "Stop + export";
    }
  });
}

function wireNav() {
  // Smooth scroll for in-page anchors
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    });
  });

  // Header elevate on scroll
  const header = $(".site-header");
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

function wireReveal() {
  if (reduced) {
    $$(".reveal").forEach((el) => el.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const ent of entries) {
        if (ent.isIntersecting) {
          ent.target.classList.add("is-in");
          io.unobserve(ent.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  $$(".reveal").forEach((el) => io.observe(el));
}

function boot() {
  buildMapTable();
  buildNoteChips();
  buildQualityButtons();
  wireAsk();
  wireSound();
  wireBiomes();
  wireNav();
  wireReveal();

  // Neon void cosmos backdrop (pixel starfield, reacts to chord light)
  if (ui.cosmos) {
    try {
      cosmos = createCosmos(ui.cosmos, { reducedMotion: reduced });
      // Keep beam aligned to wheel when layout settles
      window.addEventListener(
        "resize",
        () => {
          if (ui.host && cosmos) cosmos.setBeamFromElement(ui.host);
        },
        { passive: true }
      );
    } catch (err) {
      console.warn("Cosmos backdrop unavailable", err);
    }
  }

  if (!ui.host) return;

  // Static poster fallback if WebGL fails
  try {
    wheel = createColorChordWheel(ui.host, {
      reducedMotion: reduced,
      onSelect,
      onOrbit(rotZ) {
        if (biomes && biomesOn) biomes.setOrbit(rotZ);
      },
    });
  } catch (err) {
    console.error(err);
    // Preserve biome canvas if present; only show fallback notice
    const existingBiome = ui.host.querySelector(".biome-canvas");
    ui.host.innerHTML = `<div class="wheel-fallback" role="img" aria-label="ColorChord spectrum wheel">
      <div class="fallback-ring"></div>
      <p>3D wheel needs WebGL. The mapping table below still works.${existingBiome ? " Living Biomes canvas may still run." : ""}</p>
    </div>`;
    if (existingBiome) ui.host.insertBefore(existingBiome, ui.host.firstChild);
    // Seed panel from C major
    const root = FIFTHS[0];
    const tones = chordPitches(root, "major");
    updatePanel(root, tones, "major");
    pushChordLight(root, tones, "major", { pulse: false });
    pushBiomes(root, tones, "major");
  }

  // First paint panel without forcing audio until gesture
  if (wheel) {
    const { root, tones, quality } = wheel.getState();
    updatePanel(root, tones, quality);
    pushChordLight(root, tones, quality, { pulse: false });
    // After layout, lock beam to wheel center
    requestAnimationFrame(() => {
      if (cosmos && ui.host) cosmos.setBeamFromElement(ui.host);
    });
  }

  // Unlock audio on first meaningful interaction
  const unlockOnce = () => {
    unlockAudio();
    window.removeEventListener("pointerdown", unlockOnce);
    window.removeEventListener("keydown", unlockOnce);
  };
  window.addEventListener("pointerdown", unlockOnce, { once: true });
  window.addEventListener("keydown", unlockOnce, { once: true });

  // Keyboard: left/right cycle notes
  window.addEventListener("keydown", (e) => {
    if (!wheel) return;
    if (e.target && ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const s = wheel.getState();
      wheel.setRootIndex(s.root.fifthsIndex + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const s = wheel.getState();
      wheel.setRootIndex(s.root.fifthsIndex - 1);
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
