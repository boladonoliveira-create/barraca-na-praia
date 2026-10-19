/* Câmera, cenário, personagens, máquinas e efeitos. Só lê o estado do núcleo. */
import { W, H, WORLD_W, WORLD_H, SHORE, WALL_Y, PLAY_BOTTOM, LUGARES, FAIXAS, SHOPS, SLOTS, COUNTER_CAP, CASH_MAGNET, SERVICO, ESCOLA, TORNEIO, AMBULANTE, type Item, type Rect } from '../dados/mapa.ts';
import { fmt } from '../core/economia.ts';
import { NIVEL_ABRE, AREAS } from '../dados/planos.ts';
import { PRAIAS } from '../dados/praias.ts';
import { desenharCenario, luz, hash } from './cenarios.ts';
import { zoneOf, padOf, inZone, posCarga, NUM_AREAS, type Jogo, type Kind, type Machine, type Umbrella, type Carrier, type Vendedor, type Banhista } from '../core/jogo.ts';

export interface Joy { on: boolean; ox: number; oy: number; x: number; y: number }
interface PersonLook { shirt: string; skin: string; walk?: number; face?: number; cap?: string; hat?: boolean; apron?: boolean; hair?: string; hairStyle?: number; shorts?: string; flip?: string; shades?: boolean; carry?: boolean }

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const specks = Array.from({ length: 600 }, () => ({ x: Math.random() * WORLD_W, y: SHORE + Math.random() * (FAIXAS.areia.y1 - SHORE), r: Math.random() * 1.4 + 0.4, c: Math.random() < .5 ? 'rgba(190,150,90,0.25)' : 'rgba(255,255,255,0.35)' }));
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
  } else if (kind === 'caixaMate' || kind === 'caixaBisc') {
    // caixa de papelão com a etiqueta do produto
    ctx.fillStyle = '#c8955a'; rr(-9, -8, 18, 15, 2); ctx.fill(); ctx.fillStyle = '#a87742'; ctx.fillRect(-9, -3, 18, 2);
    ctx.fillStyle = kind === 'caixaMate' ? '#c8772e' : '#fff4e6'; rr(-5, 0, 10, 6, 1); ctx.fill();
    if (kind === 'caixaBisc') { ctx.strokeStyle = '#e8590c'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 3, 1.8, 0, Math.PI * 2); ctx.stroke() }
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
/** Carga nas costas: três colunas de itens, com uma nova camada a cada três itens. Não reduz nem oculta a carga. */
function drawStack(a: Carrier) {
  if (!a.stack.length) return;
  const bx = a.x - a.face * 13, by = a.y - 22;
  ctx.fillStyle = '#8d5a2b'; rr(bx - 12, by - 10, 24, 25, 5); ctx.fill();
  ctx.strokeStyle = '#f4d58d'; ctx.lineWidth = 2; ctx.stroke();
  for (let i = 0; i < a.stack.length; i++) { const p = posCarga(a, i); drawItem(a.stack[i], p.x, p.y, 0.8) }
}

function drawMachine(m: Machine) {
  if (m.pilha) { // pilha de caixas que o caminhão deixou na calçada
    const z = zoneOf(m); rr(z.x - z.w / 2, z.y - z.h / 2, z.w, z.h, 8); ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fill(); ctx.strokeStyle = 'rgba(91,35,112,0.35)'; ctx.lineWidth = 2; ctx.stroke();
    for (let i = 0; i < m.pile; i++) drawItem(m.type, z.x - 24 + (i % 4) * 16, z.y + 6 - Math.floor(i / 4) * 13, 1);
    ctx.fillStyle = '#3a2316'; ctx.font = '800 10px "Baloo 2",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(m.type === 'caixaMate' ? 'CAIXAS DE MATE' : 'CAIXAS DE BISCOITO', z.x, z.y - z.h / 2 - 8); return;
  }
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

function drawPad(x: number, y: number, name: string, remain: number, progress: number, isUp: boolean, gold: boolean, precisa: string | null = null) {
  const w = 72, h = 60, afford = g.money >= remain;
  if (precisa) ctx.globalAlpha = 0.8;
  rr(x - w / 2, y - h / 2, w, h, 12); ctx.fillStyle = gold ? 'rgba(255,243,196,0.92)' : 'rgba(255,253,247,0.8)'; ctx.fill();
  ctx.save(); rr(x - w / 2, y - h / 2, w, h, 12); ctx.clip(); ctx.fillStyle = 'rgba(47,158,68,0.35)'; ctx.fillRect(x - w / 2, y + h / 2 - h * progress, w, h * progress); ctx.restore();
  ctx.setLineDash([6, 5]); ctx.lineWidth = 2.5; ctx.strokeStyle = gold ? '#e0a800' : afford ? '#2f9e44' : '#b08a5a'; rr(x - w / 2, y - h / 2, w, h, 12); ctx.stroke(); ctx.setLineDash([]);
  if (isUp) { ctx.fillStyle = '#2f9e44'; circ(x + w / 2 - 4, y - h / 2 + 4, 9); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x + w / 2 - 4, y - h / 2 + 9); ctx.lineTo(x + w / 2 - 4, y - h / 2); ctx.moveTo(x + w / 2 - 8, y - h / 2 + 3.5); ctx.lineTo(x + w / 2 - 4, y - h / 2 - 0.5); ctx.lineTo(x + w / 2, y - h / 2 + 3.5); ctx.stroke() }
  ctx.globalAlpha = 1; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#3a2316'; ctx.font = '800 11px "Nunito",sans-serif';
  const words = name.split(' '), half = Math.ceil(words.length / 2); ctx.fillText(words.slice(0, half).join(' '), x, y - 15); const l2 = words.slice(half).join(' '); if (l2) ctx.fillText(l2, x, y - 3);
  if (precisa) {
    ctx.fillStyle = '#6c583e'; ctx.font = '800 9px "Nunito",sans-serif'; ctx.fillText('Precisa de:', x, y + 11);
    ctx.font = '800 8px "Nunito",sans-serif'; ctx.fillText(precisa, x, y + 23, 76);
  } else { ctx.font = '800 15px "Baloo 2",sans-serif'; ctx.fillStyle = '#2f9e44'; ctx.fillText(g.testMode ? 'Grátis' : 'R$ ' + fmt(remain), x, y + 15) }
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
  const L = LUGARES[a].zona, bx = Math.max(L.x - L.w / 2 + 6, x0 - w - 4); // sem sair do lugar da área
  ctx.fillStyle = t >= 2 ? '#f59f00' : '#5b2370'; rr(bx, c.y - 8, w, 16, 8); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, bx + w / 2, c.y);
}
function drawBarraca(si = 0) {
  const d = SHOPS[si], st = g.S[si], c = d.counter; if (!st.open) return;
  if (si === 0) {
    ctx.fillStyle = 'rgba(120,80,30,0.12)'; ctx.beginPath(); ctx.ellipse(c.x, c.y + 20, 104, 12, 0, 0, Math.PI * 2); ctx.fill();
    rr(c.x - c.w / 2, c.y - c.h / 2, c.w, c.h, 10); ctx.fillStyle = '#b8763e'; ctx.fill(); rr(c.x - c.w / 2, c.y - c.h / 2, c.w, 12, 10); ctx.fillStyle = '#d4955a'; ctx.fill();
    ctx.fillStyle = '#8a5229'; for (let i = 1; i < 6; i++) ctx.fillRect(c.x - c.w / 2 + i * c.w / 6, c.y - 6, 2, 24);
    ctx.fillStyle = '#fffdf7'; rr(c.x - 62, c.y + 6, 124, 16, 8); ctx.fill(); ctx.fillStyle = '#5b2370'; ctx.font = '800 12px "Baloo 2",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(d.name, c.x, c.y + 14);
  } else drawQuiosque(si); // milho e pastel, sucos: quiosque na grama
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
  const cap = g.aguaCap(), pct = sv.agua / cap, tx = SERVICO.caixa.x, ty = SERVICO.caixa.y;
  // cano da caixa até os chuveiros
  ctx.fillStyle = '#868e96'; ctx.fillRect(SHOPS[2].counter.x - 100, ty + 4, tx - (SHOPS[2].counter.x - 100), 5);
  for (const ch of sv.chuveiros) {
    ctx.fillStyle = '#bde0fe'; rr(ch.x - 22, ch.y - 12, 44, 18, 6); ctx.fill(); // piso molhado
    ctx.fillStyle = '#868e96'; ctx.fillRect(ch.x - 3, ty + 4, 6, ch.y - ty - 4); ctx.beginPath(); ctx.arc(ch.x, ty + 12, 9, Math.PI, 0); ctx.fill();
    if (ch.user && !reduceMotion) { ctx.strokeStyle = 'rgba(77,171,247,0.8)'; ctx.lineWidth = 1.5; for (let i = 0; i < 6; i++) { const yy = ty + 16 + ((g.now / 4 + i * 9) % 36); ctx.beginPath(); ctx.moveTo(ch.x - 7 + i * 3, yy); ctx.lineTo(ch.x - 7 + i * 3, yy + 5); ctx.stroke() } }
  }
  // caixa d'água com o nível
  shadow(tx, ty + 70, 34); ctx.fillStyle = '#ced4da'; rr(tx - 30, ty, 60, 66, 8); ctx.fill();
  ctx.fillStyle = pct === 0 ? '#ffc9c9' : '#4dabf7'; rr(tx - 24, ty + 6 + 54 * (1 - pct), 48, 54 * pct || 4, 4); ctx.fill();
  ctx.fillStyle = '#3a2316'; ctx.font = '800 11px "Baloo 2",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(sv.agua + '/' + cap, tx, ty + 33);
  if (sv.agua === 0) { ctx.fillStyle = '#e03131'; ctx.font = '800 12px "Baloo 2",sans-serif'; ctx.fillText('VAZIA!', tx, ty - 10) }
  drawDropZone(d.drop, 'ENCHER'); ctx.fillStyle = '#e03131'; circ(d.drop.x + 30, d.drop.y - 12, 5); ctx.fill(); // registro
  tagTxt(SERVICO.filaX - 70, SERVICO.filaY, 'Banho R$ ' + fmt(g.precoBanho()));
  tagTxt(SERVICO.cadeiras[0].x + 97, SERVICO.cadeiras[0].y - 26, 'Cadeira R$ ' + fmt(g.precoCadeira()));
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
    const ya = c.y + c.h / 2 + 8; ctx.fillStyle = '#c08a4a'; for (let r = 0; r < 2; r++) rr(x0 + 4, ya + r * 16, c.w - 8, 8, 3), ctx.fill();
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

/* ---------- Área 9: palco de pagode (docs/MOLDE-ORLA.md, item B4) ---------- */
/** Instrumento reconhecível do músico do palco, desenhado no ponto (x, y). */
function palcoInstr(tipo: string, x: number, y: number) {
  ctx.save(); ctx.translate(x, y); ctx.lineWidth = 1.4; ctx.strokeStyle = OUTLINE; ctx.lineJoin = 'round';
  if (tipo === 'pandeiro') {
    ctx.fillStyle = '#e6b980'; circ(0, 0, 8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#f8f0e0'; circ(0, 0, 6.4); ctx.fill();
    ctx.fillStyle = '#c98a4a'; for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; circ(Math.cos(a) * 6.4, Math.sin(a) * 6.4, 1.3); ctx.fill() }
    circ(0, 0, 1.5); ctx.fill();
  } else if (tipo === 'cavaquinho' || tipo === 'violao') {
    const b = tipo === 'violao' ? 8.5 : 6.4;
    ctx.fillStyle = '#c98a4a'; circ(0, b * 0.35, b); ctx.fill(); circ(0, -b * 0.55, b * 0.82); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#3a2316'; circ(0, -b * 0.15, b * 0.3); ctx.fill();
    ctx.fillStyle = '#8d5a2b'; rr(-1.6, -b * 2.1, 3.2, b * 1.5, 1); ctx.fill();
    ctx.fillStyle = '#3a2316'; rr(-2.5, -b * 2.5, 5, 4.2, 1); ctx.fill();
    ctx.strokeStyle = '#f8f0e0'; ctx.lineWidth = 0.5; for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(i * 1.1, -b * 2.1); ctx.lineTo(i * 1.1, b * 0.9); ctx.stroke() }
  } else if (tipo === 'banjo') {
    ctx.fillStyle = '#e6b980'; circ(0, 0, 8.4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#f8f0e0'; circ(0, 0, 6); ctx.fill();
    ctx.fillStyle = '#8d5a2b'; rr(-1.8, -20, 3.6, 14, 1); ctx.fill();
    ctx.fillStyle = '#3a2316'; rr(-2.6, -23, 5.2, 4, 1); ctx.fill();
  } else { // tambores: surdo, tantã e repique
    const w = tipo === 'surdo' ? 15 : tipo === 'tanta' ? 11 : 6, h = tipo === 'surdo' ? 17 : tipo === 'tanta' ? 12 : 15;
    ctx.fillStyle = tipo === 'repique' ? '#1c7ed6' : tipo === 'tanta' ? '#f08c00' : '#c92a2a'; rr(-w, -h, w * 2, h * 2, 3); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#adb5bd'; ctx.lineWidth = 1; for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(i * (w / 1.8), -h); ctx.lineTo(i * (w / 1.8), h); ctx.stroke() }
    ctx.fillStyle = '#f8f0e0'; ctx.beginPath(); ctx.ellipse(0, -h, w, w * 0.42, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = OUTLINE; ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(0, h, w, w * 0.42, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
/** Um músico do palco: em pé (cavaquinho, pandeiro, vocal, repique, banjo) ou sentado à mesa (surdo, violão, tantã). */
function palcoMusico(i: number, tipo: string, x: number, y: number, sentado: boolean, face: number, anim: number) {
  const shirt = SHIRTS_Q[i % SHIRTS_Q.length], skin = BAN_SKINS[i % BAN_SKINS.length], hair = BAN_HAIRS[i % BAN_HAIRS.length];
  if (tipo === 'vocal') { // no microfone
    drawPerson(x, y, { shirt: '#ffd43b', skin, walk: anim, face, hair, shorts: '#212529' });
    ctx.strokeStyle = '#495057'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + face * 9, y); ctx.lineTo(x + face * 9, y - 26); ctx.stroke();
    ctx.fillStyle = '#343a40'; circ(x + face * 9, y - 28, 3.4); ctx.fill(); ctx.fillStyle = '#868e96'; circ(x + face * 9, y - 28, 2); ctx.fill();
    return;
  }
  if (sentado) { ctx.fillStyle = '#8d5a2b'; rr(x - 6, y - 5, 12, 6, 2); ctx.fill(); drawPerson(x, y - 5, { shirt, skin, walk: 0, face, hair, shorts: '#212529' }) }
  else drawPerson(x, y, { shirt, skin, walk: anim, face, hair, shorts: '#212529' });
  palcoInstr(tipo, x + face * 8, y - (sentado ? 24 : 22));
}
function drawPalco() {
  if (!g.aberta(8)) return;
  const c = SHOPS[8].counter, x0 = c.x - c.w / 2, y0 = c.y - c.h / 2, show = g.showAtivo(), som = g.L('somMelhor'), t = reduceMotion ? 0 : g.now;
  const anim = show && !reduceMotion ? t / 130 : 0, pulo = (i: number) => reduceMotion ? 0 : Math.abs(Math.sin(t / 240 + i)) * 3;
  // palco: fundo, tablado e caixas de som (maiores com o "som melhor")
  ctx.fillStyle = '#5f3dc4'; rr(x0, y0, c.w, c.h - 26, 8); ctx.fill();
  ctx.fillStyle = '#8d5a2b'; rr(x0 - 6, y0 + c.h - 30, c.w + 12, 18, 4); ctx.fill();
  for (const s of [-1, 1]) { ctx.fillStyle = '#212529'; rr(c.x + s * (c.w / 2 - 8) - 9 - som * 2, y0 + c.h - 62 - som * 4, 18 + som * 4, 32 + som * 4, 3); ctx.fill(); ctx.fillStyle = '#495057'; circ(c.x + s * (c.w / 2 - 8), y0 + c.h - 42 - som * 2, 5 + som); ctx.fill() }
  // mesa dos três de trás
  ctx.fillStyle = '#8d5a2b'; rr(c.x - 52, y0 + 44, 104, 6, 2); ctx.fill(); ctx.fillStyle = '#a26b2f'; rr(c.x - 50, y0 + 50, 100, 4, 2); ctx.fill();
  // camarote: cercadinho com o quiosque de bebidas (um lado do palco)
  const bx = x0 - 24, by = y0 + 62;
  ctx.fillStyle = '#8d5a2b'; rr(bx - 16, by - 30, 34, 30, 4); ctx.fill();
  ctx.fillStyle = '#e8d5b0'; rr(bx - 18, by - 32, 38, 6, 3); ctx.fill();
  ctx.fillStyle = '#f59f00'; for (let i = 0; i < 3; i++) { rr(bx - 12 + i * 10, by - 40, 4, 9, 1); ctx.fill() }
  ctx.fillStyle = '#fff'; ctx.font = '800 8px "Baloo 2",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('BAR', bx + 1, by - 13);
  ctx.strokeStyle = '#a26b2f'; ctx.lineWidth = 2; for (let i = 0; i <= 4; i++) { const fx = bx - 22 + i * 11; ctx.beginPath(); ctx.moveTo(fx, by + 2); ctx.lineTo(fx, by + 14); ctx.stroke() }
  ctx.beginPath(); ctx.moveTo(bx - 22, by + 6); ctx.lineTo(bx + 22, by + 6); ctx.stroke();
  // placa
  ctx.fillStyle = '#fffdf7'; rr(c.x - 58, y0 + 6, 116, 16, 8); ctx.fill(); ctx.fillStyle = '#5f3dc4'; ctx.font = '800 11px "Baloo 2",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('PALCO DE PAGODE', c.x, y0 + 14);
  // os 8 músicos, sempre no palco
  palcoMusico(3, 'surdo', c.x - 44, y0 + 36, true, 1, anim + 0.5);
  palcoMusico(6, 'violao', c.x, y0 + 36, true, -1, anim);
  palcoMusico(2, 'tanta', c.x + 44, y0 + 36, true, 1, anim + 1);
  palcoMusico(0, 'cavaquinho', c.x - 52, y0 + 68, false, 1, anim);
  palcoMusico(5, 'pandeiro', c.x, y0 + 68, false, -1, anim + 0.7);
  palcoMusico(1, 'vocal', c.x + 52, y0 + 68, false, 1, anim + 1.4);
  palcoMusico(4, 'repique', x0 + 30, y0 + 56, false, 1, anim + 1.1);
  palcoMusico(7, 'banjo', x0 + c.w - 30, y0 + 56, false, -1, anim + 0.3);
  if (show) {
    // luzes e notas musicais
    for (let i = 0; i < 5; i++) { const on = Math.floor(t / 250 + i) % 2 === 0; ctx.fillStyle = on ? 'rgba(255,236,153,0.55)' : 'rgba(255,135,135,0.4)'; ctx.beginPath(); ctx.moveTo(x0 + 18 + i * 36, y0 + 2); ctx.lineTo(x0 + 6 + i * 36, y0 + c.h - 30); ctx.lineTo(x0 + 30 + i * 36, y0 + c.h - 30); ctx.closePath(); ctx.fill() }
    ctx.fillStyle = '#fff'; ctx.font = '800 16px "Baloo 2",sans-serif'; for (let i = 0; i < 4; i++) { const k = ((t / 1400 + i / 4) % 1); ctx.globalAlpha = 1 - k; ctx.fillText(i % 2 ? '♪' : '♫', x0 + 30 + i * 40, y0 - k * 40); } ctx.globalAlpha = 1;
    // multidão em volta, na frente do palco (y 455 a 500)
    for (let i = 0; i < 16; i++) { const fx = x0 - 20 + hash(i * 3 + 1) * (c.w + 40), fy = y0 + c.h + 4 + hash(i * 3 + 2) * 42;
      drawPerson(fx, fy - pulo(i), { shirt: SHIRTS_Q[i % SHIRTS_Q.length], skin: BAN_SKINS[i % BAN_SKINS.length], walk: reduceMotion ? 0 : t / 220 + i, face: i % 2 ? 1 : -1, hair: BAN_HAIRS[i % BAN_HAIRS.length], shorts: '#343a40' }) }
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

/* ---------- Banhistas (docs/MOLDE-ORLA.md, item B2) ---------- */
const CANGAS = ['#ff6b6b', '#4dabf7', '#ffd43b', '#69db7c', '#f783ac', '#9775fa'];
const BAN_SKINS = ['#f1c6a0', '#d9a37a', '#a8714c', '#7a4b2e', '#e8b48e'];
const BAN_HAIRS = ['#2b1d14', '#5a3825', '#8a5a2b', '#e0b04a', '#1a1a1a', '#b5651d'];
const BAN_CAPS = ['#e8590c', '#1c7ed6', '#2f9e44', '#e64980', '#f59f00'];

/** Guarda-sol pequeno com cadeira ao lado de uma canga (às vezes). */
function guardaSolCanga(x: number, y: number, i: number, cadeira = true) {
  const cor = CANGAS[i % CANGAS.length];
  shadow(x, y + 6, 14);
  if (cadeira) {
  ctx.fillStyle = '#a26b2f'; ctx.fillRect(x + 8, y - 2, 12, 3); ctx.fillRect(x + 8, y - 9, 12, 3); // cadeira
  ctx.strokeStyle = '#495057'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x + 8, y + 6); ctx.lineTo(x + 9, y - 9); ctx.moveTo(x + 20, y + 6); ctx.lineTo(x + 19, y - 9); ctx.stroke();
  }
  ctx.strokeStyle = '#9c8660'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x - 6, y + 6); ctx.lineTo(x - 6, y - 24); ctx.stroke(); // haste
  ctx.fillStyle = cor; ctx.beginPath(); ctx.ellipse(x - 6, y - 22, 15, 8, 0, Math.PI, 0); ctx.fill(); // cúpula
  ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.beginPath(); ctx.ellipse(x - 6, y - 22, 15, 8, 0, Math.PI, Math.PI * 1.5); ctx.fill();
}

/** Castelinho de areia na frente da criança. */
function castelinhoBanhista(x: number, y: number) {
  const yb = y + 12;
  ctx.fillStyle = '#e9c98b'; ctx.fillRect(x - 9, yb - 6, 18, 6);
  ctx.fillStyle = '#dcb877'; ctx.fillRect(x - 11, yb - 12, 6, 12); ctx.fillRect(x + 5, yb - 12, 6, 12);
  ctx.fillStyle = '#c9a368'; ctx.fillRect(x - 2, yb - 4, 4, 4);
  ctx.strokeStyle = '#8d5a2b'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 7, yb - 12); ctx.lineTo(x + 7, yb - 18); ctx.stroke();
  ctx.fillStyle = '#ff6b6b'; ctx.beginPath(); ctx.moveTo(x + 7, yb - 18); ctx.lineTo(x + 12, yb - 16); ctx.lineTo(x + 7, yb - 14); ctx.closePath(); ctx.fill(); // bandeirinha
}

function drawBanhista(b: Banhista, q: { x: number; y: number; acao: string; face: number; walk: number }) {
  const shirt = SHIRTS_Q[b.cor % SHIRTS_Q.length], skin = BAN_SKINS[b.cor % BAN_SKINS.length], hair = BAN_HAIRS[b.cor % BAN_HAIRS.length];
  if (q.acao === 'nada') { // no mar: cabeça, braços batendo e marola em volta
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(q.x, q.y + 4, 14, 4.5, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(q.x, q.y + 4, 9, 2.6, 0, 0, Math.PI * 2); ctx.stroke();
    const s = reduceMotion ? 0 : Math.sin(g.now / 160 + b.cor) * 3;
    ctx.strokeStyle = skin; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(q.x - 5, q.y + 3); ctx.lineTo(q.x - 9, q.y - 1 + s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(q.x + 5, q.y + 3); ctx.lineTo(q.x + 9, q.y - 1 - s); ctx.stroke();
    ctx.fillStyle = shirt; rr(q.x - 6, q.y - 3, 12, 7, 3); ctx.fill();
    ctx.fillStyle = skin; circ(q.x, q.y - 6, 4.6); ctx.fill(); ctx.fillStyle = hair; ctx.beginPath(); ctx.arc(q.x, q.y - 6, 4.6, Math.PI, Math.PI * 2); ctx.fill();
    return;
  }
  if (q.acao === 'cadeira') { // cadeira dobrável, com o corpo sentado e as pernas estendidas
    guardaSolCanga(q.x + 6, q.y - 4, b.cor, false);
    ctx.strokeStyle = '#f8f9fa'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(q.x - 9, q.y - 24); ctx.lineTo(q.x - 6, q.y + 5); ctx.lineTo(q.x + 13, q.y + 5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(q.x - 6, q.y - 4); ctx.lineTo(q.x + 9, q.y + 10); ctx.moveTo(q.x + 10, q.y - 4); ctx.lineTo(q.x - 8, q.y + 10); ctx.stroke();
    ctx.fillStyle = CANGAS[b.cor % CANGAS.length]; rr(q.x - 8, q.y - 23, 17, 23, 3); ctx.fill();
    ctx.fillStyle = shirt; rr(q.x - 6, q.y - 21, 14, 16, 4); ctx.fill();
    ctx.strokeStyle = skin; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(q.x - 1, q.y - 5); ctx.lineTo(q.x + 14, q.y + 3); ctx.moveTo(q.x + 4, q.y - 5); ctx.lineTo(q.x + 17, q.y - 1); ctx.stroke();
    ctx.fillStyle = skin; circ(q.x, q.y - 27, 5); ctx.fill();
    ctx.fillStyle = hair; ctx.beginPath(); ctx.arc(q.x, q.y - 27, 5, Math.PI, Math.PI * 2); ctx.fill();
    return;
  }
  if (q.acao === 'canga') { // deitado na canga (de bruços ou de barriga para cima, pelo b.cor)
    const cor = CANGAS[b.cor % CANGAS.length], brucos = b.cor % 2 === 0, f = q.face || 1;
    ctx.save(); ctx.translate(q.x, q.y); ctx.rotate((hash(b.cor) - 0.5) * 0.12);
    ctx.fillStyle = cor; rr(-19, -9, 38, 17, 3); ctx.fill(); // canga
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillRect(-19, -9, 38, 3); ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(-19, 5, 38, 3);
    ctx.fillStyle = skin; ctx.fillRect(2, -5, 13, 4); ctx.fillRect(2, 1, 13, 4); // pernas
    ctx.fillStyle = shirt; rr(-7, -7, 16, 13, 4); ctx.fill(); // tronco
    ctx.fillStyle = skin; circ(-13, -1, 5); ctx.fill(); // cabeça
    ctx.fillStyle = hair; ctx.beginPath(); ctx.arc(-13, -1, 5, brucos ? Math.PI : 0.4, brucos ? Math.PI * 2 : Math.PI - 0.4); ctx.fill();
    if (brucos) { ctx.fillStyle = hair; ctx.beginPath(); ctx.arc(-13, -1, 5, Math.PI, Math.PI * 2); ctx.fill() }
    ctx.restore();
    if (b.cor % 4 === 0) guardaSolCanga(q.x + 20, q.y, b.cor);
    return;
  }
  ctx.save(); ctx.translate(q.x, q.y); if (b.crianca) ctx.scale(0.7, 0.7);
  const hat = !b.crianca && b.cor % 3 === 0, cap = !hat && !b.crianca && b.cor % 5 === 1 ? BAN_CAPS[b.cor % BAN_CAPS.length] : undefined;
  drawPerson(0, 0, { shirt, skin, walk: q.walk, face: q.face, hat, cap, shades: b.cor % 7 === 2, hairStyle: b.cor % 5, hair, shorts: SHORTS[(b.cor * 3 + 1) % SHORTS.length] });
  if (q.acao === 'anda' && b.cor % 4 === 1) { // bolsa de praia
    ctx.fillStyle = CANGAS[(b.cor + 2) % CANGAS.length]; rr(q.face > 0 ? 9 : -17, -20, 8, 9, 2); ctx.fill();
    ctx.strokeStyle = OUTLINE; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(q.face > 0 ? 13 : -9, -20, 3, Math.PI, 0); ctx.stroke();
  }
  if (q.acao === 'frescobol') { // raquete na mão
    ctx.save(); ctx.translate(q.face * 13, -24); ctx.rotate(q.face * 0.3);
    ctx.fillStyle = '#f08c00'; ctx.beginPath(); ctx.ellipse(0, -4, 4, 5.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#8d5a2b'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(0, 1); ctx.lineTo(0, 6); ctx.stroke(); ctx.restore();
  }
  if (q.acao === 'brinca') { // baldinho e pá
    ctx.fillStyle = '#ff922b'; ctx.beginPath(); ctx.moveTo(-2, -2); ctx.lineTo(8, -2); ctx.lineTo(6, 6); ctx.lineTo(0, 6); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#e8590c'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(3, -2, 5, Math.PI, 0); ctx.stroke();
    ctx.strokeStyle = '#8d5a2b'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-6, 4); ctx.lineTo(-10, -6); ctx.stroke();
    ctx.fillStyle = '#ced4da'; ctx.beginPath(); ctx.ellipse(-11, -8, 3, 4, -0.4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  if (q.acao === 'brinca') castelinhoBanhista(q.x, q.y);
  // a bola do frescobol vai e volta entre a dupla (só o lado > 0 a desenha)
  if (q.acao === 'frescobol' && b.lado > 0) { const k = reduceMotion ? 0.5 : (Math.sin(g.now / 300 + b.cor) + 1) / 2; ctx.fillStyle = '#fff'; circ(q.x + 10 + 24 * k, q.y - 30 - Math.sin(k * Math.PI) * 10, 2.5); ctx.fill() }
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
  const c = d.counter, st = g.S[5], bisc = g.machines.some(m => m.type === 'caixaBisc');
  drawCaminhao();
  // bancada: barraca de lona com o nome e o estoque
  shadow(c.x, c.y + 24, 80); ctx.fillStyle = '#e67700'; rr(c.x - c.w / 2, c.y - c.h / 2, c.w, c.h, 8); ctx.fill();
  for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? '#fff' : '#fab005'; ctx.fillRect(c.x - c.w / 2 + i * c.w / 8, c.y - c.h / 2 - 12, c.w / 8, 12) }
  ctx.fillStyle = '#fffdf7'; rr(c.x - 50, c.y - 6, 100, 16, 8); ctx.fill(); ctx.fillStyle = '#e8590c'; ctx.font = '800 11px "Baloo 2",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(d.name, c.x, c.y + 2);
  drawDropZone(d.drop, 'CAIXAS AQUI');
  ctx.fillStyle = '#3a2316'; ctx.font = '800 10px "Baloo 2",sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('mate ' + st.counter.mate.length + (bisc ? ' · biscoito ' + st.counter.biscoito.length : ''), c.x, c.y - c.h / 2 - 18);
  priceTag(c.x - 40, c.y - c.h / 2 - 36, 'mate'); if (bisc) priceTag(c.x + 40, c.y - c.h / 2 - 36, 'biscoito');
  drawShopCash(5);
}
/** O caminhão de mercadoria na baia da rua (só visual: quem enche as pilhas é o núcleo). */
function drawCaminhao() {
  const cm = g.caminhao, y = AMBULANTE.caminhao.y; if (cm.estado === 'fora') return;
  const x = cm.x; shadow(x, y + 22, 60);
  ctx.fillStyle = '#f8f9fa'; rr(x - 50, y - 26, 72, 44, 4); ctx.fill(); ctx.strokeStyle = '#adb5bd'; ctx.lineWidth = 1.5; ctx.stroke(); // baú
  ctx.fillStyle = '#1c7ed6'; rr(x + 22, y - 14, 30, 32, 5); ctx.fill(); ctx.fillStyle = '#d0ebff'; rr(x + 30, y - 10, 18, 12, 3); ctx.fill(); // cabine
  ctx.fillStyle = '#e8590c'; ctx.font = '800 9px "Baloo 2",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('MATE E BISCOITO', x - 14, y - 4);
  ctx.fillStyle = '#212529'; for (const wx of [x - 34, x + 6, x + 38]) { circ(wx, y + 20, 7); ctx.fill() }
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
  tagTxt(ESCOLA.filaX, ESCOLA.filaY + 26, 'Aula R$ ' + fmt(g.precoAula()));
  ps.forEach((b, i) => { if (b.estado === 'molhada') { drawPrancha(b.x, b.y, CORES_PRANCHA[i % 8], 0.15, true); ctx.fillStyle = '#e03131'; ctx.font = '800 13px "Baloo 2",sans-serif'; ctx.fillText('!', b.x + 20, b.y - 10) } });
  drawShopCash(6);
}

/** O prédio dos quiosques da grama (Sorveteria, Milho e pastel, Sucos): toldo, balcão e o nome. Só o prédio:
    os produtos no balcão, as plaquinhas de preço, a zona de entrega e o dinheiro são desenhados por quem chama.
    Parte B3 (docs/MOLDE-ORLA.md): o acabamento no estilo dos quiosques de orla entra aqui. */
function drawQuiosque(si: number) {
  const d = SHOPS[si], c = d.counter, cor = ['', '#4dabf7', '', '#f59f00', '', '', '', '#40c057'][si] || '#b8763e';
  const x0 = c.x - c.w / 2, x1 = c.x + c.w / 2, yt = c.y - c.h / 2, yb = c.y + c.h / 2;
  const telha = si === 3, rw = c.w + 24, ry = Math.max(FAIXAS.grama.y0 + 4, yt - 24); // cabe no balcão + 12 para os lados e menos de 30 para cima
  shadow(c.x, yb + 8, c.w / 2 + 10);
  // cobertura: lona esticada ou telhado de telha
  if (telha) {
    ctx.fillStyle = '#b5651d'; rr(c.x - rw / 2, ry, rw, 14, 4); ctx.fill();
    ctx.fillStyle = '#d98c3f'; const nt = Math.round(rw / 12); for (let i = 0; i < nt; i++) ctx.fillRect(c.x - rw / 2 + 2 + i * (rw / nt), ry + 3, rw / nt - 4, 8);
  } else {
    ctx.fillStyle = cor; rr(c.x - rw / 2, ry, rw, 14, 4); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.85)'; rr(c.x - rw / 2 + 3, ry + 3, rw - 6, 5, 2); ctx.fill();
  }
  // toldo listrado (sanefa) na frente
  const n = Math.max(6, Math.round(rw / 16)), tw = rw / n;
  for (let i = 0; i < n; i++) { ctx.fillStyle = i % 2 ? '#fff' : cor; ctx.beginPath(); const px = c.x - rw / 2 + i * tw; ctx.moveTo(px, ry + 14); ctx.lineTo(px + tw, ry + 14); ctx.lineTo(px + tw, ry + 22); ctx.arc(px + tw / 2, ry + 22, tw / 2, 0, Math.PI); ctx.closePath(); ctx.fill() }
  // postes nas quinas
  ctx.fillStyle = '#8d5a2b'; ctx.fillRect(x0 + 2, ry + 12, 4, yb - (ry + 12)); ctx.fillRect(x1 - 6, ry + 12, 4, yb - (ry + 12));
  // balcão de madeira com tampo claro e ripas
  ctx.fillStyle = '#a26b2f'; rr(x0, yt, c.w, c.h, 6); ctx.fill();
  const ripas = Math.max(2, Math.round(c.w / 16)); for (let i = 1; i < ripas; i++) { ctx.fillStyle = '#8a5a2b'; ctx.fillRect(x0 + i * (c.w / ripas), yt + 8, 2, c.h - 8) }
  ctx.fillStyle = '#e8d5b0'; rr(x0 - 3, yt, c.w + 6, 8, 3); ctx.fill();
  // banquinhos altos na frente (do lado da areia, onde fica a fila)
  const qn = c.w > 150 ? 4 : 3;
  for (let i = 0; i < qn; i++) {
    const bx = x0 + (i + 0.5) * c.w / qn;
    ctx.fillStyle = '#6b4a2a'; ctx.fillRect(bx - 1.5, yt - 9, 3, 9);
    ctx.fillStyle = '#c98a4a'; rr(bx - 5, yt - 13, 10, 4, 2); ctx.fill();
  }
  // placa com o nome
  ctx.font = '800 11px "Baloo 2",sans-serif'; const w = ctx.measureText(d.name).width + 16;
  ctx.fillStyle = '#fffdf7'; rr(c.x - w / 2, c.y + 4, w, 14, 7); ctx.fill(); ctx.strokeStyle = 'rgba(138,106,82,0.5)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = '#3a2316'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(d.name, c.x, c.y + 11);
}
function drawKiosk() {
  const d = SHOPS[1], st = g.S[1], c = d.counter; if (!st.open) return;
  drawQuiosque(1);
  const show = Math.min(10, st.stock); for (let i = 0; i < show; i++) drawItem('sorvete', c.x - 36 + (i % 5) * 18, c.y - c.h / 2 + 16 - Math.floor(i / 5) * 4, 0.62);
  const cap = g.freezerCap(), pct = st.stock / cap; ctx.fillStyle = 'rgba(255,255,255,0.9)'; rr(c.x + c.w / 2 + 6, c.y - 18, 8, 36, 4); ctx.fill(); ctx.fillStyle = pct < 0.2 ? '#e03131' : '#4dabf7'; rr(c.x + c.w / 2 + 6, c.y + 18 - 36 * pct, 8, 36 * pct, 4); ctx.fill();
  priceTag(c.x, c.y - c.h / 2 - 38, 'sorvete');
  if (st.stock === 0) { ctx.fillStyle = '#e03131'; ctx.font = '800 12px "Baloo 2",sans-serif'; ctx.fillText('VAZIO!', c.x, c.y - 2) }
  drawDropZone(d.drop, 'ABASTECER'); drawShopCash(1);
}
/** Área que ainda não abriu: o quadrado tracejado no lugar dela, com cadeado e placa. Da praia atual, a placa diz o
    que falta para abrir; de uma praia futura, "Trancado · área · Praia N". Da Praia 6 em diante, o terreno trancado é sólido. */
function drawTrancado(i: number) {
  const L = LUGARES[i], r = L.rect, futura = i >= g.areasPraia();
  { // cada área futura tem seu próprio quadrado
    // chão levemente mais escuro, com o tracejado na cor da faixa (areia, grama ou calçadão)
    const f = r.y < FAIXAS.areia.y1 ? ['rgba(120,80,30,0.10)', 'rgba(138,106,82,0.6)']
      : r.y < FAIXAS.grama.y1 ? ['rgba(40,110,40,0.10)', 'rgba(74,124,68,0.65)']
        : r.y < FAIXAS.calcadao.y1 ? ['rgba(60,70,90,0.10)', 'rgba(110,120,135,0.7)']
          : ['rgba(20,20,30,0.14)', 'rgba(90,90,100,0.7)'];
    rr(r.x - r.w / 2, r.y - r.h / 2, r.w, r.h, 14); ctx.fillStyle = f[0]; ctx.fill();
    ctx.setLineDash([8, 6]); ctx.strokeStyle = f[1]; ctx.lineWidth = 2.5; ctx.stroke(); ctx.setLineDash([]);
  }
  // Silhueta do que virá e cerca física baixa, no contorno exato do lote.
  ctx.save(); ctx.globalAlpha = 0.18; ctx.fillStyle = '#3a2316';
  const sw = Math.min(140, r.w * 0.6), sh = Math.min(65, r.h * 0.45);
  rr(r.x - sw / 2, r.y - sh - 12, sw, sh, 5); ctx.fill();
  ctx.beginPath(); ctx.moveTo(r.x - sw / 2 - 10, r.y - sh - 12); ctx.lineTo(r.x, r.y - sh - 38); ctx.lineTo(r.x + sw / 2 + 10, r.y - sh - 12); ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#a26b2f'; ctx.lineWidth = 3; ctx.strokeRect(r.x-r.w/2, r.y-r.h/2, r.w, r.h);
  for (const y of [r.y-r.h/2, r.y+r.h/2]) for (let x=r.x-r.w/2; x<=r.x+r.w/2; x+=55) { ctx.fillStyle='#8d5a2b'; ctx.fillRect(x-3,y-11,6,20) }
  const px = r.x, py = r.y;
  ctx.save(); ctx.translate(px, py); ctx.rotate(-0.03);
  ctx.fillStyle = '#8d5a2b'; ctx.fillRect(-3, 20, 6, 26); ctx.fillStyle = '#6b4a2a'; ctx.fillRect(-1, 22, 1.6, 22); // estaca
  ctx.fillStyle = '#e0b87a'; rr(-76, -30, 152, 56, 10); ctx.fill(); ctx.strokeStyle = '#a26b2f'; ctx.lineWidth = 3; ctx.stroke(); // tábua
  ctx.strokeStyle = 'rgba(138,106,82,0.35)'; ctx.lineWidth = 1; for (const gy of [-12, 0, 12]) { ctx.beginPath(); ctx.moveTo(-66, gy); ctx.lineTo(66, gy); ctx.stroke() }
  ctx.strokeStyle = '#8a6a52'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, -32, 6, Math.PI, 0); ctx.stroke(); // cadeado
  ctx.fillStyle = '#f0c674'; rr(-8, -32, 16, 12, 3); ctx.fill(); ctx.strokeStyle = '#a26b2f'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.fillStyle = '#8a6a52'; circ(0, -26, 1.8); ctx.fill();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#3a2316'; ctx.font = '800 10px "Nunito",sans-serif';
  if (futura) {
    ctx.fillText('Na próxima praia:', 0, -15);
    ctx.font = '800 12px "Baloo 2",sans-serif'; ctx.fillText(AREAS[i], 0, 1);
    ctx.font = '800 10px "Nunito",sans-serif'; ctx.fillStyle = '#e0a800'; ctx.fillText('Praia ' + (i + 1), 0, 15);
  } else {
    const ant = i - 1, n = Math.min(g.nivel[ant] || 0, NIVEL_ABRE), pronta = g.liberada(i);
    ctx.font = '800 12px "Baloo 2",sans-serif'; ctx.fillText(AREAS[i], 0, -14);
    ctx.font = '800 10px "Nunito",sans-serif'; ctx.fillStyle = pronta ? '#2f9e44' : '#8a6a52';
    ctx.fillText(pronta ? 'Pronta para abrir!' : 'abre com ' + AREAS[ant] + ' nv ' + NIVEL_ABRE, 0, 2);
    ctx.font = '800 12px "Baloo 2",sans-serif'; ctx.fillStyle = pronta ? '#2f9e44' : '#e0a800'; ctx.fillText(pronta ? 'compre no quadro' : '(' + n + '/' + NIVEL_ABRE + ')', 0, 16);
  }
  ctx.restore();
}
function arrowAt(x: number, y: number, col?: string) { const b = reduceMotion ? 0 : Math.sin(g.now / 180) * 5; ctx.fillStyle = col || '#ff4d6d'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y + b); ctx.lineTo(x - 11, y - 16 + b); ctx.lineTo(x - 4, y - 16 + b); ctx.lineTo(x - 4, y - 30 + b); ctx.lineTo(x + 4, y - 30 + b); ctx.lineTo(x + 4, y - 16 + b); ctx.lineTo(x + 11, y - 16 + b); ctx.closePath(); ctx.stroke(); ctx.fill() }
function arrowUp(x: number, y: number) { ctx.save(); ctx.translate(x, y); ctx.scale(1, -1); arrowAt(0, 0); ctx.restore() }
/** Seta na borda da tela apontando para um alvo fora dela (sx, sy: posição do alvo na tela). */
function bordaArrow(sx: number, sy: number) {
  const cx = W / 2, cy = H / 2, ang = Math.atan2(sy - cy, sx - cx), m = 26;
  const t = Math.min((W / 2 - m) / Math.max(1e-6, Math.abs(Math.cos(ang))), (H / 2 - m - 30) / Math.max(1e-6, Math.abs(Math.sin(ang))));
  const b = reduceMotion ? 0 : Math.sin(g.now / 180) * 4;
  ctx.save(); ctx.translate(cx + Math.cos(ang) * (t + b), cy + Math.sin(ang) * (t + b)); ctx.rotate(ang); ctx.fillStyle = '#ff4d6d'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-4, -14); ctx.lineTo(-4, -6); ctx.lineTo(-16, -6); ctx.lineTo(-16, 6); ctx.lineTo(-4, 6); ctx.lineTo(-4, 14); ctx.closePath(); ctx.stroke(); ctx.fill(); ctx.restore() }

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
      if (v) { const pad = g.padCompra(v); if (!inZone(p, pad)) t = pad }
      else if (g.novaPraiaAberta() && g.proximaExiste() && g.money >= g.custoNovaPraia() - (g.paid.praia || 0)) { const pad = padOf('praia'); if (!inZone(p, pad)) t = pad }
    }
  }
  return { t, up };
}

/** Corda baixa: limite das áreas abertas nas Praias 1 a 5. Só restringe o jogador, nunca clientes. */
function drawLimitePraia() {
  if (g.beach >= 5) return;
  const x = g.limitePraia() - 4;
  ctx.strokeStyle = '#c1a16d'; ctx.lineWidth = 3;
  for (let y = SHORE + 44; y < FAIXAS.calcadao.y1 - 20; y += 70) {
    ctx.beginPath(); ctx.moveTo(x, y - 12); ctx.quadraticCurveTo(x - 5, y + 25, x, y + 58); ctx.stroke();
    ctx.fillStyle = '#a26b2f'; rr(x - 3, y - 22, 6, 24, 2); ctx.fill();
    ctx.fillStyle = '#e0b87a'; circ(x, y - 22, 3); ctx.fill();
  }
  const proxima = g.proximaAreaFechada();
  if (proxima >= 0) {
    tagTxt(x - 120, SHORE + 64, '→ ' + AREAS[proxima]);
    tagTxt(x - 120, SHORE + 88, proxima >= g.areasPraia() ? 'Continua na Praia ' + (proxima + 1) : 'Próxima área · nível ' + NIVEL_ABRE);
  }
}

export function desenhar(c: CanvasRenderingContext2D, jogo: Jogo, k: number, joy: Joy) {
  ctx = c; g = jogo; const camX = g.camX, camY = g.camY, p = g.player;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.setTransform(k, 0, 0, k, -camX * k, -camY * k);
  const P = PRAIAS[Math.min(g.beach, PRAIAS.length - 1)], x0 = camX - 20, x1 = camX + W + 20;
  desenharCenario(ctx, P, { x0, x1, t: reduceMotion ? 0 : g.now, cam: camX }, WORLD_H);
  for (const s of specks) { if (s.x < x0 || s.x > x1) continue; ctx.fillStyle = s.c; circ(s.x, s.y, s.r); ctx.fill() }
  ctx.fillStyle = 'rgba(255,255,255,0.22)'; rr(10, WALL_Y + 4, 380, PLAY_BOTTOM - WALL_Y + 12, 18); ctx.fill(); // o chão da Barraca do Sol
  drawLimitePraia();
  g.umbrellas.forEach(drawUmbrella);
  drawBarraca(); drawKiosk(); drawServico(); drawBarraca(3); drawQuadra(); drawAmbulantes(); drawEscola(); drawBarraca(7); drawPalco(); drawTorneio();
  for (let a = 0; a < NUM_AREAS; a++) drawEnfeites(a);
  // áreas fechadas: todas aparecem trancadas no lugar delas (pilar 6)
  LUGARES.forEach((L, i) => { if (i === 0 || g.aberta(i) || (g.beach < 5 && i !== g.proximaAreaFechada()) || L.zona.x + L.zona.w / 2 < x0 || L.zona.x - L.zona.w / 2 > x1) return; drawTrancado(i) });
  for (const v of g.visibleSteps()) { const s = g.padCompra(v), got = g.paid[v.a + ':' + v.k] || 0; drawPad(s.x, s.y, v.s.name, v.s.price - got, got / v.s.price, v.s.k === 'up', false, g.precisaDe(v)) }
  if (g.novaPraiaAberta()) drawPadPraia();

  // banhistas: numa camada própria, por baixo de clientes, ajudantes e do jogador (que fica sempre visível),
  // e um pouco mais claros, para quem importa no jogo saltar à vista
  const bs = g.banhistas.map(b => ({ b, q: g.posBanhista(b) })).filter(({ q }) => q.x > x0 - 30 && q.x < x1 + 30 && q.y > camY - 40 && q.y < camY + H + 60).sort((a, b) => a.q.y - b.q.y);
  ctx.globalAlpha = 0.75; for (const { b, q } of bs) drawBanhista(b, q); ctx.globalAlpha = 1;
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
  g.helpers.forEach(h => ds.push({ y: h.y, d: () => { drawStack(h); drawPerson(h.x, h.y, { shirt: h.shirt, skin: '#c68a5e', walk: h.walk, face: h.face, cap: ['#1c7ed6', '#e64980', '#ffd43b', '#fff'][h.shop], apron: h.shop !== 2, hair: '#2b1d14', shorts: '#343a40', flip: '#fff', carry: h.stack.length > 0 }) } }));
  ds.push({ y: p.y, d: () => {
    drawStack(p); drawPerson(p.x, p.y, { shirt: '#ff922b', skin: '#e0a77d', walk: p.walk, face: p.face, cap: '#e03131', apron: true, hair: '#5a3825', shorts: '#1c7ed6', flip: '#ffd43b', carry: p.stack.length > 0 });
    if (p.stack.length >= g.playerCap()) { ctx.fillStyle = '#e03131'; ctx.font = '800 12px "Baloo 2",sans-serif'; ctx.textAlign = 'center'; ctx.fillText('CHEIO', p.x, p.y - 42 - Math.ceil(p.stack.length / 3) * 10) }
  } });
  ds.sort((a, b) => a.y - b.y).forEach(o => o.d());

  for (const fl of g.flyers) { if (fl.t < 0) continue; const t = Math.min(1, fl.t / fl.dur), e = 1 - Math.pow(1 - t, 2), x = fl.x0 + (fl.x1 - fl.x0) * e, y = fl.y0 + (fl.y1 - fl.y0) * e - Math.sin(t * Math.PI) * 30; drawItem(fl.kind, x, y, 1) }
  for (const s of g.sparks) { ctx.globalAlpha = Math.max(0, s.life); ctx.fillStyle = s.col; circ(s.x, s.y, 3 * s.life + 1); ctx.fill() } ctx.globalAlpha = 1;

  let borda: { x: number; y: number } | null = null;
  if (g.state === 'play') {
    const { t, up } = tutorialTarget();
    if (t) { const sx = t.x - camX, sy = t.y - camY; if (sx < 10 || sx > W - 10 || sy < 50 || sy > H - 30) borda = { x: sx, y: sy }; else if (up) arrowUp(t.x, t.y + t.h / 2 + 6); else arrowAt(t.x, t.y - (t.h || 60) / 2 - 6) }
  }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  luz(ctx, P, x0, x1, WORLD_H);
  for (const pp of g.popups) { ctx.globalAlpha = Math.min(1, pp.life * 1.5); ctx.font = '800 ' + pp.size + 'px "Baloo 2",sans-serif'; ctx.lineWidth = 4; ctx.strokeStyle = '#fff'; ctx.strokeText(pp.txt, pp.x, pp.y); ctx.fillStyle = pp.col; ctx.fillText(pp.txt, pp.x, pp.y) } ctx.globalAlpha = 1;

  // camada da tela (sem câmera)
  ctx.setTransform(k, 0, 0, k, 0, 0);
  if (borda) bordaArrow(borda.x, borda.y);
  if (g.state === 'play' && g.moved < 40 && g.tutorial === 0) { ctx.fillStyle = 'rgba(58,35,22,0.75)'; rr(W / 2 - 120, H - 70, 240, 36, 18); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '800 14px "Nunito",sans-serif'; ctx.fillText('Arraste o dedo para andar', W / 2, H - 52) }
  if (g.boostOn()) { ctx.fillStyle = 'rgba(47,158,68,0.9)'; rr(W - 86, 8, 76, 28, 14); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '800 14px "Baloo 2",sans-serif'; ctx.fillText(g.boostX + 'x R$', W - 48, 23) }
  if (g.famaTotal > 0) { const txt = '⭐ Fama x' + g.lucro().toFixed(1).replace('.', ','); ctx.font = '800 14px "Baloo 2",sans-serif'; const w = ctx.measureText(txt).width + 20; ctx.fillStyle = 'rgba(255,194,61,0.95)'; rr(10, 8, w, 28, 14); ctx.fill(); ctx.fillStyle = '#3a2316'; ctx.fillText(txt, 10 + w / 2, 23) }
  if (joy.on) { ctx.globalAlpha = 0.5; ctx.strokeStyle = '#3a2316'; ctx.lineWidth = 3; circ(joy.ox, joy.oy, 48); ctx.stroke(); const dx = joy.x - joy.ox, dy = joy.y - joy.oy, d = Math.hypot(dx, dy), m = Math.min(48, d); ctx.fillStyle = '#3a2316'; circ(joy.ox + (d ? dx / d * m : 0), joy.oy + (d ? dy / d * m : 0), 18); ctx.fill(); ctx.globalAlpha = 1 }
}
