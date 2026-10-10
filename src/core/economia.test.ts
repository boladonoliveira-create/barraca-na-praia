import { describe, it, expect } from 'vitest';
import { makeTrilha, stepPrice, fmt } from './economia.ts';
import { ECONOMIA, TRILHAS } from '../dados/planos.ts';

describe('trilhas por área', () => {
  it('preço: Barraca base × cresce^k; nas outras, o passo 0 abre a área e as melhorias seguem base × cresce^(k-1); × praia^b', () => {
    expect(stepPrice(0, 0, 0)).toBe(ECONOMIA.base[0]);
    expect(stepPrice(1, 0, 0)).toBe(ECONOMIA.abrir[1]);
    expect(stepPrice(1, 1, 0)).toBe(ECONOMIA.base[1]);
    expect(stepPrice(0, 0, 1)).toBe(Math.round(ECONOMIA.base[0] * 1.5 / 5) * 5);
    for (const a of [0, 1, 2, 3]) for (const b of [0, 2]) makeTrilha(a, b).forEach((s, k) => { expect(s.price % 5).toBe(0); expect(s.price).toBe(stepPrice(a, k, b)) });
  });

  it('cada trilha tem 60 passos: a lista fixa e depois a cauda', () => {
    for (const a of [0, 1, 2, 3]) { const t = makeTrilha(a, 0); expect(t).toHaveLength(60); expect(t.slice(0, TRILHAS[a].length).map(s => s.id)).toEqual(TRILHAS[a].map(s => s[1])) }
  });

  it('as áreas 2 a 4 começam abrindo a loja', () => {
    expect([1, 2, 3].map(a => makeTrilha(a, 0)[0].id)).toEqual(['sorv', 'servico', 'milho']);
  });

  it('nomes do cardápio seguem a ordem e depois numeram', () => {
    const names = makeTrilha(0, 0).filter(s => s.id === 'cardapio').map(s => s.name);
    expect(names.slice(0, 6)).toEqual(['Açaí com granola', 'Leite condensado', 'Morango no açaí', 'Paçoca no açaí', 'Açaí completo', 'Cardápio caprichado 6']);
    expect(makeTrilha(1, 0).filter(s => s.id === 'cardapioS').slice(0, 2).map(s => s.name)).toEqual(['Duas bolas', 'Três bolas']);
  });
});

describe('fmt', () => {
  it('formata dinheiro', () => {
    expect(fmt(999.9)).toBe('999');
    expect(fmt(12345)).toBe('12,3 mil');
    expect(fmt(123456)).toBe('123 mil');
  });
});
