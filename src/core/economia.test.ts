import { describe, it, expect } from 'vitest';
import { makeTrilha, stepPrice, fmt } from './economia.ts';
import { ECONOMIA, TRILHAS } from '../dados/planos.ts';

describe('trilhas por área', () => {
  it('preço: Barraca base × cresce^k; nas outras, o passo 0 abre a área e as melhorias seguem base × cresce^(k-1); × praia^b', () => {
    expect(stepPrice(0, 0, 0)).toBe(ECONOMIA.base[0]);
    expect(stepPrice(1, 0, 0)).toBe(ECONOMIA.abrir[1]);
    expect(stepPrice(1, 1, 0)).toBe(ECONOMIA.base[1]);
    expect(stepPrice(0, 0, 1)).toBe(Math.round(ECONOMIA.base[0] * ECONOMIA.praia / 5) * 5);
    for (const a of [0, 1, 2, 3]) for (const b of [0, 2]) makeTrilha(a, b).forEach((s, k) => { expect(s.price % 5).toBe(0); expect(s.price).toBe(stepPrice(a, k, b)) });
  });

  it('as trilhas têm 60 passos, e a Barraca ganha duas posições extras para as mochilas', () => {
    for (const a of [0, 1, 2, 3]) { const t = makeTrilha(a, 0); expect(t).toHaveLength(a === 0 ? 62 : 60); expect(t.slice(0, TRILHAS[a].length).map(s => s.id)).toEqual(TRILHAS[a].map(s => s[1])) }
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
    expect(fmt(950)).toBe('950');
    expect(fmt(12345)).toBe('12,3 mil');
    expect(fmt(12500)).toBe('12,5 mil');
    expect(fmt(123456)).toBe('123 mil');
    expect(fmt(3200000)).toBe('3,2 mi');
    expect(fmt(320000000)).toBe('320 mi');
    expect(fmt(1100000000)).toBe('1,1 bi');
    expect(fmt(12000)).toBe('12 mil');
  });
});

describe('começo rápido', () => {
  it('o 1º ajudante e o cofre vêm logo depois da abertura, de graça; o resto custa ECONOMIA.antiga do preço', () => {
    const t = makeTrilha(1, 2, true), n = makeTrilha(1, 2);
    expect(t.slice(0, 3).map(s => [s.id, s.price])).toEqual([['sorv', Math.round(n[0].price * ECONOMIA.antiga / 5) * 5], ['ajudS', 0], ['cofre1', 0]]);
    expect(t).toHaveLength(60);
    expect(makeTrilha(0, 2, true).slice(0, 2).map(s => s.id)).toEqual(['ajud', 'cofre0']);
    expect(makeTrilha(4, 4, true).every(s => s.price > 0)).toBe(true); // a quadra não tem ajudante nem cofre
  });
});


it('as mochilas extras têm preço próprio e não inflam os preços antigos da cauda', () => {
  const antiga = makeTrilha(0, 0, false, true), nova = makeTrilha(0, 0);
  expect(nova.slice(20, 22).map(s => s.price)).toEqual(ECONOMIA.mochilas.slice(0, 2));
  for (let k = 20; k < antiga.length; k++) {
    expect(nova[k + 2].id).toBe(antiga[k].id);
    expect(nova[k + 2].price).toBe(antiga[k].price);
  }
});
