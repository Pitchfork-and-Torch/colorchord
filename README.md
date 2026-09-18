# ColorChord 2.2.0 - Living Spectrum

A dual harmonic instrument: the **Circle of Fifths** mapped to the **visible spectrum**. One step clockwise is a perfect fifth in pitch and ~30 deg of hue. Opposite notes are tritones and complementary colors. Additive mixtures of note hues form living chord colors.

> *A color is a chord · living light*

## Fifths -> hue mapping

| Fifths index | Note | Hue | Color name |
|---:|---|---:|---|
| 0 | C | 0° | Crimson |
| 1 | G | 30° | Vermilion |
| 2 | D | 60° | Amber |
| 3 | A | 90° | Chartreuse |
| 4 | E | 120° | Emerald |
| 5 | B | 150° | Spring |
| 6 | F♯/G♭ | 180° | Cyan |
| 7 | D♭/C♯ | 210° | Azure |
| 8 | A♭/G♯ | 240° | Sapphire |
| 9 | E♭/D♯ | 270° | Violet |
| 10 | B♭/A♯ | 300° | Magenta |
| 11 | F | 330° | Rose |

Chord colors = circular mean of tone hues (additive-style mix) with span-based naming (close-hue glow -> near-white).

## Features

- **Play** - tap notes, voicings, voices (pure / pad / organ / piano / strings)
- **Ask** - type a chord symbol (Am7, G7, F#maj7) for colors + sound
- **Live Resonance** - YIN pitch (50-2000 Hz tau band) + chroma energies via `frequencyOf` from mic or audio file (optional; never required for sound)
- **Journey** - record / playback / share deep-link / export JSON and MIDI (480 PPQ)
- **Geometry** - scale overlays, multi-select, voice-leading trails, UV/IR rings
- **Light** - screen beam, flash, hybrid, light show (calm by default)
- **Suggest** - local mood heuristics (resolve, tension, melancholy)
- **Vision** - full / CVD-friendly / luminance modes
- **PWA** - installable offline shell

## API

`GET /api/chord-color?q=Am7` -> JSON color mapping for tools and Grok.

Play: https://play-colorchord.jonbailey.xyz/
Landing: https://colorchord.jonbailey.xyz/

## Stack

TanStack Start, React 19, Vite, Tailwind v4, Web Audio API, Canvas 2D, Vibration API.

## Local

```bash
npm run dev      # 0.0.0.0:8080
npm run build
npm run typecheck
```

Core experience is pure client-side. No login required.
