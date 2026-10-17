/* Geometria compartilhada pelo jogador, ajudantes e bot. Sem DOM, sorteios nem efeitos na economia. */
import type { Rect } from '../dados/mapa.ts';
export interface Ponto { x: number; y: number }
export interface Limites { x0: number; x1: number; y0: number; y1: number }
export const ampliar = (r: Rect, margem: number): Rect => ({ ...r, w: r.w + margem * 2, h: r.h + margem * 2 });
export const contem = (p: Ponto, r: Rect) => Math.abs(p.x - r.x) < r.w / 2 && Math.abs(p.y - r.y) < r.h / 2;
const distancia = (a: Ponto, b: Ponto) => Math.hypot(b.x - a.x, b.y - a.y);
/** Interseção exata de segmento e retângulo, inclusive para deslocamentos grandes. */
export function cruza(a: Ponto, b: Ponto, r: Rect) {
  if (Math.max(a.x, b.x) <= r.x - r.w / 2 || Math.min(a.x, b.x) >= r.x + r.w / 2 || Math.max(a.y, b.y) <= r.y - r.h / 2 || Math.min(a.y, b.y) >= r.y + r.h / 2) return false;
  let inicio = 0, fim = 1;
  for (const eixo of ['x', 'y'] as const) {
    const tamanho = eixo === 'x' ? r.w : r.h, min = r[eixo] - tamanho / 2, max = r[eixo] + tamanho / 2, d = b[eixo] - a[eixo];
    if (Math.abs(d) < 1e-9) { if (a[eixo] <= min || a[eixo] >= max) return false; continue }
    const t0 = (min - a[eixo]) / d, t1 = (max - a[eixo]) / d;
    inicio = Math.max(inicio, Math.min(t0, t1)); fim = Math.min(fim, Math.max(t0, t1));
    if (inicio >= fim) return false;
  }
  return fim > 0.000001 && inicio < 0.999999;
}

/** Grafo de visibilidade nas quinas; reutilizado até mudar uma área aberta. */
export class Navegacao {
  private pontos: Ponto[];
  private arestas: { i: number; d: number }[][];
  private custos = new Map<string, number[]>();
  readonly solidos: Rect[];
  readonly limites: Limites;
  constructor(solidos: Rect[], limites: Limites) {
    this.solidos = solidos; this.limites = limites;
    this.pontos = solidos.flatMap(r => [-1, 1].flatMap(sx => [-1, 1].map(sy => ({ x: r.x + sx * (r.w / 2 + 4), y: r.y + sy * (r.h / 2 + 4) })))).filter(p => this.livre(p));
    this.arestas = this.pontos.map((p, i) => this.pontos.flatMap((q, j) => i !== j && this.retaLivre(p, q) ? [{ i: j, d: distancia(p, q) }] : []));
  }
  livre(p: Ponto) { const l = this.limites; return p.x >= l.x0 && p.x <= l.x1 && p.y >= l.y0 && p.y <= l.y1 && !this.solidos.some(r => contem(p, r)) }
  retaLivre(a: Ponto, b: Ponto) { return !this.solidos.some(r => cruza(a, b, r)) }
  alcancavel(p: Ponto): Ponto {
    const l = this.limites, q = { x: Math.max(l.x0, Math.min(l.x1, p.x)), y: Math.max(l.y0, Math.min(l.y1, p.y)) };
    if (this.livre(q)) return q;
    const opcoes = this.solidos.filter(r => contem(q, r)).flatMap(r => [
      { x: r.x - r.w / 2 - 4, y: q.y }, { x: r.x + r.w / 2 + 4, y: q.y },
      { x: q.x, y: r.y - r.h / 2 - 4 }, { x: q.x, y: r.y + r.h / 2 + 4 },
    ]).filter(p => this.livre(p)).sort((a, b) => distancia(q, a) - distancia(q, b));
    return opcoes[0] || this.pontos.reduce((a, b) => distancia(q, a) < distancia(q, b) ? a : b);
  }
  proximo(origem: Ponto, destino: Ponto): Ponto {
    const origemLivre = this.alcancavel(origem);
    if (distancia(origem, origemLivre) > 0.001) return origemLivre;
    const alvo = this.alcancavel(destino);
    if (this.retaLivre(origem, alvo)) return alvo;
    const chave = `${alvo.x}:${alvo.y}`;
    let custos = this.custos.get(chave);
    if (!custos) {
      custos = this.pontos.map(p => this.retaLivre(p, alvo) ? distancia(p, alvo) : Infinity);
      const visitados = new Set<number>();
      for (let k = 0; k < this.pontos.length; k++) {
        let i = -1;
        for (let j = 0; j < custos.length; j++) if (!visitados.has(j) && (i < 0 || custos[j] < custos[i])) i = j;
        if (i < 0 || !Number.isFinite(custos[i])) break;
        visitados.add(i);
        for (const e of this.arestas[i]) custos[e.i] = Math.min(custos[e.i], custos[i] + e.d);
      }
      if (this.custos.size >= 512) this.custos.clear();
      this.custos.set(chave, custos);
    }
    let melhor = origem, custo = Infinity;
    this.pontos.forEach((p, i) => {
      // O bot considera uma quina alcançada a 2 unidades: avance para a próxima, em vez de devolver um alvo onde ele já parou.
      const atePonto = distancia(origem, p); if (atePonto <= 2.5) return;
      const d = atePonto + custos![i];
      if (d < custo && this.retaLivre(origem, p)) { melhor = p; custo = d }
    });
    return melhor;
  }
  /** Colisão por eixo com varredura: desliza na borda, sem atravessar mesmo com dt grande. */
  mover(p: Ponto, dx: number, dy: number) {
    Object.assign(p, this.alcancavel(p));
    const l = this.limites;
    let x = Math.max(l.x0, Math.min(l.x1, p.x + dx));
    for (const r of this.solidos) if (p.y > r.y - r.h / 2 && p.y < r.y + r.h / 2) {
      if (dx > 0 && p.x <= r.x - r.w / 2 && x > r.x - r.w / 2) x = Math.min(x, r.x - r.w / 2);
      if (dx < 0 && p.x >= r.x + r.w / 2 && x < r.x + r.w / 2) x = Math.max(x, r.x + r.w / 2);
    }
    p.x = x;
    let y = Math.max(l.y0, Math.min(l.y1, p.y + dy));
    for (const r of this.solidos) if (p.x > r.x - r.w / 2 && p.x < r.x + r.w / 2) {
      if (dy > 0 && p.y <= r.y - r.h / 2 && y > r.y - r.h / 2) y = Math.min(y, r.y - r.h / 2);
      if (dy < 0 && p.y >= r.y + r.h / 2 && y < r.y + r.h / 2) y = Math.max(y, r.y + r.h / 2);
    }
    p.y = y;
  }
}
