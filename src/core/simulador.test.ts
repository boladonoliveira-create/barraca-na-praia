import { describe, it, expect } from 'vitest';
import { simular, foraDaFaixa } from './simulador.ts';

describe('simulador de economia', () => {
  const r = simular({ praias: 4 });

  it('o bot humano completa as Praias 1 a 4 sem travar', () => {
    expect(r.travou).toBe(false);
    expect(r.praias).toHaveLength(4);
  });

  // As Praias 3 e 4 não podem mudar o jogo das Praias 1 e 2 (tempos medidos na rodada 2).
  // Se o balanceamento (etapa 7) mexer nelas de propósito, atualize os números.
  it('Praias 1 e 2 seguem com os mesmos tempos', () => {
    expect(r.praias.slice(0, 2).map(p => p.segundos.toFixed(1))).toEqual(['624.3', '808.7']);
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
