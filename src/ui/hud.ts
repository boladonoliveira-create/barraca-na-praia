/* Placar, botões e telas (overlays) em DOM. */
import { BEACHES } from '../dados/mapa.ts';
import { fmt } from '../core/economia.ts';
import type { Jogo } from '../core/jogo.ts';
import { gravarPrefs, type Prefs } from '../plataforma/salvar.ts';
import { ensureAudio, tone, setMuted, setVibra, buzz, praiaNova, pauseAudio } from '../plataforma/som.ts';
import type { Anuncios } from '../plataforma/anuncios.ts';
import { analytics } from '../plataforma/analytics.ts';

const $ = (id: string) => document.getElementById(id) as HTMLElement;

/** ads: AdMob no app; null no navegador (anúncio simulado). */
export function criarHud(g: Jogo, save: () => void, prefs: Prefs, testEnabled: boolean, ads: Anuncios | null) {
  let adTimer = 0;

  function goal() { $('beachLbl').textContent = g.beachName() + ' · próximo'; $('goal').textContent = g.goalText() }

  function syncTest() { const b = $('testBtn'); b.style.background = g.testMode ? '#2f9e44' : ''; b.style.color = g.testMode ? '#fff' : ''; g.syncTest() }

  // Som e vibração: o botão do topo e os da tela inicial mostram o mesmo estado
  function syncPrefs() {
    setMuted(!prefs.som); setVibra(prefs.vibra); gravarPrefs(prefs);
    $('waves').style.display = prefs.som ? '' : 'none'; $('mute').setAttribute('aria-label', prefs.som ? 'Som ligado' : 'Som desligado');
    $('startSom').textContent = prefs.som ? 'Som ligado' : 'Som desligado'; $('startSom').setAttribute('aria-pressed', String(prefs.som));
    $('startVibra').textContent = prefs.vibra ? 'Vibração ligada' : 'Vibração desligada'; $('startVibra').setAttribute('aria-pressed', String(prefs.vibra));
  }

  // Simulado (navegador): contagem de 3 s na tela; o jogo fica parado enquanto isso
  function simulado(titulo: string, fim: () => void) {
    $('adLbl').textContent = titulo; $('ovAd').hidden = false; let n = 3; $('adCount').textContent = String(n); clearInterval(adTimer);
    adTimer = window.setInterval(() => { n--; $('adCount').textContent = String(n); if (n <= 0) { clearInterval(adTimer); $('ovAd').hidden = true; fim() } }, 1000);
  }
  /** Recompensado: no app, AdMob; no navegador, o simulado. ok() se ganhou, semRecompensa() se fechou antes. */
  function showAd(tipo: string, ok: () => void, semRecompensa?: () => void) {
    const prev = g.state; g.state = 'ad'; analytics.registrar('ad_offer', { tipo });
    const fim = (ganhou: boolean) => { g.state = prev; pauseAudio(false); analytics.registrar('ad_watch', { tipo, recompensa: ganhou }); ganhou ? ok() : semRecompensa?.() };
    if (ads) { pauseAudio(true); ads.recompensado().then(fim, () => fim(false)) } else simulado('Anúncio simulado', () => fim(true));
  }
  /** Intersticial (sem recompensa). */
  function intersticial() {
    if (g.state !== 'play') return;
    g.state = 'ad'; analytics.registrar('ad_watch', { tipo: 'intersticial', recompensa: false });
    const fim = () => { if (g.state === 'ad') g.state = 'play'; pauseAudio(false) };
    if (ads) { pauseAudio(true); ads.intersticial().then(fim, fim) } else simulado('Intersticial simulado', fim);
  }

  function prestige() {
    const b = BEACHES[g.beach % BEACHES.length]; $('beachTitle').textContent = 'Bem-vindo à ' + b.n + '!';
    const novidade = ' As áreas recomeçam fechadas, mas o multiplicador fica para sempre.';
    $('beachText').textContent = 'Tudo aqui vende ' + Math.round((g.mult() - 1) * 100) + '% mais caro, e você já começa com dinheiro pras primeiras compras.' + novidade;
    $('ovBeach').hidden = false; praiaNova(); buzz([60, 40, 120]);
  }

  /** Cartão de ganhos offline. O valor vai para o save na hora (g.abrirOffline) e só sai ao pegar ou dobrar. */
  function showOffline(amount: number, awayMs: number) {
    const min = Math.round(Math.min(awayMs, 7200000) / 60000), tempo = min >= 60 ? Math.floor(min / 60) + ' h' + (min % 60 ? ' ' + (min % 60) + ' min' : '') : min + ' min';
    g.abrirOffline(amount); $('offAmount').textContent = 'R$ ' + fmt(amount);
    $('offText').textContent = min >= 1 ? 'Você ficou fora ' + tempo + (awayMs > 7200000 ? ' (conta até 2 h)' : '') + ' e os ajudantes continuaram vendendo.' : 'Seus ajudantes guardaram este dinheiro para você.';
    $('ovOffline').hidden = false;
  }
  function pegarOffline(vezes: number) { const v = g.pegarOffline(vezes); tone(988, 0.1, 'sine', 0.08, 1); buzz(30); analytics.registrar('offline_claim', { valor: v, dobrado: vezes > 1 }) }

  /** Tela inicial; ao tocar em Jogar chama onPlay (o áudio só pode começar depois de um toque). */
  function showStart(onPlay: () => void) {
    g.state = 'inicio'; $('startBeach').textContent = g.beachName(); $('ovStart').hidden = false;
    $('startPlay').onclick = () => { ensureAudio(); $('ovStart').hidden = true; g.state = 'play'; tone(784, 0.12, 'triangle', 0.08, 1.2); buzz(20); onPlay() };
  }

  function frame() {
    $('money').textContent = g.testMode ? '∞' : fmt(g.shown);
    const b = $('boost');
    if (g.boostOn()) { const s = Math.ceil((g.boostUntil - g.now) / 1000); b.classList.add('on'); $('boostBadge').textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0') }
    else { b.classList.remove('on'); $('boostBadge').textContent = 'anúncio · 2 min' }
  }

  const toggleSom = () => { prefs.som = !prefs.som; ensureAudio(); syncPrefs() };
  $('mute').addEventListener('click', toggleSom); $('startSom').addEventListener('click', toggleSom);
  $('startVibra').addEventListener('click', () => { prefs.vibra = !prefs.vibra; syncPrefs(); buzz(30) });
  // Modo teste (∞): só na versão de desenvolvimento, nunca na da loja
  if (testEnabled) $('testBtn').addEventListener('click', () => { g.testMode = prefs.teste = !g.testMode; gravarPrefs(prefs); if (!g.testMode) { g.money = 0; g.shown = 0 } syncTest() });
  else $('testBtn').hidden = true;
  $('boost').addEventListener('click', () => { if (g.state !== 'play' || g.boostOn()) return; ensureAudio(); showAd('dinheiro_dobro', () => { g.boostUntil = g.now + 120000; tone(784, 0.2, 'triangle', 0.1, 1.2); buzz(40) }) });
  $('offTake').addEventListener('click', () => { ensureAudio(); $('ovOffline').hidden = true; g.state = 'play'; pegarOffline(1) });
  // se o anúncio fechar antes da recompensa, recebe o valor normal (sem derrota)
  $('offDouble').addEventListener('click', () => { ensureAudio(); $('ovOffline').hidden = true; g.state = 'play'; showAd('dobrar_offline', () => pegarOffline(2), () => pegarOffline(1)) });
  $('beachOk').addEventListener('click', () => { $('ovBeach').hidden = true; g.state = 'play' });
  syncPrefs();

  return { goal, prestige, showOffline, showStart, frame, syncTest, intersticial };
}
