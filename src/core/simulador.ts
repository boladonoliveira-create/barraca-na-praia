/* Simulador de economia: um bot joga sozinho e mede o tempo até cada compra em cada praia.
   Estratégia (GDD seção 11): vai à máquina mais cheia, entrega e compra a próxima melhoria.
   O bot humano (padrão, usado nas metas de ritmo) reage com 200 a 400 ms de atraso, anda com desvio leve
   e para 3 a 5 s a cada 30 s. O perfeito (humano: false) decide a cada quadro e anda reto.
   Relatório no terminal: npm run sim [praias] (scripts/sim.ts) */
import { SHOPS, COUNTER_CAP, PRODUCTS, type Item, type Rect } from '../dados/mapa.ts';
import { Jogo, zoneOf, padOf, inZone, type Pt } from './jogo.ts';

/** Gerador determinístico (mulberry32) para o resultado não variar entre execuções. */
export function rng(seed: number) {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 };
}

export interface Compra { praia: number; indice: number; nome: string; preco: number; segundos: number }
export interface Resultado { compras: Compra[]; praias: { praia: number; segundos: number }[]; travou: boolean }

const DT = 1000 / 60;

/** Contorna a máquina que estiver entre o jogador e o alvo (ela bloqueia o caminho direto). */
function waypoint(g: Jogo, p: Pt, t: Pt): Pt {
  let best: Pt | null = null, bd = Infinity;
  for (const m of g.machines) {
    if (Math.abs(p.x - m.x) >= 46 || Math.abs(t.x - m.x) >= 46) continue;
    if (Math.sign(p.y - m.y) === Math.sign(t.y - m.y)) continue;
    const d = Math.abs(p.y - m.y); if (d >= bd) continue;
    bd = d; const side = p.x >= m.x ? 1 : -1;
    best = { x: m.x + side * 50, y: m.y + Math.sign(t.y - m.y) * 40 };
  }
  return best || t;
}

function canDeliver(g: Jogo, t: Item) {
  const si = PRODUCTS[t].shop, st = g.S[si];
  if (!st.open) return false;
  return t === 'caixa' ? st.stock < g.freezerCap() : st.counter[t].length < COUNTER_CAP;
}

/** Decide o próximo alvo do bot. */
function alvo(g: Jogo): Rect | Pt {
  const p = g.player;
  if (g.prestigeOpen()) {
    if (g.money >= g.prestigeCost() - (g.paid.praia || 0)) return padOf('praia');
  } else {
    const v = g.visibleSteps().find(v => g.money >= v.s.price - (g.paid[v.i] || 0));
    if (v) return padOf(v.s.slot);
  }
  const full = p.stack.length >= g.playerCap();
  const ms = g.machines.filter(m => m.pile > 0 && g.canCarry(p, m.type) && canDeliver(g, m.type));
  // termina o que está fazendo: pega até encher, entrega tudo o que couber
  const here = ms.find(m => inZone(p, zoneOf(m)));
  if (!full && here) return zoneOf(here);
  const drop = SHOPS.find((d, si) => inZone(p, d.drop) && p.stack.some(t => PRODUCTS[t].shop === si && canDeliver(g, t)));
  if (drop) return drop.drop;
  if (!full && ms.length) {
    // máquina mais cheia; o produto que a fila pede e acabou no balcão vem antes
    const score = (t: Item) => { const st = g.S[PRODUCTS[t].shop]; return t !== 'caixa' && !st.counter[t].length && st.queue.slice(0, 4).some(c => c.want === t) ? 100 : 0 };
    return zoneOf(ms.reduce((a, b) => b.pile + score(b.type) > a.pile + score(a.type) ? b : a));
  }
  const it = p.stack.find(t => canDeliver(g, t)) ?? p.stack[0];
  if (it) return SHOPS[PRODUCTS[it].shop].drop;
  const cash = g.S.findIndex(s => s.open && s.cashValue > 0);
  if (cash >= 0) return SHOPS[cash].cash;
  // nada para fazer: espera ao lado da máquina mais perto de encher
  return zoneOf(g.machines.reduce((a, b) => b.pile > a.pile ? b : a));
}

export function simular({ praias = 2, seed = 1, limiteMin = 60, humano = true } = {}): Resultado {
  const g = new Jogo({}, rng(seed)), R = rng(seed + 7);
  const entre = (a: number, b: number) => a + R() * (b - a);
  let a: Rect | Pt = g.player, pensa = 0, pausaAte = 0, proxPausa = 30000, fase = 0, desvio = 0;
  g.load(null); g.firstScene(); g.tutorial = 4;
  const compras: Compra[] = [], res: { praia: number; segundos: number }[] = [];
  let tPraia = 0, tCompra = 0, feitas = 0, beach = 0;
  const limite = limiteMin * 60000;
  for (let t = 0; t < limite * praias; t += DT) {
    if (g.state === 'beach') g.state = 'play';
    g.now += DT; tPraia += DT; tCompra += DT;
    const p = g.player;
    let input = { x: 0, y: 0 };
    if (!humano) a = alvo(g);
    else if (t >= proxPausa) { pausaAte = t + entre(3000, 5000); proxPausa = t + 30000 }
    if (humano && t >= pensa) { const n = alvo(g); if (n !== a && JSON.stringify(n) !== JSON.stringify(a)) { fase = R() * 6.28; desvio = entre(0.15, 0.35) } a = n; pensa = t + entre(200, 400) }
    // dentro da zona-alvo: fica parado (inZone exige estar dentro do retângulo)
    if (t >= pausaAte && (!('w' in a) || !inZone(p, { ...a, w: a.w - 16, h: a.h - 16 }))) {
      const w = waypoint(g, p, a), dx = w.x - p.x, dy = w.y - p.y, d = Math.hypot(dx, dy);
      // desvio leve: a direção balança devagar, e some perto do alvo para não ficar rodando em volta
      const ang = humano ? desvio * Math.sin(t / 600 + fase) * Math.min(1, d / 60) : 0, c = Math.cos(ang), sn = Math.sin(ang);
      if (d > 2) input = { x: (dx * c - dy * sn) / d, y: (dx * sn + dy * c) / d };
    }
    g.update(DT, input); g.updateFx(DT);
    if (g.done.size > feitas) {
      for (const i of [...g.done].slice(feitas)) compras.push({ praia: beach, indice: compras.filter(c => c.praia === beach).length, nome: g.plan[i].name, preco: g.plan[i].price, segundos: tCompra / 1000 });
      feitas = g.done.size; tCompra = 0;
    }
    if (g.beach !== beach) {
      compras.push({ praia: beach, indice: compras.filter(c => c.praia === beach).length, nome: 'Nova praia', preco: 0, segundos: tCompra / 1000 });
      res.push({ praia: beach, segundos: tPraia / 1000 }); beach = g.beach; tPraia = 0; tCompra = 0; feitas = 0;
      if (beach >= praias) return { compras, praias: res, travou: false };
    }
    if (tCompra > 10 * 60000) break; // 10 min sem comprar: travado
  }
  return { compras, praias: res, travou: true };
}

/** Faixa da seção 8 do GDD: compras de ~15 s no começo da praia subindo até ~90 s no fim (aceita metade a dobro),
    praia completa em 8 a 15 min. As 2 primeiras compras das praias novas são pagas na hora (começo rápido) e ficam de fora. */
export function foraDaFaixa(r: Resultado) {
  const erros: string[] = [];
  for (const p of r.praias) {
    const cs = r.compras.filter(c => c.praia === p.praia && !(p.praia > 0 && c.indice < 2));
    cs.forEach((c, k) => {
      const alvo = 15 + 75 * k / Math.max(1, cs.length - 1);
      if (c.segundos < alvo / 2 || c.segundos > alvo * 2) erros.push(`Praia ${p.praia + 1} #${c.indice + 1} ${c.nome}: ${c.segundos.toFixed(1)} s (alvo ~${alvo.toFixed(0)} s)`);
    });
    const min = p.segundos / 60;
    if (min < 8 || min > 15) erros.push(`Praia ${p.praia + 1} completa em ${min.toFixed(1)} min (alvo 8 a 15)`);
  }
  if (r.travou) erros.push('o bot travou');
  return erros;
}
