import { describe, it, expect } from 'vitest';
import { simular, foraDaFaixa } from './simulador.ts';

describe('simulador de economia', () => {
  const r = simular({ praias: 3 });

  it('o bot completa 3 praias sem travar', () => {
    expect(r.travou).toBe(false);
    expect(r.praias).toHaveLength(3);
  });

  it('é determinístico', () => {
    expect(simular({ praias: 1 }).compras).toEqual(simular({ praias: 1 }).compras);
  });

  // Com os números do protótipo a economia ainda anda rápido demais (praias de ~4 min).
  // Balancear é a etapa 7 do GDD; quando a faixa for atingida este teste passa a falhar: troque it.fails por it.
  it.fails('ritmo dentro da faixa da seção 8', () => {
    expect(foraDaFaixa(r)).toEqual([]);
  });
});
