/**
 * محرك صوت خفيف مبني على Web Audio API — بدون ملفات صوتية.
 * مؤثرات: نقر الاختيار، مواجهة/تناقض، ارتفاع الشك، ختم النهاية، فتح نهاية جديدة.
 */

export type Sfx = "select" | "confront" | "suspicion" | "stamp" | "unlock";

let ctx: AudioContext | null = null;
let armed = false;

function create(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  ctx ??= new Ctor();
  return ctx;
}

/** يجب استدعاؤها داخل تفاعل مستخدم (نقرة) لفتح قفل الصوت في المتصفحات. */
export function unlockAudio() {
  const ac = create();
  if (!ac) return;
  if (ac.state === "suspended") void ac.resume();
  if (!armed) {
    armed = true;
    // نغمة صامتة لتنشيط المسار الصوتي على iOS
    const osc = ac.createOscillator();
    const g = ac.createGain();
    g.gain.value = 0.0001;
    osc.connect(g).connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + 0.03);
  }
}

if (typeof window !== "undefined") {
  const arm = () => unlockAudio();
  window.addEventListener("pointerdown", arm, { capture: true });
  window.addEventListener("keydown", arm, { capture: true });
  window.addEventListener("touchstart", arm, { capture: true });
}

function audio(): AudioContext | null {
  const ac = create();
  if (!ac) return null;
  if (ac.state === "suspended") void ac.resume();
  return ac;
}

type ToneOpts = {
  freq: number;
  to?: number;
  dur: number;
  delay?: number;
  type?: OscillatorType;
  gain?: number;
};

function tone(ac: AudioContext, o: ToneOpts) {
  const start = ac.currentTime + (o.delay ?? 0);
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.freq, start);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, start + o.dur);
  const peak = o.gain ?? 0.14;
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(peak, start + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, start + o.dur);
  osc.connect(g).connect(ac.destination);
  osc.start(start);
  osc.stop(start + o.dur + 0.05);
}

function noise(ac: AudioContext, dur: number, gain = 0.12, delay = 0) {
  const start = ac.currentTime + delay;
  const frames = Math.floor(ac.sampleRate * dur);
  const buffer = ac.createBuffer(1, frames, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  const src = ac.createBufferSource();
  src.buffer = buffer;
  const filter = ac.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 1400;
  const g = ac.createGain();
  g.gain.value = gain;
  src.connect(filter).connect(g).connect(ac.destination);
  src.start(start);
}

export function playSfx(name: Sfx) {
  const ac = audio();
  if (!ac) return;

  if (name === "select") {
    tone(ac, { freq: 520, to: 760, dur: 0.12, type: "triangle", gain: 0.1 });
  } else if (name === "confront") {
    tone(ac, { freq: 220, to: 90, dur: 0.45, type: "sawtooth", gain: 0.13 });
    tone(ac, { freq: 150, to: 70, dur: 0.5, type: "square", gain: 0.07, delay: 0.06 });
    noise(ac, 0.3, 0.1);
  } else if (name === "suspicion") {
    tone(ac, { freq: 400, to: 880, dur: 0.28, type: "sine", gain: 0.1 });
    tone(ac, { freq: 600, to: 1200, dur: 0.22, type: "sine", gain: 0.05, delay: 0.1 });
  } else if (name === "stamp") {
    noise(ac, 0.18, 0.22);
    tone(ac, { freq: 120, to: 55, dur: 0.35, type: "square", gain: 0.14 });
  } else if (name === "unlock") {
    // ثلاثية صاعدة لامعة + بريق
    tone(ac, { freq: 660, dur: 0.18, type: "triangle", gain: 0.1 });
    tone(ac, { freq: 880, dur: 0.18, type: "triangle", gain: 0.1, delay: 0.1 });
    tone(ac, { freq: 1320, dur: 0.34, type: "sine", gain: 0.11, delay: 0.2 });
    tone(ac, { freq: 1760, to: 2400, dur: 0.4, type: "sine", gain: 0.045, delay: 0.24 });
  }
}
