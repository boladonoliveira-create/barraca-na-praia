/* Rodada 8, B2: material da loja (só em dev, ?loja). Tudo é desenhado no canvas com o próprio render do jogo:
   ícone 512 × 512 (com prévia em 48 × 48), destaque 1024 × 500 e 6 capturas 1080 × 1920. Cada imagem tem "Baixar",
   que baixa o PNG pelo navegador. Base: previaLoja.ts do Metrô (só leitura). */
import { W, H, WORLD_W, WORLD_H } from '../dados/mapa.ts';
import { Jogo } from '../core/jogo.ts';
import { desenhar, type Joy } from './desenho.ts';
import { ECONOMIA, NIVEL_ABRE, NIVEL_NOVA_PRAIA } from '../dados/planos.ts';

type Ctx = CanvasRenderingContext2D;
const PARADO: Joy = { on: false, ox: 0, oy: 0, x: 0, y: 0 };
const DISPLAY = '"Baloo 2",sans-serif', UI = 'Nunito,sans-serif';
const INK = '#3a2316', ROXO = '#5b2370', AREIA = '#f3d9a4';

const tela = (w: number, h: number) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c };
function rr(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r) }
function texto(ctx: Ctx, t: string, x: number, y: number, fonte: string, cor: string, alinha: CanvasTextAlign = 'left') {
  ctx.font = fonte; ctx.fillStyle = cor; ctx.textAlign = alinha; ctx.textBaseline = 'middle'; ctx.fillText(t, x, y);
}

/* ---------- Cenas do jogo de verdade ---------- */

/** Monta um Jogo como o ?praia=N do main.ts: abre todas as áreas da praia n, sem tocar no save. */
function montar(n: number): Jogo {
  const g = new Jogo();
  const famas = ECONOMIA.famaMinima.slice(0, Math.max(0, n - 1));
  g.load({ money: 0, niveis: [], paid: {}, praia: n, famaTotal: famas.reduce((a, b) => a + b, 0), famas, ganho: 0, tempo: 0, last: 0, tutorial: 4 });
  const nova = g.areasPraia() - 1;
  for (let a = 0; a <= nova; a++) while (g.liberada(a) && (!g.aberta(a) || (a < nova && g.nivel[a] < NIVEL_ABRE))) { g.applyStep(a, true); g.gratis(a) }
  return g;
}
/** Sobe a área a até o nível n (compras silenciosas de graça). */
function subir(g: Jogo, a: number, n: number) { while (g.nivel[a] < n && g.liberada(a)) g.applyStep(a, true) }
/** Roda o jogo `seg` segundos para a praia encher de clientes e movimento (dinheiro 0: nada é comprado). */
function encher(g: Jogo, seg: number) {
  for (let t = 0; t < seg * 1000; t += 16.67) { g.now += 16.67; g.update(16.67, { x: 0, y: 0 }); g.updateFx(16.67) }
  g.popups = []; g.flyers = []; g.sparks = [];
}
/** Aponta a câmera para o ponto (x, y) do mundo. */
function camera(g: Jogo, x: number, y: number) { g.camX = Math.max(0, Math.min(WORLD_W - W, x - W / 2)); g.camY = Math.max(0, Math.min(WORLD_H - H, y - H / 2)) }
/** A praia desenhada pelo desenhar() do jogo num canvas de largura w (altura H·w/W). */
function cena(g: Jogo, w: number) { const c = tela(w, Math.round(H * w / W)); desenhar(c.getContext('2d')!, g, w / W, PARADO); return c }

/** Praia cheia: monta a praia n, sobe as áreas pedidas, enche e enquadra; sem seta do tutorial. */
function praiaCheia(n: number, niveis: number[], cam: [number, number]): Jogo {
  const g = montar(n);
  niveis.forEach((v, a) => subir(g, a, v));
  encher(g, 60); camera(g, cam[0], cam[1]); g.state = 'inicio';
  return g;
}

/* ---------- Ícone 512 × 512 ---------- */

function guardaSol(ctx: Ctx, cx: number, cy: number, r: number) {
  ctx.fillStyle = '#a9722f'; ctx.fillRect(cx - 7, cy, 14, r * 1.2); // mastro
  const n = 8, passo = Math.PI / n;
  for (let i = 0; i < n; i++) { // gomos alternando vermelho e branco
    ctx.fillStyle = i % 2 ? '#e63946' : '#ffffff';
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, Math.PI + i * passo, Math.PI + (i + 1) * passo); ctx.closePath(); ctx.fill();
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.10)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#a9722f'; ctx.beginPath(); ctx.moveTo(cx, cy - r - 8); ctx.lineTo(cx - 8, cy - r + 6); ctx.lineTo(cx + 8, cy - r + 6); ctx.closePath(); ctx.fill();
}
function barraquinha(ctx: Ctx) {
  ctx.fillStyle = '#c9975a'; ctx.fillRect(340, 366, 122, 104); // parede
  ctx.fillStyle = '#8d5a2b'; ctx.fillRect(340, 366, 122, 12);
  ctx.fillStyle = '#7a5a3a'; ctx.fillRect(352, 402, 98, 42); // balcão (vão)
  ctx.fillStyle = '#e0b87a'; rr(ctx, 344, 444, 114, 22, 6); ctx.fill(); ctx.strokeStyle = '#a26b2f'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#e0b87a'; ctx.beginPath(); ctx.moveTo(326, 368); ctx.lineTo(476, 368); ctx.lineTo(452, 330); ctx.lineTo(350, 330); ctx.closePath(); ctx.fill(); // telhado
  ctx.strokeStyle = '#a26b2f'; ctx.lineWidth = 3; ctx.stroke();
}
function coco(ctx: Ctx, cx: number, cy: number, r: number) {
  ctx.strokeStyle = '#ff5d8f'; ctx.lineWidth = 13; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx + r * 0.35, cy - r * 0.55); ctx.lineTo(cx + r * 1.05, cy - r * 2.1); ctx.stroke();
  ctx.fillStyle = '#4c9a2a'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#7cc24a'; ctx.beginPath(); ctx.arc(cx - r * 0.35, cy - r * 0.35, r * 0.58, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3f7d22'; ctx.beginPath(); ctx.ellipse(cx, cy - r * 0.9, r * 0.5, r * 0.2, 0, 0, Math.PI * 2); ctx.fill();
}
function icone() {
  const c = tela(512, 512), ctx = c.getContext('2d')!;
  let gr = ctx.createLinearGradient(0, 0, 0, 300); gr.addColorStop(0, '#bfe7ff'); gr.addColorStop(1, '#eaf7ff'); ctx.fillStyle = gr; ctx.fillRect(0, 0, 512, 512);
  ctx.fillStyle = '#ffe08a'; ctx.beginPath(); ctx.arc(410, 92, 48, 0, Math.PI * 2); ctx.fill(); // sol
  gr = ctx.createLinearGradient(0, 300, 0, 448); gr.addColorStop(0, '#4dabf7'); gr.addColorStop(1, '#1c7ed6'); ctx.fillStyle = gr; ctx.fillRect(0, 300, 512, 148);
  ctx.strokeStyle = 'rgba(255,255,255,0.72)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) { const yy = 332 + i * 34; ctx.beginPath(); for (let x = 0; x <= 512; x += 8) { const y2 = yy + Math.sin(x / 30 + i * 1.4) * 7; x ? ctx.lineTo(x, y2) : ctx.moveTo(x, y2) } ctx.stroke() }
  ctx.fillStyle = AREIA; ctx.beginPath(); ctx.moveTo(0, 430); ctx.quadraticCurveTo(256, 408, 512, 438); ctx.lineTo(512, 512); ctx.lineTo(0, 512); ctx.closePath(); ctx.fill();
  barraquinha(ctx); guardaSol(ctx, 150, 252, 122); coco(ctx, 252, 430, 54);
  return c;
}

/* ---------- Destaque 1024 × 500 ---------- */

function destaque() {
  const c = tela(1024, 500), ctx = c.getContext('2d')!;
  const gr = ctx.createLinearGradient(0, 0, 0, 500); gr.addColorStop(0, '#bfe7ff'); gr.addColorStop(0.52, '#7ec8f0'); gr.addColorStop(1, AREIA);
  ctx.fillStyle = gr; ctx.fillRect(0, 0, 1024, 500);
  ctx.fillStyle = '#ffe08a'; ctx.beginPath(); ctx.arc(892, 84, 52, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(28,126,214,0.65)'; ctx.fillRect(0, 356, 1024, 60); // faixa de mar
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (let i = 0; i < 2; i++) { const yy = 372 + i * 26; ctx.beginPath(); for (let x = 0; x <= 1024; x += 10) { const y2 = yy + Math.sin(x / 34 + i) * 5; x ? ctx.lineTo(x, y2) : ctx.moveTo(x, y2) } ctx.stroke() }
  // celular com a tela do jogo (praia 6, cheia)
  const g = praiaCheia(6, [7, 6, 5, 6, 0, 0], [900, 560]);
  const jogo = cena(g, 215);
  rr(ctx, 686, 40, 302, 436, 36); ctx.fillStyle = '#1b1b22'; ctx.fill();
  ctx.save(); rr(ctx, 704, 58, 266, 400, 24); ctx.clip(); ctx.drawImage(jogo, 704, 58, 266, 400); ctx.restore();
  rr(ctx, 704, 58, 266, 400, 24); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.stroke();
  // nome e assinatura
  texto(ctx, 'Barraca', 64, 150, `800 96px ${DISPLAY}`, '#fff');
  texto(ctx, 'na Praia', 64, 240, `800 96px ${DISPLAY}`, '#fff');
  texto(ctx, 'Idle Tycoon', 66, 312, `800 40px ${DISPLAY}`, ROXO);
  rr(ctx, 64, 352, 372, 48, 24); ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.fill();
  texto(ctx, '10 praias · fama · equipe', 250, 377, `800 22px ${UI}`, INK, 'center');
  return c;
}

/* ---------- Capturas 1080 × 1920 ---------- */

/** Captura 1080 × 1920: faixa de título colorida no topo e a tela do jogo embaixo. */
function captura(titulo: string, cor: string, conteudo: HTMLCanvasElement) {
  const c = tela(1080, 1920), ctx = c.getContext('2d')!;
  ctx.fillStyle = cor; ctx.fillRect(0, 0, 1080, 1920);
  const gr = ctx.createLinearGradient(0, 0, 0, 210); gr.addColorStop(0, cor); gr.addColorStop(1, 'rgba(0,0,0,0.18)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, 1080, 210);
  const linhas: string[] = []; ctx.font = `800 84px ${DISPLAY}`;
  for (const p of titulo.split(' ')) { const l = linhas.length ? linhas[linhas.length - 1] + ' ' + p : p; if (linhas.length && ctx.measureText(l).width < 980) linhas[linhas.length - 1] = l; else linhas.push(p) }
  linhas.forEach((l, i) => texto(ctx, l, 540, 105 + (i - (linhas.length - 1) / 2) * 92, `800 84px ${DISPLAY}`, '#fff', 'center'));
  ctx.save(); rr(ctx, 90, 210, 900, 1710, 0); ctx.clip(); ctx.drawImage(conteudo, 90, 210, 900, 1710); ctx.restore();
  rr(ctx, 90, 210, 900, 1710, 0); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.stroke();
  return c;
}

function capturas(): [string, HTMLCanvasElement][] {
  // 1. Praia 4 cheia
  const c1 = praiaCheia(4, [8, 6, 5, 6], [1250, 560]);
  // 2. ajudantes trabalhando (vários por área)
  const g2 = montar(4); subir(g2, 0, 12); subir(g2, 1, 10); subir(g2, 3, 13); encher(g2, 40); camera(g2, 240, 600); g2.state = 'inicio';
  // 3. viagem: o quadro dourado de nova praia liberado
  const g3 = montar(5); subir(g3, 4, NIVEL_NOVA_PRAIA); encher(g3, 45); camera(g3, 210, 700); g3.state = 'inicio';
  // 4. show de pagode no palco
  const g4 = montar(9); subir(g4, 8, 6); encher(g4, 30); g4.palco = { t: 0, show: 600000 }; camera(g4, 1262, 460); g4.state = 'inicio';
  // 5. torneio (final em andamento, com troféus)
  const g5 = montar(10); subir(g5, 9, 7); encher(g5, 30); g5.trofeus = 2; g5.partida = { etapa: 3, ms: 300000 }; camera(g5, 2315, 650); g5.state = 'inicio';
  // 6. Praia 1, com a seta do tutorial (jogar com um dedo)
  const g6 = montar(1); g6.firstScene(); encher(g6, 4); g6.tutorial = 0; g6.moved = 0; camera(g6, 200, 560); g6.state = 'play';
  return [
    ['captura-1-monte-o-seu-point.png', captura('Monte o seu point na praia', '#1c7ed6', cena(c1, 900))],
    ['captura-2-contrate-ajudantes.png', captura('Contrate ajudantes', '#2f9e44', cena(g2, 900))],
    ['captura-3-viaje-para-praias-novas.png', captura('Viaje para praias novas', '#e8590c', cena(g3, 900))],
    ['captura-4-show-de-pagode.png', captura('Show de pagode na areia', '#862e9c', cena(g4, 900))],
    ['captura-5-seja-campeao.png', captura('Seja campeão da praia', '#e03131', cena(g5, 900))],
    ['captura-6-jogue-com-um-dedo.png', captura('Jogue só com um dedo', '#f08c00', cena(g6, 900))],
  ];
}

/* ---------- Página (só em dev) ---------- */

async function montarLoja() {
  await document.fonts.ready;
  await document.fonts.load(`800 84px ${DISPLAY}`); await document.fonts.load(`800 22px ${UI}`);
  document.querySelectorAll('.app, .tela').forEach(e => e.remove());
  document.body.style.cssText = `margin:0;padding:16px;background:#f6efe2;font:14px ${UI};color:${INK}`;
  const add = <K extends keyof HTMLElementTagNameMap>(tag: K, pai: HTMLElement, txt = '') => { const e = document.createElement(tag); e.textContent = txt; pai.appendChild(e); return e };
  add('h1', document.body, 'Material da loja');
  const nota = add('p', document.body, 'Clique em "Baixar" para salvar cada PNG (ícone, destaque e as 6 capturas).');
  nota.style.cssText = 'color:#6b5d4a';
  const imagens: [string, HTMLCanvasElement][] = [['icone-512.png', icone()], ['destaque-1024x500.png', destaque()], ...capturas()];
  const grade = add('div', document.body); grade.style.cssText = 'display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start;margin-top:12px';
  for (const [nome, c] of imagens) {
    const fig = add('figure', grade); fig.style.cssText = 'margin:0;display:grid;gap:6px;background:#fff;padding:10px;border-radius:10px;box-shadow:0 1px 4px rgba(0,0,0,.08)';
    c.style.cssText = `width:${c.width > c.height ? 360 : 210}px;border:1px solid #d5dae3;border-radius:6px`; fig.append(c);
    if (nome.startsWith('icone')) { // prévia no tamanho de lista da loja
      const p = tela(48, 48); p.getContext('2d')!.drawImage(c, 0, 0, 48, 48);
      p.title = 'Prévia em 48 × 48'; p.style.cssText = 'border:1px solid #d5dae3;border-radius:8px'; fig.append(p);
    }
    add('figcaption', fig, `${nome} · ${c.width} × ${c.height}`);
    const a = add('a', fig, 'Baixar'); a.download = nome; a.href = c.toDataURL('image/png');
    a.style.cssText = `justify-self:start;padding:6px 14px;border-radius:8px;background:${ROXO};color:#fff;text-decoration:none;font-weight:800`;
  }
}
montarLoja();
