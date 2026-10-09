import { describe, it, expect } from 'vitest';
import { makePlan, stepPrice, fmt } from './economia.ts';

describe('plano de compras', () => {
  it('preço = 50 × 1,21^i × 1,5^b em múltiplos de 5', () => {
    expect(stepPrice(0, 0)).toBe(50);
    expect(stepPrice(1, 0)).toBe(60);
    expect(stepPrice(0, 1)).toBe(75);
    for (const b of [0, 1, 3]) makePlan(b).forEach((s, i) => { expect(s.price % 5).toBe(0); expect(s.price).toBe(stepPrice(i, b)) });
  });

  it('Praia 1 começa pela base, sem sorvete; lista com 80 passos', () => {
    const p = makePlan(0);
    expect(p).toHaveLength(80);
    expect(p.slice(0, 5).map(s => s.name)).toEqual(['Máquina de açaí 2', 'Guarda-sol', 'Coqueiro', 'Ajudante', 'Açaí com granola']);
    expect(p.some(s => s.id.endsWith('S') || s.id === 'sorv')).toBe(false);
  });

  it('a partir da Praia 2 o quiosque entra na posição 3 e o cardápio do sorvete ganha nome', () => {
    const p = makePlan(1);
    expect(p[3].id).toBe('sorv');
    expect(p.filter(s => s.id === 'cardapioS').slice(0, 2).map(s => s.name)).toEqual(['Duas bolas', 'Três bolas']);
  });

  it('nomes do cardápio do açaí seguem a ordem e depois numeram', () => {
    const names = makePlan(0).filter(s => s.id === 'cardapio').map(s => s.name);
    expect(names.slice(0, 6)).toEqual(['Açaí com granola', 'Leite condensado', 'Morango no açaí', 'Paçoca no açaí', 'Açaí completo', 'Cardápio caprichado 6']);
  });
});

describe('fmt', () => {
  it('formata dinheiro', () => {
    expect(fmt(999.9)).toBe('999');
    expect(fmt(12345)).toBe('12,3 mil');
    expect(fmt(123456)).toBe('123 mil');
  });
});
