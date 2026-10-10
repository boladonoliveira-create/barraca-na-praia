/* Núcleo do jogo: estado, economia, clientes, ajudantes e compras. Sem canvas e sem DOM. */
import {
  SHOPS, PRODUCTS, COUNTER_CAP, CASH_MAGNET, BOX_SORVETES, BOX_MAX_CARRY, UMBRELLA_POS, SLOTS, LOTS, SERVICO, PREPARO, ATRACAO,
  AMBULANTE, ESCOLA, FAIXA, PHRASES, SHIRTS, SKINS, W, WALL_Y, PLAY_BOTTOM, type Item, type Rect,
} from '../dados/mapa.ts';
import { NIVEL_ABRE, NIVEL_NOVA_PRAIA, MARCOS, ECONOMIA, AREAS } from '../dados/planos.ts';
import { PRAIAS } from '../dados/praias.ts';
import { makeTrilha, type Step } from './economia.ts';

export type Kind = Item | 'bill';
export interface Pt { x: number; y: number }
export interface Walker extends Pt { walk: number; face: number }
export interface Carrier extends Walker { stack: Item[]; tT: number }
/** needs: panela/fritadeira (Praia 4) — só cozinha o que recebe cru (loaded), em lote. */
export interface Machine extends Pt { type: Item; pile: number; cap: number; t: number; needs?: Item; loaded?: number }
export interface Helper extends Carrier { shop: number; cap: number; mode: 'pick' | 'drop'; type: Item | null; target: Machine | null; wait: number; shirt: string; tarefa?: Tarefa | null }
type Tarefa = 'entregar' | 'carregar' | 'pegar' | 'cru' | 'esperar';
export interface Umbrella extends Pt { seats: (Customer | null)[] }
export interface Customer extends Walker {
  shop: number; want: Item; shirt: string; skin: string; hat: boolean; has: Item | null;
  state: 'queue' | 'toSeat' | 'sit' | 'leave' | 'fila' | 'banho' | 'toChair' | 'chair' | 'sair' | 'irMar' | 'surf' | 'voltaMar'; sitT: number; seat: { u: Umbrella; s: number } | null; tx: number; ty: number; arr?: boolean; gone?: boolean;
}
export interface ShopState { open: boolean; counter: Record<string, Item[]>; stock: number; queue: Customer[]; cashValue: number; cashBills: number; spawnT: number }
export interface Flyer { kind: Kind; x0: number; y0: number; x1: number; y1: number; t: number; dur: number }
export interface Popup { x: number; y: number; txt: string; life: number; col: string; size: number }
export interface Spark { x: number; y: number; vx: number; vy: number; life: number; col: string }
/** Praia 3: estado do chuveirão e das cadeiras. */
export interface Chuveiro extends Pt { user: Customer | null; t: number }
export interface Cadeira extends Pt { user: Customer | null; suja: boolean }
export interface Servico { agua: number; enchT: number; spawnT: number; spawnC: number; chuveiros: Chuveiro[]; fila: Customer[]; cadeiras: Cadeira[] }
const novoServico = (): Servico => ({ agua: 0, enchT: 0, spawnT: 800, spawnC: 1500, chuveiros: [], fila: [], cadeiras: [] });
/** Área 6: vendedor com o carrinho. doca: parado esperando carga (o 1º parado é o que está sendo abastecido);
    sobe: indo para a faixa de cima; rota: vendendo, vai e volta pela faixa; volta: vazio, voltando para a doca. */
export interface Vendedor extends Walker { carga: Item[]; estado: 'doca' | 'sobe' | 'rota' | 'volta'; dir: number; vendaT: number }
/** Área 7: prancha. seca/secando: na arara; aluno: com o aluno; molhada: largada na areia (spot = índice em ESCOLA.molhadas); mao: na pilha de alguém. */
export interface Prancha extends Pt { estado: 'seca' | 'secando' | 'aluno' | 'molhada' | 'mao'; t: number; aluno: Customer | null; spot: number }
export interface Escola { pranchas: Prancha[]; fila: Customer[]; spawnT: number }
export type Estado = 'inicio' | 'play' | 'ad' | 'offline' | 'beach' | 'litoral';
/** niveis: quantas compras cada área já fez (a trilha é refeita na mesma ordem ao carregar).
    praia: número da praia (1 a 10). famas: fama ganha em cada praia concluída. ganho e tempo: desta praia (dinheiro e ms de jogo). */
export interface Save {
  money: number; niveis: number[]; paid: Record<string, number>; praia: number; famaTotal: number; famas: number[]; ganho: number; tempo: number;
  last: number; tutorial: number; pendente?: number;
}
/** Uma compra visível no chão: área, nível (índice na trilha da área) e o passo. */
export interface Visivel { a: number; k: number; s: Step }
/** Áreas que já existem no jogo (a área i é SHOPS[i]). */
export const NUM_AREAS = SHOPS.length;

/** Saídas do núcleo para som, vibração, salvar e interface. */
export interface Io {
  tone(f: number, dur: number, type?: 'sine' | 'triangle' | 'square', vol?: number, slide?: number, delayMs?: number): void;
  fanfare(): void; buzz(ms: number): void; save(): void; goal(): void;
  /** Comprou a nova praia: fama ganha e minutos de jogo na praia que ficou para trás. */
  viagem(fama: number, minutos: number): void;
  /** Compra feita: praia (de 1 a 10), área, novo nível da área e segundos de jogo desde a compra anterior. */
  compra(praia: number, area: number, nivel: number, segundos: number): void;
}
const NO_IO: Io = { tone() {}, fanfare() {}, buzz() {}, save() {}, goal() {}, viagem() {}, compra() {} };

export const zoneOf = (m: Pt): Rect => ({ x: m.x, y: m.y + 50, w: 80, h: 44 });
export const inZone = (a: Pt, z: Rect) => Math.abs(a.x - z.x) < z.w / 2 && Math.abs(a.y - z.y) < z.h / 2;
export const padOf = (slot: string): Rect => ({ ...SLOTS[slot], w: 72, h: 60 });
export function moveTo(a: Walker, tx: number, ty: number, sp: number, f: number) {
  const dx = tx - a.x, dy = ty - a.y, d = Math.hypot(dx, dy);
  if (d <= sp * f) { a.x = tx; a.y = ty; return true }
  a.x += dx / d * sp * f; a.y += dy / d * sp * f; if (Math.abs(dx) > 1) a.face = dx > 0 ? 1 : -1; a.walk += 0.25 * f; return false;
}

export class Jogo {
  money = 0; shown = 0; lv: Record<string, number> = {}; beach = 0; famaTotal = 0; famas: number[] = []; ganho = 0; tempo = 0; trilhas: Step[][] = []; nivel: number[] = []; paid: Record<string, number> = {};
  machines: Machine[] = []; customers: Customer[] = []; flyers: Flyer[] = []; popups: Popup[] = []; sparks: Spark[] = []; helpers: Helper[] = []; umbrellas: Umbrella[] = []; S: ShopState[] = [];
  boostUntil = 0; now = 0; tutorial = 0; moved = 0; state: Estado = 'play'; payT = 0; camX = 0; testMode = false;
  sv: Servico = novoServico(); vend: Vendedor[] = []; esc: Escola = { pranchas: [], fila: [], spawnT: 800 };
  pendente = 0; lastBuyAt = 0; // pendente: ganho offline mostrado no cartão e ainda não pego (vai no save)
  player: Carrier = { x: 200, y: 560, stack: [], walk: 0, face: 1, tT: 0 };
  io: Io; rand: () => number;

  constructor(io: Partial<Io> = {}, rand: () => number = Math.random) {
    this.io = { ...NO_IO, ...io }; this.rand = rand; this.resetWorld();
  }

  /* ---------- Valores derivados ---------- */
  L(id: string) { return this.lv[id] || 0 }
  /** Fama: o lucro de todas as áreas (vendas e ganhos com o app fechado) × (1 + taxa × fama total). */
  lucro() { return 1 + ECONOMIA.taxaFama * this.famaTotal }
  /** Fama que a viagem daria agora: cresce com o total ganho na praia, cada vez mais devagar. */
  famaGanha() { return Math.floor(Math.sqrt(this.ganho / ECONOMIA.famaK)) }
  cardLv(shop: number) { return this.L(['cardapio', 'cardapioS', '', 'cardapioM', '', 'cardapioA'][shop] || '') }
  price(t: Item) { const a = PRODUCTS[t].shop; return Math.round(PRODUCTS[t].price * Math.pow(1.25, this.cardLv(a)) * this.marco(a) * this.lucro()) }
  /** Cada área tem o seu turbo: o da Barraca não acelera o depósito do sorvete. */
  rateOf(t: Item) { return PRODUCTS[t].rate / (1 + 0.25 * this.L(['turbo', 'turboS'][PRODUCTS[t].shop] || '')) }
  /** Marcos (níveis 5, 10, 15, 20): cada um dobra o dinheiro que a área gera. */
  marco(a: number) { return Math.pow(2, this.tier(a)) }
  tier(a: number) { return MARCOS.filter(m => (this.nivel[a] || 0) >= m).length }
  /** Área 5 (atração): multiplica a chegada de clientes nas outras áreas. Fechada, vale exatamente 1. */
  publico() {
    if (!this.aberta(4)) return 1;
    const A = ATRACAO; return 1 + (A.aberta + A.arquibancada * this.L('arquibancada') + A.rede * this.L('rede') + A.torneio * this.L('torneio')) * this.marco(4);
  }
  /** Área aberta = a loja dela já foi construída (a Barraca do Sol começa aberta). */
  aberta(a: number) { return !!this.S[a]?.open }
  /** Na praia N estão as áreas 1 a N (índices 0 a N-1); a última é a novidade da praia. */
  areasPraia() { return Math.min(NUM_AREAS, this.beach + 1) }
  /** A área a pode ser aberta: existe nesta praia e a anterior chegou ao nível mínimo. */
  liberada(a: number) { return a < this.areasPraia() && (a === 0 || (this.aberta(a - 1) && this.nivel[a - 1] >= NIVEL_ABRE)) }
  playerCap() { return 8 + 3 * this.L('bolsa') }
  freezerCap() { return 18 + 12 * this.L('freezer') }
  kioskOpen() { return !!this.S[1] && this.S[1].open }
  /** Borda direita do último lote aberto (lote i abre com a loja i). */
  openEdge() { let e = 400; LOTS.forEach((l, i) => { if (this.S[i]?.open) e = l.x1 }); return this.S[FAIXA.lote]?.open ? Math.max(e, FAIXA.fim) : e }
  /* Área 6 */
  isoporCap() { return AMBULANTE.isoporBase + AMBULANTE.isoporPorNivel * this.L('isopor') }
  /** O carrinho que está sendo abastecido: o primeiro parado na doca (ou nenhum, se todos estão na rua). */
  carregando() { return this.vend.find(v => v.estado === 'doca') }
  /* Área 7 */
  araraCap() { return ESCOLA.araraBase + ESCOLA.araraPorNivel * this.L('arara') }
  naArara() { return this.esc.pranchas.filter(b => b.estado === 'seca' || b.estado === 'secando').length }
  precoAula() { return Math.round(ESCOLA.precoAula * Math.pow(1.25, this.L('aulaUp')) * this.marco(6) * this.lucro()) }
  /* Praia 3 */
  aguaCap() { return SERVICO.aguaBase + SERVICO.aguaPorNivel * this.L('caixaAgua') }
  precoBanho() { return Math.round(SERVICO.precoBanho * Math.pow(1.25, this.L('banhoUp')) * this.marco(2) * this.lucro()) }
  precoCadeira() { return Math.round(SERVICO.precoCadeira * Math.pow(1.25, this.L('aluguel')) * this.marco(2) * this.lucro()) }
  /* Praia 4 */
  lote() { return PREPARO.loteBase + PREPARO.lotePorNivel * this.L('panelaMaior') }
  espaco(m: Machine) { return Math.min(this.lote() - (m.loaded || 0), m.cap - m.pile - (m.loaded || 0)) }
  cookMs(m: Machine) { return PREPARO[m.type as 'milho' | 'pastel'].cozinharMs / (m.type === 'pastel' ? 1 + 0.3 * this.L('fritaRapida') : 1) }
  boostOn() { return this.now < this.boostUntil }
  /** Quadro de nova praia: aparece com a área nova desta praia no nível NIVEL_NOVA_PRAIA. */
  novaPraiaAberta() { const a = this.areasPraia() - 1; return this.aberta(a) && this.nivel[a] >= NIVEL_NOVA_PRAIA }
  /** A próxima praia já tem a área dela pronta no jogo (depois da Praia 5 o quadro diz "em breve"). */
  proximaExiste() { return this.beach + 1 < NUM_AREAS }
  /** Custo da viagem: o preço do próximo nível da área nova. */
  custoNovaPraia() { return this.trilhas[this.areasPraia() - 1][NIVEL_NOVA_PRAIA].price }
  beachName() { return PRAIAS[Math.min(this.beach, PRAIAS.length - 1)].nome }
  goalText() {
    if (this.novaPraiaAberta()) return this.proximaExiste() ? 'Viajar para a ' + PRAIAS[this.beach + 1].nome : PRAIAS[this.beach + 1].nome + ' · em breve';
    const v = this.melhorCompra(false) || this.melhorCompra(true); return v ? AREAS[v.a] + ': ' + v.s.name : '';
  }
  falta(v: Visivel) { return v.s.price - (this.paid[v.a + ':' + v.k] || 0) }

  /** Compras no chão: em cada área aberta, a próxima da trilha e, se ficar em outro quadrado, a seguinte.
      De uma área fechada, só o quadro de abertura, e só quando a área anterior chegou ao nível mínimo. */
  visibleSteps(): Visivel[] {
    const out: Visivel[] = [];
    for (let a = 0; a < NUM_AREAS; a++) {
      if (!this.liberada(a)) continue;
      const t = this.trilhas[a], k = this.nivel[a];
      out.push({ a, k, s: t[k] });
      if (this.aberta(a) && t[k + 1] && t[k + 1].slot !== t[k].slot) out.push({ a, k: k + 1, s: t[k + 1] });
    }
    return out;
  }
  /** Melhor custo-benefício: abrir área vale mais, chegar a um marco (ou ao nível que abre a próxima) também.
      soCabe: só entre as que o dinheiro já paga (é o que a seta sugere). */
  melhorCompra(soCabe = true): Visivel | null {
    let best: Visivel | null = null, bs = -1;
    for (const v of this.visibleSteps()) {
      if (v.k !== this.nivel[v.a]) continue; // só a próxima de cada área (a seguinte vem depois dela)
      if (soCabe && this.money < this.falta(v)) continue;
      const proximo = v.k + 1, ganho = 1 + (v.s.k === 'build' && !this.aberta(v.a) ? 2 : 0) + (MARCOS.includes(proximo) || proximo === NIVEL_ABRE ? 1 : 0) + (this.aberta(v.a) && v.a === this.areasPraia() - 1 ? 1 : 0);
      const sc = ganho / Math.max(1, this.falta(v)); if (sc > bs) { bs = sc; best = v }
    }
    return best;
  }

  /* ---------- Mundo ---------- */
  freshShops() { this.S = SHOPS.map((d, i) => ({ open: i === 0, counter: Object.fromEntries(d.products.map(p => [p, []])), stock: 0, queue: [], cashValue: 0, cashBills: 0, spawnT: 800 })) }
  addMachine(type: Item, x: number, y: number) { this.machines.push({ type, x, y, pile: 0, cap: type === 'caixa' ? 4 : 10, t: 0 }) }
  addCooker(type: 'milho' | 'pastel', x: number, y: number) { this.machines.push({ type, x, y, pile: 0, cap: PREPARO.saidaMax, t: 0, needs: PREPARO[type].cru, loaded: 0 }) }
  syncCadeiras() { const n = Math.min(SERVICO.cadeiras.length, SERVICO.cadeirasBase + SERVICO.cadeirasPorNivel * this.L('cadeiras')); while (this.sv.cadeiras.length < n) this.sv.cadeiras.push({ ...SERVICO.cadeiras[this.sv.cadeiras.length], user: null, suja: false }) }
  syncVendedores() {
    const n = Math.min(AMBULANTE.vagas.length, 1 + this.L('carrinhos'));
    while (this.vend.length < n) { const v = AMBULANTE.vagas[this.vend.length]; this.vend.push({ x: v.x, y: v.y, walk: 0, face: -1, carga: [], estado: 'doca', dir: -1, vendaT: 0 }) }
  }
  syncPranchas() {
    const n = Math.min(ESCOLA.maxPranchas, ESCOLA.pranchasBase + this.L('pranchas'));
    while (this.esc.pranchas.length < n) this.esc.pranchas.push({ x: SHOPS[6].counter.x, y: SHOPS[6].counter.y, estado: 'seca', t: 0, aluno: null, spot: -1 });
  }
  addHelper(shop: number) {
    const sh = ['#4dabf7', '#38d9a9', '#f783ac', '#74c0fc'];
    this.helpers.push({ shop, x: SHOPS[shop].cx, y: 620, stack: [], cap: shop === 1 || shop === 6 ? 2 : 4, mode: 'pick', type: null, target: null, tT: 0, walk: 0, face: 1, wait: 0, shirt: ['', '#ff8fab', '#e03131', '#f8f9fa'][shop] || sh[this.helpers.length % 4] });
  }
  syncUmbrellas() {
    const n = this.L('sombras');
    while (this.umbrellas.length < n && this.umbrellas.length < UMBRELLA_POS.length) { const p = UMBRELLA_POS[this.umbrellas.length]; this.umbrellas.push({ x: p.x, y: p.y, seats: [null, null] }) }
  }
  resetWorld() {
    // começo rápido (a partir da Praia 3): as áreas que já foram novidade de uma praia anterior
    this.trilhas = Array.from({ length: NUM_AREAS }, (_, a) => makeTrilha(a, this.beach, this.beach >= 2 && a < this.beach)); this.nivel = Array(NUM_AREAS).fill(0); this.machines = []; this.customers = []; this.helpers = []; this.umbrellas = []; this.lv = {}; this.paid = {}; this.sv = novoServico(); this.vend = []; this.esc = { pranchas: [], fila: [], spawnT: 800 };
    this.money = 0; this.shown = 0; this.camX = 0; this.freshShops();
    this.addMachine('acai', 110, 470); this.player.x = 200; this.player.y = 560; this.player.stack = [];
  }

  /** Compra o próximo nível da área a. */
  applyStep(a: number, silent = false) {
    const s = this.trilhas[a][this.nivel[a]], i = ++this.nivel[a];
    if (s.k === 'build') {
      if (s.id === 'maq2') this.addMachine('acai', 290, 470);
      if (s.id === 'coco') this.addMachine('coco', 110, 612);
      if (s.id === 'coco2') this.addMachine('coco', 290, 612);
      if (s.id === 'sorv') { this.S[1].open = true; this.S[1].stock = 6; this.addMachine('caixa', 500, 556) }
      if (s.id === 'servico') { this.S[2].open = true; this.sv.agua = this.aguaCap(); this.sv.chuveiros.push({ ...SERVICO.chuveiros[0], user: null, t: 0 }); this.syncCadeiras() }
      if (s.id === 'chuveiro2') this.sv.chuveiros.push({ ...SERVICO.chuveiros[1], user: null, t: 0 });
      if (s.id === 'milho') { this.S[3].open = true; this.addMachine('milhoCru', 950, 470); this.addCooker('milho', 1050, 470) }
      if (s.id === 'pastel') { this.addMachine('pastelCru', 950, 612); this.addCooker('pastel', 1150, 470) }
      if (s.id === 'panela2') this.addCooker('milho', 1050, 612);
      if (s.id === 'quadra') this.S[4].open = true;
      if (s.id === 'ambulantes') { this.S[5].open = true; this.addMachine('mate', 1475, 495); this.syncVendedores() }
      if (s.id === 'biscoito') this.addMachine('biscoito', 1615, 495);
      if (s.id === 'escola') { this.S[6].open = true; this.syncPranchas() }
    } else {
      this.lv[s.id] = this.L(s.id) + 1;
      if (s.id === 'ajud') this.addHelper(0);
      if (s.id === 'ajudS') this.addHelper(1);
      if (s.id === 'sombras') this.syncUmbrellas();
      if (s.id === 'cadeiras') this.syncCadeiras();
      if (s.id === 'salva') this.addHelper(2);
      if (s.id === 'cozinheiro') this.addHelper(3);
      if (s.id === 'gerente') this.addHelper(5);
      if (s.id === 'carrinhos') this.syncVendedores();
      if (s.id === 'instrutor') this.addHelper(6);
      if (s.id === 'pranchas') this.syncPranchas();
    }
    if (silent) return;
    const p = SLOTS[s.slot]; this.burst(p.x, p.y, '#ffc23d', 26); this.popups.push({ x: p.x, y: p.y - 42, txt: s.name + '!', life: 1.4, col: '#5b2370', size: 20 });
    if (s.id === 'sombras') this.popups.push({ x: p.x + 40, y: p.y - 70, txt: 'Mais clientes!', life: 1.6, col: '#2f9e44', size: 16 });
    if (s.id === 'cardapio') this.popups.push({ x: SHOPS[0].cx, y: 250, txt: 'Açaí agora R$ ' + this.price('acai'), life: 1.8, col: '#2f9e44', size: 18 });
    if (s.id === 'cardapioS') this.popups.push({ x: SHOPS[1].cx, y: 250, txt: 'Sorvete agora R$ ' + this.price('sorvete'), life: 1.8, col: '#2f9e44', size: 18 });
    if (s.id === 'sorv') this.popups.push({ x: 500, y: 250, txt: 'Leve caixas do depósito ao freezer!', life: 2.4, col: '#1c7ed6', size: 15 });
    if (s.id === 'servico') this.popups.push({ x: 750, y: 250, txt: "Encha a caixa d'água no registro!", life: 2.4, col: '#1c7ed6', size: 15 });
    if (s.id === 'milho') this.popups.push({ x: 1050, y: 250, txt: 'Leve o milho cru à panela!', life: 2.4, col: '#e8590c', size: 15 });
    if (s.id === 'quadra' || s.id === 'arquibancada' || s.id === 'rede' || s.id === 'torneio') this.popups.push({ x: 1300, y: 160, txt: 'Mais público: clientes x' + this.publico().toFixed(2).replace('.', ','), life: 2, col: '#2f9e44', size: 15 });
    if (s.id === 'cardapioA') this.popups.push({ x: SHOPS[5].cx, y: 250, txt: 'Mate agora R$ ' + this.price('mate'), life: 1.8, col: '#2f9e44', size: 18 });
    if (s.id === 'ambulantes') this.popups.push({ x: SHOPS[5].cx, y: 250, txt: 'Abasteça o carrinho com mate!', life: 2.4, col: '#e8590c', size: 15 });
    if (s.id === 'escola') this.popups.push({ x: SHOPS[6].cx, y: 250, txt: 'Leve as pranchas molhadas à arara!', life: 2.4, col: '#1c7ed6', size: 15 });
    if (s.id === 'cardapioM') this.popups.push({ x: SHOPS[3].cx, y: 250, txt: 'Milho agora R$ ' + this.price('milho'), life: 1.8, col: '#2f9e44', size: 18 });
    if (MARCOS.includes(i)) this.comemorar(a, i);
    this.io.compra(this.beach + 1, a, i, (this.now - this.lastBuyAt) / 1000); this.lastBuyAt = this.now;
    this.io.fanfare(); this.io.buzz(40); this.io.goal(); this.io.save();
  }

  /** Marco de nível: festa no balcão da área (a produção já dobrou em marco()). */
  comemorar(a: number, n: number) {
    const d = SHOPS[a], x = d.counter.x, y = d.counter.y;
    for (const c of ['#ffc23d', '#ff6b6b', '#4dabf7', '#69db7c']) this.burst(x, y - 20, c, 14);
    this.popups.push({ x, y: y - 70, txt: AREAS[a] + ' nível ' + n + '!', life: 2.2, col: '#5b2370', size: 18 });
    this.popups.push({ x, y: y - 46, txt: 'Produção x' + this.marco(a), life: 2.2, col: '#2f9e44', size: 16 });
    this.io.buzz(80);
  }

  /** Começo rápido: aplica de graça os passos de preço 0 que vêm agora na trilha da área (1º ajudante e cofre). */
  gratis(a: number) { while (this.aberta(a) && this.trilhas[a][this.nivel[a]]?.price === 0) this.applyStep(a, true) }

  /** Comprou o quadro de nova praia: ganha a fama, zera dinheiro e níveis e começa a próxima praia. */
  viajar() {
    const fama = this.famaGanha(), minutos = this.tempo / 60000;
    this.famas.push(fama); this.famaTotal += fama; this.beach++; this.ganho = 0; this.tempo = 0;
    this.resetWorld(); this.gratis(0); this.tutorial = 4;
    this.syncTest(); this.io.save(); this.io.goal();
    this.state = 'beach'; this.io.viagem(fama, minutos); this.io.fanfare();
  }
  /** Anúncio da viagem: +20% da fama ganha na última praia. Devolve o extra. */
  bonusFama() { const n = this.famas.length; if (!n) return 0; const extra = Math.ceil(this.famas[n - 1] * 0.2); this.famas[n - 1] += extra; this.famaTotal += extra; this.io.save(); return extra }

  syncTest() { if (this.testMode) { this.money = Math.max(this.money, 999999); this.shown = this.money } }

  /* ---------- Salvar ---------- */
  snapshot(last = Date.now()): Save {
    return {
      money: this.testMode ? 0 : Math.floor(this.money), niveis: [...this.nivel], paid: this.paid, praia: this.beach + 1, famaTotal: this.famaTotal, famas: [...this.famas],
      ganho: Math.floor(this.ganho), tempo: Math.round(this.tempo), last, tutorial: this.tutorial, pendente: this.pendente,
    };
  }
  /** Carrega o progresso salvo e devolve os ganhos com o app fechado (0 se não houver), somando o que ficou pendente. */
  load(s: Save | null, nowMs = Date.now()) {
    this.beach = s ? Math.max(1, Math.min(PRAIAS.length, s.praia || 1)) - 1 : 0;
    this.famaTotal = s?.famaTotal || 0; this.famas = s?.famas ? [...s.famas] : []; this.ganho = s?.ganho || 0; this.tempo = s?.tempo || 0;
    this.resetWorld(); if (!s) return 0;
    this.money = s.money || 0; this.shown = this.money; this.tutorial = s.tutorial || 0; this.paid = s.paid || {}; this.pendente = s.pendente || 0;
    (s.niveis || []).forEach((n, a) => { for (let k = 0; k < Math.min(n, 60) && a < this.areasPraia(); k++) this.applyStep(a, true) });
    for (let a = 0; a < NUM_AREAS; a++) this.gratis(a); // save convertido do v3 (níveis zerados): o começo rápido entra agora
    return this.pendente + this.offlineGain(s.last, nowMs);
  }
  /** O cartão de ganhos abriu: o valor já fica no save, para não se perder se o app fechar antes de pegar. */
  abrirOffline(valor: number) { this.pendente = valor; this.state = 'offline'; this.io.save() }
  /** Pegou (x1) ou dobrou (x2) o ganho offline. Devolve o valor recebido. */
  pegarOffline(vezes: number) { const v = this.pendente * vezes; this.money += v; this.ganho += v; this.pendente = 0; this.io.save(); return v }
  /** Ganhos com o app fechado: 24 × ajudantes × lucro da fama por minuto, até 2 h; menos de 1 min não conta. */
  offlineGain(last: number, nowMs = Date.now()) {
    if (!this.helpers.length || !last) return 0;
    const away = Math.min(7200, (nowMs - last) / 1000);
    return away > 60 ? Math.round(away / 60 * 24 * this.helpers.length * this.lucro()) : 0;
  }
  /** Primeira vez na praia: já tem clientes na fila e açaí no balcão. */
  firstScene() {
    if (this.nivel.some(n => n) || this.money || this.beach !== 0) return;
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
    if (type === 'caixa' || type === 'prancha') return a.stack.filter(t => t === type).length < (isP ? BOX_MAX_CARRY : cap);
    return true;
  }
  stepTransfer(a: Carrier, dt: number, onlyType?: Item | null) {
    const P = a === this.player; a.tT += dt;
    for (const m of this.machines) {
      if (onlyType && m.type !== onlyType) continue; const z = zoneOf(m);
      if (m.needs && inZone(a, z) && a.tT > 90 && this.espaco(m) > 0) {
        const idx = a.stack.lastIndexOf(m.needs);
        if (idx >= 0) { a.tT = 0; a.stack.splice(idx, 1); m.loaded!++; this.fly(m.needs, a.x, a.y - 30, m.x, m.y - 10, 200); if (P) this.io.tone(480, 0.06, 'triangle', 0.05, 0.8) }
      }
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
      if (d.kind === 'ambulante') { // abastece o carrinho parado; cheio, ele sai para vender
        const v = this.carregando(), cap = this.isoporCap(); if (!v || v.carga.length >= cap) continue;
        let idx = -1; for (let i = a.stack.length - 1; i >= 0; i--) if (PRODUCTS[a.stack[i]].shop === si) { idx = i; break }
        if (idx < 0) continue;
        a.tT = 0; const it = a.stack.splice(idx, 1)[0]; v.carga.push(it); this.fly(it, a.x, a.y - 30 - (idx + 1) * 9, v.x, v.y - 20, 220);
        if (v.carga.length >= cap) { v.estado = 'sobe'; v.dir = -1; this.popups.push({ x: v.x, y: v.y - 50, txt: 'Saiu para vender!', life: 1.4, col: '#2f9e44', size: 14 }) }
        if (P) this.io.tone(700 - a.stack.length * 25, 0.05, 'triangle', 0.05, 0.9); return true;
      }
      if (d.kind === 'escola') { // pendura a prancha molhada na arara, se tiver lugar
        const idx = a.stack.lastIndexOf('prancha'), b = this.esc.pranchas.find(x => x.estado === 'mao'); if (idx < 0 || !b || this.naArara() >= this.araraCap()) continue;
        a.tT = 0; a.stack.splice(idx, 1); b.estado = 'secando'; b.t = ESCOLA.secarMs; this.fly('prancha', a.x, a.y - 30, d.counter.x, d.counter.y, 220);
        if (P) this.io.tone(560, 0.08, 'triangle', 0.05, 1.3); return true;
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
  /** Passou por cima de uma prancha molhada: pega (até 3 na mão do jogador; o instrutor, até a carga dele). */
  pegarPranchas(a: Carrier) {
    const P = a === this.player;
    for (const b of this.esc.pranchas) {
      if (b.estado !== 'molhada' || Math.abs(a.x - b.x) > 26 || Math.abs(a.y - b.y) > 22 || a.tT <= 90 || !this.canCarry(a, 'prancha')) continue;
      a.tT = 0; b.estado = 'mao'; b.spot = -1; a.stack.push('prancha'); this.fly('prancha', b.x, b.y, a.x, a.y - 30 - a.stack.length * 9, 200);
      if (P) this.io.tone(440, 0.06, 'triangle', 0.05, 1.2);
    }
  }

  /* ---------- Ajudantes ---------- */
  helperThink(h: Helper) {
    const d = SHOPS[h.shop], st = this.S[h.shop];
    if (d.kind === 'kiosk') { const dep = this.machines.find(m => m.type === 'caixa'); if (dep && st.stock < this.freezerCap() - 3) { h.type = 'caixa'; h.target = dep } else { h.type = null; h.target = null } return }
    if (d.kind === 'ambulante') { // gerente: abastece enquanto houver carrinho parado; busca na máquina mais cheia
      const ms = this.machines.filter(m => PRODUCTS[m.type].shop === h.shop), v = this.carregando();
      if (!v || !ms.length) { h.type = null; h.target = null; return }
      h.target = ms.reduce((a, b) => b.pile > a.pile ? b : a); h.type = h.target.type; return;
    }
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
    this.tempo += dt;
    let ix = input.x, iy = input.y; const il = Math.hypot(ix, iy); if (il > 1) { ix /= il; iy /= il }
    const sp = 3.6 * (1 + 0.12 * this.L('chinelo')); p.x += ix * sp * f; p.y += iy * sp * f;
    if (il > 0.05) { p.walk += 0.3 * f; if (Math.abs(ix) > 0.1) p.face = ix > 0 ? 1 : -1; this.moved += sp * f * Math.min(1, il) }
    p.x = Math.max(16, Math.min(this.openEdge() - 12, p.x)); p.y = Math.max(WALL_Y + 12, Math.min(PLAY_BOTTOM, p.y));
    for (const m of this.machines) { const hw = 34, hh = 26, dx = p.x - m.x, dy = p.y - m.y; if (Math.abs(dx) < hw && Math.abs(dy) < hh) { const px = hw - Math.abs(dx), py = hh - Math.abs(dy); if (px < py) p.x += px * Math.sign(dx || 1); else p.y += py * Math.sign(dy || 1) } }
    this.stepTransfer(p, dt); this.pegarPranchas(p);

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
        const key = v.a + ':' + v.k; if (v.k !== this.nivel[v.a]) continue; // a seguinte só depois da próxima
        this.payT = 0; const got = this.paid[key] || 0, chunk = Math.min(Math.floor(this.money), this.testMode ? pr : Math.max(1, Math.ceil(pr / 28)), pr - got); if (chunk <= 0) continue;
        this.money -= chunk; this.paid[key] = got + chunk; this.fly('bill', p.x, p.y - 16, pad.x, pad.y, 170); this.io.tone(600 + this.paid[key] / pr * 500, 0.04, 'triangle', 0.04, 1);
        if (this.paid[key] >= pr) { delete this.paid[key]; if (this.tutorial === 3) this.tutorial = 4; this.applyStep(v.a); this.gratis(v.a) }
      }
    }
    if (this.novaPraiaAberta() && this.proximaExiste()) {
      const pad = padOf('praia'), pr = this.custoNovaPraia();
      if (inZone(p, pad) && this.money > 0 && this.payT > 40) {
        this.payT = 0; const got = this.paid.praia || 0, chunk = Math.min(Math.floor(this.money), this.testMode ? pr : Math.ceil(pr / 28), pr - got);
        this.money -= chunk; this.paid.praia = got + chunk; this.fly('bill', p.x, p.y - 16, pad.x, pad.y, 170);
        if (this.paid.praia >= pr) { delete this.paid.praia; this.viajar(); return }
      }
    }

    for (const m of this.machines) {
      if (m.needs) { if (m.loaded) { m.t += dt; if (m.t >= this.cookMs(m)) { m.t = 0; m.pile += m.loaded; m.loaded = 0 } } continue }
      if (m.pile < m.cap) { m.t += dt; if (m.t >= this.rateOf(m.type)) { m.t = 0; m.pile++ } }
    }

    for (const h of this.helpers) {
      if (h.shop === 2) { this.salvaVidas(h, dt, f); continue }
      if (h.shop === 3) { this.cozinheiro(h, dt, f); continue }
      if (h.shop === 6) { this.instrutor(h, dt, f); continue }
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
      if (d.kind === 'atracao') continue; // a quadra não tem clientes próprios
      if (d.kind === 'ambulante') { this.updateAmbulantes(dt, f); continue }
      if (d.kind === 'escola') { this.updateEscola(dt, f); continue }
      if (d.kind === 'servico') { this.updateServico(dt, f); continue }
      const stock = this.stockOf(si), stockF = stock >= 8 ? 0.5 : stock >= 3 ? 0.75 : 1.25, demand = si === 0 ? 1 + 0.35 * this.umbrellas.length : 1;
      const maxQ = si === 0 ? 6 + this.umbrellas.length : 7, interval = d.base / demand * stockF / this.publico();
      st.spawnT -= dt; if (st.spawnT <= 0) { st.spawnT = interval * (0.75 + this.rand() * 0.5); if (st.queue.length < maxQ) this.spawnCustomer(si) }
      st.queue.forEach((c, i) => { const q = this.slotPos(si, i); c.arr = moveTo(c, q.x, q.y, 2.5, f) });
      // os 4 primeiros da fila podem comprar
      const bi = st.queue.findIndex((c, i) => i < 4 && c.arr && this.hasStock(si, c.want));
      if (bi >= 0) {
        const c = st.queue[bi]; if (d.kind === 'kiosk') st.stock--; else st.counter[c.want].pop(); st.queue.splice(bi, 1); c.has = c.want;
        this.fly(c.want, d.kind === 'kiosk' ? d.cx : d.cx + (c.want === d.products[0] ? -50 : 50), d.counter.y - 4, c.x, c.y - 26, 200);
        this.receber(si, this.price(c.want), c.x, c.y);
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
      else if (c.state === 'sair' && moveTo(c, c.tx, c.ty, 2.1, f)) c.gone = true;
    }
    this.customers = this.customers.filter(c => !c.gone);

    const camMax = Math.max(0, this.openEdge() - W + 140); const target = Math.max(0, Math.min(camMax, p.x - W / 2)); this.camX += (target - this.camX) * Math.min(1, 0.12 * f);
  }

  /* ---------- Praia 3: chuveirão e cadeiras ---------- */
  private novoCliente(x: number, y: number, state: Customer['state'], shop = 2): Customer {
    const R = this.rand, c: Customer = { shop, x, y, want: 'acai', shirt: SHIRTS[Math.floor(R() * SHIRTS.length)], skin: SKINS[Math.floor(R() * SKINS.length)], hat: R() < .35, walk: R() * 6, face: 1, has: null, state, sitT: 0, seat: null, tx: 0, ty: 0 };
    this.customers.push(c); return c;
  }
  /** Dinheiro de uma venda: vai para a pilha da área ou, com o cofre automático, direto para o caixa. */
  receber(si: number, valor: number, x: number, y: number) {
    const st = this.S[si], d = SHOPS[si], v = valor * (this.boostOn() ? 2 : 1);
    this.fly('bill', x, y, d.cash.x, d.cash.y, 320);
    this.ganho += v;
    if (this.L('cofre' + si)) { this.money += v; if (this.tutorial === 2) this.tutorial = 3 } // com cofre não há pilha para recolher
    else { st.cashValue += v; st.cashBills += 1 }
  }
  private pagar(si: number, valor: number, x: number, y: number) {
    this.receber(si, valor, x, y);
    if (this.rand() < .28) this.popups.push({ x, y: y - 46, txt: PHRASES[Math.floor(this.rand() * PHRASES.length)], life: 1.2, col: '#3a2316', size: 15 });
    this.io.tone(880, 0.07, 'sine', 0.05, 1.2);
  }
  /** Parado no registro: enche a caixa d'água (jogador e salva-vidas). */
  encher(dt: number, P: boolean) {
    const sv = this.sv; if (sv.agua >= this.aguaCap()) return;
    sv.enchT += dt; if (sv.enchT < SERVICO.encherMs) return;
    sv.enchT = 0; sv.agua++; if (P) this.io.tone(300 + sv.agua * 20, 0.05, 'sine', 0.04, 1.1);
  }
  /** Passou por cima: arruma a cadeira bagunçada. */
  arrumar(a: Pt, P: boolean) {
    for (const c of this.sv.cadeiras) if (c.suja && Math.abs(a.x - c.x) < 22 && Math.abs(a.y - c.y) < 22) {
      c.suja = false; this.burst(c.x, c.y, '#ffd8a8', 8); if (P) this.io.tone(660, 0.06, 'triangle', 0.05, 1.3);
    }
  }
  updateServico(dt: number, f: number) {
    const sv = this.sv, p = this.player, R = this.rand;
    if (inZone(p, SHOPS[2].drop)) this.encher(dt, true);
    this.arrumar(p, true);
    // chuveirão: quem sai do mar entra na fila; sem água, a fila para
    sv.spawnT -= dt;
    if (sv.spawnT <= 0) { sv.spawnT = SHOPS[2].base / this.publico() * (0.75 + R() * 0.5); if (sv.fila.length < SERVICO.filaMax) sv.fila.push(this.novoCliente(SERVICO.filaX + (R() - 0.5) * 120, 110, 'fila')) }
    sv.fila.forEach((c, i) => { c.arr = moveTo(c, SERVICO.filaX, 250 - i * 26, 2.5, f) });
    for (const ch of sv.chuveiros) {
      if (!ch.user && sv.agua > 0 && sv.fila[0]?.arr) { const c = sv.fila.shift()!; ch.user = c; ch.t = SERVICO.banhoMs; sv.agua--; c.state = 'banho' }
      const c = ch.user; if (!c) continue;
      if (!moveTo(c, ch.x, ch.y - 26, 2.5, f)) continue;
      ch.t -= dt; if (ch.t > 0) continue;
      this.pagar(2, this.precoBanho(), c.x, c.y); ch.user = null; c.state = 'sair'; c.tx = c.x; c.ty = 100;
    }
    // cadeiras: só aluga cadeira livre e arrumada; paga ao sair e deixa a cadeira bagunçada
    sv.spawnC -= dt;
    if (sv.spawnC <= 0) {
      sv.spawnC = SERVICO.chegadaCadeiraMs / this.publico() * (0.75 + R() * 0.5);
      const livres = sv.cadeiras.filter(c => !c.user && !c.suja);
      if (livres.length) { const cad = livres[Math.floor(R() * livres.length)], c = this.novoCliente(cad.x, 110, 'toChair'); cad.user = c; c.tx = cad.x; c.ty = cad.y - 6 }
    }
    for (const cad of sv.cadeiras) {
      const c = cad.user; if (!c) continue;
      if (c.state === 'toChair') { if (moveTo(c, c.tx, c.ty, 2.2, f)) { c.state = 'chair'; c.sitT = SERVICO.aluguelMs[0] + R() * (SERVICO.aluguelMs[1] - SERVICO.aluguelMs[0]) } }
      else if ((c.sitT -= dt) <= 0) { this.pagar(2, this.precoCadeira(), c.x, c.y); cad.user = null; cad.suja = true; c.state = 'sair'; c.tx = c.x; c.ty = 100 }
    }
  }

  /* ---------- Área 6: ambulantes ---------- */
  updateAmbulantes(dt: number, f: number) {
    const A = AMBULANTE, sp = A.velocidade * (1 + A.rapidoPorNivel * this.L('carrinhoRapido')), doca = A.vagas[0];
    let k = 0;
    for (const v of this.vend) {
      if (v.estado === 'doca') { const vg = A.vagas[k++]; moveTo(v, vg.x, vg.y, sp * 1.5, f); continue } // a fila da doca anda
      if (v.estado === 'sobe') { if (moveTo(v, v.x, A.rotaY, sp, f)) v.estado = 'rota'; continue }
      if (v.estado === 'volta') {
        if (Math.abs(v.x - doca.x) > 1) moveTo(v, doca.x, A.rotaY, sp, f); else if (moveTo(v, doca.x, doca.y, sp, f)) v.estado = 'doca';
        continue;
      }
      // rota: vai até a ponta esquerda e volta até a última área aberta, vendendo para quem passa
      if (moveTo(v, v.dir < 0 ? A.rotaX0 : this.openEdge() - 40, A.rotaY, sp, f)) v.dir = -v.dir;
      v.vendaT -= dt;
      if (v.vendaT <= 0 && v.carga.length) {
        v.vendaT = A.vendaMs / this.publico() * (0.75 + this.rand() * 0.5);
        const it = v.carga.pop()!, perto = this.customers.find(c => Math.abs(c.x - v.x) < 90 && Math.abs(c.y - v.y) < 90);
        this.fly(it, v.x, v.y - 20, perto ? perto.x : v.x + 30 * v.dir, perto ? perto.y - 26 : A.rotaY - 60, 260);
        this.receber(5, this.price(it), v.x, v.y);
      }
      if (!v.carga.length) v.estado = 'volta';
    }
  }

  /* ---------- Área 7: escolinha de surf ---------- */
  updateEscola(dt: number, f: number) {
    const E = ESCOLA, es = this.esc, R = this.rand, arara = SHOPS[6].counter;
    let n = 0;
    for (const b of es.pranchas) {
      if (b.estado === 'secando' && (b.t -= dt) <= 0) b.estado = 'seca';
      if (b.estado === 'seca' || b.estado === 'secando') { b.x = arara.x - arara.w / 2 + 14 + (n++ % 8) * 20; b.y = arara.y }
    }
    // alunos chegam do mar e fazem fila
    es.spawnT -= dt;
    if (es.spawnT <= 0) { es.spawnT = SHOPS[6].base / this.publico() * (0.75 + R() * 0.5); if (es.fila.length < E.filaMax) es.fila.push(this.novoCliente(E.filaX + (R() - 0.5) * 100, 110, 'fila', 6)) }
    es.fila.forEach((c, i) => { c.arr = moveTo(c, E.filaX, 250 - i * 26, 2.5, f) });
    // aluga: só prancha seca (a molhada não serve)
    const seca = es.pranchas.find(b => b.estado === 'seca');
    if (seca && es.fila[0]?.arr) { const c = es.fila.shift()!; seca.estado = 'aluno'; seca.aluno = c; c.state = 'irMar'; c.tx = LOTS[6].x0 + 30 + R() * 240; c.ty = 70 }
    for (const b of es.pranchas) {
      const c = b.aluno; if (b.estado !== 'aluno' || !c) continue;
      if (c.state === 'irMar') { if (moveTo(c, c.tx, c.ty, 2.4, f)) { c.state = 'surf'; c.sitT = E.aulaMs } }
      else if (c.state === 'surf') {
        c.walk += 0.1 * f; c.x += Math.sin(this.now / 400 + c.tx) * 0.5 * f; // pegando onda
        if ((c.sitT -= dt) <= 0) {
          const ocup = new Set(es.pranchas.map(x => x.spot)), spot = E.molhadas.findIndex((_, i) => !ocup.has(i));
          b.spot = spot; c.state = 'voltaMar'; c.tx = E.molhadas[spot].x; c.ty = E.molhadas[spot].y - 6;
        }
      } else if (c.state === 'voltaMar' && moveTo(c, c.tx, c.ty, 2.4, f)) {
        // paga a aula e larga a prancha molhada na areia
        this.pagar(6, this.precoAula(), c.x, c.y); const s = E.molhadas[b.spot];
        b.estado = 'molhada'; b.aluno = null; b.x = s.x; b.y = s.y; c.state = 'sair'; c.tx = c.x; c.ty = 100;
      }
      if (b.estado === 'aluno') { b.x = c.x; b.y = c.y }
    }
  }
  /** Instrutor: recolhe as pranchas molhadas e pendura na arara. */
  instrutor(h: Helper, dt: number, f: number) {
    const molhadas = this.esc.pranchas.filter(b => b.estado === 'molhada'), drop = SHOPS[6].drop, hi = this.helpers.filter(x => x.shop === 6).indexOf(h);
    h.tT += dt;
    if (h.stack.length && (h.stack.length >= h.cap || !molhadas.length)) { if (moveTo(h, drop.x - 20 + hi * 30, drop.y, 2.4, f)) this.stepTransfer(h, dt); return }
    if (molhadas.length) { const b = molhadas.reduce((a, x) => Math.hypot(x.x - h.x, x.y - h.y) < Math.hypot(a.x - h.x, a.y - h.y) ? x : a); moveTo(h, b.x, b.y, 2.4, f); this.pegarPranchas(h); return }
    moveTo(h, drop.x - 20 + hi * 30, drop.y + 50, 2.4, f);
  }
  /** Salva-vidas: enche a caixa quando está pela metade e arruma as cadeiras. */
  salvaVidas(h: Helper, dt: number, f: number) {
    const sv = this.sv, reg = SHOPS[2].drop, cap = this.aguaCap(), sujas = sv.cadeiras.filter(c => c.suja && !c.user);
    if (h.mode === 'drop') { if (sv.agua >= cap) h.mode = 'pick' }
    else if (sv.agua <= cap / 2 || (!sujas.length && sv.agua < cap)) h.mode = 'drop';
    let alvo: Pt;
    if (h.mode === 'drop') alvo = reg;
    else if (sujas.length) alvo = sujas.reduce((a, b) => Math.hypot(b.x - h.x, b.y - h.y) < Math.hypot(a.x - h.x, a.y - h.y) ? b : a);
    else alvo = { x: reg.x, y: reg.y + 56 };
    if (moveTo(h, alvo.x, alvo.y, 2.4, f) && h.mode === 'drop') this.encher(dt, false);
    this.arrumar(h, false);
  }

  /* ---------- Praia 4: o cozinheiro faz o ciclo inteiro ---------- */
  cozinheiro(h: Helper, dt: number, f: number) {
    const st = this.S[3], drop = SHOPS[3].drop, cookers = this.machines.filter(m => m.needs);
    const cru = (t: Item) => PRODUCTS[t].shop < 0, temPronto = h.stack.some(t => !cru(t)), meuCru = h.stack.find(cru);
    const pronto = cookers.find(m => m.pile > 0 && st.counter[m.type].length < COUNTER_CAP);
    if (!h.tarefa) {
      h.wait = 0; h.target = null; h.type = null;
      if (temPronto && (h.stack.length >= h.cap || !pronto)) h.tarefa = 'entregar';
      else if (meuCru) {
        const m = cookers.find(m => m.needs === meuCru && this.espaco(m) > 0);
        if (m) { h.tarefa = 'carregar'; h.target = m } else if (pronto && h.stack.length < h.cap) { h.tarefa = 'pegar'; h.target = pronto } else h.tarefa = temPronto ? 'entregar' : 'esperar';
      } else if (pronto) { h.tarefa = 'pegar'; h.target = pronto }
      else {
        // panela parada e com espaço: busca um lote de cru
        const m = cookers.find(m => !m.loaded && this.espaco(m) > 0), src = m && this.machines.find(x => x.type === m.needs);
        if (m && src) { h.tarefa = 'cru'; h.target = src; h.type = m.needs! }
        else h.tarefa = temPronto ? 'entregar' : 'esperar';
      }
    }
    const hi = this.helpers.filter(x => x.shop === 3).indexOf(h);
    h.wait += dt;
    if (h.tarefa === 'esperar') { if (h.wait > 800) h.tarefa = null; return }
    if (h.tarefa === 'entregar') {
      if (moveTo(h, drop.x - 30 + hi * 20, drop.y, 2.4, f) && this.stepTransfer(h, dt)) h.wait = 0;
      if (!h.stack.some(t => !cru(t)) || h.wait > 1500) h.tarefa = null;
      return;
    }
    const m = h.target!, z = zoneOf(m);
    if (moveTo(h, z.x + (hi - 1) * 12, z.y, 2.4, f)) {
      const antes = h.stack.length; this.stepTransfer(h, dt, m.type); if (h.stack.length !== antes) h.wait = 0;
      if (h.tarefa === 'carregar' && (!h.stack.includes(m.needs!) || this.espaco(m) <= 0)) h.tarefa = null;
      else if (h.tarefa === 'pegar' && (m.pile === 0 || h.stack.length >= h.cap)) h.tarefa = null;
      else if (h.tarefa === 'cru') {
        const alvo = cookers.find(c => c.needs === h.type);
        if (h.stack.length >= h.cap || (alvo && h.stack.filter(t => t === h.type).length >= this.espaco(alvo)) || (m.pile === 0 && h.stack.length)) h.tarefa = null;
      }
    }
    if (h.wait > 4000) h.tarefa = null; // nada mudou em 4 s: replaneja
  }

  updateFx(dt: number) {
    const f = dt / 16.67;
    for (const fl of this.flyers) fl.t += dt; this.flyers = this.flyers.filter(fl => fl.t < fl.dur);
    for (const p of this.popups) { p.y -= 0.45 * f; p.life -= 0.014 * f } this.popups = this.popups.filter(p => p.life > 0);
    for (const s of this.sparks) { s.x += s.vx * f; s.y += s.vy * f; s.vy += 0.12 * f; s.life -= 0.025 * f } this.sparks = this.sparks.filter(s => s.life > 0);
    this.shown += (this.money - this.shown) * Math.min(1, 0.18 * f); if (Math.abs(this.money - this.shown) < 0.5) this.shown = this.money;
  }
}
