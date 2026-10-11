/* Liga núcleo, render, UI e plataforma; entrada e laço principal. */
import { W, H } from './dados/mapa.ts';
import { Jogo } from './core/jogo.ts';
import { desenhar, type Joy } from './render/desenho.ts';
import { criarHud } from './ui/hud.ts';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar } from '@capacitor/status-bar';
import { lerSave, gravarSave, lerPrefs, iniciarArmazenamento } from './plataforma/salvar.ts';
import { iniciarAnuncios } from './plataforma/anuncios.ts';
import { analytics, iniciarAnalytics } from './plataforma/analytics.ts';
import { hojeLocal } from './core/diaria.ts';
import { ECONOMIA, NIVEL_ABRE } from './dados/planos.ts';
import { ensureAudio, pauseAudio, tone, fanfare, buzz } from './plataforma/som.ts';

const testEnabled = import.meta.env.DEV, nativo = Capacitor.isNativePlatform();
// no app: tela cheia sem barra de status; o save sai do Preferences para a memória antes de tudo
if (nativo) StatusBar.hide().catch(() => { /* sem barra */ });
await iniciarArmazenamento();
const [ads] = await Promise.all([iniciarAnuncios(), iniciarAnalytics()]);
const canvas = document.getElementById('game') as HTMLCanvasElement, ctx = canvas.getContext('2d')!, stage = document.getElementById('stage')!;

// prévia de cenário (só em dev): ?praia=N abre na praia N com as áreas abertas, sem mexer no save
const previa = testEnabled ? Math.min(10, Number(new URLSearchParams(location.search).get('praia')) || 0) : 0;
const save = () => { if (!previa) gravarSave(g.snapshot()) }, prefs = lerPrefs();
const g = new Jogo({
  tone, fanfare, buzz, save, goal: () => hud.goal(),
  viagem: (fama, minutos) => hud.viagem(fama, minutos), campeao: () => hud.campeao(),
  compra: (praia, area, nivel, segundos) => analytics.registrar('step_buy', { praia, area, nivel, segundos: Math.round(segundos) }),
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
function aoSair() { if (pausado) return; pausado = true; save(); pauseAudio(true); hiddenAt = Date.now(); analytics.registrar('session_end', { praia: g.beach + 1 }) }
function aoVoltar() {
  if (!pausado) return; pausado = false; pauseAudio(false);
  if (g.state !== 'inicio') analytics.registrar('session_start', { praia: g.beach + 1 });
  const off = g.state === 'play' && !g.testMode && hiddenAt ? g.offlineGain(hiddenAt) : 0;
  if (off > 0) hud.showOffline(off, Date.now() - hiddenAt);
}
if (nativo) App.addListener('appStateChange', ({ isActive }) => isActive ? aoVoltar() : aoSair());
else document.addEventListener('visibilitychange', () => document.hidden ? aoSair() : aoVoltar());

if (typeof ResizeObserver !== 'undefined') new ResizeObserver(resize).observe(stage); else window.addEventListener('resize', resize);
resize();
const saved = previa ? null : lerSave(), offAmount = g.load(saved);
if (previa) {
  const famas = ECONOMIA.famaMinima.slice(0, previa - 1);
  g.load({ money: 0, niveis: [], paid: {}, praia: previa, famaTotal: famas.reduce((a, b) => a + b, 0), famas, ganho: 0, tempo: 0, last: 0, tutorial: 4 });
  const nova = g.areasPraia() - 1;
  for (let a = 0; a <= nova; a++) while (g.liberada(a) && (!g.aberta(a) || (a < nova && g.nivel[a] < NIVEL_ABRE))) { g.applyStep(a, true); g.gratis(a) }
  g.money = g.shown = 3 * g.trilhas[nova][g.nivel[nova]].price;
}
hud.syncTest(); hud.goal(); g.firstScene();
hud.showStart(() => {
  analytics.registrar('session_start', { praia: g.beach + 1 });
  // primeiro a recompensa diária (se for a primeira abertura do dia), depois o cartão dos ganhos com o app fechado
  const offline = () => { if (offAmount > 0 && !g.testMode) hud.showOffline(offAmount, Date.now() - saved!.last) };
  if (previa) offline(); else hud.showDiaria(hojeLocal(), offline);
});
requestAnimationFrame(frame);

// gancho de depuração no console (o mesmo do protótipo)
(window as any).__praia = {
  get state() { return { beach: g.beach, niveis: g.nivel.join('/'), next: g.visibleSteps().map(v => v.s.name), helpers: g.helpers.map(h => h.shop + ':' + h.mode + ':' + h.stack.join(',')), stock: g.S.map((s, i) => i === 1 ? s.stock : Object.values(s.counter).map(a => a.length)), queues: g.S.map(s => s.queue.length), cash: g.S.map(s => s.cashValue), cam: Math.round(g.camX) } },
  buyAll(n: number) { for (let i = 0; i < n; i++) { const v = g.melhorCompra(false); if (v) g.applyStep(v.a, true) } },
  /** Sobe a área a até o nível n (compras de graça, com efeito de comemoração nos marcos). */
  subir(a: number, n: number) { while (g.nivel[a] < n && g.liberada(a)) g.applyStep(a) },
  viajar() { g.viajar() }, tp(x: number, y: number) { g.player.x = x; g.player.y = y },
  /** Roda o jogo ms milissegundos de uma vez e redesenha (para conferir com a aba em segundo plano). */
  avancar(ms: number) { for (let t = 0; t < ms; t += 16.67) { g.now += 16.67; g.update(16.67, { x: 0, y: 0 }); g.updateFx(16.67) } desenhar(ctx, g, k, joy) },
};
