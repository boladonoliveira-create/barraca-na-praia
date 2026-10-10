import { describe, it, expect } from 'vitest';
import { Jogo, padOf } from './jogo.ts';
import { rng } from './simulador.ts';
import { PRESTIGE_AFTER } from '../dados/planos.ts';
import { SHOPS } from '../dados/mapa.ts';

const DT = 1000 / 60, PARADO = { x: 0, y: 0 };
function novo(seed = 1) { const g = new Jogo({}, rng(seed)); g.load(null); g.tutorial = 4; return g }
function rodar(g: Jogo, ms: number, each?: () => void) { for (let t = 0; t < ms; t += DT) { g.now += DT; each?.(); g.update(DT, PARADO); g.updateFx(DT) } }
function comprarAte(g: Jogo, n: number) { while (g.done.size < n) g.applyStep(g.visibleSteps()[0].i, true) }

describe('demanda', () => {
  // com rand fixo em 0,5 o sorteio (0,75 + r × 0,5) vale 1 e o intervalo sai exato
  function intervalo(acai: number, sombras = 0) {
    const g = new Jogo({}, () => 0.5); g.load(null);
    for (let i = 0; i < sombras; i++) { g.lv.sombras = i + 1; g.syncUmbrellas() }
    for (let i = 0; i < acai; i++) g.S[0].counter.acai.push('acai');
    g.S[0].spawnT = 0; g.update(DT, PARADO);
    return g.S[0].spawnT;
  }
  it('intervalo = base ÷ demanda × fator de estoque', () => {
    expect(intervalo(8)).toBeCloseTo(1500 * 0.5);
    expect(intervalo(3)).toBeCloseTo(1500 * 0.75);
    expect(intervalo(2)).toBeCloseTo(1500 * 1.25);
    expect(intervalo(8, 2)).toBeCloseTo(1500 / 1.7 * 0.5);
  });

  it('fila tem no máximo 6 + 1 por guarda-sol', () => {
    const g = novo(); g.lv.sombras = 1; g.syncUmbrellas();
    let max = 0; rodar(g, 60000, () => { max = Math.max(max, g.S[0].queue.length) });
    expect(max).toBe(7);
  });

  it('cliente prefere o produto com mais estoque no balcão (peso estoque + 2)', () => {
    const g = novo(); g.addMachine('coco', 110, 612);
    for (let i = 0; i < 20; i++) g.S[0].counter.acai.push('acai');
    let acai = 0; for (let i = 0; i < 2000; i++) { g.spawnCustomer(0); if (g.S[0].queue.pop()!.want === 'acai') acai++ }
    expect(acai / 2000).toBeGreaterThan(0.88); expect(acai / 2000).toBeLessThan(0.95); // esperado 22/24
  });

  it('quem quer açaí não fica preso atrás de quem quer coco (4 primeiros compram)', () => {
    const g = novo(); g.addMachine('coco', 110, 612); g.S[0].spawnT = 1e9;
    for (const want of ['coco', 'acai'] as const) { g.spawnCustomer(0); g.S[0].queue.at(-1)!.want = want }
    g.S[0].counter.acai.push('acai');
    rodar(g, 5000, () => { g.S[0].spawnT = 1e9 });
    expect(g.S[0].queue.map(c => c.want)).toEqual(['coco']);
    expect(g.S[0].cashValue).toBe(6);
  });
});

describe('ajudantes', () => {
  it('com o balcão de um produto cheio, larga e vai buscar o outro', () => {
    const g = novo(); g.addMachine('coco', 110, 612); g.addHelper(0);
    for (let i = 0; i < 20; i++) g.S[0].counter.acai.push('acai');
    const h = g.helpers[0]; h.stack = ['acai', 'acai']; h.mode = 'drop';
    rodar(g, 20000, () => { g.S[0].spawnT = 1e9 });
    expect(g.S[0].counter.coco.length).toBeGreaterThan(0);
  });

  it('nunca ficam travados: barraca e quiosque vendem sem o jogador por 10 min', () => {
    const g = novo(3); comprarAte(g, 0); g.beach = 1; g.resetWorld(); g.tutorial = 4;
    // Praia 2 com 2 ajudantes na barraca e o sorveteiro
    for (const id of ['maq2', 'coco', 'sorv', 'ajud', 'ajudS', 'ajud']) g.applyStep(g.plan.findIndex((s, i) => s.id === id && !g.done.has(i)), true);
    g.player.x = 380; g.player.y = 740; // longe de tudo
    const vendas = [0, 0]; let ultimo = [0, 0], parado = [0, 0];
    rodar(g, 600000, () => {
      for (const si of [0, 1]) {
        const c = g.S[si].cashValue; if (c > ultimo[si]) { vendas[si]++; parado[si] = 0 } else parado[si] += DT; ultimo[si] = c;
        expect(parado[si]).toBeLessThan(30000);
      }
    });
    expect(vendas[0]).toBeGreaterThan(100); expect(vendas[1]).toBeGreaterThan(50);
  });
});

describe('compras', () => {
  it('parado no quadrado, paga aos poucos (1/28 a cada 40 ms) e aplica a compra', () => {
    const g = novo(); const v = g.visibleSteps()[0]; Object.assign(g.player, padOf(v.s.slot)); g.money = 1000;
    rodar(g, 500);
    expect(g.paid[v.i]).toBeGreaterThan(0); expect(g.done.has(v.i)).toBe(false);
    rodar(g, 2000);
    expect(g.done.has(v.i)).toBe(true); expect(g.money).toBe(1000 - v.s.price); expect(g.machines).toHaveLength(2);
  });

  it('pagamento parcial fica guardado no quadrado', () => {
    const g = novo(); const v = g.visibleSteps()[0]; Object.assign(g.player, padOf(v.s.slot)); g.money = 20;
    rodar(g, 3000);
    expect(g.money).toBe(0); expect(g.paid[v.i]).toBe(20); expect(g.done.has(v.i)).toBe(false);
  });

  it('mostra só as 2 próximas, sempre em quadrados diferentes', () => {
    const g = novo();
    for (let n = 0; n < 40; n++) { const vs = g.visibleSteps(); expect(vs.length).toBeGreaterThan(0); expect(vs.length).toBeLessThanOrEqual(2); if (vs.length === 2) expect(vs[0].s.slot).not.toBe(vs[1].s.slot); g.applyStep(vs[0].i, true) }
  });
});

describe('prestígio', () => {
  it(`abre depois de ${PRESTIGE_AFTER} compras; leva à próxima praia com dinheiro das 2 primeiras compras`, () => {
    const g = novo(); comprarAte(g, PRESTIGE_AFTER - 1); expect(g.prestigeOpen()).toBe(false);
    comprarAte(g, PRESTIGE_AFTER); expect(g.prestigeOpen()).toBe(true);
    expect(g.prestigeCost()).toBe(4000);
    Object.assign(g.player, padOf('praia')); g.money = 4000; g.S[0].spawnT = 1e9;
    rodar(g, 3000);
    expect(g.beach).toBe(1); expect(g.state).toBe('beach');
    expect(g.money).toBe(g.plan[0].price + g.plan[1].price);
    expect(g.done.size).toBe(0); expect(g.machines).toHaveLength(1); expect(g.kioskOpen()).toBe(false);
    expect(g.price('acai')).toBe(9); expect(g.prestigeCost()).toBe(6000);
  });
});

describe('salvar', () => {
  it('salva e carrega o progresso; ganhos com o app fechado = 24 × ajudantes × multiplicador por minuto, até 2 h', () => {
    const g = novo(); g.beach = 1; g.resetWorld(); comprarAte(g, 12); g.money = 321;
    const s = JSON.parse(JSON.stringify(g.snapshot(1000)));
    const h = new Jogo(); const off = h.load(s, 1000 + 30 * 60000);
    expect(h.beach).toBe(1); expect(h.money).toBe(321); expect([...h.done]).toEqual([...g.done]);
    expect(h.helpers.length).toBe(g.helpers.length);
    expect(off).toBe(Math.round(30 * 24 * h.helpers.length * 1.5));
    expect(new Jogo().load(s, 10 * 3600000)).toBe(Math.round(120 * 24 * h.helpers.length * 1.5));
  });
});

describe('ganhos offline pendentes', () => {
  it('o valor do cartão vai para o save ao abrir e só sai quando é pego', () => {
    const g = novo(); comprarAte(g, 4); g.money = 100;
    g.abrirOffline(500);
    const s = JSON.parse(JSON.stringify(g.snapshot(1000)));
    expect(s.pendente).toBe(500);
    // app fechou com o cartão aberto: ao abrir de novo, o pendente volta somado ao novo tempo fora
    const h = new Jogo(); const off = h.load(s, 1000 + 10 * 60000);
    expect(off).toBe(500 + h.offlineGain(1000, 1000 + 10 * 60000));
    h.abrirOffline(off);
    expect(h.pegarOffline(2)).toBe(off * 2);
    expect(h.money).toBe(100 + off * 2); expect(h.pendente).toBe(0); expect(h.snapshot().pendente).toBe(0);
  });
});

describe('aviso de compra', () => {
  it('informa praia, índice e segundos desde a compra anterior (evento step_buy)', () => {
    const avisos: number[][] = []; const g = new Jogo({ compra: (...a) => { avisos.push(a) } }, rng(1)); g.load(null);
    g.now = 15000; g.applyStep(0); g.now = 40000; g.applyStep(1);
    g.applyStep(2, true); // silenciosa (carregar save) não conta
    expect(avisos).toEqual([[0, 0, 15], [0, 1, 25]]);
  });
});

/** Mundo da praia b com as compras pedidas (por id, na ordem). */
function praia(b: number, ids: string[], seed = 5) {
  const g = novo(seed); g.beach = b; g.resetWorld(); g.tutorial = 4;
  for (const id of ids) g.applyStep(g.plan.findIndex((s, i) => s.id === id && !g.done.has(i)), true);
  g.player.x = 380; g.player.y = 740; // longe de tudo
  return g;
}

describe('Praia 3: chuveirão e cadeiras', () => {
  it('a fila do chuveirão para com a caixa vazia e volta ao encher', () => {
    const g = praia(2, ['sorv', 'servico']); g.sv.agua = 0;
    let banhos = 0; rodar(g, 15000, () => { banhos += g.sv.chuveiros.filter(c => c.user).length });
    expect(banhos).toBe(0); expect(g.sv.fila.length).toBeGreaterThan(0);
    Object.assign(g.player, SHOPS[2].drop); // parado no registro
    rodar(g, 2000);
    expect(g.sv.agua).toBeGreaterThan(0);
    rodar(g, 4000, () => { banhos += g.sv.chuveiros.filter(c => c.user).length });
    expect(banhos).toBeGreaterThan(0);
  });

  it('cadeira bagunçada não é alugada; arrumada, volta a alugar', () => {
    const g = praia(2, ['sorv', 'servico']); g.sv.agua = 0;
    for (const c of g.sv.cadeiras) c.suja = true;
    rodar(g, 20000);
    expect(g.sv.cadeiras.every(c => !c.user)).toBe(true);
    Object.assign(g.player, { x: g.sv.cadeiras[0].x, y: g.sv.cadeiras[0].y }); rodar(g, 100); // passa por cima
    expect(g.sv.cadeiras[0].suja).toBe(false);
    g.player.x = 380; g.player.y = 740;
    rodar(g, 10000);
    expect(g.sv.cadeiras[0].user).not.toBeNull();
  });
});

describe('ajudantes das Praias 3 e 4', () => {
  // conta as vendas de uma loja e falha se ela ficar 30 s sem vender
  function semTravar(g: Jogo, si: number) {
    let vendas = 0, ultimo = 0, parado = 0;
    rodar(g, 600000, () => {
      const c = g.S[si].cashValue; if (c > ultimo) { vendas++; parado = 0 } else parado += DT; ultimo = c;
      expect(parado).toBeLessThan(30000);
    });
    return vendas;
  }

  it('salva-vidas nunca fica travado: chuveirão e cadeiras rendem 10 min sem o jogador', () => {
    const g = praia(2, ['sorv', 'servico', 'salva', 'cadeiras', 'chuveiro2']);
    expect(semTravar(g, 2)).toBeGreaterThan(150);
    expect(g.sv.cadeiras.some(c => c.user)).toBe(true);
  });

  it('cozinheiro nunca fica travado: milho e pastel vendem 10 min sem o jogador', () => {
    const g = praia(3, ['sorv', 'servico', 'milho', 'pastel', 'cozinheiro']);
    const vendas = semTravar(g, 3);
    expect(vendas).toBeGreaterThan(60);
  });
});
