/* Placar, botões e telas (overlays) em DOM. */
import { PRAIAS } from '../dados/praias.ts';
import { TORNEIO } from '../dados/mapa.ts';
import { fmt } from '../core/economia.ts';
import type { Jogo } from '../core/jogo.ts';
import { gravarPrefs, type Prefs } from '../plataforma/salvar.ts';
import { ensureAudio, tone, setMuted, setVibra, buzz, praiaNova, pauseAudio } from '../plataforma/som.ts';
import { podeIntersticial, type Anuncios } from '../plataforma/anuncios.ts';
import { analytics } from '../plataforma/analytics.ts';
import { PREMIOS, type Premio } from '../core/diaria.ts';

const $ = (id: string) => document.getElementById(id) as HTMLElement;

/** ads: AdMob no app; null no navegador (anúncio simulado). */
export function criarHud(g: Jogo, save: () => void, prefs: Prefs, testEnabled: boolean, ads: Anuncios | null) {
  let adTimer = 0, ultimoInter = Date.now(); // o 1º intersticial só depois de 4 min de sessão
  const semMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  /** Intersticial (sem recompensa). Só é chamado na viagem (podeIntersticial); depois chama fim. */
  function intersticial(fim: () => void) {
    const prev = g.state; g.state = 'ad'; analytics.registrar('ad_watch', { tipo: 'intersticial', recompensa: false });
    const acabou = () => { g.state = prev; pauseAudio(false); fim() };
    if (ads) { pauseAudio(true); ads.intersticial().then(acabou, acabou) } else simulado('Intersticial simulado', acabou);
  }

  /* ---------- Litoral: a costa com as 10 praias ---------- */
  const ponto = (i: number) => ({ x: 96 + (i % 2) * 22, y: 30 + i * 48 });
  /** Desenha o litoral com o barquinho parado na praia de índice `barco`. */
  function desenharLitoral(barco: number) {
    const atual = g.beach, pts = PRAIAS.map((_, i) => ponto(i));
    let costa = 'M0 0 L' + (pts[0].x - 18) + ' 0';
    pts.forEach(p => { costa += ' L' + (p.x - 18) + ' ' + p.y });
    costa += ' L' + (pts[9].x - 18) + ' 540 L0 540 Z';
    let h = '<path d="' + costa + '" fill="#4dabf7" opacity=".8"/>';
    h += '<path d="' + pts.map((p, i) => (i ? 'L' : 'M') + p.x + ' ' + p.y).join(' ') + '" stroke="#e0b84f" stroke-width="3" stroke-dasharray="5 6" fill="none"/>';
    PRAIAS.forEach((P, i) => {
      const { x, y } = pts[i], feita = i < atual, prox = i === atual + 1, cls = feita ? 'feita' : i === atual ? 'atual' : prox ? 'proxima' : 'trancada';
      // as seguintes não dizem a área nova (é surpresa)
      const sub = feita ? '+' + (g.famas[i] ?? 0) + ' de fama ⭐' : i === atual ? 'Você está aqui' : prox ? P.area : '🔒';
      if (i === atual) h += '<circle cx="' + x + '" cy="' + y + '" r="15" fill="#ffc23d" opacity=".45"/>';
      h += '<g class="' + cls + '"><circle cx="' + x + '" cy="' + y + '" r="' + (i === atual ? 9 : 7) + '" fill="' + (feita ? '#2f9e44' : i === atual ? '#5b2370' : '#fffdf7') + '" stroke="#8a6a52" stroke-width="2"/>';
      h += '<text class="nome" x="' + (x + 18) + '" y="' + (y - 2) + '">' + (i + 1) + '. ' + P.nome + '</text>';
      h += '<text class="sub" x="' + (x + 18) + '" y="' + (y + 13) + '">' + sub + '</text></g>';
    });
    h += '<text class="sub" x="160" y="526" text-anchor="middle">Praia 11 em diante · em breve</text>';
    const b = pts[barco];
    h += '<g id="barco" style="transform:translate(' + (b.x - 44) + 'px,' + b.y + 'px)"><path d="M-12 2 h24 l-5 7 h-14 Z" fill="#8d5a2b"/><path d="M0 0 V-18 L11 -2 Z" fill="#fff" stroke="#8a6a52" stroke-width="1"/></g>';
    $('litoralMapa').innerHTML = h;
  }
  function abrirLitoral() { if (g.state !== 'play') return; g.state = 'litoral'; desenharLitoral(g.beach); $('litoralFechar').hidden = false; $('ovLitoral').hidden = false }

  /** Comprou a nova praia (g.viajar já trocou de praia): 1) o barquinho vai até a praia nova; 2) intersticial, se puder;
      3) cartão com a fama ganha e o anúncio opcional de +20%; 4) o nome da praia nova grande na tela. */
  function viagem(fama: number, minutos: number) {
    const deixada = g.beach; // número (1 a 10) da praia que ficou para trás
    desenharLitoral(g.beach - 1); $('litoralFechar').hidden = true; $('ovLitoral').hidden = false; praiaNova();
    requestAnimationFrame(() => requestAnimationFrame(() => { const p = ponto(g.beach); $('barco').style.transform = 'translate(' + (p.x - 44) + 'px,' + p.y + 'px)' }));
    setTimeout(() => {
      $('ovLitoral').hidden = true;
      const cartao = () => cartaoFama(fama, minutos);
      if (!g.testMode && podeIntersticial(deixada, Date.now(), ultimoInter)) { ultimoInter = Date.now(); intersticial(cartao) } else cartao();
    }, semMovimento ? 600 : 2100);
  }
  let viagemAtual: { fama: number; minutos: number; anuncio: boolean } | null = null;
  function textoFama() {
    $('beachTitle').textContent = '+' + viagemAtual!.fama + ' de fama ⭐';
    $('beachText').textContent = 'Agora tudo vende x' + g.lucro().toFixed(1).replace('.', ',') + '. Na ' + g.beachName() + ', a novidade é: ' + PRAIAS[g.beach].area + '.';
  }
  function cartaoFama(fama: number, minutos: number) {
    viagemAtual = { fama, minutos, anuncio: false }; textoFama();
    $('beachAd').hidden = fama < 1; $('ovBeach').hidden = false; buzz([60, 40, 120]);
  }
  /** Venceu a final do torneio: festa e a prévia da Arena. */
  function campeao() {
    const prev = g.state; g.state = 'ad';
    $('campeaoText').textContent = 'Você venceu as 3 etapas do torneio. Os troféus dão +' + Math.round(g.trofeus * TORNEIO.bonusTrofeu * 100) + '% de público para sempre.';
    $('ovCampeao').hidden = false; praiaNova(); buzz([80, 40, 80, 40, 160]);
    $('campeaoOk').onclick = () => { $('ovCampeao').hidden = true; g.state = prev === 'ad' ? 'play' : prev };
  }
  /* ---------- Recompensa diária ---------- */
  const rotulo = (p: Premio) => p.tipo === 'dinheiro' ? 'R$ ' + p.min + ' min' : p.tipo === 'turbo' ? '×' + p.x + ' ' + p.min + ' min' : '+' + Math.round(p.pct * 100) + '% ⭐';
  /** Primeira abertura do dia: o calendário de 7 dias com o prêmio de hoje. Fecha com 1 toque; depois chama `depois`. */
  function showDiaria(hoje: string, depois: () => void) {
    const dia = g.diaDeHoje(hoje); if (!dia) { depois(); return }
    g.state = 'diaria';
    $('diariaDias').innerHTML = PREMIOS.map((p, i) => '<li class="' + (i + 1 < dia ? 'feito' : i + 1 === dia ? 'hoje' : '') + '"><b>' + (i + 1) + '</b>' + rotulo(p) + '</li>').join('');
    $('ovDiaria').hidden = false;
    const pegar = (dobro: boolean) => {
      const r = g.pegarDiaria(hoje, dobro); $('ovDiaria').hidden = true; g.state = 'play';
      if (r) {
        analytics.registrar('recompensa_diaria', { dia: r.dia, dobrou: dobro });
        const txt = r.premio.tipo === 'dinheiro' ? '+R$ ' + fmt(r.valor) : r.premio.tipo === 'turbo' ? 'Turbo ×' + r.premio.x + ' por ' + r.valor + ' min!' : '+' + r.valor + ' de fama ⭐';
        g.popups.push({ x: g.player.x, y: g.player.y - 60, txt, life: 2.2, col: '#2f9e44', size: 20 });
        if (r.dia === 7) praiaNova(); else tone(988, 0.15, 'triangle', 0.1, 1.2);
        buzz(40);
      }
      depois();
    };
    $('diariaPegar').onclick = () => { ensureAudio(); pegar(false) };
    // se o anúncio fechar antes da recompensa, pega o prêmio normal (sem derrota)
    $('diariaDobro').onclick = () => { ensureAudio(); showAd('diaria_dobro', () => pegar(true), () => pegar(false)) };
  }
  function chegar() {
    $('ovBeach').hidden = true; g.state = 'play';
    if (viagemAtual) { const v = viagemAtual; analytics.registrar('praia_nova', { praia: g.beach + 1, fama_ganha: v.fama, minutos: Math.round(v.minutos), anuncio: v.anuncio }); viagemAtual = null }
    const n = $('praiaNome'); n.textContent = g.beachName(); n.hidden = true; void n.offsetWidth; n.hidden = false; // reinicia a animação
    setTimeout(() => { n.hidden = true }, 2700); tone(784, 0.2, 'triangle', 0.1, 1.2);
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
  $('boost').addEventListener('click', () => { if (g.state !== 'play' || g.boostOn()) return; ensureAudio(); showAd('dinheiro_dobro', () => { g.boostX = 2; g.boostUntil = g.now + 120000; tone(784, 0.2, 'triangle', 0.1, 1.2); buzz(40) }) });
  $('offTake').addEventListener('click', () => { ensureAudio(); $('ovOffline').hidden = true; g.state = 'play'; pegarOffline(1) });
  // se o anúncio fechar antes da recompensa, recebe o valor normal (sem derrota)
  $('offDouble').addEventListener('click', () => { ensureAudio(); $('ovOffline').hidden = true; g.state = 'play'; showAd('dobrar_offline', () => pegarOffline(2), () => pegarOffline(1)) });
  $('beachOk').addEventListener('click', () => { ensureAudio(); chegar() });
  $('beachAd').addEventListener('click', () => {
    if (!viagemAtual || viagemAtual.anuncio) return; ensureAudio();
    showAd('fama_viagem', () => { viagemAtual!.fama += g.bonusFama(); viagemAtual!.anuncio = true; textoFama(); $('beachAd').hidden = true; tone(988, 0.15, 'triangle', 0.1, 1.2); buzz(40) });
  });
  $('litoralBtn').addEventListener('click', () => { ensureAudio(); abrirLitoral() });
  $('litoralFechar').addEventListener('click', () => { $('ovLitoral').hidden = true; if (g.state === 'litoral') g.state = 'play' });
  syncPrefs();

  return { goal, viagem, campeao, showDiaria, showOffline, showStart, frame, syncTest };
}
