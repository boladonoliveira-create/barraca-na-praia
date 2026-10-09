/* Núcleo do jogo: estado, economia, clientes, ajudantes e compras. Sem canvas e sem DOM. */
import {
  SHOPS, PRODUCTS, COUNTER_CAP, CASH_MAGNET, BOX_SORVETES, BOX_MAX_CARRY, UMBRELLA_POS, SLOTS, BEACHES,
  PHRASES, SHIRTS, SKINS, W, WALL_Y, PLAY_BOTTOM, type Item, type Rect,
} from '../dados/mapa.ts';
import { PRESTIGE_AFTER, ECONOMIA } from '../dados/planos.ts';
import { makePlan, type Step } from './economia.ts';

export type Kind = Item | 'bill';
export interface Pt { x: number; y: number }
export interface Walker extends Pt { walk: number; face: number }
export interface Carrier extends Walker { stack: Item[]; tT: number }
export interface Machine extends Pt { type: Item; pile: number; cap: number; t: number }
export interface Helper extends Carrier { shop: number; cap: number; mode: 'pick' | 'drop'; type: Item | null; target: Machine | null; wait: number; shirt: string }
export interface Umbrella extends Pt { seats: (Customer | null)[] }
export interface Customer extends Walker {
  shop: number; want: Item; shirt: string; skin: string; hat: boolean; has: Item | null;
  state: 'queue' | 'toSeat' | 'sit' | 'leave'; sitT: number; seat: { u: Umbrella; s: number } | null; tx: number; ty: number; arr?: boolean; gone?: boolean;
}
export interface ShopState { open: boolean; counter: Record<string, Item[]>; stock: number; queue: Customer[]; cashValue: number; cashBills: number; spawnT: number }
export interface Flyer { kind: Kind; x0: number; y0: number; x1: number; y1: number; t: number; dur: number }
export interface Popup { x: number; y: number; txt: string; life: number; col: string; size: number }
export interface Spark { x: number; y: number; vx: number; vy: number; life: number; col: string }
export type Estado = 'inicio' | 'play' | 'ad' | 'offline' | 'beach';
export interface Save { money: number; done: number[]; paid: Record<string, number>; beach: number; last: number; tutorial: number }

/** Saídas do núcleo para som, vibração, salvar e interface. */
export interface Io {
  tone(f: number, dur: number, type?: 'sine' | 'triangle' | 'square', vol?: number, slide?: number, delayMs?: number): void;
  fanfare(): void; buzz(ms: number): void; save(): void; goal(): void; prestige(): void;
}
const NO_IO: Io = { tone() {}, fanfare() {}, buzz() {}, save() {}, goal() {}, prestige() {} };

export const zoneOf = (m: Pt): Rect => ({ x: m.x, y: m.y + 50, w: 80, h: 44 });
export const inZone = (a: Pt, z: Rect) => Math.abs(a.x - z.x) < z.w / 2 && Math.abs(a.y - z.y) < z.h / 2;
export const padOf = (slot: string): Rect => ({ ...SLOTS[slot], w: 72, h: 60 });
export function moveTo(a: Walker, tx: number, ty: number, sp: number, f: number) {
  const dx = tx - a.x, dy = ty - a.y, d = Math.hypot(dx, dy);
  if (d <= sp * f) { a.x = tx; a.y = ty; return true }
  a.x += dx / d * sp * f; a.y += dy / d * sp * f; if (Math.abs(dx) > 1) a.face = dx > 0 ? 1 : -1; a.walk += 0.25 * f; return false;
}

export class Jogo {
  money = 0; shown = 0; lv: Record<string, number> = {}; beach = 0; plan: Step[] = makePlan(0); done = new Set<number>(); paid: Record<string, number> = {};
  machines: Machine[] = []; customers: Customer[] = []; flyers: Flyer[] = []; popups: Popup[] = []; sparks: Spark[] = []; helpers: Helper[] = []; umbrellas: Umbrella[] = []; S: ShopState[] = [];
  boostUntil = 0; now = 0; tutorial = 0; moved = 0; state: Estado = 'play'; payT = 0; camX = 0; testMode = false;
  player: Carrier = { x: 200, y: 560, stack: [], walk: 0, face: 1, tT: 0 };
  io: Io; rand: () => number;

  constructor(io: Partial<Io> = {}, rand: () => number = Math.random) {
    this.io = { ...NO_IO, ...io }; this.rand = rand; this.resetWorld();
  }

  /* ---------- Valores derivados ---------- */
  L(id: string) { return this.lv[id] || 0 }
  mult() { return Math.pow(ECONOMIA.praia, this.beach) }
  cardLv(shop: number) { return shop === 0 ? this.L('cardapio') : this.L('cardapioS') }
  price(t: Item) { return Math.round(PRODUCTS[t].price * Math.pow(1.25, this.cardLv(PRODUCTS[t].shop)) * this.mult()) }
  rateOf(t: Item) { return PRODUCTS[t].rate / (1 + 0.25 * this.L('turbo')) }
  playerCap() { return 8 + 3 * this.L('bolsa') }
  freezerCap() { return 18 + 12 * this.L('freezer') }
  prestigeCost() { return Math.round(ECONOMIA.novaPraia * this.mult() / 50) * 50 }
  kioskOpen() { return !!this.S[1] && this.S[1].open }
  openEdge() { return this.kioskOpen() ? 600 : 400 }
  boostOn() { return this.now < this.boostUntil }
  prestigeOpen() { return this.done.size >= PRESTIGE_AFTER }
  beachName() { const n = BEACHES.length; return BEACHES[this.beach % n].n + (this.beach >= n ? ' ' + (Math.floor(this.beach / n) + 1) : '') }
  goalText() { const v = this.visibleSteps()[0]; return v ? v.s.name : 'Nova praia' }

  /** As próximas 2 compras, sempre em quadrados diferentes. */
  visibleSteps() {
    const out: { i: number; s: Step }[] = [];
    for (let i = 0; i < this.plan.length && out.length < 2; i++) {
      if (this.done.has(i)) continue;
      if (out.length && out[0].s.slot === this.plan[i].slot) break;
      out.push({ i, s: this.plan[i] });
    }
    return out;
  }

  /* ---------- Mundo ---------- */
  freshShops() { this.S = SHOPS.map((d, i) => ({ open: i === 0, counter: Object.fromEntries(d.products.map(p => [p, []])), stock: 0, queue: [], cashValue: 0, cashBills: 0, spawnT: 800 })) }
  addMachine(type: Item, x: number, y: number) { this.machines.push({ type, x, y, pile: 0, cap: type === 'caixa' ? 4 : 10, t: 0 }) }
  addHelper(shop: number) {
    const sh = ['#4dabf7', '#38d9a9', '#f783ac', '#74c0fc'];
    this.helpers.push({ shop, x: SHOPS[shop].cx, y: 620, stack: [], cap: shop ? 2 : 4, mode: 'pick', type: null, target: null, tT: 0, walk: 0, face: 1, wait: 0, shirt: shop ? '#ff8fab' : sh[this.helpers.length % 4] });
  }
  syncUmbrellas() {
    const n = this.L('sombras');
    while (this.umbrellas.length < n && this.umbrellas.length < UMBRELLA_POS.length) { const p = UMBRELLA_POS[this.umbrellas.length]; this.umbrellas.push({ x: p.x, y: p.y, seats: [null, null] }) }
  }
  resetWorld() {
    this.plan = makePlan(this.beach); this.machines = []; this.customers = []; this.helpers = []; this.umbrellas = []; this.lv = {}; this.paid = {}; this.done = new Set();
    this.money = 0; this.shown = 0; this.camX = 0; this.freshShops();
    this.addMachine('acai', 110, 470); this.player.x = 200; this.player.y = 560; this.player.stack = [];
  }

  applyStep(i: number, silent = false) {
    const s = this.plan[i]; this.done.add(i);
    if (s.k === 'build') {
      if (s.id === 'maq2') this.addMachine('acai', 290, 470);
      if (s.id === 'coco') this.addMachine('coco', 110, 612);
      if (s.id === 'coco2') this.addMachine('coco', 290, 612);
      if (s.id === 'sorv') { this.S[1].open = true; this.S[1].stock = 6; this.addMachine('caixa', 500, 556) }
    } else {
      this.lv[s.id] = this.L(s.id) + 1;
      if (s.id === 'ajud') this.addHelper(0);
      if (s.id === 'ajudS') this.addHelper(1);
      if (s.id === 'sombras') this.syncUmbrellas();
    }
    if (silent) return;
    const p = SLOTS[s.slot]; this.burst(p.x, p.y, '#ffc23d', 26); this.popups.push({ x: p.x, y: p.y - 42, txt: s.name + '!', life: 1.4, col: '#5b2370', size: 20 });
    if (s.id === 'sombras') this.popups.push({ x: p.x + 40, y: p.y - 70, txt: 'Mais clientes!', life: 1.6, col: '#2f9e44', size: 16 });
    if (s.id === 'cardapio') this.popups.push({ x: SHOPS[0].cx, y: 250, txt: 'Açaí agora R$ ' + this.price('acai'), life: 1.8, col: '#2f9e44', size: 18 });
    if (s.id === 'cardapioS') this.popups.push({ x: SHOPS[1].cx, y: 250, txt: 'Sorvete agora R$ ' + this.price('sorvete'), life: 1.8, col: '#2f9e44', size: 18 });
    if (s.id === 'sorv') this.popups.push({ x: 500, y: 250, txt: 'Leve caixas do depósito ao freezer!', life: 2.4, col: '#1c7ed6', size: 15 });
    this.io.fanfare(); this.io.buzz(40); this.io.goal(); this.io.save();
  }

  prestige() {
    this.beach++; this.resetWorld(); this.tutorial = 4; this.money = this.plan[0].price + this.plan[1].price; this.shown = this.money;
    this.syncTest(); this.io.save(); this.io.goal();
    this.state = 'beach'; this.io.prestige(); this.io.fanfare();
  }

  syncTest() { if (this.testMode) { this.money = Math.max(this.money, 999999); this.shown = this.money } }

  /* ---------- Salvar ---------- */
  snapshot(last = Date.now()): Save {
    return { money: this.testMode ? 0 : Math.floor(this.money), done: [...this.done], paid: this.paid, beach: this.beach, last, tutorial: this.tutorial };
  }
  /** Carrega o progresso salvo e devolve os ganhos com o app fechado (0 se não houver). */
  load(s: Save | null, nowMs = Date.now()) {
    this.beach = s ? s.beach || 0 : 0; this.resetWorld(); if (!s) return 0;
    this.money = s.money || 0; this.shown = this.money; this.tutorial = s.tutorial || 0; this.paid = s.paid || {};
    (s.done || []).sort((a, b) => a - b).forEach(i => { if (this.plan[i]) this.applyStep(i, true) });
    return this.offlineGain(s.last, nowMs);
  }
  /** Ganhos com o app fechado: 24 × ajudantes × multiplicador da praia por minuto, até 2 h; menos de 1 min não conta. */
  offlineGain(last: number, nowMs = Date.now()) {
    if (!this.helpers.length || !last) return 0;
    const away = Math.min(7200, (nowMs - last) / 1000);
    return away > 60 ? Math.round(away / 60 * 24 * this.helpers.length * this.mult()) : 0;
  }
  /** Primeira vez na praia: já tem clientes na fila e açaí no balcão. */
  firstScene() {
    if (this.done.size || this.money || this.beach !== 0) return;
    for (let i = 0; i < 3; i++) { this.spawnCustomer(0); const q = this.S[0].queue, c = q[q.length - 1], p = this.slotPos(0, q.length - 1); c.x = p.x; c.y = p.y }
    for (let i = 0; i < 4; i++) this.S[0].counter.acai.push('acai');
    this.machines[0].pile = 4;
  }

  /* ---------- Efeitos (dados; quem desenha é o render) ---------- */
  fly(kind: Kind, x0: number, y0: number, x1: number, y1: number, dur = 260, delay = 0) { this.flyers.push({ kind, x0, y0, x1, y1, t: -delay, dur }) }
  burst(x: number, y: number, col: string, n: number) {
    for (let i = 0; i < n; i++) { const a = this.rand() * Math.PI * 2, s = 1 + this.rand() * 3.5; this.sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1.5, life: 1, col }) }
  }

  /* ---------- Clientes ---------- */
  stockOf(si: number) { return SHOPS[si].kind === 'kiosk' ? this.S[si].stock : Object.values(this.S[si].counter).reduce((a, b) => a + b.length, 0) }
  hasStock(si: number, t: Item) { return SHOPS[si].kind === 'kiosk' ? this.S[si].stock > 0 : this.S[si].counter[t].length > 0 }
  spawnCustomer(si: number) {
    const d = SHOPS[si], st = this.S[si], R = this.rand; let want: Item = 'sorvete';
    if (d.kind === 'counter') {
      // pesa mais o produto com mais estoque no balcão
      const have = d.products.filter(p => this.machines.some(m => m.type === p)); const w = have.map(p => st.counter[p].length + 2), tot = w.reduce((a, b) => a + b, 0);
      let r = R() * tot; want = have[0]; for (let i = 0; i < have.length; i++) { r -= w[i]; if (r <= 0) { want = have[i]; break } }
    }
    const c: Customer = { shop: si, x: d.spawnX, y: 150 + R() * 30, want, shirt: SHIRTS[Math.floor(R() * SHIRTS.length)], skin: SKINS[Math.floor(R() * SKINS.length)], hat: R() < .35, walk: R() * 6, face: si === 0 ? 1 : -1, has: null, state: 'queue', sitT: 0, seat: null, tx: 0, ty: 0 };
    this.customers.push(c); st.queue.push(c);
  }
  slotPos(si: number, i: number) { const d = SHOPS[si], top = d.counter.y - d.counter.h / 2 - 22; return i < 5 ? { x: d.cx, y: top - i * 28 } : { x: d.cx + d.side * (i - 4) * 28, y: top - 4 * 28 - 10 } }
  counterSlot(si: number, type: Item, i: number) { const d = SHOPS[si]; const base = d.products.indexOf(type) === 0 ? d.cx - 88 : d.cx + 12; return { x: base + (i % 6) * 15, y: d.counter.y - 4 - Math.floor(i / 6) * 7 } }

  /* ---------- Transferências ---------- */
  canCarry(a: Carrier, type: Item) {
    const isP = a === this.player, cap = isP ? this.playerCap() : (a as Helper).cap;
    if (a.stack.length >= cap) return false;
    if (type === 'caixa') return a.stack.filter(t => t === 'caixa').length < (isP ? BOX_MAX_CARRY : cap);
    return true;
  }
  stepTransfer(a: Carrier, dt: number, onlyType?: Item | null) {
    const P = a === this.player; a.tT += dt;
    for (const m of this.machines) {
      if (onlyType && m.type !== onlyType) continue; const z = zoneOf(m);
      if (inZone(a, z) && m.pile > 0 && this.canCarry(a, m.type) && a.tT > 90) {
        a.tT = 0; m.pile--; a.stack.push(m.type); this.fly(m.type, m.x, m.y + 44, a.x, a.y - 30 - a.stack.length * 9, 200);
        if (P) { this.io.tone(400 + a.stack.length * 30, 0.06, 'triangle', 0.05, 1.2); if (this.tutorial === 0) this.tutorial = 1 }
      }
    }
    for (let si = 0; si < SHOPS.length; si++) {
      const d = SHOPS[si], st = this.S[si]; if (!st.open || !inZone(a, d.drop) || !a.stack.length || a.tT <= 75) continue;
      if (d.kind === 'kiosk') {
        const idx = a.stack.lastIndexOf('caixa'); if (idx < 0 || st.stock >= this.freezerCap()) continue;
        a.tT = 0; a.stack.splice(idx, 1); st.stock = Math.min(this.freezerCap(), st.stock + BOX_SORVETES); this.fly('caixa', a.x, a.y - 30, d.counter.x, d.counter.y, 220);
        if (P) this.io.tone(520, 0.1, 'triangle', 0.06, 1.4); return true;
      }
      // solta qualquer item da pilha que caiba, não só o de cima
      let idx = -1; for (let i = a.stack.length - 1; i >= 0; i--) { const t = a.stack[i]; if (PRODUCTS[t].shop === si && t !== 'caixa' && st.counter[t].length < COUNTER_CAP) { idx = i; break } }
      if (idx >= 0) {
        a.tT = 0; const it = a.stack.splice(idx, 1)[0]; st.counter[it].push(it); const s = this.counterSlot(si, it, Math.min(17, st.counter[it].length - 1)); this.fly(it, a.x, a.y - 30 - (idx + 1) * 9, s.x, s.y, 220);
        if (P) { this.io.tone(700 - a.stack.length * 25, 0.05, 'triangle', 0.05, 0.9); if (this.tutorial === 1) this.tutorial = 2 } return true;
      }
    }
    return false;
  }

  /* ---------- Ajudantes ---------- */
  helperThink(h: Helper) {
    const d = SHOPS[h.shop], st = this.S[h.shop];
    if (d.kind === 'kiosk') { const dep = this.machines.find(m => m.type === 'caixa'); if (dep && st.stock < this.freezerCap() - 3) { h.type = 'caixa'; h.target = dep } else { h.type = null; h.target = null } return }
    let best: Item | null = null, bs = -1;
    for (const t of d.products) {
      if (!this.machines.some(m => m.type === t)) continue; const space = COUNTER_CAP - st.counter[t].length; if (space <= 0) continue;
      const n = space + st.queue.filter(c => c.want === t).length * 3; if (n > bs) { bs = n; best = t }
    }
    if (!best) { h.type = null; h.target = null; return }
    h.type = best; h.target = this.machines.filter(m => m.type === best).reduce((a, b) => b.pile > a.pile ? b : a);
  }

  /* ---------- Atualização ---------- */
  /** input: direção já somada (joystick + teclado); é normalizada aqui se passar de 1. */
  update(dt: number, input: Pt) {
    const f = dt / 16.67, p = this.player;
    if (this.testMode && this.money < 500000) { this.money = 999999; this.shown = this.money }
    if (this.state !== 'play') return;
    let ix = input.x, iy = input.y; const il = Math.hypot(ix, iy); if (il > 1) { ix /= il; iy /= il }
    const sp = 3.6 * (1 + 0.12 * this.L('chinelo')); p.x += ix * sp * f; p.y += iy * sp * f;
    if (il > 0.05) { p.walk += 0.3 * f; if (Math.abs(ix) > 0.1) p.face = ix > 0 ? 1 : -1; this.moved += sp * f * Math.min(1, il) }
    p.x = Math.max(16, Math.min(this.openEdge() - 12, p.x)); p.y = Math.max(WALL_Y + 12, Math.min(PLAY_BOTTOM, p.y));
    for (const m of this.machines) { const hw = 34, hh = 26, dx = p.x - m.x, dy = p.y - m.y; if (Math.abs(dx) < hw && Math.abs(dy) < hh) { const px = hw - Math.abs(dx), py = hh - Math.abs(dy); if (px < py) p.x += px * Math.sign(dx || 1); else p.y += py * Math.sign(dy || 1) } }
    this.stepTransfer(p, dt);

    // dinheiro vai sozinho para o jogador perto da pilha ou no "Entregar"
    for (let si = 0; si < SHOPS.length; si++) {
      const st = this.S[si], d = SHOPS[si]; if (!st.open || st.cashValue <= 0) continue;
      if (Math.hypot(p.x - d.cash.x, p.y - d.cash.y) < CASH_MAGNET || inZone(p, d.drop)) {
        this.money += st.cashValue; st.cashValue = 0; const n = Math.min(8, st.cashBills);
        for (let i = 0; i < n; i++) this.fly('bill', d.cash.x, d.cash.y, p.x, p.y - 20, 240, i * 35);
        st.cashBills = 0; this.io.tone(1046, 0.08, 'square', 0.04, 1.1); this.io.tone(1318, 0.12, 'square', 0.04, 1, 70); this.io.buzz(15); if (this.tutorial === 2) this.tutorial = 3;
      }
    }

    // compras: 1/28 do preço a cada 40 ms
    this.payT += dt;
    for (const v of this.visibleSteps()) {
      const pad = padOf(v.s.slot), pr = v.s.price;
      if (inZone(p, pad) && this.money > 0 && this.payT > 40) {
        this.payT = 0; const got = this.paid[v.i] || 0, chunk = Math.min(Math.floor(this.money), this.testMode ? pr : Math.max(1, Math.ceil(pr / 28)), pr - got); if (chunk <= 0) continue;
        this.money -= chunk; this.paid[v.i] = got + chunk; this.fly('bill', p.x, p.y - 16, pad.x, pad.y, 170); this.io.tone(600 + this.paid[v.i] / pr * 500, 0.04, 'triangle', 0.04, 1);
        if (this.paid[v.i] >= pr) { delete this.paid[v.i]; if (this.tutorial === 3) this.tutorial = 4; this.applyStep(v.i) }
      }
    }
    if (this.prestigeOpen()) {
      const pad = padOf('praia'), pr = this.prestigeCost();
      if (inZone(p, pad) && this.money > 0 && this.payT > 40) {
        this.payT = 0; const got = this.paid.praia || 0, chunk = Math.min(Math.floor(this.money), this.testMode ? pr : Math.ceil(pr / 28), pr - got);
        this.money -= chunk; this.paid.praia = got + chunk; this.fly('bill', p.x, p.y - 16, pad.x, pad.y, 170);
        if (this.paid.praia >= pr) { delete this.paid.praia; this.prestige(); return }
      }
    }

    for (const m of this.machines) { if (m.pile < m.cap) { m.t += dt; if (m.t >= this.rateOf(m.type)) { m.t = 0; m.pile++ } } }

    for (const h of this.helpers) {
      const d = SHOPS[h.shop], same = this.helpers.filter(x => x.shop === h.shop), hi = same.indexOf(h);
      if (h.mode === 'pick') {
        if (!h.target || h.target.pile === 0 && !h.stack.length) this.helperThink(h);
        if (!h.target) { moveTo(h, d.drop.x - 40 + hi * 30, d.drop.y + 44, 2.4, f); if (h.stack.length) h.mode = 'drop'; continue }
        const z = zoneOf(h.target);
        if (moveTo(h, z.x + (hi - 1) * 12, z.y, 2.4, f)) { this.stepTransfer(h, dt, h.type); if (h.stack.length >= h.cap || (h.target.pile === 0 && h.stack.length > 0)) h.mode = 'drop' }
      } else if (moveTo(h, d.drop.x - 30 + hi * 20, d.drop.y, 2.4, f)) {
        if (this.stepTransfer(h, dt)) h.wait = 0; else h.wait += dt;
        // 1,2 s sem conseguir entregar: volta e busca outro produto
        if (!h.stack.length) { h.mode = 'pick'; h.target = null } else if (h.wait > 1200 && h.stack.length < h.cap) { h.mode = 'pick'; h.target = null; h.wait = 0 }
      }
    }

    for (let si = 0; si < SHOPS.length; si++) {
      const st = this.S[si], d = SHOPS[si]; if (!st.open) continue;
      const stock = this.stockOf(si), stockF = stock >= 8 ? 0.5 : stock >= 3 ? 0.75 : 1.25, demand = si === 0 ? 1 + 0.35 * this.umbrellas.length : 1;
      const maxQ = si === 0 ? 6 + this.umbrellas.length : 7, interval = d.base / demand * stockF;
      st.spawnT -= dt; if (st.spawnT <= 0) { st.spawnT = interval * (0.75 + this.rand() * 0.5); if (st.queue.length < maxQ) this.spawnCustomer(si) }
      st.queue.forEach((c, i) => { const q = this.slotPos(si, i); c.arr = moveTo(c, q.x, q.y, 2.5, f) });
      // os 4 primeiros da fila podem comprar
      const bi = st.queue.findIndex((c, i) => i < 4 && c.arr && this.hasStock(si, c.want));
      if (bi >= 0) {
        const c = st.queue[bi]; if (d.kind === 'kiosk') st.stock--; else st.counter[c.want].pop(); st.queue.splice(bi, 1); c.has = c.want;
        this.fly(c.want, d.kind === 'kiosk' ? d.cx : d.cx + (c.want === d.products[0] ? -50 : 50), d.counter.y - 4, c.x, c.y - 26, 200);
        st.cashValue += this.price(c.want) * (this.boostOn() ? 2 : 1); st.cashBills += 1; this.fly('bill', c.x, c.y, d.cash.x, d.cash.y, 320);
        if (this.rand() < .28) this.popups.push({ x: c.x, y: c.y - 46, txt: PHRASES[Math.floor(this.rand() * PHRASES.length)], life: 1.2, col: '#3a2316', size: 15 });
        this.io.tone(880, 0.07, 'sine', 0.05, 1.2);
        let seat: Customer['seat'] = null; if (si === 0) for (const u of this.umbrellas) for (let s = 0; s < 2; s++) if (!u.seats[s] && !seat) { seat = { u, s }; u.seats[s] = c }
        if (seat) { c.state = 'toSeat'; c.seat = seat; c.tx = seat.u.x + (seat.s ? 22 : -22); c.ty = seat.u.y + 18 }
        else { c.state = 'leave'; c.tx = si === 0 ? -30 : d.spawnX + 10; c.ty = 130 + this.rand() * 40 }
      }
    }

    for (const c of this.customers) {
      if (c.state === 'toSeat') { if (moveTo(c, c.tx, c.ty, 2, f)) { c.state = 'sit'; c.sitT = 4000 + this.rand() * 3000 } }
      else if (c.state === 'sit') {
        c.sitT -= dt;
        if (c.sitT <= 0) {
          c.seat!.u.seats[c.seat!.s] = null; c.seat = null;
          if (this.rand() < .55 && this.S[0].queue.length < 6 + this.umbrellas.length) {
            c.state = 'queue'; c.has = null; c.want = this.rand() < .5 && this.machines.some(m => m.type === 'coco') ? 'coco' : 'acai'; this.S[0].queue.push(c);
            this.popups.push({ x: c.x, y: c.y - 40, txt: 'Mais um!', life: 1, col: '#2f9e44', size: 14 });
          } else { c.state = 'leave'; c.tx = -30; c.ty = 130 + this.rand() * 30 }
        }
      } else if (c.state === 'leave') { moveTo(c, c.tx, c.ty, 2.1, f); if (c.x < -28 || c.x > c.tx - 2 && c.tx > W) c.gone = true }
    }
    this.customers = this.customers.filter(c => !c.gone);

    const camMax = Math.max(0, this.openEdge() - W + 140); const target = Math.max(0, Math.min(camMax, p.x - W / 2)); this.camX += (target - this.camX) * Math.min(1, 0.12 * f);
  }

  updateFx(dt: number) {
    const f = dt / 16.67;
    for (const fl of this.flyers) fl.t += dt; this.flyers = this.flyers.filter(fl => fl.t < fl.dur);
    for (const p of this.popups) { p.y -= 0.45 * f; p.life -= 0.014 * f } this.popups = this.popups.filter(p => p.life > 0);
    for (const s of this.sparks) { s.x += s.vx * f; s.y += s.vy * f; s.vy += 0.12 * f; s.life -= 0.025 * f } this.sparks = this.sparks.filter(s => s.life > 0);
    this.shown += (this.money - this.shown) * Math.min(1, 0.18 * f); if (Math.abs(this.money - this.shown) < 0.5) this.shown = this.money;
  }
}
