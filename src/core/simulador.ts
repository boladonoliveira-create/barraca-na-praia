/* Simulador de economia: um bot joga sozinho e mede o tempo até cada compra em cada praia.
   Estratégia (GDD seção 11): vai à máquina mais cheia, entrega e compra a próxima melhoria.
   O bot humano (padrão, usado nas metas de ritmo) reage com 200 a 400 ms de atraso, anda com desvio leve
   e para 3 a 5 s a cada 30 s. O perfeito (humano: false) decide a cada quadro e anda reto.
   Relatório no terminal: npm run sim [praias] (scripts/sim.ts) */
import { SHOPS, SLOTS, COUNTER_CAP, PRODUCTS, type Item, type Rect } from '../dados/mapa.ts';
import { Jogo, zoneOf, padOf, inZone, NUM_AREAS, type Pt } from './jogo.ts';
import { AREAS } from '../dados/planos.ts';

/** Gerador determinístico (mulberry32) para o resultado não variar entre execuções. */
export function rng(seed: number) {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 };
}

/** fase: quantas áreas já tinham sido abertas antes desta compra menos 1 (fase 0 = só a Barraca do Sol). */
export interface Compra { fase: number; area: number; nivel: number; nome: string; preco: number; segundos: number }
/** fases[n]: minutos de jogo da abertura da área n até a abertura da área n+1. */
export interface Resultado { compras: Compra[]; fases: number[]; total: number; travou: boolean }

const DT = 1000 / 60;

/** Contorna a máquina que estiver entre o jogador e o alvo (ela bloqueia o caminho direto).
    Juntando dinheiro, contorna também os quadros de compra que estiverem no caminho. */
function waypoint(g: Jogo, p: Pt, t: Pt, desviar: Pt[] = []): Pt {
  let best: Pt | null = null, bd = Infinity;
  for (const m of [...g.machines, ...desviar]) {
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
    const v = g.melhorCompra(false), falta = v ? g.falta(v) : Infinity;
    const pilhas = g.S.map((st, i) => st.open ? st.cashValue : 0), total = pilhas.reduce((x, y) => x + y, 0), maior = pilhas.indexOf(Math.max(...pilhas));
    if (g.money < falta && pilhas[maior] > 0 && (g.money + total >= falta || pilhas[maior] >= 0.3 * falta)) return SHOPS[maior].cash;
  }
  // panela: com cru na mão e espaço, fica carregando
  const panela = g.machines.find(m => m.needs && inZone(p, zoneOf(m)) && g.espaco(m) > 0 && p.stack.includes(m.needs));
  if (panela) return zoneOf(panela);
  return null;
}

/** Decide o próximo alvo do bot. */
function alvo(g: Jogo): Rect | Pt {
  const p = g.player;
  // a melhor compra entre todas as áreas (custo-benefício); se ainda não dá, junta dinheiro trabalhando
  const v = g.melhorCompra(false);
  if (v && g.money >= g.falta(v)) return padOf(v.s.slot);
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
    const score = (t: Item) => { const st = g.S[PRODUCTS[t].shop]; return st && t !== 'caixa' && !st.counter[t].length && st.queue.slice(0, 4).some(c => c.want === t) ? 100 : 0 };
    return zoneOf(ms.reduce((a, b) => b.pile + score(b.type) > a.pile + score(a.type) ? b : a));
  }
  const it = p.stack.find(t => canDeliver(g, t)) ?? p.stack[0];
  if (it) return destino(g, it);
  const cash = g.S.findIndex(s => s.open && s.cashValue > 0);
  if (cash >= 0) return SHOPS[cash].cash;
  // nada para fazer: espera ao lado da máquina mais perto de encher
  return zoneOf(g.machines.reduce((a, b) => b.pile > a.pile ? b : a));
}

/** As metas de ritmo (seção 8) valem até a 4ª área; a quadra (área 5) vem depois. */
export const AREAS_RITMO = 4;
/** Joga até abrir as 4 primeiras áreas (ou travar). */
export function simular({ seed = 1, limiteMin = 120, humano = true } = {}): Resultado {
  const g = new Jogo({}, rng(seed)), R = rng(seed + 7);
  const entre = (a: number, b: number) => a + R() * (b - a);
  let a: Rect | Pt = g.player, pensa = 0, pausaAte = 0, proxPausa = 30000, fase = 0, desvio = 0;
  g.load(null); g.firstScene(); g.tutorial = 4;
  const compras: Compra[] = [], fases: number[] = [];
  let tFase = 0, tCompra = 0, feitas = 0;
  const limite = limiteMin * 60000, abertas = () => g.S.slice(0, AREAS_RITMO).filter(s => s.open).length;
  for (let t = 0; t < limite; t += DT) {
    if (g.state === 'beach') g.state = 'play';
    g.now += DT; tFase += DT; tCompra += DT;
    const p = g.player;
    let input = { x: 0, y: 0 };
    if (!humano) a = alvo(g);
    else if (t >= proxPausa) { pausaAte = t + entre(3000, 5000); proxPausa = t + 30000 }
    if (humano && t >= pensa) { const n = alvo(g); if (n !== a && JSON.stringify(n) !== JSON.stringify(a)) { fase = R() * 6.28; desvio = entre(0.15, 0.35) } a = n; pensa = t + entre(200, 400) }
    // dentro da zona-alvo: fica parado (inZone exige estar dentro do retângulo)
    if (t >= pausaAte && (!('w' in a) || !inZone(p, { ...a, w: a.w - 16, h: a.h - 16 }))) {
      // juntando para uma compra: não pisa nos outros quadros (pisar neles gastaria o dinheiro)
      const v = g.melhorCompra(false), evitar = v && g.money < g.falta(v) ? g.visibleSteps().filter(x => x.s.slot !== v.s.slot).map(x => SLOTS[x.s.slot]) : [];
      const w = waypoint(g, p, a, evitar), dx = w.x - p.x, dy = w.y - p.y, d = Math.hypot(dx, dy);
      // desvio leve: a direção balança devagar, e some perto do alvo para não ficar rodando em volta
      const ang = humano ? desvio * Math.sin(t / 600 + fase) * Math.min(1, d / 60) : 0, c = Math.cos(ang), sn = Math.sin(ang);
      if (d > 2) input = { x: (dx * c - dy * sn) / d, y: (dx * sn + dy * c) / d };
    }
    const antes = [...g.nivel], faseAtual = abertas() - 1;
    g.update(DT, input); g.updateFx(DT);
    for (let ar = 0; ar < NUM_AREAS; ar++) while (antes[ar] < g.nivel[ar]) {
      const s = g.trilhas[ar][antes[ar]++]; compras.push({ fase: faseAtual, area: ar, nivel: antes[ar], nome: s.name, preco: s.price, segundos: tCompra / 1000 }); tCompra = 0; feitas++;
    }
    if (abertas() - 1 > faseAtual) { fases.push(tFase / 60000); tFase = 0; if (abertas() === AREAS_RITMO) return { compras, fases, total: fases.reduce((x, y) => x + y, 0), travou: false } }
    if (tCompra > 10 * 60000) break; // 10 min sem comprar: travado
  }
  return { compras, fases, total: fases.reduce((x, y) => x + y, 0), travou: true };
}

/** Faixa do GDD (seção 8, estrutura por áreas): em cada fase (de uma área aberta até a próxima), as compras vão de
    ~15 s a ~90 s (aceita metade a dobro); cada área nova abre de 8 a 15 min depois da anterior; as 4 abertas em 35 a 60 min. */
export const FAIXA = { inicio: 15, fim: 90, faseMin: 8, faseMax: 15, totalMin: 35, totalMax: 60 };
export function foraDaFaixa(r: Resultado) {
  const erros: string[] = [], F = FAIXA;
  r.fases.forEach((min, n) => {
    const cs = r.compras.filter(c => c.fase === n);
    cs.forEach((c, k) => {
      const alvo = F.inicio + (F.fim - F.inicio) * k / Math.max(1, cs.length - 1);
      if (c.segundos < alvo / 2 || c.segundos > alvo * 2) erros.push(`Fase ${n + 1} #${k + 1} ${AREAS[c.area]} nv ${c.nivel} (${c.nome}): ${c.segundos.toFixed(1)} s (alvo ~${alvo.toFixed(0)} s)`);
    });
    if (min < F.faseMin || min > F.faseMax) erros.push(`${AREAS[n + 1]} abriu ${min.toFixed(1)} min depois da anterior (alvo ${F.faseMin} a ${F.faseMax})`);
  });
  if (r.total < F.totalMin || r.total > F.totalMax) erros.push(`4 áreas abertas em ${r.total.toFixed(1)} min (alvo ${F.totalMin} a ${F.totalMax})`);
  if (r.travou) erros.push('o bot travou');
  return erros;
}
