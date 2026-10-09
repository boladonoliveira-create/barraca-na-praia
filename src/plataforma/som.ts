/* Som sintetizado (WebAudio) e vibração. */
let ac: AudioContext | null = null;
export let muted = false;
export function setMuted(m: boolean) { muted = m }
export function ensureAudio() {
  if (!ac) { try { ac = new (window.AudioContext || (window as any).webkitAudioContext)() } catch { /* sem áudio */ } }
  if (ac && ac.state === 'suspended') ac.resume();
}
export function tone(f: number, dur: number, type: OscillatorType = 'sine', vol = 0.08, slide = 1.3, delayMs = 0) {
  if (delayMs) { setTimeout(() => tone(f, dur, type, vol, slide), delayMs); return }
  if (!ac || muted) return;
  try {
    const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
    o.type = type; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * slide, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur + 0.02);
  } catch { /* ignora */ }
}
export function fanfare() { tone(523, 0.12, 'triangle', 0.1, 1); tone(659, 0.12, 'triangle', 0.1, 1, 110); tone(880, 0.22, 'triangle', 0.1, 1, 220) }
export function buzz(ms: number) { try { navigator.vibrate?.(ms) } catch { /* ignora */ } }
