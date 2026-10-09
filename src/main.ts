/* Liga núcleo, render, UI e plataforma; entrada e laço principal. */
import { W, H } from './dados/mapa.ts';
import { Jogo } from './core/jogo.ts';
import { desenhar, type Joy } from './render/desenho.ts';
import { criarHud } from './ui/hud.ts';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar } from '@capacitor/status-bar';
import { lerSave, gravarSave, lerPrefs, iniciarArmazenamento } from './plataforma/salvar.ts';
import { iniciarAnuncios, podeIntersticial } from './plataforma/anuncios.ts';
import { analytics, iniciarAnalytics } from './plataforma/analytics.ts';
import { ensureAudio, pauseAudio, tone, fanfare, buzz } from './plataforma/som.ts';

const testEnabled = import.meta.env.DEV, nativo = Capacitor.isNativePlatform();
// no app: tela cheia sem barra de status; o save sai do Preferences para a memória antes de tudo
if (nativo) StatusBar.hide().catch(() => { /* sem barra */ });
await iniciarArmazenamento();
const [ads] = await Promise.all([iniciarAnuncios(), iniciarAnalytics()]);
const canvas = document.getElementById('game') as HTMLCanvasElement, ctx = canvas.getContext('2d')!, stage = document.getElementById('stage')!;

const save = () => gravarSave(g.snapshot()), prefs = lerPrefs();
let ultimoInter = Date.now(); // o primeiro intersticial vem só depois de 4 min de sessão, não logo ao chegar na Praia 2
const g = new Jogo({
  tone, fanfare, buzz, save, goal: () => hud.goal(),
  prestige: () => { hud.prestige(); analytics.registrar('prestige', { praia: g.beach }) },
  compra: (praia, indice, segundos) => {
    analytics.registrar('step_buy', { praia, indice, segundos: Math.round(segundos) });
    // intersticial (GDD seção 9): logo depois de uma compra, a partir da Praia 2, no máximo a cada 4 min
    if (!g.testMode && podeIntersticial(praia, Date.now(), ultimoInter)) { ultimoInter = Date.now(); setTimeout(() => hud.intersticial(), 700) }
  },
});
g.testMode = testEnabled && prefs.teste;
const hud = criarHud(g, save, prefs, testEnabled, ads);

/* ---------- Entrada: joystick que aparece onde o dedo toca, ou teclado ---------- */
const joy: Joy & { id: number | null } = { on: false, ox: 0, oy: 0, x: 0, y: 0, id: null };
const keys: Record<string, boolean> = {};
function toScreen(e: PointerEvent) { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H } }
canvas.addEventListener('pointerdown', e => { if (g.state !== 'play') return; ensureAudio(); const p = toScreen(e); joy.on = true; joy.id = e.pointerId; joy.ox = p.x; joy.oy = p.y; joy.x = p.x; joy.y = p.y; try { canvas.setPointerCapture(e.pointerId) } catch { /* ignora */ } });
canvas.addEventListener('pointermove', e => { if (!joy.on || e.pointerId !== joy.id) return; const p = toScreen(e); joy.x = p.x; joy.y = p.y });
function endJoy(e: PointerEvent) { if (e.pointerId === joy.id) { joy.on = false; joy.id = null } }
canvas.addEventListener('pointerup', endJoy); canvas.addEventListener('pointercancel', endJoy);
window.addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; ensureAudio() });
window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false });
function readInput() {
  let ix = 0, iy = 0;
  if (joy.on) { const dx = joy.x - joy.ox, dy = joy.y - joy.oy, d = Math.hypot(dx, dy); if (d > 6) { const m = Math.min(1, d / 48); ix = dx / d * m; iy = dy / d * m } }
  if (keys['a'] || keys['arrowleft']) ix -= 1; if (keys['d'] || keys['arrowright']) ix += 1; if (keys['w'] || keys['arrowup']) iy -= 1; if (keys['s'] || keys['arrowdown']) iy += 1;
  return { x: ix, y: iy };
}

/* ---------- Laço ---------- */
let k = 1, last = performance.now(), goalT = 0, saveT = 0;
function resize() {
  const r = stage.getBoundingClientRect(); if (r.width < 10 || r.height < 10) return;
  const scale = Math.min(r.width / W, r.height / H), cw = W * scale, ch = H * scale; canvas.style.width = cw + 'px'; canvas.style.height = ch + 'px';
  const dpr = Math.min(2, window.devicePixelRatio || 1); canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr); k = scale * dpr;
}
let pausado = false;
function frame(ms: number) {
  if (pausado) { last = ms; requestAnimationFrame(frame); return }
  const dt = Math.min(50, ms - last); last = ms; g.now += dt;
  g.update(dt, readInput()); g.updateFx(dt); hud.frame();
  saveT += dt; if (saveT > 3000) { saveT = 0; save() }
  goalT += dt; if (goalT > 500) { goalT = 0; hud.goal() }
  desenhar(ctx, g, k, joy); requestAnimationFrame(frame);
}
// Ciclo de vida: ao sair, salva e pausa jogo, sons e mar. Na volta, os ajudantes renderam o tempo fora.
// No app vem do @capacitor/app; no navegador, da visibilidade da aba.
let hiddenAt = 0;
function aoSair() { if (pausado) return; pausado = true; save(); pauseAudio(true); hiddenAt = Date.now(); analytics.registrar('session_end', { praia: g.beach }) }
function aoVoltar() {
  if (!pausado) return; pausado = false; pauseAudio(false);
  if (g.state !== 'inicio') analytics.registrar('session_start', { praia: g.beach });
  const off = g.state === 'play' && !g.testMode && hiddenAt ? g.offlineGain(hiddenAt) : 0;
  if (off > 0) hud.showOffline(off, Date.now() - hiddenAt);
}
if (nativo) App.addListener('appStateChange', ({ isActive }) => isActive ? aoVoltar() : aoSair());
else document.addEventListener('visibilitychange', () => document.hidden ? aoSair() : aoVoltar());

if (typeof ResizeObserver !== 'undefined') new ResizeObserver(resize).observe(stage); else window.addEventListener('resize', resize);
resize();
const saved = lerSave(), offAmount = g.load(saved); hud.syncTest(); hud.goal(); g.firstScene();
hud.showStart(() => {
  analytics.registrar('session_start', { praia: g.beach });
  if (offAmount > 0 && !g.testMode) hud.showOffline(offAmount, Date.now() - saved!.last);
});
requestAnimationFrame(frame);

// gancho de depuração no console (o mesmo do protótipo)
(window as any).__praia = {
  get state() { return { beach: g.beach, done: g.done.size, next: g.visibleSteps().map(v => v.s.name), helpers: g.helpers.map(h => h.shop + ':' + h.mode + ':' + h.stack.join(',')), stock: g.S.map((s, i) => i === 1 ? s.stock : Object.values(s.counter).map(a => a.length)), queues: g.S.map(s => s.queue.length), cash: g.S.map(s => s.cashValue), cam: Math.round(g.camX) } },
  buyAll(n: number) { for (let i = 0; i < n; i++) { const v = g.visibleSteps()[0]; if (v) g.applyStep(v.i, true) } },
  prestige() { g.prestige() }, tp(x: number, y: number) { g.player.x = x; g.player.y = y },
};
