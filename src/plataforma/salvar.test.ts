import { describe, it, expect } from 'vitest';
import { lerSave, gravarSave, SAVE_KEY, SAVE_VERSION } from './salvar.ts';

const save = { money: 10, done: [0, 1], paid: {}, beach: 1, last: 5, tutorial: 4 };
function mem(init: Record<string, string> = {}) {
  const m = new Map(Object.entries(init));
  return { get: (k: string) => m.get(k) ?? null, set: (k: string, v: string) => { m.set(k, v); return true }, m };
}

describe('salvamento', () => {
  it('grava com chave própria e versão, e lê de volta', () => {
    const s = mem(); gravarSave(save, s.get, s.set);
    expect(JSON.parse(s.m.get(SAVE_KEY)!)).toEqual({ versao: SAVE_VERSION, jogo: save });
    expect(lerSave(s.get)).toEqual(save);
  });

  it('aproveita o save do protótipo (barracaPraia.v5)', () => {
    expect(lerSave(mem({ 'barracaPraia.v5': JSON.stringify(save) }).get)).toEqual(save);
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
