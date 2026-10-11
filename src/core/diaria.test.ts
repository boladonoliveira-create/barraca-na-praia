import { describe, it, expect } from 'vitest';
import { diaDeHoje, hojeLocal, PREMIOS } from './diaria.ts';
import { Jogo } from './jogo.ts';
import { rng } from './simulador.ts';
import { ECONOMIA } from '../dados/planos.ts';

describe('recompensa diária: o calendário', () => {
  it('1ª vez é o dia 1; no mesmo dia não volta; no dia seguinte avança; depois do 7 volta ao 1', () => {
    expect(diaDeHoje({ ultimo: null, dia: 0 }, '2026-10-10')).toBe(1);
    expect(diaDeHoje({ ultimo: '2026-10-10', dia: 1 }, '2026-10-10')).toBeNull();
    expect(diaDeHoje({ ultimo: '2026-10-10', dia: 1 }, '2026-10-11')).toBe(2);
    expect(diaDeHoje({ ultimo: '2026-10-31', dia: 6 }, '2026-11-01')).toBe(7); // virada do mês
    expect(diaDeHoje({ ultimo: '2026-12-31', dia: 7 }, '2027-01-01')).toBe(1); // virada do ano, e o ciclo recomeça
  });

  it('dia perdido: volta 1 dia (repete o último que pegou)', () => {
    expect(diaDeHoje({ ultimo: '2026-10-10', dia: 4 }, '2026-10-12')).toBe(4); // pulou 1 dia: seria o 5, fica no 4
    expect(diaDeHoje({ ultimo: '2026-10-01', dia: 6 }, '2026-10-20')).toBe(6);
    expect(diaDeHoje({ ultimo: '2026-10-10', dia: 1 }, '2026-10-13')).toBe(1);
    expect(diaDeHoje({ ultimo: '2026-10-10', dia: 3 }, '2026-10-08')).toBeNull(); // relógio voltou
  });

  it('a data local sai como AAAA-MM-DD', () => {
    expect(hojeLocal(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });
});

describe('recompensa diária: os prêmios', () => {
  function jogo() { const g = new Jogo({}, rng(1)); g.load(null); return g }

  it('dia 1: 3 min de lucro da praia; em dobro, o dobro; não pega duas vezes no mesmo dia', () => {
    const a = jogo(), b = jogo(); a.ganho = b.ganho = 6000; a.tempo = b.tempo = 120000; // 3000 por minuto
    expect(a.pegarDiaria('2026-10-10', false)!.valor).toBe(9000); expect(a.money).toBe(9000);
    expect(b.pegarDiaria('2026-10-10', true)!.valor).toBe(18000);
    expect(a.pegarDiaria('2026-10-10', false)).toBeNull(); expect(a.money).toBe(9000);
  });

  it('turbo ×3 (dia 6) multiplica as vendas por 3 durante 5 min (10 em dobro)', () => {
    const g = jogo(); g.diaria = { ultimo: '2026-10-09', dia: 5 }; g.lv.cofre0 = 1;
    const r = g.pegarDiaria('2026-10-10', true)!;
    expect(r.dia).toBe(6); expect(r.valor).toBe(10); expect(g.turbo()).toBe(3);
    const antes = g.money; g.receber(0, 10, 0, 0); expect(g.money - antes).toBe(30);
    g.now += 10 * 60000; expect(g.turbo()).toBe(1);
  });

  it('dia 7: +10% da fama da praia atual (no mínimo 1), em dobro 2×', () => {
    const g = jogo(); g.diaria = { ultimo: '2026-10-09', dia: 6 }; g.ganho = 100 * ECONOMIA.famaK; // fama da praia: 10
    const r = g.pegarDiaria('2026-10-10', false)!;
    expect(r.dia).toBe(7); expect(r.premio).toEqual(PREMIOS[6]); expect(g.famaTotal).toBe(1);
    const h = jogo(); h.diaria = { ultimo: '2026-10-09', dia: 6 }; h.pegarDiaria('2026-10-10', true); expect(h.famaTotal).toBe(2);
  });

  it('o calendário fica no save', () => {
    const g = jogo(); g.pegarDiaria('2026-10-10', false);
    const h = new Jogo(); h.load(JSON.parse(JSON.stringify(g.snapshot())));
    expect(h.diaria).toEqual({ ultimo: '2026-10-10', dia: 1 }); expect(h.diaDeHoje('2026-10-10')).toBeNull(); expect(h.diaDeHoje('2026-10-11')).toBe(2);
  });
});
