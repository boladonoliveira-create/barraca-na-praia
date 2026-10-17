import { describe, it, expect } from 'vitest';
import { Navegacao, cruza, contem } from './navegacao.ts';

const solido = { x: 100, y: 100, w: 60, h: 80 };
const limites = { x0: 0, x1: 300, y0: 0, y1: 250 };
describe('navegação em terrenos sólidos', () => {
  it('detecta segmentos que cruzam o terreno mesmo se os dois extremos estão fora', () => {
    expect(cruza({ x: 0, y: 100 }, { x: 200, y: 100 }, solido)).toBe(true);
    expect(cruza({ x: 100, y: 0 }, { x: 100, y: 200 }, solido)).toBe(true);
    expect(cruza({ x: 0, y: 10 }, { x: 200, y: 10 }, solido)).toBe(false);
  });
  it('colisão não deixa atravessar com um deslocamento grande e permite deslizar', () => {
    const n = new Navegacao([solido], limites), p = { x: 20, y: 100 };
    n.mover(p, 260, 10); expect(p.x).toBe(70); expect(p.y).toBe(110);
    n.mover(p, 0, 60); n.mover(p, 100, 0); expect(p.x).toBe(170);
    expect(contem(p, solido)).toBe(false);
  });
  it('contorna vários terrenos e chega ao destino sem entrar neles', () => {
    const rs = [solido, { x: 190, y: 60, w: 50, h: 90 }], n = new Navegacao(rs, limites);
    const p = { x: 20, y: 100 }, alvo = { x: 270, y: 100 };
    for (let i = 0; i < 1000 && Math.hypot(p.x - alvo.x, p.y - alvo.y) > 0.01; i++) {
      const q = n.proximo(p, alvo), d = Math.hypot(q.x - p.x, q.y - p.y), k = Math.min(1, 3 / d);
      if (d > 0) n.mover(p, (q.x - p.x) * k, (q.y - p.y) * k);
      expect(rs.some(r => contem(p, r))).toBe(false);
    }
    expect(p.x).toBeCloseTo(alvo.x); expect(p.y).toBeCloseTo(alvo.y);
    expect(n.livre(n.alcancavel({ x: 100, y: 100 }))).toBe(true);
  });
});
