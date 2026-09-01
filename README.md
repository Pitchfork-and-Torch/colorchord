# ColorChord

**Color is to light as chord is to sound.** One tone, one wavelength. Mix either, and the Circle of Fifths is the color wheel.

Version **2.1.1** — the Living Spectrum instrument (this repo). Patch over the 2.1.0 copy already on the theory landing.

- Instrument: https://play-colorchord.jonbailey.xyz/
- Theory landing: https://colorchord.jonbailey.xyz/

## What it is

A browser instrument that puts the **Circle of Fifths** and the **hue wheel** on one clock face. One step clockwise is a perfect fifth in pitch and 30° of hue. Opposite notes are tritones and complementary colors. A chord’s color is the circular mean of its tone hues; wide spans name toward white.

This is a designed mapping and an artistic-scientific contention — not a physical law. C = crimson (hue 0°) is a design choice. Relative fifths steps are fixed.

The playable wheel does not require sign-in. Optional account buttons exist; they are not part of the instrument.

## What it is not

- Not a DAW, tuner, or notation editor
- Not a scientific proof that harmony “is” color
- Not an AI model — mood suggestions are local heuristics
- Mic / file resonance is optional and never required to make sound

## Fifths → hue mapping

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

## What you can do here

- **Play** — tap notes and voicings; five Web Audio voices (pure / pad / organ / piano / strings)
- **Ask** — type a chord symbol (`Am7`, `G7`, `F#maj7`…) for colors plus sound
- **Live Resonance** — optional YIN pitch + chroma from the mic or an audio file
- **Journey** — record, play back, share a deep link, export JSON or MIDI
- **Geometry** — scale overlays, multi-select, voice-leading trails, UV/IR rings
- **Light** — screen beam, flash (where the browser allows), hybrid, light show (calm by default)
- **Suggest** — local mood heuristics (resolve, tension, melancholy…)
- **Vision** — full, deuteranopia / protanopia-oriented, or luminance
- **PWA** — installable same-origin offline shell for the app chrome

## FAQ

### What is ColorChord?

A dual map of harmony geometry onto color. This repository is the Living Spectrum instrument. The essay and 3D wheel live on the [theory landing](https://colorchord.jonbailey.xyz/).

### Color is to light as chord is to sound — what does that mean?

A single tone is treated like a single wavelength seed. Simultaneous tones (a chord) are treated like mixed light (a color). The fifths ring and the hue circle share one face so a tritone sits opposite its complement.

### Is the mapping unique or scientific law?

No. It is a designed instrument. Fifths steps are fixed; rotating C onto crimson is a choice, not a discovery.

### Where is the API?

`GET /api/chord-color?q=Am7` on the instrument origin → JSON for tools and lookups. Same mapping the wheel uses. No key required.

## API

`GET /api/chord-color?q=Am7` → JSON color mapping.

## Stack

TanStack Start, React 19, Vite, Tailwind v4, Web Audio API, Canvas 2D, optional WebGL field, Vibration API.

## Local

```bash
npm run dev
npm run build
npm run typecheck
```

The instrument itself is client-side. Sign-in is optional and unused by play, ask, resonance, journey, light, or the color API.

## License

MIT. See `LICENSE`.
