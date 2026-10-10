/* Simulador de economia: um bot joga sozinho e mede o tempo até cada compra em cada praia.
   Estratégia (GDD seção 11): vai à máquina mais cheia, entrega e compra a próxima melhoria.
   O bot humano (padrão, usado nas metas de ritmo) reage com 200 a 400 ms de atraso, anda com desvio leve
   e para 3 a 5 s a cada 30 s. O perfeito (humano: false) decide a cada quadro e anda reto.
   Relatório no terminal: npm run sim (scripts/sim.ts) */
import { SHOPS, SLOTS, COUNTER_CAP, PRODUCTS, type Item, type Rect } from '../dados/mapa.ts';
import { Jogo, zoneOf, padOf, inZone, NUM_AREAS, type Pt } from './jogo.ts';

/** Gerador determinístico (mulberry32) para o resultado não variar entre execuções. */
export function rng(seed: number) {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 };
}

/** fase: a praia da compra (0 = Praia 1). */
export interface Compra { fase: number; area: number; nivel: number; nome: string; preco: number; segundos: number }
export interface Resultado { praias: PraiaSim[]; total: number; travou: boolean }

const DT = 1000 / 60;

/** Contorna a máquina que estiver entre o jogador e o alvo (ela bloqueia o caminho direto).
    Juntando dinheiro, contorna também os quadros de compra que estiverem no caminho. */
function waypoint(g: Jogo, p: Pt, t: Pt, desviar: Pt[] = []): Pt {
  // quadro no caminho (o trajeto reto passa por cima dele): vai para a quina alcançável mais perto do alvo
  const cruza = (a: Pt, b: Pt, z: Rect) => { for (let i = 1; i <= 16; i++) if (inZone({ x: a.x + (b.x - a.x) * i / 16, y: a.y + (b.y - a.y) * i / 16 }, z)) return true; return false };
  let z: Rect | null = null, qd = Infinity;
  for (const m of desviar) {
    const r = { x: m.x, y: m.y, w: 96, h: 84 }, d = Math.hypot(m.x - p.x, m.y - p.y);
    if (d < qd && !inZone(t, r) && !inZone(p, r) && cruza(p, t, r)) { z = r; qd = d }
  }
  if (z) {
    let c: Pt | null = null, cd = Infinity;
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
      const k = { x: z.x + sx * 52, y: z.y + sy * 46 }, d = Math.hypot(t.x - k.x, t.y - k.y);
      if (d < cd && Math.hypot(k.x - p.x, k.y - p.y) > 3 && !cruza(p, k, z)) { c = k; cd = d }
    }
    if (c) return c;
  }
  let best: Pt | null = null, bd = Infinity;
  for (const m of g.machines) {
    // obstáculo entre o jogador e o alvo na mesma altura: passa por cima ou por baixo dele
    if (Math.abs(p.y - m.y) < 40 && Math.abs(t.y - m.y) < 40 && Math.sign(p.x - m.x) !== Math.sign(t.x - m.x) && Math.abs(p.x - m.x) < 60) {
      const d = Math.abs(p.x - m.x); if (d >= bd) continue;
      bd = d; best = { x: p.x, y: m.y + (p.y !== m.y ? Math.sign(p.y - m.y) : t.y >= m.y ? 1 : -1) * 58 }; continue; // contorna pelo lado em que já está
    }
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
  if (si < 0) return g.machines.some(m => m.needs === t && g.espaco(m) > 0); // cru: vai para a panela
  if (!st.open) return false;
  if (SHOPS[si].kind === 'ambulante') return g.cabeNaBancada(t); // a caixa vai para a bancada, se couber
  if (t === 'prancha') return g.naArara() < g.araraCap();
  return t === 'caixa' ? st.stock < g.freezerCap() : st.counter[t].length < COUNTER_CAP;
}

/** Para onde levar o item: cru vai para a panela que o recebe; o resto, para o balcão da loja. */
function destino(g: Jogo, t: Item): Rect {
  if (PRODUCTS[t].shop >= 0) return SHOPS[PRODUCTS[t].shop].drop;
  const ms = g.machines.filter(m => m.needs === t);
  return zoneOf(ms.find(m => g.espaco(m) > 0) || ms[0]);
}

/** Praias 3 e 4: trabalhos que só existem com as lojas novas (as regras das Praias 1 e 2 não mudam). */
function alvoNovo(g: Jogo): Rect | Pt | null {
  const p = g.player, sv = g.sv, reg = SHOPS[2].drop;
  if (g.S[2]?.open) {
    const salva = g.helpers.some(h => h.shop === 2), cap = g.aguaCap();
    // enche a caixa: começa quando secou (ou está baixa sem salva-vidas) e só sai cheia
    if (inZone(p, reg) && sv.agua < cap) return reg;
    if (sv.agua === 0 && sv.fila.length || (!salva && sv.agua <= 1)) return reg;
    // cadeiras bagunçadas (sem salva-vidas, quando já são 2 ou mais)
    const sujas = sv.cadeiras.filter(c => c.suja);
    if (!salva && sujas.length >= 2) return sujas.reduce((a, b) => Math.hypot(b.x - p.x, b.y - p.y) < Math.hypot(a.x - p.x, a.y - p.y) ? b : a);
    // dinheiro parado nas lojas que os ajudantes já tocam: busca a maior pilha quando ela completa a compra ou pesa nela
    const falta = meta(g)?.falta ?? Infinity;
    const pilhas = g.S.map((st, i) => st.open ? st.cashValue : 0), total = pilhas.reduce((x, y) => x + y, 0), maior = pilhas.indexOf(Math.max(...pilhas));
    if (g.money < falta && pilhas[maior] > 0 && (g.money + total >= falta || pilhas[maior] >= 0.3 * falta)) return SHOPS[maior].cash;
  }
  // escolinha: leva a prancha molhada para a arara; sem instrutor, recolhe as que estão na areia
  if (g.S[6]?.open) {
    if (p.stack.includes('prancha') && canDeliver(g, 'prancha') && (!g.canCarry(p, 'prancha') || !g.esc.pranchas.some(b => b.estado === 'molhada'))) return SHOPS[6].drop;
    const molhadas = g.esc.pranchas.filter(b => b.estado === 'molhada'), secas = g.esc.pranchas.filter(b => b.estado === 'seca').length;
    if (!g.helpers.some(h => h.shop === 6) && molhadas.length && g.canCarry(p, 'prancha') && (secas === 0 || molhadas.length >= 2))
      return molhadas.reduce((a, b) => Math.hypot(b.x - p.x, b.y - p.y) < Math.hypot(a.x - p.x, a.y - p.y) ? b : a);
  }
  // panela: com cru na mão e espaço, fica carregando
  const panela = g.machines.find(m => m.needs && inZone(p, zoneOf(m)) && g.espaco(m) > 0 && p.stack.includes(m.needs));
  if (panela) return zoneOf(panela);
  return null;
}

/** O que o bot está juntando dinheiro para comprar: a viagem, assim que libera, ou a melhor compra. */
function meta(g: Jogo): { pad: Rect; slot: string; falta: number } | null {
  if (g.novaPraiaAberta() && g.proximaExiste()) return { pad: padOf('praia'), slot: 'praia', falta: g.custoNovaPraia() - (g.paid.praia || 0) };
  const v = g.melhorCompra(true) || g.melhorCompra(false); // como a seta: a melhor que cabe no bolso; se nada cabe, junta para a melhor
  return v ? { pad: padOf(v.s.slot), slot: v.s.slot, falta: g.falta(v) } : null;
}

/** Decide o próximo alvo do bot. */
function alvo(g: Jogo): Rect | Pt {
  const p = g.player;
  // a viagem ou a melhor compra entre todas as áreas (custo-benefício); se ainda não dá, junta dinheiro trabalhando
  const m = meta(g);
  if (m && g.money >= m.falta) return m.pad;
  const novo = alvoNovo(g); if (novo) return novo;
  const full = p.stack.length >= g.playerCap();
  const ms = g.machines.filter(m => m.pile > 0 && g.canCarry(p, m.type) && canDeliver(g, m.type));
  // termina o que está fazendo: pega até encher, entrega tudo o que couber
  const here = ms.find(m => inZone(p, zoneOf(m)));
  if (!full && here) return zoneOf(here);
  const drop = SHOPS.find((d, si) => inZone(p, d.drop) && p.stack.some(t => PRODUCTS[t].shop === si && canDeliver(g, t)));
  if (drop) return drop.drop;
  if (!full && ms.length) {
    // máquina mais cheia; o produto que a fila pede e acabou no balcão vem antes
    const score = (t: Item) => { const st = g.S[PRODUCTS[t].shop]; return st && st.counter[t] && !st.counter[t].length && st.queue.slice(0, 4).some(c => c.want === t) ? 100 : 0 };
    return zoneOf(ms.reduce((a, b) => b.pile + score(b.type) > a.pile + score(a.type) ? b : a));
  }
  const it = p.stack.find(t => canDeliver(g, t)) ?? p.stack[0];
  if (it) return destino(g, it);
  const cash = g.S.findIndex(s => s.open && s.cashValue > 0);
  if (cash >= 0) return SHOPS[cash].cash;
  // nada para fazer: espera ao lado da máquina mais perto de encher
  return zoneOf(g.machines.reduce((a, b) => b.pile > a.pile ? b : a));
}

/** Uma praia jogada pelo bot: minutos até a viagem, quando as áreas antigas voltaram (% do tempo da praia),
    a maior espera entre compras (s) e a fama ganha. */
export interface PraiaSim { praia: number; minutos: number; antigas: number; maiorEspera: number; fama: number; compras: Compra[] }

/** Joga da Praia 1 até a área nova da última praia chegar ao nível da viagem (ou travar).
    O bot compra a nova praia assim que ela libera. */
export function simular({ seed = 1, limiteMin = 900, humano = true, praias = NUM_AREAS } = {}): Resultado {
  const g = new Jogo({}, rng(seed)), R = rng(seed + 7);
  const entre = (a: number, b: number) => a + R() * (b - a);
  let a: Rect | Pt = g.player, pensa = 0, pausaAte = 0, proxPausa = 30000, fase = 0, desvio = 0;
  g.load(null); g.firstScene(); g.tutorial = 4;
  const lista: PraiaSim[] = [];
  let tPraia = 0, tCompra = 0, antigas = -1, maior = 0, compras: Compra[] = [];
  const limite = limiteMin * 60000;
  const fim = (travou: boolean): Resultado => ({ praias: lista, total: lista.reduce((x, y) => x + y.minutos, 0), travou });
  const fecha = (b: number, fama: number) => {
    maior = Math.max(maior, tCompra / 1000);
    lista.push({ praia: b + 1, minutos: tPraia / 60000, antigas: b ? Math.max(0, antigas) / tPraia * 100 : 0, maiorEspera: maior, fama, compras });
    tPraia = 0; tCompra = 0; antigas = -1; maior = 0; compras = [];
  };
  for (let t = 0; t < limite; t += DT) {
    if (g.state === 'beach') g.state = 'play';
    g.now += DT; tPraia += DT; tCompra += DT;
    const p = g.player;
    let input = { x: 0, y: 0 };
    if (!humano) a = alvo(g);
    else if (t >= proxPausa) { pausaAte = t + entre(3000, 5000); proxPausa = t + 30000 }
    if (humano && t >= pensa) { const n = alvo(g); if (n !== a && JSON.stringify(n) !== JSON.stringify(a)) { fase = R() * 6.28; desvio = entre(0.15, 0.35) } a = n; pensa = t + entre(200, 400) }
    // dentro da zona-alvo: fica parado (inZone exige estar dentro do retângulo)
    if (t >= pausaAte && (!('w' in a) || !inZone(p, { ...a, w: a.w - 16, h: a.h - 16 }))) {
      // juntando para uma compra: não pisa nos outros quadros (pisar neles gastaria o dinheiro)
      const m = meta(g), evitar = m && g.money < m.falta ? g.visibleSteps().filter(x => x.s.slot !== m.slot).map(x => SLOTS[x.s.slot]) : [];
      const w = waypoint(g, p, a, evitar), dx = w.x - p.x, dy = w.y - p.y, d = Math.hypot(dx, dy);
      // desvio leve: a direção balança devagar, e some perto do alvo para não ficar rodando em volta
      const ang = humano ? desvio * Math.sin(t / 600 + fase) * Math.min(1, d / 60) : 0, c = Math.cos(ang), sn = Math.sin(ang);
      if (d > 2) input = { x: (dx * c - dy * sn) / d, y: (dx * sn + dy * c) / d };
    }
    const antes = [...g.nivel], praia = g.beach;
    g.update(DT, input); g.updateFx(DT);
    if (g.beach !== praia) { // viajou: a praia anterior acabou (e, se era a última pedida, a simulação também)
      fecha(praia, g.famas[g.famas.length - 1]); if (praia + 1 >= praias) return fim(false); continue;
    }
    for (let ar = 0; ar < NUM_AREAS; ar++) while (antes[ar] < g.nivel[ar]) {
      const s = g.trilhas[ar][antes[ar]++]; if (!s.price) continue; // começo rápido: de graça, não é compra
      compras.push({ fase: praia, area: ar, nivel: antes[ar], nome: s.name, preco: s.price, segundos: tCompra / 1000 }); maior = Math.max(maior, tCompra / 1000); tCompra = 0;
    }
    if (antigas < 0 && g.S.slice(0, Math.max(1, g.beach)).every(st => st.open)) antigas = tPraia;
    // cada praia acaba na compra da viagem; a Praia 10 (sem viagem), quando o torneio faz campeão
    if (praia === 9 ? g.campeao() : g.novaPraiaAberta() && !g.proximaExiste()) { fecha(praia, g.famaGanha()); return fim(false) }
    if (tCompra > 10 * 60000) break; // 10 min sem comprar: travado
  }
  return fim(true);
}

/** Metas da rodada 5, por praia: minutos [mín, máx] até a viagem. Nenhuma espera passa de ESPERA_MAX s, e as áreas
    antigas voltam a funcionar nos primeiros ANTIGAS_MAX % do tempo da praia. */
export const METAS: [number, number][] = [[8, 10], [15, 20], [20, 25], [25, 35], [35, 45], [45, 55], [55, 65], [60, 75], [70, 85], [80, 95]];
/** O total das 10 praias, em horas de jogo ativo. */
export const TOTAL_HORAS: [number, number] = [7.5, 9];
export const ESPERA_MAX = 150, ANTIGAS_MAX = 25;
export function foraDaFaixa(r: Resultado) {
  const erros: string[] = [];
  for (const p of r.praias) {
    const [mn, mx] = METAS[p.praia - 1];
    if (p.minutos < mn || p.minutos > mx) erros.push(`Praia ${p.praia}: ${p.minutos.toFixed(1)} min (alvo ${mn} a ${mx})`);
    if (p.maiorEspera > ESPERA_MAX) erros.push(`Praia ${p.praia}: espera de ${p.maiorEspera.toFixed(0)} s (máximo ${ESPERA_MAX})`);
    if (p.antigas > ANTIGAS_MAX) erros.push(`Praia ${p.praia}: áreas antigas abertas a ${p.antigas.toFixed(0)}% do tempo (máximo ${ANTIGAS_MAX}%)`);
  }
  if (r.praias.length === METAS.length && (r.total < TOTAL_HORAS[0] * 60 || r.total > TOTAL_HORAS[1] * 60)) erros.push(`Total: ${(r.total / 60).toFixed(1)} h (alvo ${TOTAL_HORAS[0]} a ${TOTAL_HORAS[1]} h)`);
  if (r.travou) erros.push('o bot travou');
  return erros;
}
