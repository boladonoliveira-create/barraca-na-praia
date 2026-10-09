/* Câmera, cenário, personagens, máquinas e efeitos. Só lê o estado do núcleo. */
import { W, H, WORLD_W, SHORE, WALL_Y, PLAY_BOTTOM, LOTS, SHOPS, SLOTS, BEACHES, COUNTER_CAP, CASH_MAGNET, type Item, type Lot, type Rect } from '../dados/mapa.ts';
import { fmt } from '../core/economia.ts';
import { zoneOf, padOf, inZone, type Jogo, type Kind, type Machine, type Umbrella, type Carrier } from '../core/jogo.ts';

export interface Joy { on: boolean; ox: number; oy: number; x: number; y: number }
interface PersonLook { shirt: string; skin: string; walk?: number; face?: number; cap?: string; hat?: boolean; apron?: boolean }

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
  } else { ctx.fillStyle = '#2f9e44'; rr(-8, -5, 16, 10, 2); ctx.fill(); ctx.fillStyle = '#b2f2bb'; circ(0, 0, 2.6); ctx.fill() }
  ctx.restore();
}

function drawPerson(x: number, y: number, o: PersonLook) {
  const bob = reduceMotion ? 0 : Math.abs(Math.sin(o.walk || 0)) * 2.2; shadow(x, y + 2, 12);
  ctx.save(); ctx.translate(x, y - bob);
  const leg = reduceMotion ? 0 : Math.sin(o.walk || 0) * 3; ctx.fillStyle = o.skin; rr(-6, -6 + leg * 0.3, 4, 9, 2); ctx.fill(); rr(2, -6 - leg * 0.3, 4, 9, 2); ctx.fill();
  ctx.fillStyle = o.shirt; rr(-10, -22, 20, 18, 8); ctx.fill();
  if (o.apron) { ctx.fillStyle = '#fff'; rr(-7, -16, 14, 12, 4); ctx.fill(); ctx.fillStyle = '#5b2370'; circ(0, -10, 2.2); ctx.fill() }
  ctx.fillStyle = o.skin; circ(0, -29, 8); ctx.fill();
  const fx = (o.face || 1) * 2; ctx.fillStyle = '#3a2316'; circ(fx - 2.5, -29, 1.3); ctx.fill(); circ(fx + 2.5, -29, 1.3); ctx.fill();
  if (o.cap) { ctx.fillStyle = o.cap; ctx.beginPath(); ctx.arc(0, -31, 8.4, Math.PI, 0); ctx.fill(); rr((o.face || 1) > 0 ? 0 : -12, -32, 12, 3.5, 2); ctx.fill() }
  else if (o.hat) { ctx.fillStyle = '#f4d58d'; ctx.beginPath(); ctx.ellipse(0, -34, 12, 4, 0, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(0, -34, 6.5, Math.PI, 0); ctx.fill() }
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
  } else {
    shadow(m.x, m.y + 22, 34); ctx.fillStyle = '#d9b382'; rr(m.x - 30, m.y - 22, 60, 42, 6); ctx.fill(); ctx.fillStyle = '#c8955a'; rr(m.x - 30, m.y - 22, 60, 10, 6); ctx.fill();
    ctx.fillStyle = '#3a2316'; ctx.font = '800 10px "Baloo 2",sans-serif'; ctx.fillText('DEPÓSITO', m.x, m.y + 1);
    ctx.fillStyle = 'rgba(255,255,255,0.85)'; rr(m.x - 20, m.y + 10, 40, 6, 3); ctx.fill(); ctx.fillStyle = '#ffc23d'; rr(m.x - 20, m.y + 10, 40 * Math.min(1, m.t / r), 6, 3); ctx.fill();
  }
  const z = zoneOf(m); rr(z.x - z.w / 2, z.y - z.h / 2, z.w, z.h, 8); ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fill(); ctx.strokeStyle = 'rgba(91,35,112,0.35)'; ctx.lineWidth = 2; ctx.stroke();
  if (m.type === 'caixa') { for (let i = 0; i < m.pile; i++) drawItem('caixa', z.x - 27 + i * 18, z.y + 3, 1) }
  else for (let i = 0; i < m.pile; i++) drawItem(m.type, z.x - 24 + (i % 4) * 16, z.y + 4 - Math.floor(i / 4) * 9, 0.9);
}

function drawPad(x: number, y: number, name: string, remain: number, progress: number, isUp: boolean, gold: boolean) {
  const w = 72, h = 60, afford = g.money >= remain;
  rr(x - w / 2, y - h / 2, w, h, 12); ctx.fillStyle = gold ? 'rgba(255,243,196,0.92)' : 'rgba(255,253,247,0.8)'; ctx.fill();
  ctx.save(); rr(x - w / 2, y - h / 2, w, h, 12); ctx.clip(); ctx.fillStyle = 'rgba(47,158,68,0.35)'; ctx.fillRect(x - w / 2, y + h / 2 - h * progress, w, h * progress); ctx.restore();
  ctx.setLineDash([6, 5]); ctx.lineWidth = 2.5; ctx.strokeStyle = gold ? '#e0a800' : afford ? '#2f9e44' : '#b08a5a'; rr(x - w / 2, y - h / 2, w, h, 12); ctx.stroke(); ctx.setLineDash([]);
  if (isUp) { ctx.fillStyle = '#2f9e44'; circ(x + w / 2 - 4, y - h / 2 + 4, 9); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x + w / 2 - 4, y - h / 2 + 9); ctx.lineTo(x + w / 2 - 4, y - h / 2); ctx.moveTo(x + w / 2 - 8, y - h / 2 + 3.5); ctx.lineTo(x + w / 2 - 4, y - h / 2 - 0.5); ctx.lineTo(x + w / 2, y - h / 2 + 3.5); ctx.stroke() }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#3a2316'; ctx.font = '800 11px "Nunito",sans-serif';
  const words = name.split(' '), half = Math.ceil(words.length / 2); ctx.fillText(words.slice(0, half).join(' '), x, y - 15); const l2 = words.slice(half).join(' '); if (l2) ctx.fillText(l2, x, y - 3);
  ctx.font = '800 15px "Baloo 2",sans-serif'; ctx.fillStyle = '#2f9e44'; ctx.fillText(g.testMode ? 'Grátis' : 'R$ ' + fmt(remain), x, y + 15);
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
  if (st.cashValue > 0) { ctx.strokeStyle = 'rgba(47,158,68,0.25)'; ctx.setLineDash([3, 6]); ctx.lineWidth = 2; circ(d.cash.x, d.cash.y, CASH_MAGNET); ctx.stroke(); ctx.setLineDash([]) }
  for (let i = 0; i < Math.min(16, st.cashBills); i++) drawItem('bill', d.cash.x - 10 + (i % 2) * 20, d.cash.y + 12 - Math.floor(i / 2) * 5, 1);
  if (st.cashValue > 0) { ctx.fillStyle = '#2f9e44'; ctx.font = '800 13px "Baloo 2",sans-serif'; ctx.textAlign = 'center'; ctx.fillText('R$ ' + fmt(st.cashValue), d.cash.x, d.cash.y - 30) }
}
function drawDropZone(dz: Rect, label: string) { rr(dz.x - dz.w / 2, dz.y - dz.h / 2, dz.w, dz.h, 10); ctx.fillStyle = 'rgba(91,35,112,0.12)'; ctx.fill(); ctx.strokeStyle = 'rgba(91,35,112,0.4)'; ctx.setLineDash([5, 4]); ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = 'rgba(91,35,112,0.65)'; ctx.font = '800 11px "Nunito",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, dz.x, dz.y) }

function drawBarraca() {
  const d = SHOPS[0], st = g.S[0], c = d.counter;
  ctx.fillStyle = 'rgba(120,80,30,0.12)'; ctx.beginPath(); ctx.ellipse(c.x, c.y + 20, 104, 12, 0, 0, Math.PI * 2); ctx.fill();
  rr(c.x - c.w / 2, c.y - c.h / 2, c.w, c.h, 10); ctx.fillStyle = '#b8763e'; ctx.fill(); rr(c.x - c.w / 2, c.y - c.h / 2, c.w, 12, 10); ctx.fillStyle = '#d4955a'; ctx.fill();
  ctx.fillStyle = '#8a5229'; for (let i = 1; i < 6; i++) ctx.fillRect(c.x - c.w / 2 + i * c.w / 6, c.y - 6, 2, 24);
  ctx.fillStyle = '#fffdf7'; rr(c.x - 62, c.y + 6, 124, 16, 8); ctx.fill(); ctx.fillStyle = '#5b2370'; ctx.font = '800 12px "Baloo 2",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(d.name, c.x, c.y + 14);
  for (const t of d.products) {
    const n = st.counter[t].length; for (let i = 0; i < Math.min(n, 18); i++) { const s = g.counterSlot(0, t, i); drawItem(t, s.x, s.y, 0.85) }
    if (g.machines.some(m => m.type === t)) priceTag(t === d.products[0] ? c.x - 50 : c.x + 50, c.y - 30 - Math.min(2, Math.floor(n / 6)) * 7, t);
    if (n >= COUNTER_CAP) { ctx.fillStyle = '#e03131'; ctx.font = '800 11px "Baloo 2",sans-serif'; ctx.fillText('CHEIO', t === d.products[0] ? c.x - 50 : c.x + 50, c.y - 48) }
  }
  drawDropZone(d.drop, 'ENTREGAR'); drawShopCash(0);
}
function drawKiosk() {
  const d = SHOPS[1], st = g.S[1], c = d.counter; if (!st.open) return;
  shadow(c.x, c.y + 24, 56);
  ctx.fillStyle = '#4dabf7'; rr(c.x - c.w / 2, c.y - c.h / 2, c.w, c.h, 10); ctx.fill();
  ctx.fillStyle = '#d0ebff'; rr(c.x - c.w / 2 + 6, c.y - c.h / 2 + 6, c.w - 12, 20, 6); ctx.fill();
  const show = Math.min(10, st.stock); for (let i = 0; i < show; i++) drawItem('sorvete', c.x - 36 + (i % 5) * 18, c.y - c.h / 2 + 16 - Math.floor(i / 5) * 4, 0.62);
  for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? '#fff' : '#ff8fab'; ctx.beginPath(); const x0 = c.x - c.w / 2 - 6 + i * (c.w + 12) / 6; ctx.moveTo(x0, c.y - c.h / 2 - 26); ctx.lineTo(x0 + (c.w + 12) / 6, c.y - c.h / 2 - 26); ctx.lineTo(x0 + (c.w + 12) / 6, c.y - c.h / 2 - 14); ctx.arc(x0 + (c.w + 12) / 12, c.y - c.h / 2 - 14, (c.w + 12) / 12, 0, Math.PI); ctx.closePath(); ctx.fill() }
  ctx.fillStyle = '#fffdf7'; rr(c.x - 34, c.y + 8, 68, 14, 7); ctx.fill(); ctx.fillStyle = '#1c7ed6'; ctx.font = '800 11px "Baloo 2",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(d.name, c.x, c.y + 15);
  const cap = g.freezerCap(), pct = st.stock / cap; ctx.fillStyle = 'rgba(255,255,255,0.9)'; rr(c.x + c.w / 2 + 6, c.y - 18, 8, 36, 4); ctx.fill(); ctx.fillStyle = pct < 0.2 ? '#e03131' : '#4dabf7'; rr(c.x + c.w / 2 + 6, c.y + 18 - 36 * pct, 8, 36 * pct, 4); ctx.fill();
  priceTag(c.x, c.y - c.h / 2 - 38, 'sorvete');
  if (st.stock === 0) { ctx.fillStyle = '#e03131'; ctx.font = '800 12px "Baloo 2",sans-serif'; ctx.fillText('VAZIO!', c.x, c.y - 2) }
  drawDropZone(d.drop, 'ABASTECER'); drawShopCash(1);
}
function drawLockedLot(lot: Lot) {
  const w = lot.x1 - lot.x0, cx = lot.x0 + w / 2;
  ctx.fillStyle = 'rgba(58,35,22,0.07)'; ctx.fillRect(lot.x0, WALL_Y - 10, w, PLAY_BOTTOM - WALL_Y + 30);
  ctx.globalAlpha = 0.35;
  if (lot.kind === 'shower') {
    for (const sx of [cx - 60, cx + 40]) { ctx.fillStyle = '#868e96'; ctx.fillRect(sx - 3, WALL_Y + 60, 6, 90); ctx.fillRect(sx - 3, WALL_Y + 60, 24, 6); ctx.fillStyle = '#4dabf7'; for (let i = 0; i < 5; i++) ctx.fillRect(sx + 14 + i * 2 - 4, WALL_Y + 72 + i * 7, 2, 10) }
    for (let i = 0; i < 4; i++) { ctx.fillStyle = '#ffd8a8'; rr(lot.x0 + 40 + i * 56, WALL_Y + 230, 26, 40, 4); ctx.fill() }
  } else if (lot.kind === 'corn') { ctx.fillStyle = '#ffd43b'; rr(cx - 50, WALL_Y + 90, 100, 60, 10); ctx.fill(); ctx.fillStyle = '#868e96'; circ(cx - 30, WALL_Y + 160, 12); ctx.fill(); circ(cx + 30, WALL_Y + 160, 12); ctx.fill(); ctx.fillStyle = '#e9c46a'; rr(cx - 30, WALL_Y + 240, 60, 40, 8); ctx.fill() }
  else { ctx.fillStyle = '#4dabf7'; rr(cx - 46, WALL_Y - 30, 92, 40, 10); ctx.fill(); ctx.fillStyle = '#d9b382'; rr(cx - 30, WALL_Y + 210, 60, 42, 6); ctx.fill() }
  ctx.globalAlpha = 1;
  for (let y = WALL_Y - 14; y < PLAY_BOTTOM + 10; y += 22) { ctx.fillStyle = '#c08a4a'; rr(lot.x0 - 4, y, 8, 18, 3); ctx.fill() }
  ctx.fillStyle = '#a26b2f'; ctx.fillRect(lot.x0 - 6, WALL_Y + 40, 12, 4); ctx.fillRect(lot.x0 - 6, PLAY_BOTTOM - 40, 12, 4);
  ctx.save(); ctx.translate(lot.x0 + 80, WALL_Y + 150); ctx.rotate(-0.04); ctx.fillStyle = '#fff3c4'; rr(-72, -30, 144, 60, 10); ctx.fill(); ctx.strokeStyle = '#e0b84f'; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.fillStyle = '#3a2316'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '800 11px "Nunito",sans-serif'; ctx.fillText(lot.title!, 0, -12);
  ctx.fillStyle = '#e0a800'; ctx.font = '800 15px "Baloo 2",sans-serif'; ctx.fillText('abre na Praia ' + lot.praia, 0, 8);
  ctx.fillStyle = '#8a6a52'; ctx.beginPath(); ctx.arc(0, -34, 7, Math.PI, 0); ctx.lineWidth = 3; ctx.strokeStyle = '#8a6a52'; ctx.stroke(); ctx.fillRect(-8, -34, 16, 12); ctx.restore();
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
    if (!t) {
      const v = g.visibleSteps().find(v => g.money >= v.s.price - (g.paid[v.i] || 0));
      if (v) { const pad = padOf(v.s.slot); if (!inZone(p, pad)) t = pad }
      else if (g.prestigeOpen() && g.money >= g.prestigeCost() - (g.paid.praia || 0)) { const pad = padOf('praia'); if (!inZone(p, pad)) t = pad }
    }
  }
  return { t, up };
}

export function desenhar(c: CanvasRenderingContext2D, jogo: Jogo, k: number, joy: Joy) {
  ctx = c; g = jogo; const camX = g.camX, p = g.player;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.setTransform(k, 0, 0, k, -camX * k, 0);
  const B = BEACHES[g.beach % BEACHES.length], x0 = camX - 20, x1 = camX + W + 20;
  const sg = ctx.createLinearGradient(0, 0, 0, SHORE); sg.addColorStop(0, B.sea[0]); sg.addColorStop(1, B.sea[1]); ctx.fillStyle = sg; ctx.fillRect(x0, 0, x1 - x0, SHORE + 10);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2;
  for (let r = 0; r < 4; r++) { ctx.beginPath(); for (let x = Math.floor(x0 / 10) * 10; x <= x1; x += 10) { const y = 24 + r * 24 + Math.sin(x / 30 + g.now / 700 + r) * 3; x === Math.floor(x0 / 10) * 10 ? ctx.moveTo(x, y) : ctx.lineTo(x, y) } ctx.stroke() }
  ctx.fillStyle = '#f6e3b4'; ctx.beginPath(); ctx.moveTo(x0, H); for (let x = Math.floor(x0 / 8) * 8; x <= x1; x += 8) ctx.lineTo(x, SHORE + Math.sin(x / 38 + g.now / 900) * 5); ctx.lineTo(x1, H); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 4; ctx.beginPath(); for (let x = Math.floor(x0 / 8) * 8; x <= x1; x += 8) { const y = SHORE + Math.sin(x / 38 + g.now / 900) * 5; x === Math.floor(x0 / 8) * 8 ? ctx.moveTo(x, y) : ctx.lineTo(x, y) } ctx.stroke();
  for (const s of specks) { if (s.x < x0 || s.x > x1) continue; ctx.fillStyle = s.c; circ(s.x, s.y, s.r); ctx.fill() }
  ctx.fillStyle = 'rgba(255,255,255,0.22)'; rr(10, WALL_Y + 4, 380, PLAY_BOTTOM - WALL_Y + 12, 18); ctx.fill();
  if (g.kioskOpen()) { rr(410, WALL_Y + 4, 180, PLAY_BOTTOM - WALL_Y + 12, 18); ctx.fill() }
  g.umbrellas.forEach(drawUmbrella);
  drawBarraca(); drawKiosk();
  for (const lot of LOTS) { if (!lot.praia) continue; if (lot.praia === 2 && g.kioskOpen()) continue; if (lot.x1 < x0 || lot.x0 > x1) continue; drawLockedLot(lot) }
  for (const v of g.visibleSteps()) { const s = SLOTS[v.s.slot], got = g.paid[v.i] || 0; drawPad(s.x, s.y, v.s.name, v.s.price - got, got / v.s.price, v.s.k === 'up', false) }
  if (g.prestigeOpen()) { const s = SLOTS.praia, pr = g.prestigeCost(), got = g.paid.praia || 0; drawPad(s.x, s.y, 'Nova praia', pr - got, got / pr, false, true) }

  // ordem de profundidade pelo y
  const ds: { y: number; d: () => void }[] = [];
  g.machines.forEach(m => ds.push({ y: m.y, d: () => drawMachine(m) }));
  g.customers.forEach(c => ds.push({ y: c.y, d: () => {
    drawPerson(c.x, c.y, c);
    if (c.has) drawItem(c.has, c.x + (c.face > 0 ? 12 : -12), c.y - 18, 0.9);
    else { const qi = g.S[c.shop].queue.indexOf(c); if (qi >= 0 && qi < 4) { ctx.fillStyle = '#fff'; rr(c.x + 10, c.y - 58, 26, 22, 8); ctx.fill(); ctx.beginPath(); ctx.moveTo(c.x + 14, c.y - 38); ctx.lineTo(c.x + 10, c.y - 32); ctx.lineTo(c.x + 20, c.y - 37); ctx.fill(); drawItem(c.want, c.x + 23, c.y - 47, 0.8) } }
  } }));
  g.helpers.forEach(h => ds.push({ y: h.y, d: () => { drawPerson(h.x, h.y, { shirt: h.shirt, skin: '#c68a5e', walk: h.walk, face: h.face, cap: h.shop ? '#e64980' : '#1c7ed6', apron: true }); drawStack(h) } }));
  ds.push({ y: p.y, d: () => {
    drawPerson(p.x, p.y, { shirt: '#ff922b', skin: '#e0a77d', walk: p.walk, face: p.face, cap: '#e03131', apron: true }); drawStack(p);
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
  for (const pp of g.popups) { ctx.globalAlpha = Math.min(1, pp.life * 1.5); ctx.font = '800 ' + pp.size + 'px "Baloo 2",sans-serif'; ctx.lineWidth = 4; ctx.strokeStyle = '#fff'; ctx.strokeText(pp.txt, pp.x, pp.y); ctx.fillStyle = pp.col; ctx.fillText(pp.txt, pp.x, pp.y) } ctx.globalAlpha = 1;

  // camada da tela (sem câmera)
  ctx.setTransform(k, 0, 0, k, 0, 0);
  if (side) sideArrow(side, Math.min(H - 60, Math.max(WALL_Y, sideY)));
  if (g.state === 'play' && g.moved < 40 && g.tutorial === 0) { ctx.fillStyle = 'rgba(58,35,22,0.75)'; rr(W / 2 - 120, H - 70, 240, 36, 18); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '800 14px "Nunito",sans-serif'; ctx.fillText('Arraste o dedo para andar', W / 2, H - 52) }
  if (g.boostOn()) { ctx.fillStyle = 'rgba(47,158,68,0.9)'; rr(W - 86, 8, 76, 28, 14); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '800 14px "Baloo 2",sans-serif'; ctx.fillText('2x R$', W - 48, 23) }
  if (g.beach > 0) { const m = g.mult(); ctx.fillStyle = 'rgba(255,194,61,0.95)'; rr(10, 8, 84, 28, 14); ctx.fill(); ctx.fillStyle = '#3a2316'; ctx.font = '800 14px "Baloo 2",sans-serif'; ctx.fillText('R$ x' + (m % 1 ? m.toFixed(1).replace('.', ',') : m), 52, 23) }
  if (joy.on) { ctx.globalAlpha = 0.5; ctx.strokeStyle = '#3a2316'; ctx.lineWidth = 3; circ(joy.ox, joy.oy, 48); ctx.stroke(); const dx = joy.x - joy.ox, dy = joy.y - joy.oy, d = Math.hypot(dx, dy), m = Math.min(48, d); ctx.fillStyle = '#3a2316'; circ(joy.ox + (d ? dx / d * m : 0), joy.oy + (d ? dy / d * m : 0), 18); ctx.fill(); ctx.globalAlpha = 1 }
}
