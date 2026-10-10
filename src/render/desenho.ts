/* Câmera, cenário, personagens, máquinas e efeitos. Só lê o estado do núcleo. */
import { W, H, WORLD_W, SHORE, WALL_Y, PLAY_BOTTOM, LOTS, SHOPS, SLOTS, COUNTER_CAP, CASH_MAGNET, SERVICO, ESCOLA, TORNEIO, type Item, type Lot, type Rect } from '../dados/mapa.ts';
import { fmt } from '../core/economia.ts';
import { NIVEL_ABRE, AREAS } from '../dados/planos.ts';
import { PRAIAS } from '../dados/praias.ts';
import { desenharCenario, luz } from './cenarios.ts';
import { zoneOf, padOf, inZone, NUM_AREAS, type Jogo, type Kind, type Machine, type Umbrella, type Carrier, type Vendedor } from '../core/jogo.ts';

export interface Joy { on: boolean; ox: number; oy: number; x: number; y: number }
interface PersonLook { shirt: string; skin: string; walk?: number; face?: number; cap?: string; hat?: boolean; apron?: boolean; hair?: string; hairStyle?: number; shorts?: string; flip?: string; shades?: boolean; carry?: boolean }

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const specks = Array.from({ length: 380 }, () => ({ x: Math.random() * WORLD_W, y: SHORE + Math.random() * (H - SHORE), r: Math.random() * 1.4 + 0.4, c: Math.random() < .5 ? 'rgba(190,150,90,0.25)' : 'rgba(255,255,255,0.35)' }));
let ctx: CanvasRenderingContext2D, g: Jogo;

function rr(x: number, y: number, w: number, h: number, r: number) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath() }
function circ(x: number, y: number, r: number) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2) }
function shadow(x: number, y: number, w: number) { ctx.fillStyle = 'rgba(120,80,30,0.18)'; ctx.beginPath(); ctx.ellipse(x, y, w, w * 0.32, 0, 0, Math.PI * 2); ctx.fill() }

function drawItem(kind: Kind, x: number, y: number, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (kind === 'acai') {
    const lv = g.L('cardapio'); if (lv >= 5) ctx.scale(1.15, 1.15);
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-7, -5); ctx.lineTo(7, -5); ctx.lineTo(5, 7); ctx.lineTo(-5, 7); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#d9c7e6'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#5b2370'; ctx.beginPath(); ctx.ellipse(0, -5, 8, lv >= 5 ? 6 : 4.5, 0, 0, Math.PI * 2); ctx.fill();
    if (lv >= 1) { ctx.fillStyle = '#e9c46a'; circ(-4, -6, 1.3); ctx.fill(); circ(3, -4, 1.2); ctx.fill(); circ(-1, -3.5, 1.1); ctx.fill() }
    if (lv >= 2) { ctx.strokeStyle = '#fff8e7'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-6, -6); ctx.quadraticCurveTo(-2, -9, 1, -6); ctx.quadraticCurveTo(4, -3, 6, -6); ctx.stroke() }
    if (lv >= 3) { ctx.fillStyle = '#e63946'; circ(3, -8.5, 2.4); ctx.fill(); ctx.fillStyle = '#2b9348'; circ(3, -11, 1.1); ctx.fill() }
    if (lv >= 4) { ctx.fillStyle = '#d4a373'; rr(-6, -10, 4.5, 3.5, 1); ctx.fill() }
  } else if (kind === 'coco') {
    const lv = g.L('cardapio'); ctx.fillStyle = '#4c9a2a'; circ(0, 0, 7.5); ctx.fill(); ctx.fillStyle = '#7cc24a'; circ(-2, -2.5, 4); ctx.fill();
    ctx.strokeStyle = lv >= 1 ? '#ff5d8f' : '#ffffff'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(1, -4); ctx.lineTo(5, -12); ctx.stroke();
    if (lv >= 2) { ctx.fillStyle = '#ffd43b'; ctx.beginPath(); ctx.moveTo(-8, -9); ctx.lineTo(-1, -13); ctx.lineTo(-2, -6); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-3, -9); ctx.lineTo(-2, -2); ctx.stroke() }
    if (lv >= 3) { ctx.fillStyle = '#a3d977'; circ(6, 2, 3); ctx.fill(); ctx.strokeStyle = '#5c940d'; ctx.lineWidth = 0.8; ctx.stroke() }
  } else if (kind === 'sorvete') {
    const lv = g.L('cardapioS'), n = 1 + Math.min(2, lv);
    ctx.fillStyle = '#e0a458'; ctx.beginPath(); ctx.moveTo(-6, -2); ctx.lineTo(6, -2); ctx.lineTo(0, 9); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#b97a35'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-3, 0); ctx.lineTo(2, 6); ctx.moveTo(3, 0); ctx.lineTo(-2, 6); ctx.stroke();
    const cols = ['#ff8fab', '#fff3d6', '#8b5e3c']; for (let i = 0; i < n; i++) { ctx.fillStyle = cols[i]; circ(0, -5 - i * 6, 6 - i * 0.6); ctx.fill() }
    const top = -5 - (n - 1) * 6;
    if (lv >= 3) { const sc = ['#ffd43b', '#4dabf7', '#69db7c', '#f783ac']; for (let i = 0; i < 5; i++) { ctx.fillStyle = sc[i % 4]; ctx.fillRect(-4 + i * 2, top - 2 + (i % 2) * 2, 1.5, 1.5) } }
    if (lv >= 4) { ctx.fillStyle = '#c9184a'; circ(0, top - 6, 2); ctx.fill() }
  } else if (kind === 'caixa') {
    ctx.fillStyle = '#c8955a'; rr(-9, -7, 18, 14, 2); ctx.fill(); ctx.fillStyle = '#a87742'; ctx.fillRect(-9, -2, 18, 2); ctx.fillStyle = '#fff'; rr(-5, 1, 10, 5, 1); ctx.fill(); ctx.fillStyle = '#ff8fab'; circ(0, 3.5, 1.6); ctx.fill();
  } else if (kind === 'milho' || kind === 'milhoCru') {
    // espiga: crua fica pálida e enrolada na palha; pronta fica amarela e ganha o cardápio por cima
    const pronto = kind === 'milho', lv = g.L('cardapioM');
    ctx.fillStyle = pronto ? '#ffd43b' : '#f4e3a1'; ctx.beginPath(); ctx.ellipse(0, -2, 4.5, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = pronto ? '#f59f00' : '#e9d58a'; for (let r = -8; r <= 4; r += 3) for (const c of [-2, 0, 2]) { circ(c, r, 0.9); ctx.fill() }
    ctx.fillStyle = pronto ? '#69db7c' : '#8ce99a'; ctx.beginPath(); ctx.moveTo(-5, 6); ctx.quadraticCurveTo(-8, -2, -3, -9); ctx.lineTo(-1, 4); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(5, 6); ctx.quadraticCurveTo(8, -2, 3, -9); ctx.lineTo(1, 4); ctx.closePath(); ctx.fill();
    if (!pronto) { ctx.fillStyle = '#b2f2bb'; rr(-4, -4, 8, 9, 3); ctx.fill() }
    if (pronto && lv >= 1) { ctx.fillStyle = '#fff3bf'; rr(-3, -7, 6, 3, 1); ctx.fill() }
    if (pronto && lv >= 3) { ctx.fillStyle = '#fff'; for (let i = 0; i < 4; i++) ctx.fillRect(-3 + i * 2, -3 + (i % 2) * 3, 1.4, 1.4) }
  } else if (kind === 'pastel' || kind === 'pastelCru') {
    const pronto = kind === 'pastel', lv = g.L('cardapioM');
    if (pronto && lv >= 2) ctx.scale(1.12, 1.12);
    ctx.fillStyle = pronto ? '#f08c00' : '#fff3d6'; ctx.beginPath(); ctx.moveTo(-9, 3); ctx.quadraticCurveTo(0, -11, 9, 3); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = pronto ? '#c76a00' : '#e9d5a8'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-9, 3); ctx.lineTo(9, 3); ctx.stroke();
    for (let i = -6; i <= 6; i += 3) { ctx.beginPath(); ctx.moveTo(i, 3); ctx.lineTo(i, 1); ctx.stroke() }
    if (pronto) { ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.ellipse(-2, -2, 3, 1.5, -0.4, 0, Math.PI * 2); ctx.fill() }
  } else if (kind === 'mate') {
    // copo de mate gelado; com limão ganha a rodela, no combo vem com canudo listrado
    const lv = g.L('cardapioA');
    ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.moveTo(-6, -7); ctx.lineTo(6, -7); ctx.lineTo(4.5, 8); ctx.lineTo(-4.5, 8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c8772e'; ctx.beginPath(); ctx.moveTo(-5.4, -3); ctx.lineTo(5.4, -3); ctx.lineTo(4.2, 7); ctx.lineTo(-4.2, 7); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(-3, -1, 2, 2); ctx.fillRect(1, 2, 2, 2);
    if (lv >= 1) { ctx.fillStyle = '#a9e34b'; circ(5, -7, 3.2); ctx.fill(); ctx.fillStyle = '#d8f5a2'; circ(5, -7, 1.8); ctx.fill() }
    ctx.strokeStyle = lv >= 2 ? '#e64980' : '#fff'; ctx.lineWidth = 1.6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-1, -3); ctx.lineTo(-3, -12); ctx.stroke();
  } else if (kind === 'biscoito') {
    // saquinho de biscoito de polvilho (rodinhas brancas)
    ctx.fillStyle = '#ffe8cc'; rr(-7, -8, 14, 16, 3); ctx.fill(); ctx.strokeStyle = '#e8590c'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#e8590c'; ctx.fillRect(-7, -8, 14, 3);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.8; for (const [bx, by] of [[-3, 0], [3, 1], [0, 5]]) { ctx.beginPath(); ctx.arc(bx, by, 2.2, 0, Math.PI * 2); ctx.stroke() }
  } else if (kind === 'laranja') {
    ctx.fillStyle = '#fd7e14'; circ(0, 0, 6.5); ctx.fill(); ctx.fillStyle = '#ffa94d'; circ(-2, -2, 2.5); ctx.fill(); ctx.fillStyle = '#2f9e44'; ctx.beginPath(); ctx.ellipse(2, -7, 3, 1.4, -0.5, 0, Math.PI * 2); ctx.fill();
  } else if (kind === 'acaiBanana') {
    ctx.fillStyle = '#5b2370'; for (const [bx, by] of [[-3, 1], [2, 2], [0, -2]]) { circ(bx, by, 3); ctx.fill() }
    ctx.strokeStyle = '#ffd43b'; ctx.lineWidth = 3.4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(2, -4, 6, 0.3, 1.9); ctx.stroke();
  } else if (kind === 'sucoLaranja' || kind === 'sucoAcai') {
    // copo de suco: cresce com o "copo maior"; o cardápio põe gelo, hortelã e canudo
    const lv = g.L('cardapioJ'), cor = kind === 'sucoLaranja' ? '#fd7e14' : '#7b3a92'; if (g.L('copoMaior') >= 2) ctx.scale(1.12, 1.12);
    ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.moveTo(-6, -8); ctx.lineTo(6, -8); ctx.lineTo(4.5, 8); ctx.lineTo(-4.5, 8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = cor; ctx.beginPath(); ctx.moveTo(-5.4, -4); ctx.lineTo(5.4, -4); ctx.lineTo(4.2, 7); ctx.lineTo(-4.2, 7); ctx.closePath(); ctx.fill();
    if (lv >= 1) { ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.fillRect(-3, -3, 3, 3); ctx.fillRect(1, -1, 3, 3) }
    if (lv >= 3) { ctx.fillStyle = '#40c057'; ctx.beginPath(); ctx.ellipse(-3, -9, 3, 1.5, -0.6, 0, Math.PI * 2); ctx.fill() }
    ctx.strokeStyle = lv >= 2 ? '#ffd43b' : '#fff'; ctx.lineWidth = 1.6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(2, -4); ctx.lineTo(4, -13); ctx.stroke();
  } else if (kind === 'prancha') {
    // prancha molhada (com gotas)
    ctx.rotate(-0.5); ctx.fillStyle = '#4dabf7'; ctx.beginPath(); ctx.ellipse(0, 0, 11, 3.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillRect(-10, -0.6, 20, 1.2); ctx.rotate(0.5);
    ctx.fillStyle = '#74c0fc'; circ(-5, 6, 1.3); ctx.fill(); circ(4, 7, 1.1); ctx.fill();
  } else { ctx.fillStyle = '#2f9e44'; rr(-8, -5, 16, 10, 2); ctx.fill(); ctx.fillStyle = '#b2f2bb'; circ(0, 0, 2.6); ctx.fill() }
  ctx.restore();
}

/* Personagens: contorno marrom, short, chinelo, braços que balançam ao andar (ou erguidos segurando a pilha),
   cabelo, olhos e sorriso. Clientes ganham cabelo, short e óculos sorteados uma vez (só visual, fora do núcleo). */
const OUTLINE = 'rgba(58,35,22,0.55)';
const HAIRS = ['#2b1d14', '#5a3825', '#8a5a2b', '#e0b04a', '#1a1a1a', '#b5651d'];
const SHORTS = ['#3b5bdb', '#2b8a3e', '#e8590c', '#495057', '#d6336c', '#1098ad'];
const looks = new WeakMap<object, { hair: string; hairStyle: number; shorts: string; shades: boolean }>();
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
function lookOf(c: object) {
  let l = looks.get(c);
  if (!l) { l = { hair: pick(HAIRS), hairStyle: Math.floor(Math.random() * 5), shorts: pick(SHORTS), shades: Math.random() < 0.25 }; looks.set(c, l) }
  return l;
}

function drawPerson(x: number, y: number, o: PersonLook) {
  const w = o.walk || 0, bob = reduceMotion ? 0 : Math.abs(Math.sin(w)) * 2.2, sw = reduceMotion ? 0 : Math.sin(w), f = o.face || 1;
  shadow(x, y + 2, 12);
  ctx.save(); ctx.translate(x, y - bob); ctx.lineWidth = 1.5; ctx.strokeStyle = OUTLINE; ctx.lineJoin = 'round';
  // pernas e chinelos
  for (const s of [-1, 1]) {
    const ly = sw * s * 2.4;
    ctx.fillStyle = o.skin; rr(s * 3.5 - 2.2, -7 + ly * 0.3, 4.4, 9, 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = o.flip || '#4dabf7'; ctx.beginPath(); ctx.ellipse(s * 3.5 + f, 2.4 + ly * 0.3, 3.3, 1.6, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = o.shorts || '#3b5bdb'; rr(-8.5, -12, 17, 7, 3); ctx.fill(); ctx.stroke();
  // braços: balançam ao andar; erguidos quando carrega a pilha
  for (const s of [-1, 1]) {
    ctx.save(); ctx.translate(s * 8.5, -20); ctx.rotate(o.carry ? s * (Math.PI - 0.35) : s * 0.18 + sw * s * 0.5);
    ctx.fillStyle = o.skin; rr(-2.1, -1, 4.2, 11, 2.1); ctx.fill(); ctx.stroke(); ctx.restore();
  }
  ctx.fillStyle = o.shirt; rr(-9.5, -24, 19, 14, 7); ctx.fill(); ctx.stroke();
  if (o.apron) { ctx.fillStyle = '#fff'; rr(-6.5, -18, 13, 11, 4); ctx.fill(); ctx.fillStyle = '#5b2370'; circ(0, -12.5, 2); ctx.fill() }
  // cabelo de trás, cabeça, cabelo da frente
  const hs = o.hairStyle ?? 0, hair = o.hair || '#2b1d14';
  if (hs === 1) { ctx.fillStyle = hair; rr(-9.5, -37, 19, 15, 7); ctx.fill(); ctx.stroke() }
  ctx.fillStyle = o.skin; circ(0, -30, 8.5); ctx.fill(); ctx.stroke();
  ctx.fillStyle = hair;
  if (hs !== 4) { ctx.beginPath(); ctx.ellipse(0, -34, 8.8, 5.2, 0, Math.PI, 0); ctx.fill() }
  if (hs === 2) for (const [cx, cy] of [[-7, -34], [-3, -38], [3, -38], [7, -34]]) { circ(cx, cy, 3.3); ctx.fill() }
  if (hs === 3) { circ(0, -40.5, 3.6); ctx.fill() }
  // rosto olhando para onde anda
  const fx = f * 2;
  if (o.shades) { ctx.fillStyle = '#212529'; rr(fx - 6, -32, 5, 3.4, 1.5); ctx.fill(); rr(fx + 1, -32, 5, 3.4, 1.5); ctx.fill(); ctx.fillRect(fx - 1, -31.2, 2, 1) }
  else { ctx.fillStyle = '#3a2316'; circ(fx - 2.6, -30, 1.3); ctx.fill(); circ(fx + 2.6, -30, 1.3); ctx.fill(); ctx.fillStyle = '#fff'; circ(fx - 2.2, -30.5, 0.45); ctx.fill(); circ(fx + 3, -30.5, 0.45); ctx.fill() }
  ctx.fillStyle = 'rgba(255,120,120,0.35)'; circ(fx - 5, -27, 1.6); ctx.fill(); circ(fx + 5, -27, 1.6); ctx.fill();
  ctx.strokeStyle = '#3a2316'; ctx.lineWidth = 1.1; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(fx, -27.4, 2, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();
  if (o.cap) { ctx.fillStyle = o.cap; ctx.strokeStyle = OUTLINE; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, -32, 8.8, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); rr(f > 0 ? 1 : -13, -33, 12, 3.5, 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff'; circ(0, -36, 1.8); ctx.fill() }
  else if (o.hat) { ctx.fillStyle = '#f4d58d'; ctx.strokeStyle = OUTLINE; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(0, -35, 12.5, 4, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(0, -35, 6.5, Math.PI, 0); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#e8590c'; ctx.fillRect(-6.5, -37, 13, 2) }
  ctx.restore();
}
function drawStack(a: Carrier) { for (let i = 0; i < a.stack.length; i++) drawItem(a.stack[i], a.x, a.y - 44 - i * (a.stack[i] === 'caixa' ? 13 : 9), 1) }

function drawMachine(m: Machine) {
  const r = g.rateOf(m.type); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (m.type === 'acai') {
    shadow(m.x, m.y + 22, 34); rr(m.x - 31, m.y - 24, 62, 46, 10); ctx.fillStyle = '#7b3a92'; ctx.fill(); rr(m.x - 31, m.y - 24, 62, 14, 10); ctx.fillStyle = '#9b59b6'; ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = '800 11px "Baloo 2",sans-serif'; ctx.fillText('AÇAÍ' + (g.L('turbo') ? ' +' : ''), m.x, m.y + 2);
    ctx.fillStyle = 'rgba(255,255,255,0.85)'; rr(m.x - 20, m.y + 12, 40, 6, 3); ctx.fill(); ctx.fillStyle = '#ffc23d'; rr(m.x - 20, m.y + 12, 40 * Math.min(1, m.t / r), 6, 3); ctx.fill();
  } else if (m.type === 'coco') {
    shadow(m.x, m.y + 20, 30); ctx.fillStyle = '#8d5a2b'; rr(m.x - 5, m.y - 6, 10, 26, 4); ctx.fill();
    ctx.fillStyle = '#2f8f3e'; for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.3; ctx.save(); ctx.translate(m.x, m.y - 8); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(18, 0, 20, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore() }
    ctx.fillStyle = '#4c9a2a'; circ(m.x - 5, m.y - 6, 5); ctx.fill(); circ(m.x + 5, m.y - 4, 5); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.85)'; rr(m.x - 20, m.y + 16, 40, 6, 3); ctx.fill(); ctx.fillStyle = '#ffc23d'; rr(m.x - 20, m.y + 16, 40 * Math.min(1, m.t / r), 6, 3); ctx.fill();
  } else if (m.needs) {
    // panela (milho) ou fritadeira (pastel): mostra o que está cozinhando e a barra de tempo
    const tempo = g.cookMs(m), frit = m.type === 'pastel', liqui = m.type === 'sucoLaranja' || m.type === 'sucoAcai';
    if (liqui) { // liquidificadora: copo alto na base, com a fruta batendo
      shadow(m.x, m.y + 22, 30); ctx.fillStyle = '#495057'; rr(m.x - 24, m.y + 2, 48, 20, 5); ctx.fill();
      ctx.fillStyle = 'rgba(208,235,255,0.9)'; rr(m.x - 16, m.y - 34, 32, 36, 6); ctx.fill(); ctx.strokeStyle = '#868e96'; ctx.lineWidth = 2; ctx.stroke();
      if (m.loaded) { ctx.fillStyle = m.type === 'sucoLaranja' ? '#fd7e14' : '#7b3a92'; const h = 30 * Math.min(1, (m.loaded || 0) / g.lote(m.type)); rr(m.x - 14, m.y - h, 28, h, 4); ctx.fill() }
      ctx.fillStyle = '#fff'; ctx.font = '800 10px "Baloo 2",sans-serif'; ctx.fillText('SUCO ' + (m.loaded || 0) + '/' + g.lote(m.type), m.x, m.y + 13);
      ctx.fillStyle = 'rgba(255,255,255,0.85)'; rr(m.x - 20, m.y - 44, 40, 6, 3); ctx.fill(); ctx.fillStyle = '#ff922b'; rr(m.x - 20, m.y - 44, 40 * Math.min(1, m.t / tempo), 6, 3); ctx.fill();
    } else {
    shadow(m.x, m.y + 22, 34); ctx.fillStyle = '#495057'; rr(m.x - 30, m.y + 4, 60, 18, 5); ctx.fill(); // fogão
    ctx.fillStyle = frit ? '#adb5bd' : '#868e96'; rr(m.x - 26, m.y - 22, 52, 30, frit ? 4 : 12); ctx.fill();
    ctx.fillStyle = frit ? '#ffd8a8' : '#d0ebff'; rr(m.x - 22, m.y - 20, 44, 8, 4); ctx.fill(); // óleo / água
    for (let i = 0; i < (m.loaded || 0); i++) drawItem(m.needs, m.x - 15 + (i % 4) * 10, m.y - 18 - Math.floor(i / 4) * 5, 0.55);
    if (m.loaded && !reduceMotion) { ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2; for (let i = -1; i <= 1; i++) { const o = Math.sin(g.now / 200 + i) * 3; ctx.beginPath(); ctx.moveTo(m.x + i * 12, m.y - 26); ctx.quadraticCurveTo(m.x + i * 12 + o, m.y - 34, m.x + i * 12, m.y - 42); ctx.stroke() } }
    ctx.fillStyle = '#fff'; ctx.font = '800 10px "Baloo 2",sans-serif'; ctx.fillText((frit ? 'FRITADEIRA ' : 'PANELA ') + (m.loaded || 0) + '/' + g.lote(), m.x, m.y + 13);
    ctx.fillStyle = 'rgba(255,255,255,0.85)'; rr(m.x - 20, m.y - 4, 40, 6, 3); ctx.fill(); ctx.fillStyle = '#ff922b'; rr(m.x - 20, m.y - 4, 40 * Math.min(1, m.t / tempo), 6, 3); ctx.fill();
    }
  } else if (m.type === 'milhoCru' || m.type === 'pastelCru' || m.type === 'laranja' || m.type === 'acaiBanana') {
    shadow(m.x, m.y + 22, 34); ctx.fillStyle = '#c8955a'; rr(m.x - 30, m.y - 18, 60, 38, 5); ctx.fill(); ctx.fillStyle = '#a87742'; ctx.fillRect(m.x - 30, m.y - 4, 60, 3); ctx.fillRect(m.x - 30, m.y + 8, 60, 3);
    for (let i = 0; i < 3; i++) drawItem(m.type, m.x - 14 + i * 14, m.y - 20, 0.8);
    ctx.fillStyle = '#3a2316'; ctx.font = '800 10px "Baloo 2",sans-serif'; ctx.fillText(({ milhoCru: 'MILHO CRU', pastelCru: 'MASSA', laranja: 'LARANJA', acaiBanana: 'AÇAÍ E BANANA' } as Record<string, string>)[m.type], m.x, m.y + 3);
    ctx.fillStyle = 'rgba(255,255,255,0.85)'; rr(m.x - 20, m.y + 12, 40, 6, 3); ctx.fill(); ctx.fillStyle = '#ffc23d'; rr(m.x - 20, m.y + 12, 40 * Math.min(1, m.t / r), 6, 3); ctx.fill();
  } else {
    shadow(m.x, m.y + 22, 34); ctx.fillStyle = '#d9b382'; rr(m.x - 30, m.y - 22, 60, 42, 6); ctx.fill(); ctx.fillStyle = '#c8955a'; rr(m.x - 30, m.y - 22, 60, 10, 6); ctx.fill();
    ctx.fillStyle = '#3a2316'; ctx.font = '800 10px "Baloo 2",sans-serif'; ctx.fillText(m.type === 'mate' ? 'MATE' : m.type === 'biscoito' ? 'BISCOITO' : 'DEPÓSITO', m.x, m.y + 1);
    ctx.fillStyle = 'rgba(255,255,255,0.85)'; rr(m.x - 20, m.y + 10, 40, 6, 3); ctx.fill(); ctx.fillStyle = '#ffc23d'; rr(m.x - 20, m.y + 10, 40 * Math.min(1, m.t / r), 6, 3); ctx.fill();
  }
  const z = zoneOf(m); rr(z.x - z.w / 2, z.y - z.h / 2, z.w, z.h, 8); ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fill(); ctx.strokeStyle = 'rgba(91,35,112,0.35)'; ctx.lineWidth = 2; ctx.stroke();
  if (m.type === 'caixa') { for (let i = 0; i < m.pile; i++) drawItem('caixa', z.x - 27 + i * 18, z.y + 3, 1) }
  else for (let i = 0; i < m.pile; i++) drawItem(m.type, z.x - 24 + (i % 4) * 16, z.y + 4 - Math.floor(i / 4) * 9, 0.9);
}

function drawPad(x: number, y: number, name: string, remain: number, progress: number, isUp: boolean, gold: boolean, previa = false) {
  const w = 72, h = 60, afford = g.money >= remain;
  if (previa) ctx.globalAlpha = 0.45;
  rr(x - w / 2, y - h / 2, w, h, 12); ctx.fillStyle = gold ? 'rgba(255,243,196,0.92)' : 'rgba(255,253,247,0.8)'; ctx.fill();
  ctx.save(); rr(x - w / 2, y - h / 2, w, h, 12); ctx.clip(); ctx.fillStyle = 'rgba(47,158,68,0.35)'; ctx.fillRect(x - w / 2, y + h / 2 - h * progress, w, h * progress); ctx.restore();
  ctx.setLineDash([6, 5]); ctx.lineWidth = 2.5; ctx.strokeStyle = gold ? '#e0a800' : afford ? '#2f9e44' : '#b08a5a'; rr(x - w / 2, y - h / 2, w, h, 12); ctx.stroke(); ctx.setLineDash([]);
  if (isUp) { ctx.fillStyle = '#2f9e44'; circ(x + w / 2 - 4, y - h / 2 + 4, 9); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x + w / 2 - 4, y - h / 2 + 9); ctx.lineTo(x + w / 2 - 4, y - h / 2); ctx.moveTo(x + w / 2 - 8, y - h / 2 + 3.5); ctx.lineTo(x + w / 2 - 4, y - h / 2 - 0.5); ctx.lineTo(x + w / 2, y - h / 2 + 3.5); ctx.stroke() }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#3a2316'; ctx.font = '800 11px "Nunito",sans-serif';
  const words = name.split(' '), half = Math.ceil(words.length / 2); ctx.fillText(words.slice(0, half).join(' '), x, y - 15); const l2 = words.slice(half).join(' '); if (l2) ctx.fillText(l2, x, y - 3);
  ctx.font = '800 15px "Baloo 2",sans-serif'; ctx.fillStyle = '#2f9e44'; ctx.fillText(previa ? 'depois' : g.testMode ? 'Grátis' : 'R$ ' + fmt(remain), x, y + 15);
  ctx.globalAlpha = 1;
}

/** Quadro dourado de nova praia (maior que os outros, para caber o nome). Depois da última praia pronta: "em breve", sem preço. */
function drawPadPraia() {
  const s = SLOTS.praia, w = 92, h = 78, x = s.x + 8, y = s.y - 6, prox = PRAIAS[g.beach + 1], pode = g.proximaExiste();
  const pr = g.custoNovaPraia(), got = g.paid.praia || 0, prog = pode ? got / pr : 0;
  rr(x - w / 2, y - h / 2, w, h, 12); ctx.fillStyle = 'rgba(255,243,196,0.95)'; ctx.fill();
  ctx.save(); rr(x - w / 2, y - h / 2, w, h, 12); ctx.clip(); ctx.fillStyle = 'rgba(245,159,0,0.35)'; ctx.fillRect(x - w / 2, y + h / 2 - h * prog, w, h * prog); ctx.restore();
  ctx.setLineDash(pode ? [6, 5] : [2, 4]); ctx.lineWidth = 3; ctx.strokeStyle = '#e0a800'; rr(x - w / 2, y - h / 2, w, h, 12); ctx.stroke(); ctx.setLineDash([]);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#3a2316';
  if (!pode) {
    ctx.font = '800 12px "Baloo 2",sans-serif'; ctx.fillText(prox ? prox.nome : 'Praia ' + (g.beach + 2), x, y - 8);
    ctx.font = '800 11px "Nunito",sans-serif'; ctx.fillStyle = '#8a6a52'; ctx.fillText('em breve', x, y + 12); return;
  }
  ctx.font = '800 10px "Nunito",sans-serif'; ctx.fillText('Viajar para a', x, y - 27);
  ctx.font = '800 12px "Baloo 2",sans-serif'; ctx.fillText(prox.nome, x, y - 13);
  ctx.font = '800 11px "Nunito",sans-serif'; ctx.fillStyle = '#e8590c'; ctx.fillText('+' + g.famaGanha() + ' de fama ⭐', x, y + 2);
  ctx.font = '800 15px "Baloo 2",sans-serif'; ctx.fillStyle = '#2f9e44'; ctx.fillText(g.testMode ? 'Grátis' : 'R$ ' + fmt(pr - got), x, y + 22);
}

function drawUmbrella(u: Umbrella) {
  for (let s = 0; s < 2; s++) { const x = u.x + (s ? 22 : -22); ctx.fillStyle = '#fff'; rr(x - 9, u.y + 8, 18, 24, 4); ctx.fill(); ctx.fillStyle = '#ffd8a8'; rr(x - 7, u.y + 10, 14, 20, 3); ctx.fill() }
  shadow(u.x, u.y + 14, 30);
  const cols = ['#ff6b6b', '#fff']; for (let i = 0; i < 8; i++) { ctx.fillStyle = cols[i % 2]; ctx.beginPath(); ctx.moveTo(u.x, u.y - 6); ctx.arc(u.x, u.y - 6, 30, i / 8 * Math.PI * 2, (i + 1) / 8 * Math.PI * 2); ctx.closePath(); ctx.fill() }
  ctx.fillStyle = '#c92a2a'; circ(u.x, u.y - 6, 4); ctx.fill();
}
function priceTag(x: number, y: number, t: Item) { const txt = 'R$ ' + g.price(t); ctx.font = '800 11px "Baloo 2",sans-serif'; const w = ctx.measureText(txt).width + 12; ctx.fillStyle = '#fff'; rr(x - w / 2, y - 9, w, 18, 9); ctx.fill(); ctx.strokeStyle = '#2f9e44'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.fillStyle = '#2f9e44'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, x, y) }
function drawShopCash(si: number) {
  const d = SHOPS[si], st = g.S[si];
  if (g.L('cofre' + si)) { // cofre automático: o dinheiro vai direto para o caixa
    const { x, y } = d.cash; shadow(x, y + 14, 18); ctx.fillStyle = '#495057'; rr(x - 15, y - 12, 30, 26, 4); ctx.fill(); ctx.fillStyle = '#868e96'; rr(x - 11, y - 8, 22, 18, 3); ctx.fill();
    ctx.strokeStyle = '#ffd43b'; ctx.lineWidth = 2; circ(x, y + 1, 5); ctx.stroke(); ctx.fillStyle = '#2f9e44'; ctx.font = '800 10px "Baloo 2",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('COFRE', x, y - 20);
  }
  if (st.cashValue > 0) { ctx.strokeStyle = 'rgba(47,158,68,0.25)'; ctx.setLineDash([3, 6]); ctx.lineWidth = 2; circ(d.cash.x, d.cash.y, CASH_MAGNET); ctx.stroke(); ctx.setLineDash([]) }
  for (let i = 0; i < Math.min(16, st.cashBills); i++) drawItem('bill', d.cash.x - 10 + (i % 2) * 20, d.cash.y + 12 - Math.floor(i / 2) * 5, 1);
  if (st.cashValue > 0) { ctx.fillStyle = '#2f9e44'; ctx.font = '800 13px "Baloo 2",sans-serif'; ctx.textAlign = 'center'; ctx.fillText('R$ ' + fmt(st.cashValue), d.cash.x, d.cash.y - 30) }
}
function drawDropZone(dz: Rect, label: string) { rr(dz.x - dz.w / 2, dz.y - dz.h / 2, dz.w, dz.h, 10); ctx.fillStyle = 'rgba(91,35,112,0.12)'; ctx.fill(); ctx.strokeStyle = 'rgba(91,35,112,0.4)'; ctx.setLineDash([5, 4]); ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = 'rgba(91,35,112,0.65)'; ctx.font = '800 11px "Nunito",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, dz.x, dz.y) }

/** Visual dos marcos (níveis 5, 10, 15, 20): bandeirinhas, letreiro, luzinhas e moldura dourada; e o selo "Nv". */
function drawEnfeites(a: number) {
  if (!g.aberta(a)) return;
  const c = SHOPS[a].counter, t = g.tier(a), x0 = c.x - c.w / 2, yb = c.y + c.h / 2;
  if (t >= 1) { // bandeirinhas penduradas na frente do balcão
    const cols = ['#ff6b6b', '#ffd43b', '#4dabf7', '#69db7c'], n = Math.max(4, Math.round(c.w / 14));
    for (let i = 0; i < n; i++) { const x = x0 + (i + 0.5) * c.w / n; ctx.fillStyle = cols[i % 4]; ctx.beginPath(); ctx.moveTo(x - 6, yb); ctx.lineTo(x + 6, yb); ctx.lineTo(x, yb + 9); ctx.closePath(); ctx.fill() }
  }
  if (t >= 3) { for (let i = 0; i <= 10; i++) { const on = reduceMotion || Math.floor(g.now / 300 + i) % 2 === 0; ctx.fillStyle = on ? '#fff3bf' : '#ffd43b'; circ(x0 + i * c.w / 10, c.y - c.h / 2 - 2, 2.6); ctx.fill() } } // luzinhas
  if (t >= 4) { ctx.strokeStyle = '#f59f00'; ctx.lineWidth = 3; rr(x0 - 3, c.y - c.h / 2 - 3, c.w + 6, c.h + 6, 12); ctx.stroke() } // moldura dourada
  // selo de nível (com uma estrela por marco; a partir do 2º marco vira letreiro dourado)
  const txt = 'Nv ' + g.nivel[a] + (t ? ' ' + '★'.repeat(t) : ''); ctx.font = '800 11px "Baloo 2",sans-serif'; const w = ctx.measureText(txt).width + 12;
  // à esquerda do balcão, na altura dele: ali não há plaquinha de preço nem fila
  const bx = Math.max(LOTS[a].x0 + 6, x0 - w - 4); // sem passar para o lote vizinho
  ctx.fillStyle = t >= 2 ? '#f59f00' : '#5b2370'; rr(bx, c.y - 8, w, 16, 8); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, bx + w / 2, c.y);
}
function drawBarraca(si = 0) {
  const d = SHOPS[si], st = g.S[si], c = d.counter; if (!st.open) return;
  ctx.fillStyle = 'rgba(120,80,30,0.12)'; ctx.beginPath(); ctx.ellipse(c.x, c.y + 20, 104, 12, 0, 0, Math.PI * 2); ctx.fill();
  rr(c.x - c.w / 2, c.y - c.h / 2, c.w, c.h, 10); ctx.fillStyle = '#b8763e'; ctx.fill(); rr(c.x - c.w / 2, c.y - c.h / 2, c.w, 12, 10); ctx.fillStyle = '#d4955a'; ctx.fill();
  ctx.fillStyle = '#8a5229'; for (let i = 1; i < 6; i++) ctx.fillRect(c.x - c.w / 2 + i * c.w / 6, c.y - 6, 2, 24);
  ctx.fillStyle = '#fffdf7'; rr(c.x - 62, c.y + 6, 124, 16, 8); ctx.fill(); ctx.fillStyle = '#5b2370'; ctx.font = '800 12px "Baloo 2",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(d.name, c.x, c.y + 14);
  for (const t of d.products) {
    const n = st.counter[t].length; for (let i = 0; i < Math.min(n, 18); i++) { const s = g.counterSlot(si, t, i); drawItem(t, s.x, s.y, 0.85) }
    if (g.machines.some(m => m.type === t)) priceTag(t === d.products[0] ? c.x - 50 : c.x + 50, c.y - 30 - Math.min(2, Math.floor(n / 6)) * 7, t);
    if (n >= COUNTER_CAP) { ctx.fillStyle = '#e03131'; ctx.font = '800 11px "Baloo 2",sans-serif'; ctx.fillText('CHEIO', t === d.products[0] ? c.x - 50 : c.x + 50, c.y - 48) }
  }
  drawDropZone(d.drop, 'ENTREGAR'); drawShopCash(si);
}

/* ---------- Praia 3: chuveirão, caixa d'água e cadeiras ---------- */
function tagTxt(x: number, y: number, txt: string) { ctx.font = '800 11px "Baloo 2",sans-serif'; const w = ctx.measureText(txt).width + 12; ctx.fillStyle = '#fff'; rr(x - w / 2, y - 9, w, 18, 9); ctx.fill(); ctx.strokeStyle = '#2f9e44'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.fillStyle = '#2f9e44'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, x, y) }
function drawCadeira(c: { x: number; y: number; suja: boolean }) {
  ctx.save(); ctx.translate(c.x, c.y); shadow(0, 12, 16);
  if (c.suja) ctx.rotate(0.5); // bagunçada: torta, com toalha largada
  ctx.strokeStyle = '#8d5a2b'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-12, 12); ctx.lineTo(-8, -12); ctx.moveTo(12, 12); ctx.lineTo(8, -12); ctx.stroke();
  for (let i = 0; i < 4; i++) { ctx.fillStyle = i % 2 ? '#fff' : '#4dabf7'; ctx.fillRect(-9 + i * 4.5, -12, 4.5, 22) }
  if (c.suja) { ctx.fillStyle = '#ff8787'; rr(-6, -2, 14, 8, 2); ctx.fill() }
  ctx.restore();
  if (c.suja) { ctx.fillStyle = '#e03131'; ctx.font = '800 13px "Baloo 2",sans-serif'; ctx.textAlign = 'center'; ctx.fillText('!', c.x + 16, c.y - 14) }
}
function drawServico() {
  const d = SHOPS[2], sv = g.sv; if (!g.S[2].open) return;
  const cap = g.aguaCap(), pct = sv.agua / cap, tx = 840, ty = 232;
  // cano da caixa até os chuveiros
  ctx.fillStyle = '#868e96'; ctx.fillRect(SHOPS[2].counter.x - 100, 236, tx - (SHOPS[2].counter.x - 100), 5);
  for (const ch of sv.chuveiros) {
    ctx.fillStyle = '#bde0fe'; rr(ch.x - 22, ch.y - 12, 44, 18, 6); ctx.fill(); // piso molhado
    ctx.fillStyle = '#868e96'; ctx.fillRect(ch.x - 3, 236, 6, ch.y - 236); ctx.beginPath(); ctx.arc(ch.x, 244, 9, Math.PI, 0); ctx.fill();
    if (ch.user && !reduceMotion) { ctx.strokeStyle = 'rgba(77,171,247,0.8)'; ctx.lineWidth = 1.5; for (let i = 0; i < 6; i++) { const yy = 248 + ((g.now / 4 + i * 9) % 36); ctx.beginPath(); ctx.moveTo(ch.x - 7 + i * 3, yy); ctx.lineTo(ch.x - 7 + i * 3, yy + 5); ctx.stroke() } }
  }
  // caixa d'água com o nível
  shadow(tx, ty + 70, 34); ctx.fillStyle = '#ced4da'; rr(tx - 30, ty, 60, 66, 8); ctx.fill();
  ctx.fillStyle = pct === 0 ? '#ffc9c9' : '#4dabf7'; rr(tx - 24, ty + 6 + 54 * (1 - pct), 48, 54 * pct || 4, 4); ctx.fill();
  ctx.fillStyle = '#3a2316'; ctx.font = '800 11px "Baloo 2",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(sv.agua + '/' + cap, tx, ty + 33);
  if (sv.agua === 0) { ctx.fillStyle = '#e03131'; ctx.font = '800 12px "Baloo 2",sans-serif'; ctx.fillText('VAZIA!', tx, ty - 10) }
  drawDropZone(d.drop, 'ENCHER'); ctx.fillStyle = '#e03131'; circ(d.drop.x + 30, d.drop.y - 12, 5); ctx.fill(); // registro
  tagTxt(SERVICO.filaX - 70, 250, 'Banho R$ ' + fmt(g.precoBanho()));
  tagTxt(745, 530, 'Cadeira R$ ' + fmt(g.precoCadeira()));
  sv.cadeiras.forEach(drawCadeira);
  drawShopCash(2);
}
/* ---------- Área 5: quadra de futevôlei (atração) ---------- */
function drawQuadra() {
  if (!g.aberta(4)) return;
  const c = SHOPS[4].counter, x0 = c.x - c.w / 2, y0 = c.y - c.h / 2, arq = g.L('arquibancada'), rede = g.L('rede'), tor = g.L('torneio');
  ctx.fillStyle = '#f3d9a4'; rr(x0, y0, c.w, c.h, 6); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(x0 + 6, y0 + 6, c.w - 12, c.h - 12);
  // rede (a nova é listrada) e os postes
  ctx.fillStyle = '#868e96'; ctx.fillRect(c.x - 2, y0 - 6, 4, c.h + 12);
  for (let y = y0; y < y0 + c.h; y += 7) { ctx.fillStyle = rede && Math.floor((y - y0) / 7) % 2 ? '#ffd43b' : rede ? '#1c7ed6' : 'rgba(255,255,255,0.9)'; ctx.fillRect(c.x - 1, y, 2, 5) }
  // jogo rolando: dois jogadores e a bola indo e voltando por cima da rede
  const t = reduceMotion ? 0.5 : (Math.sin(g.now / 700) + 1) / 2, bx = c.x - 50 + 100 * t, by = c.y - 10 - Math.sin(t * Math.PI) * 50;
  drawPerson(c.x - 55, c.y + 20, { shirt: '#ff6b6b', skin: '#d9a37a', walk: g.now / 160, face: 1, hair: '#2b1d14', shorts: '#343a40' });
  drawPerson(c.x + 55, c.y + 20, { shirt: '#4dabf7', skin: '#a8714c', walk: g.now / 160 + 1, face: -1, hair: '#1a1a1a', shorts: '#343a40' });
  ctx.fillStyle = '#fff'; circ(bx, by, 5); ctx.fill(); ctx.strokeStyle = '#ffd43b'; ctx.lineWidth = 1.5; ctx.stroke();
  // arquibancada com público: mais gente a cada nível
  if (arq) {
    const ya = WALL_Y + 22; ctx.fillStyle = '#c08a4a'; for (let r = 0; r < 2; r++) rr(x0 + 4, ya + r * 16, c.w - 8, 8, 3), ctx.fill();
    const n = Math.min(18, 6 * arq + 2 * tor);
    for (let i = 0; i < n; i++) { const px = x0 + 14 + (i % 9) * 17, py = ya - 6 + Math.floor(i / 9) * 16, pulo = reduceMotion ? 0 : Math.abs(Math.sin(g.now / 260 + i)) * 2;
      ctx.fillStyle = SHIRTS_Q[i % SHIRTS_Q.length]; rr(px - 5, py - pulo, 10, 9, 4); ctx.fill(); ctx.fillStyle = '#d9a37a'; circ(px, py - 6 - pulo, 4); ctx.fill() }
  }
  // torneio da tarde: faixa e troféu
  if (tor) {
    ctx.fillStyle = '#e03131'; rr(c.x - 62, y0 - 26, 124, 18, 6); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = '800 11px "Baloo 2",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('TORNEIO DA TARDE', c.x, y0 - 17);
    ctx.fillStyle = '#f59f00'; rr(x0 + c.w - 18, y0 - 30, 12, 12, 3); ctx.fill(); ctx.fillRect(x0 + c.w - 14, y0 - 18, 4, 6); ctx.fillRect(x0 + c.w - 18, y0 - 12, 12, 3);
  }
  tagTxt(c.x, y0 + c.h + 12, 'Clientes x' + g.publico().toFixed(2).replace('.', ','));
}
const SHIRTS_Q = ['#ff6b6b', '#4dabf7', '#ffd43b', '#69db7c', '#f783ac', '#ff922b'];

/* ---------- Área 9: palco de pagode ---------- */
function drawPalco() {
  if (!g.aberta(8)) return;
  const c = SHOPS[8].counter, x0 = c.x - c.w / 2, y0 = c.y - c.h / 2, show = g.showAtivo(), som = g.L('somMelhor'), t = reduceMotion ? 0 : g.now;
  // palco: tablado, fundo e caixas de som (maiores com o "som melhor")
  ctx.fillStyle = '#5f3dc4'; rr(x0, y0, c.w, c.h - 26, 8); ctx.fill();
  ctx.fillStyle = '#8d5a2b'; rr(x0 - 6, y0 + c.h - 30, c.w + 12, 18, 4); ctx.fill();
  for (const s of [-1, 1]) { ctx.fillStyle = '#212529'; rr(c.x + s * (c.w / 2 - 8) - 9 - som * 2, y0 + c.h - 62 - som * 4, 18 + som * 4, 32 + som * 4, 3); ctx.fill(); ctx.fillStyle = '#495057'; circ(c.x + s * (c.w / 2 - 8), y0 + c.h - 42 - som * 2, 5 + som); ctx.fill() }
  ctx.fillStyle = '#fffdf7'; rr(c.x - 58, y0 + 6, 116, 16, 8); ctx.fill(); ctx.fillStyle = '#5f3dc4'; ctx.font = '800 11px "Baloo 2",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('PALCO DE PAGODE', c.x, y0 + 14);
  if (show) {
    // banda tocando, luzes e notas musicais
    for (let i = 0; i < 3; i++) drawPerson(c.x - 40 + i * 40, y0 + c.h - 30, { shirt: ['#ff6b6b', '#ffd43b', '#69db7c'][i], skin: ['#a8714c', '#d9a37a', '#7a4b2e'][i], walk: t / 140 + i, face: 1, hair: '#1a1a1a', hat: i === 1, shorts: '#343a40' });
    for (let i = 0; i < 5; i++) { const on = Math.floor(t / 250 + i) % 2 === 0; ctx.fillStyle = on ? 'rgba(255,236,153,0.55)' : 'rgba(255,135,135,0.4)'; ctx.beginPath(); ctx.moveTo(x0 + 18 + i * 36, y0 + 2); ctx.lineTo(x0 + 6 + i * 36, y0 + c.h - 30); ctx.lineTo(x0 + 30 + i * 36, y0 + c.h - 30); ctx.closePath(); ctx.fill() }
    ctx.fillStyle = '#fff'; ctx.font = '800 16px "Baloo 2",sans-serif'; for (let i = 0; i < 4; i++) { const k = ((t / 1400 + i / 4) % 1); ctx.globalAlpha = 1 - k; ctx.fillText(i % 2 ? '♪' : '♫', x0 + 30 + i * 40, y0 - k * 40); } ctx.globalAlpha = 1;
    tagTxt(c.x, y0 + c.h + 12, 'SHOW! ' + tempoTxt(g.palco.show) + ' · Clientes x' + (1 + g.bonusShow()).toFixed(2).replace('.', ','));
  } else tagTxt(c.x, y0 + c.h + 12, 'Próximo show em ' + tempoTxt(g.palco.t));
}
const tempoTxt = (ms: number) => { const s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0') };

/* ---------- Área 10: torneio ---------- */
function drawTorneio() {
  if (!g.aberta(9)) return;
  const c = SHOPS[9].counter, x0 = c.x - c.w / 2, y0 = c.y - c.h / 2, pt = g.partida, jogando = pt.ms > 0, t = reduceMotion ? 0 : g.now;
  ctx.fillStyle = '#f3d9a4'; rr(x0, y0, c.w, c.h, 6); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(x0 + 6, y0 + 6, c.w - 12, c.h - 12);
  ctx.fillStyle = '#868e96'; ctx.fillRect(c.x - 2, y0 - 6, 4, c.h + 12);
  for (let y = y0; y < y0 + c.h; y += 7) { ctx.fillStyle = Math.floor((y - y0) / 7) % 2 ? '#ffd43b' : '#e03131'; ctx.fillRect(c.x - 1, y, 2, 5) }
  // faixa do torneio e os troféus ganhos
  ctx.fillStyle = '#1971c2'; rr(c.x - 70, y0 - 28, 140, 18, 6); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '800 11px "Baloo 2",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('TORNEIO DA PRAIA', c.x, y0 - 19);
  for (let i = 0; i < 3; i++) { const tx = x0 + c.w + 12, ty = y0 + 8 + i * 30; ctx.globalAlpha = i < g.trofeus ? 1 : 0.25; ctx.fillStyle = '#f59f00'; rr(tx - 7, ty, 14, 12, 4); ctx.fill(); ctx.fillRect(tx - 2, ty + 12, 4, 6); ctx.fillRect(tx - 7, ty + 18, 14, 3); ctx.globalAlpha = 1 }
  // dois de cada lado; na partida, a bola vai e volta e o placar mostra a etapa
  const k = jogando ? (Math.sin(t / 450) + 1) / 2 : 0.5, bx = c.x - 55 + 110 * k, by = c.y - 10 - Math.sin(k * Math.PI) * (jogando ? 55 : 0);
  for (const [dx, cor, f] of [[-60, '#e03131', 1], [-30, '#e03131', 1], [30, '#1971c2', -1], [60, '#1971c2', -1]] as const) drawPerson(c.x + dx, c.y + 24 + (dx % 60 ? 14 : 0), { shirt: cor, skin: dx < 0 ? '#d9a37a' : '#a8714c', walk: jogando ? t / 150 + dx : 0, face: f, hair: '#2b1d14', shorts: '#343a40' });
  ctx.fillStyle = '#fff'; circ(bx, by, 5); ctx.fill(); ctx.strokeStyle = '#ffd43b'; ctx.lineWidth = 1.5; ctx.stroke();
  if (jogando) tagTxt(c.x, y0 + c.h + 12, TORNEIO.etapas[pt.etapa - 1] + ' · ' + tempoTxt(pt.ms));
  else if (g.campeao()) tagTxt(c.x, y0 + c.h + 12, 'Campeão da Praia! 🏆');
  else tagTxt(c.x, y0 + c.h + 12, 'Troféus ' + g.trofeus + '/3 · Clientes x' + g.publico().toFixed(2).replace('.', ','));
}

/* ---------- Área 6: ambulantes ---------- */
function drawCarrinho(x: number, y: number, carga: number, cap: number) {
  shadow(x, y + 14, 20);
  ctx.fillStyle = '#495057'; circ(x - 10, y + 10, 4); ctx.fill(); circ(x + 10, y + 10, 4); ctx.fill();
  ctx.fillStyle = '#f8f9fa'; rr(x - 16, y - 14, 32, 22, 4); ctx.fill(); ctx.strokeStyle = '#4dabf7'; ctx.lineWidth = 2; ctx.stroke(); // isopor
  ctx.fillStyle = '#4dabf7'; ctx.fillRect(x - 16, y - 6, 32 * Math.min(1, carga / cap), 4);
  ctx.strokeStyle = '#868e96'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 16, y - 6); ctx.lineTo(x + 24, y - 16); ctx.stroke(); // alça
}
function drawAmbulantes() {
  const d = SHOPS[5]; if (!g.aberta(5)) return;
  const c = d.counter, v0 = g.carregando(), cap = g.isoporCap();
  // depósito: barraca de lona com o nome
  shadow(c.x, c.y + 24, 80); ctx.fillStyle = '#e67700'; rr(c.x - c.w / 2, c.y - c.h / 2, c.w, c.h, 8); ctx.fill();
  for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? '#fff' : '#fab005'; ctx.fillRect(c.x - c.w / 2 + i * c.w / 8, c.y - c.h / 2 - 12, c.w / 8, 12) }
  ctx.fillStyle = '#fffdf7'; rr(c.x - 50, c.y - 6, 100, 16, 8); ctx.fill(); ctx.fillStyle = '#e8590c'; ctx.font = '800 11px "Baloo 2",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(d.name, c.x, c.y + 2);
  drawDropZone(d.drop, v0 ? 'ABASTECER ' + v0.carga.length + '/' + cap : 'CARRINHOS NA RUA');
  priceTag(c.x - 40, c.y - c.h / 2 - 26, 'mate'); if (g.machines.some(m => m.type === 'biscoito')) priceTag(c.x + 40, c.y - c.h / 2 - 26, 'biscoito');
  drawShopCash(5);
}
function drawVendedor(v: Vendedor) {
  drawCarrinho(v.x + v.face * 18, v.y - 4, v.carga.length, g.isoporCap());
  drawPerson(v.x, v.y, { shirt: '#fab005', skin: '#a8714c', walk: v.walk, face: v.face, cap: '#e8590c', hair: '#2b1d14', shorts: '#495057', flip: '#fff' });
}

/* ---------- Área 7: escolinha de surf ---------- */
function drawPrancha(x: number, y: number, cor: string, rot = 0, molhada = false) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = cor; ctx.beginPath(); ctx.ellipse(0, 0, 18, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(-16, -0.8, 32, 1.6); ctx.restore();
  if (molhada) { ctx.fillStyle = '#74c0fc'; circ(x - 8, y + 8, 1.6); ctx.fill(); circ(x + 6, y + 9, 1.4); ctx.fill(); circ(x + 12, y + 6, 1.2); ctx.fill() }
}
const CORES_PRANCHA = ['#ff6b6b', '#ffd43b', '#69db7c', '#f783ac', '#ff922b', '#9775fa', '#38d9a9', '#4dabf7'];
function drawEscola() {
  const d = SHOPS[6]; if (!g.aberta(6)) return;
  const c = d.counter, ps = g.esc.pranchas;
  // arara: dois postes e a barra, com as pranchas em pé (secando pingam)
  ctx.fillStyle = '#8d5a2b'; ctx.fillRect(c.x - c.w / 2, c.y - 30, 5, 44); ctx.fillRect(c.x + c.w / 2 - 5, c.y - 30, 5, 44); ctx.fillRect(c.x - c.w / 2, c.y - 30, c.w, 5);
  ps.forEach((b, i) => {
    if (b.estado !== 'seca' && b.estado !== 'secando') return;
    ctx.save(); ctx.translate(b.x, b.y); ctx.fillStyle = CORES_PRANCHA[i % 8]; ctx.beginPath(); ctx.ellipse(0, -6, 5, 18, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(-0.8, -22, 1.6, 32); ctx.restore();
    if (b.estado === 'secando') { ctx.fillStyle = '#4dabf7'; const k = reduceMotion ? 0 : (g.now / 30 + i * 7) % 14; circ(b.x + 3, b.y + 12 + k, 1.6); ctx.fill() }
  });
  ctx.fillStyle = '#fffdf7'; rr(c.x - 62, c.y + 18, 124, 16, 8); ctx.fill(); ctx.fillStyle = '#1c7ed6'; ctx.font = '800 11px "Baloo 2",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(d.name, c.x, c.y + 26);
  drawDropZone(d.drop, 'SECAR ' + g.naArara() + '/' + g.araraCap());
  tagTxt(ESCOLA.filaX - 66, 250, 'Aula R$ ' + fmt(g.precoAula()));
  ps.forEach((b, i) => { if (b.estado === 'molhada') { drawPrancha(b.x, b.y, CORES_PRANCHA[i % 8], 0.15, true); ctx.fillStyle = '#e03131'; ctx.font = '800 13px "Baloo 2",sans-serif'; ctx.fillText('!', b.x + 20, b.y - 10) } });
  drawShopCash(6);
}

function drawKiosk() {
  const d = SHOPS[1], st = g.S[1], c = d.counter; if (!st.open) return;
  shadow(c.x, c.y + 24, 56);
  ctx.fillStyle = '#4dabf7'; rr(c.x - c.w / 2, c.y - c.h / 2, c.w, c.h, 10); ctx.fill();
  ctx.fillStyle = '#d0ebff'; rr(c.x - c.w / 2 + 6, c.y - c.h / 2 + 6, c.w - 12, 20, 6); ctx.fill();
  const show = Math.min(10, st.stock); for (let i = 0; i < show; i++) drawItem('sorvete', c.x - 36 + (i % 5) * 18, c.y - c.h / 2 + 16 - Math.floor(i / 5) * 4, 0.62);
  for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? '#fff' : '#ff8fab'; ctx.beginPath(); const x0 = c.x - c.w / 2 - 6 + i * (c.w + 12) / 6; ctx.moveTo(x0, c.y - c.h / 2 - 26); ctx.lineTo(x0 + (c.w + 12) / 6, c.y - c.h / 2 - 26); ctx.lineTo(x0 + (c.w + 12) / 6, c.y - c.h / 2 - 14); ctx.arc(x0 + (c.w + 12) / 12, c.y - c.h / 2 - 14, (c.w + 12) / 12, 0, Math.PI); ctx.closePath(); ctx.fill() }
  ctx.fillStyle = '#fffdf7'; rr(c.x - 42, c.y + 8, 84, 14, 7); ctx.fill(); ctx.fillStyle = '#1c7ed6'; ctx.font = '800 11px "Baloo 2",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(d.name, c.x, c.y + 15);
  const cap = g.freezerCap(), pct = st.stock / cap; ctx.fillStyle = 'rgba(255,255,255,0.9)'; rr(c.x + c.w / 2 + 6, c.y - 18, 8, 36, 4); ctx.fill(); ctx.fillStyle = pct < 0.2 ? '#e03131' : '#4dabf7'; rr(c.x + c.w / 2 + 6, c.y + 18 - 36 * pct, 8, 36 * pct, 4); ctx.fill();
  priceTag(c.x, c.y - c.h / 2 - 38, 'sorvete');
  if (st.stock === 0) { ctx.fillStyle = '#e03131'; ctx.font = '800 12px "Baloo 2",sans-serif'; ctx.fillText('VAZIO!', c.x, c.y - 2) }
  drawDropZone(d.drop, 'ABASTECER'); drawShopCash(1);
}
// placa a 66 do começo do lote: inteira dentro das 140 unidades que a câmera mostra além do último lote aberto
function drawLockedLot(lot: Lot, i: number) {
  const w = lot.x1 - lot.x0, cx = lot.x0 + w / 2;
  // na faixa grande: sem cerca e sem silhueta; só a placa, e só quando o lote é desta praia
  if (lot.faixa) { if (i < g.areasPraia()) placaLote(lot, i, cx - 66); return }
  ctx.fillStyle = 'rgba(58,35,22,0.07)'; ctx.fillRect(lot.x0, WALL_Y - 10, w, PLAY_BOTTOM - WALL_Y + 30);
  ctx.globalAlpha = 0.35;
  if (lot.kind === 'shower') {
    for (const sx of [cx - 60, cx + 40]) { ctx.fillStyle = '#868e96'; ctx.fillRect(sx - 3, WALL_Y + 60, 6, 90); ctx.fillRect(sx - 3, WALL_Y + 60, 24, 6); ctx.fillStyle = '#4dabf7'; for (let i = 0; i < 5; i++) ctx.fillRect(sx + 14 + i * 2 - 4, WALL_Y + 72 + i * 7, 2, 10) }
    for (let i = 0; i < 4; i++) { ctx.fillStyle = '#ffd8a8'; rr(lot.x0 + 40 + i * 56, WALL_Y + 230, 26, 40, 4); ctx.fill() }
  } else if (lot.kind === 'volei') {
    ctx.fillStyle = '#868e96'; ctx.fillRect(cx - 70, WALL_Y + 90, 5, 120); ctx.fillRect(cx + 65, WALL_Y + 90, 5, 120);
    ctx.strokeStyle = '#868e96'; ctx.lineWidth = 1.5; for (let y = WALL_Y + 92; y < WALL_Y + 140; y += 8) { ctx.beginPath(); ctx.moveTo(cx - 65, y); ctx.lineTo(cx + 65, y); ctx.stroke() }
    ctx.fillStyle = '#ffd43b'; circ(cx + 20, WALL_Y + 70, 10); ctx.fill();
  } else if (lot.kind === 'ambulantes') {
    for (const [dx, dy] of [[-40, 120], [30, 220]]) { ctx.fillStyle = '#ff922b'; rr(cx + dx - 26, WALL_Y + dy, 52, 30, 6); ctx.fill(); ctx.fillStyle = '#495057'; circ(cx + dx - 14, WALL_Y + dy + 34, 7); ctx.fill(); circ(cx + dx + 14, WALL_Y + dy + 34, 7); ctx.fill() }
  } else if (lot.kind === 'corn') { ctx.fillStyle = '#ffd43b'; rr(cx - 50, WALL_Y + 90, 100, 60, 10); ctx.fill(); ctx.fillStyle = '#868e96'; circ(cx - 30, WALL_Y + 160, 12); ctx.fill(); circ(cx + 30, WALL_Y + 160, 12); ctx.fill(); ctx.fillStyle = '#e9c46a'; rr(cx - 30, WALL_Y + 240, 60, 40, 8); ctx.fill() }
  else if (lot.kind === 'surf') { for (let i = 0; i < 4; i++) { ctx.fillStyle = CORES_PRANCHA[i]; ctx.beginPath(); ctx.ellipse(cx - 45 + i * 30, WALL_Y + 120, 6, 22, 0, 0, Math.PI * 2); ctx.fill() } ctx.fillStyle = '#8d5a2b'; ctx.fillRect(cx - 60, WALL_Y + 92, 120, 5) }
  else { ctx.fillStyle = '#4dabf7'; rr(cx - 46, WALL_Y - 30, 92, 40, 10); ctx.fill(); ctx.fillStyle = '#d9b382'; rr(cx - 30, WALL_Y + 210, 60, 42, 6); ctx.fill() }
  ctx.globalAlpha = 1;
  for (let y = WALL_Y - 14; y < PLAY_BOTTOM + 10; y += 22) { ctx.fillStyle = '#c08a4a'; rr(lot.x0 - 4, y, 8, 18, 3); ctx.fill() }
  ctx.fillStyle = '#a26b2f'; ctx.fillRect(lot.x0 - 6, WALL_Y + 40, 12, 4); ctx.fillRect(lot.x0 - 6, PLAY_BOTTOM - 40, 12, 4);
  placaLote(lot, i, lot.x0);
}
/** A placa com cadeado: o nome do lote e o que falta para abrir (ou "Na próxima praia"). */
function placaLote(lot: Lot, i: number, x0: number) {
  ctx.save(); ctx.translate(x0 + 66, WALL_Y + 150); ctx.rotate(-0.04); ctx.fillStyle = '#fff3c4'; rr(-72, -36, 144, 72, 10); ctx.fill(); ctx.strokeStyle = '#e0b84f'; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.fillStyle = '#3a2316'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '800 11px "Nunito",sans-serif';
  if (ctx.measureText(lot.title!).width > 132) ctx.font = '800 9px "Nunito",sans-serif'; // título longo: cabe na placa
  ctx.fillText(lot.title!, 0, -20);
  // "abre com a área anterior no nível 5 (3/5)"; quando já pode abrir, manda comprar na cerca.
  // O lote da próxima praia só diz o que vai ter (pilar 6: o futuro próximo fica à vista)
  const ant = i - 1, n = Math.min(g.nivel[ant] || 0, NIVEL_ABRE), pronta = g.liberada(i), proxima = i >= g.areasPraia();
  ctx.font = '800 10px "Nunito",sans-serif'; ctx.fillStyle = '#8a6a52';
  if (proxima) ctx.fillText('Na próxima praia:', 0, -2);
  else if (pronta) { ctx.fillStyle = '#2f9e44'; ctx.fillText('Pronta para abrir:', 0, -2) }
  else ctx.fillText('abre com ' + AREAS[ant] + ' nv ' + NIVEL_ABRE, 0, -2);
  ctx.fillStyle = pronta ? '#2f9e44' : '#e0a800'; ctx.font = '800 15px "Baloo 2",sans-serif';
  ctx.fillText(proxima ? PRAIAS[i].area : pronta ? 'compre na cerca' : '(' + n + '/' + NIVEL_ABRE + ')', 0, 18);
  ctx.fillStyle = '#8a6a52'; ctx.beginPath(); ctx.arc(0, -40, 7, Math.PI, 0); ctx.lineWidth = 3; ctx.strokeStyle = '#8a6a52'; ctx.stroke(); ctx.fillRect(-8, -40, 16, 12); ctx.restore();
}
function arrowAt(x: number, y: number, col?: string) { const b = reduceMotion ? 0 : Math.sin(g.now / 180) * 5; ctx.fillStyle = col || '#ff4d6d'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y + b); ctx.lineTo(x - 11, y - 16 + b); ctx.lineTo(x - 4, y - 16 + b); ctx.lineTo(x - 4, y - 30 + b); ctx.lineTo(x + 4, y - 30 + b); ctx.lineTo(x + 4, y - 16 + b); ctx.lineTo(x + 11, y - 16 + b); ctx.closePath(); ctx.stroke(); ctx.fill() }
function arrowUp(x: number, y: number) { ctx.save(); ctx.translate(x, y); ctx.scale(1, -1); arrowAt(0, 0); ctx.restore() }
function sideArrow(dir: number, y: number) { const x = dir > 0 ? W - 22 : 22, b = reduceMotion ? 0 : Math.sin(g.now / 180) * 4 * dir; ctx.save(); ctx.translate(x + b, y); ctx.scale(dir, 1); ctx.fillStyle = '#ff4d6d'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-4, -14); ctx.lineTo(-4, -6); ctx.lineTo(-16, -6); ctx.lineTo(-16, 6); ctx.lineTo(-4, 6); ctx.lineTo(-4, 14); ctx.closePath(); ctx.stroke(); ctx.fill(); ctx.restore() }

/** Onde a seta do tutorial aponta agora (ou null). */
function tutorialTarget(): { t: Rect | { x: number; y: number; h: number } | null; up: boolean } {
  const p = g.player; let t: Rect | { x: number; y: number; h: number } | null = null, up = false;
  if (g.tutorial === 0) { t = zoneOf(g.machines[0]); up = true }
  else if (g.tutorial === 1) { if (p.stack.length) t = SHOPS[0].drop; else { t = zoneOf(g.machines[0]); up = true } }
  else if (g.tutorial === 2) { t = g.S[0].cashValue > 0 ? { x: SHOPS[0].cash.x, y: SHOPS[0].cash.y, h: 48 } : null }
  else {
    if (g.kioskOpen() && g.S[1].stock <= 3 && !g.helpers.some(h => h.shop === 1)) { const dep = g.machines.find(m => m.type === 'caixa'); if (dep) { t = p.stack.includes('caixa') ? SHOPS[1].drop : zoneOf(dep); up = !p.stack.includes('caixa') } }
    if (!t && g.S[2]?.open && g.sv.agua === 0 && !g.helpers.some(h => h.shop === 2) && !inZone(p, SHOPS[2].drop)) t = SHOPS[2].drop;
    if (!t) {
      const v = g.melhorCompra(true);
      if (v) { const pad = padOf(v.s.slot); if (!inZone(p, pad)) t = pad }
      else if (g.novaPraiaAberta() && g.proximaExiste() && g.money >= g.custoNovaPraia() - (g.paid.praia || 0)) { const pad = padOf('praia'); if (!inZone(p, pad)) t = pad }
    }
  }
  return { t, up };
}

export function desenhar(c: CanvasRenderingContext2D, jogo: Jogo, k: number, joy: Joy) {
  ctx = c; g = jogo; const camX = g.camX, p = g.player;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.setTransform(k, 0, 0, k, -camX * k, 0);
  const P = PRAIAS[Math.min(g.beach, PRAIAS.length - 1)], x0 = camX - 20, x1 = camX + W + 20;
  desenharCenario(ctx, P, { x0, x1, t: reduceMotion ? 0 : g.now, cam: camX }, H);
  for (const s of specks) { if (s.x < x0 || s.x > x1) continue; ctx.fillStyle = s.c; circ(s.x, s.y, s.r); ctx.fill() }
  ctx.fillStyle = 'rgba(255,255,255,0.22)'; rr(10, WALL_Y + 4, 380, PLAY_BOTTOM - WALL_Y + 12, 18); ctx.fill();
  LOTS.forEach((l, i) => { if (i && g.S[i]?.open) { rr(l.x0 + 10, WALL_Y + 4, l.x1 - l.x0 - 20, PLAY_BOTTOM - WALL_Y + 12, 18); ctx.fill() } });
  g.umbrellas.forEach(drawUmbrella);
  drawBarraca(); drawKiosk(); drawServico(); drawBarraca(3); drawQuadra(); drawAmbulantes(); drawEscola(); drawBarraca(7); drawPalco(); drawTorneio();
  for (let a = 0; a < NUM_AREAS; a++) drawEnfeites(a);
  // lotes fechados: os desta praia e o da próxima; os depois disso não aparecem
  LOTS.forEach((lot, i) => { if (!lot.praia || i > g.areasPraia() || g.S[i]?.open || lot.x1 < x0 || lot.x0 > x1) return; drawLockedLot(lot, i) });
  for (const v of g.visibleSteps()) { const s = SLOTS[v.s.slot], got = g.paid[v.a + ':' + v.k] || 0; drawPad(s.x, s.y, v.s.name, v.s.price - got, got / v.s.price, v.s.k === 'up', false, v.k !== g.nivel[v.a]) }
  if (g.novaPraiaAberta()) drawPadPraia();

  // ordem de profundidade pelo y
  const ds: { y: number; d: () => void }[] = [];
  g.machines.forEach(m => ds.push({ y: m.y, d: () => drawMachine(m) }));
  g.vend.forEach(v => ds.push({ y: v.y, d: () => drawVendedor(v) }));
  g.customers.forEach(c => ds.push({ y: c.y, d: () => {
    // aluno da escolinha: no mar, de pé na prancha
    if (c.state === 'surf' || ((c.state === 'irMar' || c.state === 'voltaMar') && c.y < SHORE + 10)) {
      const b = g.esc.pranchas.find(x => x.aluno === c), i = b ? g.esc.pranchas.indexOf(b) : 0, bal = reduceMotion ? 0 : Math.sin(g.now / 300 + c.tx) * 0.12;
      drawPrancha(c.x, c.y + 2, CORES_PRANCHA[i % 8], bal); drawPerson(c.x, c.y - 2, { ...c, ...lookOf(c), walk: 0 });
      if (c.state === 'surf' && !reduceMotion) { ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(c.x - 22, c.y + 4, 10, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke() }
      return;
    }
    if (c.state === 'voltaMar' || c.state === 'irMar') { const b = g.esc.pranchas.find(x => x.aluno === c); if (b) drawPrancha(c.x + 14, c.y - 18, CORES_PRANCHA[g.esc.pranchas.indexOf(b) % 8], -1.2) }
    drawPerson(c.x, c.y, { ...c, ...lookOf(c) });
    if (c.has) drawItem(c.has, c.x + (c.face > 0 ? 12 : -12), c.y - 18, 0.9);
    else { const qi = g.S[c.shop].queue.indexOf(c); if (qi >= 0 && qi < 4) { ctx.fillStyle = '#fff'; rr(c.x + 10, c.y - 58, 26, 22, 8); ctx.fill(); ctx.beginPath(); ctx.moveTo(c.x + 14, c.y - 38); ctx.lineTo(c.x + 10, c.y - 32); ctx.lineTo(c.x + 20, c.y - 37); ctx.fill(); drawItem(c.want, c.x + 23, c.y - 47, 0.8) } }
  } }));
  g.helpers.forEach(h => ds.push({ y: h.y, d: () => { drawPerson(h.x, h.y, { shirt: h.shirt, skin: '#c68a5e', walk: h.walk, face: h.face, cap: ['#1c7ed6', '#e64980', '#ffd43b', '#fff'][h.shop], apron: h.shop !== 2, hair: '#2b1d14', shorts: '#343a40', flip: '#fff', carry: h.stack.length > 0 }); drawStack(h) } }));
  ds.push({ y: p.y, d: () => {
    drawPerson(p.x, p.y, { shirt: '#ff922b', skin: '#e0a77d', walk: p.walk, face: p.face, cap: '#e03131', apron: true, hair: '#5a3825', shorts: '#1c7ed6', flip: '#ffd43b', carry: p.stack.length > 0 }); drawStack(p);
    if (p.stack.length >= g.playerCap()) { ctx.fillStyle = '#e03131'; ctx.font = '800 12px "Baloo 2",sans-serif'; ctx.textAlign = 'center'; ctx.fillText('CHEIO', p.x, p.y - 52 - p.stack.length * 9) }
  } });
  ds.sort((a, b) => a.y - b.y).forEach(o => o.d());

  for (const fl of g.flyers) { if (fl.t < 0) continue; const t = Math.min(1, fl.t / fl.dur), e = 1 - Math.pow(1 - t, 2), x = fl.x0 + (fl.x1 - fl.x0) * e, y = fl.y0 + (fl.y1 - fl.y0) * e - Math.sin(t * Math.PI) * 30; drawItem(fl.kind, x, y, 1) }
  for (const s of g.sparks) { ctx.globalAlpha = Math.max(0, s.life); ctx.fillStyle = s.col; circ(s.x, s.y, 3 * s.life + 1); ctx.fill() } ctx.globalAlpha = 1;

  let side = 0, sideY = 0;
  if (g.state === 'play') {
    const { t, up } = tutorialTarget();
    if (t) { const sx = t.x - camX; if (sx < 10) { side = -1; sideY = t.y } else if (sx > W - 10) { side = 1; sideY = t.y } else if (up) arrowUp(t.x, t.y + t.h / 2 + 6); else arrowAt(t.x, t.y - (t.h || 60) / 2 - 6) }
  }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  luz(ctx, P, x0, x1, H);
  for (const pp of g.popups) { ctx.globalAlpha = Math.min(1, pp.life * 1.5); ctx.font = '800 ' + pp.size + 'px "Baloo 2",sans-serif'; ctx.lineWidth = 4; ctx.strokeStyle = '#fff'; ctx.strokeText(pp.txt, pp.x, pp.y); ctx.fillStyle = pp.col; ctx.fillText(pp.txt, pp.x, pp.y) } ctx.globalAlpha = 1;

  // camada da tela (sem câmera)
  ctx.setTransform(k, 0, 0, k, 0, 0);
  if (side) sideArrow(side, Math.min(H - 60, Math.max(WALL_Y, sideY)));
  if (g.state === 'play' && g.moved < 40 && g.tutorial === 0) { ctx.fillStyle = 'rgba(58,35,22,0.75)'; rr(W / 2 - 120, H - 70, 240, 36, 18); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '800 14px "Nunito",sans-serif'; ctx.fillText('Arraste o dedo para andar', W / 2, H - 52) }
  if (g.boostOn()) { ctx.fillStyle = 'rgba(47,158,68,0.9)'; rr(W - 86, 8, 76, 28, 14); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '800 14px "Baloo 2",sans-serif'; ctx.fillText('2x R$', W - 48, 23) }
  if (g.famaTotal > 0) { const txt = '⭐ Fama x' + g.lucro().toFixed(1).replace('.', ','); ctx.font = '800 14px "Baloo 2",sans-serif'; const w = ctx.measureText(txt).width + 20; ctx.fillStyle = 'rgba(255,194,61,0.95)'; rr(10, 8, w, 28, 14); ctx.fill(); ctx.fillStyle = '#3a2316'; ctx.fillText(txt, 10 + w / 2, 23) }
  if (joy.on) { ctx.globalAlpha = 0.5; ctx.strokeStyle = '#3a2316'; ctx.lineWidth = 3; circ(joy.ox, joy.oy, 48); ctx.stroke(); const dx = joy.x - joy.ox, dy = joy.y - joy.oy, d = Math.hypot(dx, dy), m = Math.min(48, d); ctx.fillStyle = '#3a2316'; circ(joy.ox + (d ? dx / d * m : 0), joy.oy + (d ? dy / d * m : 0), 18); ctx.fill(); ctx.globalAlpha = 1 }
}
