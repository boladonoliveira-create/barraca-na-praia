/* Placar, botões e telas (overlays) em DOM. */
import { BEACHES } from '../dados/mapa.ts';
import { fmt } from '../core/economia.ts';
import type { Jogo } from '../core/jogo.ts';
import { store } from '../plataforma/salvar.ts';
import { ensureAudio, tone, muted, setMuted } from '../plataforma/som.ts';

const $ = (id: string) => document.getElementById(id) as HTMLElement;

export function criarHud(g: Jogo, save: () => void, testEnabled: boolean) {
  let adTimer = 0, offAmount = 0;

  function goal() { $('beachLbl').textContent = g.beachName() + ' · próximo'; $('goal').textContent = g.goalText() }

  function syncTest() { const b = $('testBtn'); b.style.background = g.testMode ? '#2f9e44' : ''; b.style.color = g.testMode ? '#fff' : ''; g.syncTest() }

  // Anúncio simulado: 3 s e entrega a recompensa
  function showAd(cb: () => void) {
    const prev = g.state; g.state = 'ad'; $('ovAd').hidden = false; let n = 3; $('adCount').textContent = String(n); clearInterval(adTimer);
    adTimer = window.setInterval(() => { n--; $('adCount').textContent = String(n); if (n <= 0) { clearInterval(adTimer); $('ovAd').hidden = true; g.state = prev; cb() } }, 1000);
  }

  function prestige() {
    const b = BEACHES[g.beach % BEACHES.length]; $('beachTitle').textContent = 'Bem-vindo à ' + b.n + '!';
    const novidade = g.beach === 1 ? ' Novidade: o quiosque de sorvete do outro lado da cerca!' : '';
    $('beachText').textContent = 'Tudo aqui vende ' + Math.round((g.mult() - 1) * 100) + '% mais caro, e você já começa com dinheiro pras primeiras compras.' + novidade;
    $('ovBeach').hidden = false;
  }

  function showOffline(amount: number) { offAmount = amount; g.state = 'offline'; $('offAmount').textContent = 'R$ ' + fmt(amount); $('ovOffline').hidden = false }

  function frame() {
    $('money').textContent = g.testMode ? '∞' : fmt(g.shown);
    const b = $('boost');
    if (g.boostOn()) { const s = Math.ceil((g.boostUntil - g.now) / 1000); b.classList.add('on'); $('boostBadge').textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0') }
    else { b.classList.remove('on'); $('boostBadge').textContent = 'anúncio · 2 min' }
  }

  $('mute').addEventListener('click', () => { setMuted(!muted); $('waves').style.display = muted ? 'none' : ''; $('mute').setAttribute('aria-label', muted ? 'Som desligado' : 'Som ligado') });
  // Modo teste (∞): só na versão de desenvolvimento, nunca na da loja
  if (testEnabled) $('testBtn').addEventListener('click', () => { g.testMode = !g.testMode; store.set('test', g.testMode); if (!g.testMode) { g.money = 0; g.shown = 0 } syncTest() });
  else $('testBtn').hidden = true;
  $('boost').addEventListener('click', () => { if (g.state !== 'play' || g.boostOn()) return; ensureAudio(); showAd(() => { g.boostUntil = g.now + 120000; tone(784, 0.2, 'triangle', 0.1, 1.2) }) });
  $('offTake').addEventListener('click', () => { ensureAudio(); g.money += offAmount; $('ovOffline').hidden = true; g.state = 'play'; tone(988, 0.1, 'sine', 0.08, 1); save() });
  $('offDouble').addEventListener('click', () => { ensureAudio(); $('ovOffline').hidden = true; g.state = 'play'; showAd(() => { g.money += offAmount * 2; save() }) });
  $('beachOk').addEventListener('click', () => { $('ovBeach').hidden = true; g.state = 'play' });

  return { goal, prestige, showOffline, frame, syncTest };
}
