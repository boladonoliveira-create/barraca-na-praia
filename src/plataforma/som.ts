/* Som sintetizado (WebAudio), ambiente de praia e vibração. */
let ac: AudioContext | null = null, master: GainNode | null = null, gullT = 0;
export let muted = false, vibra = true;

export function setMuted(m: boolean) { muted = m; if (master && ac) master.gain.setTargetAtTime(m ? 0 : 1, ac.currentTime, 0.1) }
export function setVibra(v: boolean) { vibra = v }

/** Cria o áudio no primeiro toque (o navegador só deixa tocar depois de um gesto) e liga o mar. */
export function ensureAudio() {
  if (!ac) {
    try { ac = new (window.AudioContext || (window as any).webkitAudioContext)() } catch { return }
    master = ac.createGain(); master.gain.value = muted ? 0 : 1; master.connect(ac.destination);
    startAmbience();
  }
  if (ac.state === 'suspended') ac.resume();
}
/** Pausa o áudio com o app em segundo plano. */
export function pauseAudio(paused: boolean) { if (ac) paused ? ac.suspend() : ac.resume() }

export function tone(f: number, dur: number, type: OscillatorType = 'sine', vol = 0.08, slide = 1.3, delayMs = 0) {
  if (delayMs) { setTimeout(() => tone(f, dur, type, vol, slide), delayMs); return }
  if (!ac || !master || muted) return;
  try {
    const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
    o.type = type; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * slide, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(master); o.start(t); o.stop(t + dur + 0.02);
  } catch { /* ignora */ }
}
export function fanfare() { tone(523, 0.12, 'triangle', 0.1, 1); tone(659, 0.12, 'triangle', 0.1, 1, 110); tone(880, 0.22, 'triangle', 0.1, 1, 220) }
/** Praia nova: arpejo mais longo que o da compra. */
export function praiaNova() { [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, i === 4 ? 0.5 : 0.14, 'triangle', 0.1, 1, i * 120)) }
export function buzz(p: number | number[]) { if (!vibra) return; try { navigator.vibrate?.(p) } catch { /* ignora */ } }

/* Mar: ruído marrom com filtro e volume subindo e descendo devagar, como ondas. De vez em quando, uma gaivota. */
function startAmbience() {
  if (!ac || !master) return;
  try {
    const len = ac.sampleRate * 3, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
    let last = 0; for (let i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5 }
    const src = ac.createBufferSource(); src.buffer = buf; src.loop = true;
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 600;
    const swell = ac.createGain(); swell.gain.value = 0.05;
    const lfo = ac.createOscillator(), depth = ac.createGain(); lfo.frequency.value = 0.11; depth.gain.value = 0.035;
    lfo.connect(depth).connect(swell.gain); src.connect(lp).connect(swell).connect(master); src.start(); lfo.start();
    clearInterval(gullT); gullT = window.setInterval(() => { if (Math.random() < 0.35) gaivota() }, 9000);
  } catch { /* sem ambiente */ }
}
function gaivota() {
  if (!ac || !master || muted || ac.state !== 'running') return;
  for (let k = 0; k < 2; k++) {
    const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + k * 0.22;
    o.type = 'sawtooth'; o.frequency.setValueAtTime(1500, t); o.frequency.exponentialRampToValueAtTime(950, t + 0.18);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.012, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1300; bp.Q.value = 4;
    o.connect(bp).connect(g).connect(master); o.start(t); o.stop(t + 0.22);
  }
}
