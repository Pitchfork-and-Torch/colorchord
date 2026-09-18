/** Node cook tests for ColorChord theory + YIN. No Vite. No 8080. */
import { chordMidis, complementaryPitch, frequencyOf, parseChordSymbol, pitchById } from "../src/lib/music/theory";
import { chromaEnergies, yinPitch } from "../src/lib/music/yin";

let fails = 0;
function ok(name: string, cond: boolean, extra = "") {
  if (cond) console.log("ok", name);
  else {
    fails += 1;
    console.log("FAIL", name, extra);
  }
}

ok("A4 is 440", Math.abs(frequencyOf(9, 4) - 440) < 1e-9);
ok("C4 midi 60", Math.abs(frequencyOf(0, 4) - 261.625565) < 0.01);
ok("major triad C", JSON.stringify(chordMidis(0, "major")) === JSON.stringify([0, 4, 7]));
ok("dom7 G", JSON.stringify(chordMidis(7, "dom7")) === JSON.stringify([7, 11, 2, 5]));
ok("tritone complement of C is F#", complementaryPitch(pitchById("C")).id === "F#");

const am = parseChordSymbol("Am");
ok("parse Am", !!am && am.quality === "minor" && am.root.id === "A");
const fs = parseChordSymbol("F#maj7");
ok("parse F#maj7", !!fs && fs.quality === "maj7" && fs.root.id === "F#");
const dim = parseChordSymbol("E°");
ok("parse E dim", !!dim && dim.quality === "dim");

const sr = 44100;
const n = 2048;
const buf = new Float32Array(n);
for (let i = 0; i < n; i++) buf[i] = 0.2 * Math.sin((2 * Math.PI * 440 * i) / sr);
const yin = yinPitch(buf, sr);
ok("YIN A4 near 440", yin.frequency > 430 && yin.frequency < 450, `got ${yin.frequency}`);
ok("YIN voiced", yin.probability > 0.5, `p=${yin.probability}`);

const silence = new Float32Array(n);
ok("YIN silence unvoiced", yinPitch(silence, sr).frequency === -1);

const hi = new Float32Array(n);
for (let i = 0; i < n; i++) hi[i] = 0.2 * Math.sin((2 * Math.PI * 8000 * i) / sr);
const yinHi = yinPitch(hi, sr);
ok(
  "YIN 8kHz outside tau band",
  yinHi.frequency === -1 || (yinHi.frequency >= 50 && yinHi.frequency <= 2000),
  `got ${yinHi.frequency}`,
);
ok("YIN 8kHz is not 8k", yinHi.frequency < 3000, `got ${yinHi.frequency}`);

const lo = new Float32Array(n);
for (let i = 0; i < n; i++) lo[i] = 0.2 * Math.sin((2 * Math.PI * 30 * i) / sr);
ok("YIN 30Hz unvoiced", yinPitch(lo, sr).frequency === -1);

const mixed = new Float32Array(n);
for (let i = 0; i < n; i++) {
  mixed[i] =
    0.3 * Math.sin((2 * Math.PI * 440 * i) / sr) +
    0.04 * Math.sin((2 * Math.PI * 9000 * i) / sr);
}
const yinMix = yinPitch(mixed, sr);
ok(
  "YIN 440+junk stays A4",
  yinMix.frequency > 420 && yinMix.frequency < 460,
  `got ${yinMix.frequency}`,
);
ok("YIN 440+junk stays in tau band", yinMix.frequency >= 50 && yinMix.frequency <= 2000);

const a2 = new Float32Array(n);
for (let i = 0; i < n; i++) a2[i] = 0.25 * Math.sin((2 * Math.PI * 110 * i) / sr);
const yinA2 = yinPitch(a2, sr);
ok("YIN A2 near 110", yinA2.frequency > 100 && yinA2.frequency < 120, `got ${yinA2.frequency}`);

const chroma = chromaEnergies(buf, sr);
let peak = 0;
let peakPc = -1;
for (let i = 0; i < 12; i++) {
  if (chroma[i]! > peak) {
    peak = chroma[i]!;
    peakPc = i;
  }
}
ok("chroma peak is A (9)", peakPc === 9, `pc=${peakPc}`);

if (fails) {
  console.log("MUSIC FAIL", fails);
  process.exit(1);
}
console.log("MUSIC OK");
