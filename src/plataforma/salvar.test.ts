import { describe, it, expect } from 'vitest';
import { lerSave, gravarSave, lerMundo, SAVE_KEY, SAVE_VERSION } from './salvar.ts';
import { Jogo } from '../core/jogo.ts';
import { makeTrilha } from '../core/economia.ts';
import { ECONOMIA } from '../dados/planos.ts';

const save = { money: 10, niveis: [6, 2, 0, 0], paid: {}, praia: 2, famaTotal: 3, famas: [3], ganho: 40, tempo: 9000, last: 5, tutorial: 4 };
function mem(init: Record<string, string> = {}) {
  const m = new Map(Object.entries(init));
  return { get: (k: string) => m.get(k) ?? null, set: (k: string, v: string) => { m.set(k, v); return true }, m };
}

describe('salvamento', () => {
  it('grava com chave própria, versão 6 e o mundo, e lê de volta', () => {
    const s = mem(); gravarSave(save, s.get, s.set);
    expect(SAVE_VERSION).toBe(6);
    const gravado = JSON.parse(s.m.get(SAVE_KEY)!);
    expect(gravado).toEqual({ versao: 6, mundo: { id: expect.any(String), criadoEm: expect.any(Number) }, jogo: save });
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


describe('conversão de compras v4 para v5', () => {
  it('preserva as melhorias e pagamentos antigos ao inserir três mochilas na trilha', () => {
    for (const praia of [1, 3, 6, 10]) {
      const antigo = { ...save, praia, niveis: [60, 3], paid: { '0:20': 123, praia: 456 } };
      const convertido = lerSave(mem({ [SAVE_KEY]: JSON.stringify({ versao: 4, jogo: antigo }) }).get)!;
      expect(convertido.compradas?.[0]).toHaveLength(60);
      expect(convertido.compradas?.[0]).not.toContain(20);
      expect(convertido.paid).toEqual({ '0:22': 123, praia: 456 });
      const g = new Jogo(); g.load(convertido, antigo.last);
      const velha = makeTrilha(0, praia - 1, praia >= 3, true);
      const contagem: Record<string, number> = {};
      for (const s of velha) if (s.k === 'up') contagem[s.id] = (contagem[s.id] || 0) + 1;
      for (const [id, qtd] of Object.entries(contagem)) expect(g.L(id), id).toBe(qtd);
      expect(g.nivel[0]).toBe(60); expect(g.playerCap()).toBe(30);
    }
  });

  it('o v5 conserva compras fora de ordem e o mundo existente', () => {
    const jogo = { ...save, niveis: [1, 0], compradas: [[1], []], paid: { '0:0': 7 } };
    const s = mem({ [SAVE_KEY]: JSON.stringify({ versao: 5, mundo: { id: 'mundo-antigo', criadoEm: 1 }, jogo }) });
    const g = new Jogo(); g.load(lerSave(s.get), jogo.last);
    expect(g.L('sombras')).toBe(1); expect(g.machines).toHaveLength(1); expect(g.proximoIndice(0)).toBe(0);
    gravarSave(g.snapshot(jogo.last), s.get, s.set);
    expect(lerMundo(s.get).id).toBe('mundo-antigo'); expect(lerSave(s.get)?.compradas?.[0]).toEqual([1]);
  });
});


it('migra a mochila máxima v5 para 60 e devolve o preço da quarta melhoria retirada', () => {
  const antigo = {...save, praia: 1, niveis: [23], compradas: [Array.from({length:23}, (_, k) => k)], paid: {'0:23':17}};
  const s = mem({[SAVE_KEY]:JSON.stringify({versao:5,jogo:antigo})});
  const convertido=lerSave(s.get)!; const g=new Jogo(); g.load(convertido, antigo.last);
  expect(g.playerCap()).toBe(60); expect(g.nivel[0]).toBe(22);
  expect(convertido.money).toBe(64010); expect(convertido.paid).toEqual({'0:22':17});
});
