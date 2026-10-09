import { describe, it, expect } from 'vitest';
import { simular, foraDaFaixa } from './simulador.ts';

describe('simulador de economia', () => {
  const r = simular({ praias: 3 });

  it('o bot humano completa 3 praias sem travar', () => {
    expect(r.travou).toBe(false);
    expect(r.praias).toHaveLength(3);
  });

  it('o bot perfeito continua disponível e também completa as praias', () => {
    expect(simular({ praias: 2, humano: false }).travou).toBe(false);
  });

  it('é determinístico', () => {
    expect(simular({ praias: 1 }).compras).toEqual(simular({ praias: 1 }).compras);
  });

  // Metas de ritmo medidas com o bot humano (padrão). Números em dados/planos.ts (ECONOMIA).
  it('ritmo dentro da faixa da seção 8', () => {
    expect(foraDaFaixa(r)).toEqual([]);
  });
});
