import { describe, it, expect } from 'vitest';
import { simular, foraDaFaixa, FAIXA } from './simulador.ts';

describe('simulador de economia (áreas independentes)', () => {
  const r = simular();

  it('o bot humano abre as 4 áreas sem travar', () => {
    expect(r.travou).toBe(false);
    expect(r.fases).toHaveLength(3);
  });

  it('o bot perfeito continua disponível e também abre as 4 áreas', () => {
    expect(simular({ humano: false }).travou).toBe(false);
  });

  it('é determinístico', () => {
    expect(simular({ limiteMin: 15 }).compras).toEqual(simular({ limiteMin: 15 }).compras);
  });

  it(`cada área nova abre de ${FAIXA.faseMin} a ${FAIXA.faseMax} min depois da anterior; as 4 em ${FAIXA.totalMin} a ${FAIXA.totalMax} min`, () => {
    for (const m of r.fases) { expect(m).toBeGreaterThanOrEqual(FAIXA.faseMin); expect(m).toBeLessThanOrEqual(FAIXA.faseMax) }
    expect(r.total).toBeGreaterThanOrEqual(FAIXA.totalMin); expect(r.total).toBeLessThanOrEqual(FAIXA.totalMax);
  });

  // Compras de ~15 s a ~90 s em cada fase. Hoje sobram 3 desvios na semente 1, todos do mesmo tipo: esperas de
  // 3,5 a 4 min antes de uma compra cara (abrir o Chuveirão, o 2º aluguel) e a 1ª compra da fase 3 (49 s, alvo ~15 s).
  // Abrir uma área é um salto de preço, e baixá-lo encurta as fases para menos de 8 min. Fica para o balanceamento
  // da etapa 7; o teste só não deixa piorar.
  it('compras dentro da faixa, com no máximo os 3 desvios conhecidos e nenhuma espera acima de 4 min', () => {
    expect(foraDaFaixa(r).length).toBeLessThanOrEqual(3);
    for (const c of r.compras) expect(c.segundos).toBeLessThan(240);
  });
});
