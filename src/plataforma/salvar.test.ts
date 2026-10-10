import { describe, it, expect } from 'vitest';
import { lerSave, gravarSave, SAVE_KEY, SAVE_VERSION } from './salvar.ts';

const save = { money: 10, niveis: [6, 2, 0, 0], paid: {}, beach: 1, last: 5, tutorial: 4 };
function mem(init: Record<string, string> = {}) {
  const m = new Map(Object.entries(init));
  return { get: (k: string) => m.get(k) ?? null, set: (k: string, v: string) => { m.set(k, v); return true }, m };
}

describe('salvamento', () => {
  it('grava com chave própria e versão 3, e lê de volta', () => {
    const s = mem(); gravarSave(save, s.get, s.set);
    expect(SAVE_VERSION).toBe(3);
    expect(JSON.parse(s.m.get(SAVE_KEY)!)).toEqual({ versao: SAVE_VERSION, jogo: save });
    expect(lerSave(s.get)).toEqual(save);
  });

  it('saves das versões antigas (lista única de compras) recomeçam do zero', () => {
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
