// Small WebAudio helpers so we don't ship audio files. Called from game screen
// after a user gesture so browsers allow playback.
let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = (window as unknown as { AudioContext?: typeof AudioContext }).AudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

function beep(freq: number, duration: number, type: OscillatorType = "sine", vol = 0.15) {
  const c = ac();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = vol;
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
  o.connect(g).connect(c.destination);
  o.start();
  o.stop(c.currentTime + duration);
}

export const sfx = {
  correct() {
    beep(660, 0.12, "sine", 0.18);
    setTimeout(() => beep(990, 0.18, "sine", 0.18), 90);
  },
  wrong() {
    beep(180, 0.2, "square", 0.12);
  },
  win() {
    beep(523, 0.14);
    setTimeout(() => beep(659, 0.14), 130);
    setTimeout(() => beep(784, 0.14), 260);
    setTimeout(() => beep(1046, 0.3), 390);
  },
};
