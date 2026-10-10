import { describe, it, expect } from 'vitest';
import { lerSave, gravarSave, lerMundo, SAVE_KEY, SAVE_VERSION } from './salvar.ts';
import { ECONOMIA } from '../dados/planos.ts';

const save = { money: 10, niveis: [6, 2, 0, 0], paid: {}, praia: 2, famaTotal: 3, famas: [3], ganho: 40, tempo: 9000, last: 5, tutorial: 4 };
function mem(init: Record<string, string> = {}) {
  const m = new Map(Object.entries(init));
  return { get: (k: string) => m.get(k) ?? null, set: (k: string, v: string) => { m.set(k, v); return true }, m };
}

describe('salvamento', () => {
  it('grava com chave própria, versão 4 e o mundo, e lê de volta', () => {
    const s = mem(); gravarSave(save, s.get, s.set);
    expect(SAVE_VERSION).toBe(4);
    const gravado = JSON.parse(s.m.get(SAVE_KEY)!);
    expect(gravado).toEqual({ versao: 4, mundo: { id: expect.any(String), criadoEm: expect.any(Number) }, jogo: save });
    expect(lerSave(s.get)).toEqual(save);
  });

  it('o mundo é criado uma vez e nunca muda', () => {
    const s = mem(); gravarSave(save, s.get, s.set); const m = lerMundo(s.get);
    gravarSave({ ...save, money: 99 }, s.get, s.set);
    expect(JSON.parse(s.m.get(SAVE_KEY)!).mundo).toEqual(m); expect(m.id.length).toBeGreaterThan(8);
  });

  it('o v3 vira a praia igual ao número de áreas abertas (no máximo 5), com a fama mínima das anteriores', () => {
    const v3 = (niveis: number[]) => lerSave(mem({ [SAVE_KEY]: JSON.stringify({ versao: 3, jogo: { money: 5000, niveis, paid: { '0:3': 10 }, beach: 2, last: 7, tutorial: 4, pendente: 30 } }) }).get)!;
    const m = ECONOMIA.famaMinima;
    expect(v3([8, 0, 0, 0, 0])).toEqual({ money: 0, niveis: [], paid: {}, praia: 1, famaTotal: 0, famas: [], ganho: 0, tempo: 0, last: 7, tutorial: 4, pendente: 30 });
    expect(v3([12, 6, 1, 0, 0])).toMatchObject({ praia: 3, famas: [m[0], m[1]], famaTotal: m[0] + m[1] });
    expect(v3([20, 20, 20, 20, 9]).praia).toBe(5);
  });

  it('saves das versões antes da 3 (lista única de compras) recomeçam do zero', () => {
    expect(lerSave(mem({ [SAVE_KEY]: JSON.stringify({ versao: 2, jogo: { money: 10, done: [0, 1], paid: {}, beach: 1, last: 5, tutorial: 4 } }) }).get)).toBeNull();
    expect(lerSave(mem({ 'barracaPraia.v5': JSON.stringify({ money: 10, done: [0] }) }).get)).toBeNull();
  });

  it('não lê nem sobrescreve save de versão mais nova', () => {
    const s = mem({ [SAVE_KEY]: JSON.stringify({ versao: SAVE_VERSION + 1, jogo: save }) });
    expect(lerSave(s.get)).toBeNull();
    expect(gravarSave({ ...save, money: 0 }, s.get, s.set)).toBe(false);
    expect(JSON.parse(s.m.get(SAVE_KEY)!).jogo.money).toBe(10);
  });

  it('save corrompido vira jogo novo', () => {
    expect(lerSave(mem({ [SAVE_KEY]: '{quebrado' }).get)).toBeNull();
  });
});
