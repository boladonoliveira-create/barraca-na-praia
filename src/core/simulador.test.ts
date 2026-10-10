import { describe, it, expect } from 'vitest';
import { simular, foraDaFaixa, METAS, ESPERA_MAX, ANTIGAS_MAX } from './simulador.ts';

describe('simulador de economia (praias 1 a 5)', () => {
  const r = simular({ praias: 5 });

  it('o bot humano joga as 5 praias sem travar, comprando a viagem assim que libera', () => {
    expect(r.travou).toBe(false);
    expect(r.praias.map(p => p.praia)).toEqual([1, 2, 3, 4, 5]);
  });

  it('o bot perfeito continua disponível e também chega ao fim da Praia 2', () => {
    expect(simular({ humano: false, praias: 2 }).travou).toBe(false);
  });

  it('é determinístico', () => {
    expect(simular({ limiteMin: 15 }).praias).toEqual(simular({ limiteMin: 15 }).praias);
  });

  it(`cada praia dentro da meta de tempo, nenhuma espera acima de ${ESPERA_MAX} s e as áreas antigas abertas nos primeiros ${ANTIGAS_MAX}%`, () => {
    expect(foraDaFaixa(r)).toEqual([]);
    r.praias.forEach((p, i) => { expect(p.minutos).toBeGreaterThanOrEqual(METAS[i][0]); expect(p.minutos).toBeLessThanOrEqual(METAS[i][1]) });
  });

  it('a fama ganha cresce de praia para praia', () => {
    for (let i = 1; i < r.praias.length; i++) expect(r.praias[i].fama).toBeGreaterThan(r.praias[i - 1].fama);
  });
});
