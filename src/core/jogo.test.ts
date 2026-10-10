import { describe, it, expect } from 'vitest';
import { Jogo, padOf, NUM_AREAS } from './jogo.ts';
import { rng } from './simulador.ts';
import { NIVEL_ABRE, NIVEL_PRESTIGIO } from '../dados/planos.ts';
import { SHOPS, LOTS, SLOTS } from '../dados/mapa.ts';

const DT = 1000 / 60, PARADO = { x: 0, y: 0 };
function novo(seed = 1) { const g = new Jogo({}, rng(seed)); g.load(null); g.tutorial = 4; return g }
function rodar(g: Jogo, ms: number, each?: () => void) { for (let t = 0; t < ms; t += DT) { g.now += DT; each?.(); g.update(DT, PARADO); g.updateFx(DT) } }
/** Leva cada área ao nível pedido (compras de graça, na ordem da trilha). */
function mundo(niveis: number[], seed = 5) {
  const g = novo(seed);
  niveis.forEach((n, a) => { while (g.nivel[a] < n) g.applyStep(a, true) });
  g.player.x = 380; g.player.y = 740; // longe de tudo
  return g;
}

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
    const g = mundo([12, 3], 3); g.lv.cofre0 = 0; // sem cofre, para contar as vendas pela pilha
    expect(g.helpers.map(h => h.shop).sort()).toEqual([0, 0, 1]);
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

describe('áreas independentes', () => {
  it('a área N+1 só abre com a área N no nível mínimo', () => {
    const g = novo();
    const visivel = (a: number) => g.visibleSteps().some(v => v.a === a);
    for (let a = 1; a < NUM_AREAS; a++) {
      while (g.nivel[a - 1] < NIVEL_ABRE - 1) g.applyStep(a - 1, true);
      expect(visivel(a)).toBe(false); expect(g.liberada(a)).toBe(false);
      g.applyStep(a - 1, true); // chega ao nível mínimo: o quadro de abrir aparece na cerca
      expect(g.visibleSteps().filter(v => v.a === a).map(v => v.s.k)).toEqual(['build']);
      expect(g.aberta(a)).toBe(false);
      g.applyStep(a, true); expect(g.aberta(a)).toBe(true);
    }
  });

  it('melhorias de uma área não alteram outra', () => {
    const g = mundo([5, 5, 5, 4]);
    const outras = () => [g.price('sorvete'), g.rateOf('caixa'), g.freezerCap(), g.aguaCap(), g.precoBanho(), g.precoCadeira(), g.price('milho'), g.price('pastel'), g.lote(), g.cookMs(g.machines.find(m => m.type === 'pastel')!)];
    const antes = outras();
    while (g.nivel[0] < 25) g.applyStep(0, true); // turbo, cardápio, marcos da Barraca do Sol...
    expect(outras()).toEqual(antes);
    const acai = [g.price('acai'), g.rateOf('acai'), g.price('coco')];
    for (const a of [1, 2, 3]) while (g.nivel[a] < 20) g.applyStep(a, true);
    expect([g.price('acai'), g.rateOf('acai'), g.price('coco')]).toEqual(acai);
  });

  it('marcos nos níveis 5, 10, 15 e 20 dobram o que a área gera', () => {
    const g = novo(), m: number[] = [];
    for (let n = 0; n <= 21; n++) { m.push(g.marco(0)); g.applyStep(0, true) }
    expect([m[4], m[5], m[9], m[10], m[15], m[20], m[21]]).toEqual([1, 2, 2, 4, 8, 16, 16]);
    expect(g.marco(1)).toBe(1); // as outras áreas não ganham o marco da Barraca
  });

  it('com o cofre automático, a venda entra direto no caixa', () => {
    const g = mundo([7]); expect(g.L('cofre0')).toBe(1);
    for (let i = 0; i < 6; i++) g.S[0].counter.acai.push('acai');
    const antes = g.money; rodar(g, 15000);
    expect(g.money).toBeGreaterThan(antes); expect(g.S[0].cashValue).toBe(0);
  });

  it('a seta sugere a melhor compra que cabe no bolso; sem dinheiro, nenhuma', () => {
    const g = mundo([5]); g.money = 0;
    expect(g.melhorCompra(true)).toBeNull();
    g.money = 1e9; const v = g.melhorCompra(true)!;
    expect(v.k).toBe(g.nivel[v.a]);
    expect(v.a).toBe(0); // no nível 5, a melhoria da Barraca (R$ 1.050) rende mais por real que abrir o Sorvete
    const h = mundo([12]); h.money = 1e9;
    expect(h.melhorCompra(true)!.a).toBe(1); // no nível 12 a Barraca ficou cara: abrir o Sorvete passa a valer mais
  });
});

describe('área 5: quadra de futevôlei (atração)', () => {
  it('não vende nada, mas aumenta a chegada de clientes em todas as outras áreas', () => {
    // com rand fixo em 0,5 o intervalo de chegada sai exato
    function chegada(niveis: number[]) {
      const g = new Jogo({}, () => 0.5); g.load(null);
      niveis.forEach((n, a) => { while (g.nivel[a] < n) g.applyStep(a, true) });
      for (const si of [0, 1]) g.S[si].spawnT = 0; g.sv.spawnT = 0; g.sv.spawnC = 0;
      g.update(DT, PARADO);
      return [g.S[0].spawnT, g.S[1].spawnT, g.sv.spawnT, g.sv.spawnC, g.publico()];
    }
    const sem = chegada([5, 5, 5, 5]), com = chegada([5, 5, 5, 5, 3]); // quadra, arquibancada, rede nova
    expect(sem[4]).toBe(1); expect(com[4]).toBeCloseTo(1 + 0.15 + 0.1 + 0.06);
    for (let i = 0; i < 4; i++) expect(com[i]).toBeCloseTo(sem[i] / com[4]);
    const g = mundo([5, 5, 5, 5, 3]); expect(g.S[4].cashValue).toBe(0); expect(g.helpers.some(h => h.shop === 4)).toBe(false);
  });
});

describe('compras', () => {
  it('parado no quadrado, paga aos poucos (1/28 a cada 40 ms) e aplica a compra', () => {
    const g = novo(); const v = g.visibleSteps()[0]; Object.assign(g.player, padOf(v.s.slot)); g.money = 1000;
    rodar(g, 500);
    expect(g.paid['0:0']).toBeGreaterThan(0); expect(g.nivel[0]).toBe(0);
    rodar(g, 2000);
    expect(g.nivel[0]).toBe(1); expect(g.money).toBe(1000 - v.s.price); expect(g.machines).toHaveLength(2);
  });

  it('pagamento parcial fica guardado no quadrado', () => {
    const g = novo(); const v = g.visibleSteps()[0]; Object.assign(g.player, padOf(v.s.slot)); g.money = 20;
    rodar(g, 3000);
    expect(g.money).toBe(0); expect(g.paid['0:0']).toBe(20); expect(g.nivel[0]).toBe(0);
  });

  it('1 ou 2 por área, em quadrados diferentes e dentro da própria área (o de abrir fica na cerca)', () => {
    const g = mundo([8, 6, 6, 6, 2]);
    for (let n = 0; n < 30; n++) {
      const vs = g.visibleSteps();
      for (let a = 0; a < NUM_AREAS; a++) {
        const da = vs.filter(v => v.a === a); expect(da.length).toBeGreaterThan(0); expect(da.length).toBeLessThanOrEqual(2);
        if (da.length === 2) expect(da[0].s.slot).not.toBe(da[1].s.slot);
        for (const v of da) { const x = SLOTS_X(v.s.slot); expect(x).toBeGreaterThan(LOTS[a].x0); expect(x).toBeLessThan(LOTS[a].x1) }
      }
      g.applyStep(n % NUM_AREAS, true);
    }
  });

  it('a 2ª compra de uma área só é paga depois da 1ª', () => {
    const g = novo(); const [v1, v2] = g.visibleSteps(); expect(v2.k).toBe(1);
    Object.assign(g.player, padOf(v2.s.slot)); g.money = 5000; rodar(g, 3000);
    expect(g.nivel[0]).toBe(0); expect(g.money).toBe(5000);
    expect(v1.k).toBe(0);
  });
});

describe('prestígio', () => {
  it(`só com todas as áreas abertas e no nível ${NIVEL_PRESTIGIO}; recomeça com multiplicador e dinheiro das 2 primeiras compras`, () => {
    const g = mundo([NIVEL_PRESTIGIO, NIVEL_PRESTIGIO, NIVEL_PRESTIGIO, NIVEL_PRESTIGIO, NIVEL_PRESTIGIO - 1]);
    expect(g.prestigeOpen()).toBe(false);
    g.applyStep(4, true); expect(g.prestigeOpen()).toBe(true);
    Object.assign(g.player, padOf('praia')); g.money = g.prestigeCost(); g.S[0].spawnT = 1e9;
    rodar(g, 3000);
    expect(g.beach).toBe(1); expect(g.state).toBe('beach');
    expect(g.money).toBe(g.trilhas[0][0].price + g.trilhas[0][1].price);
    expect(g.nivel).toEqual([0, 0, 0, 0, 0]); expect(g.machines).toHaveLength(1); expect(g.kioskOpen()).toBe(false);
    expect(g.price('acai')).toBe(9);
  });
});

describe('salvar', () => {
  it('salva e carrega o progresso por área; ganhos com o app fechado = 24 × ajudantes × multiplicador por minuto, até 2 h', () => {
    const g = mundo([12, 3]); g.beach = 1; g.money = 321;
    const s = JSON.parse(JSON.stringify(g.snapshot(1000)));
    expect(s.niveis).toEqual([12, 3, 0, 0, 0]);
    const h = new Jogo(); const off = h.load(s, 1000 + 30 * 60000);
    expect(h.beach).toBe(1); expect(h.money).toBe(321); expect(h.nivel).toEqual([12, 3, 0, 0, 0]);
    expect(h.helpers.length).toBe(g.helpers.length); expect(h.aberta(1)).toBe(true);
    expect(off).toBe(Math.round(30 * 24 * h.helpers.length * 1.5));
    expect(new Jogo().load(s, 10 * 3600000)).toBe(Math.round(120 * 24 * h.helpers.length * 1.5));
  });
});

describe('ganhos offline pendentes', () => {
  it('o valor do cartão vai para o save ao abrir e só sai quando é pego', () => {
    const g = mundo([4]); g.money = 100;
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
  it('informa praia, área, nível e segundos desde a compra anterior (evento step_buy)', () => {
    const avisos: number[][] = []; const g = new Jogo({ compra: (...a) => { avisos.push(a) } }, rng(1)); g.load(null);
    g.now = 15000; g.applyStep(0); g.now = 40000; g.applyStep(0);
    g.applyStep(0, true); // silenciosa (carregar save) não conta
    expect(avisos).toEqual([[0, 0, 1, 15], [0, 0, 2, 25]]);
  });
});

describe('área 3: chuveirão e cadeiras', () => {
  it('a fila do chuveirão para com a caixa vazia e volta ao encher', () => {
    const g = mundo([5, 5, 1]); g.sv.agua = 0;
    let banhos = 0; rodar(g, 15000, () => { banhos += g.sv.chuveiros.filter(c => c.user).length });
    expect(banhos).toBe(0); expect(g.sv.fila.length).toBeGreaterThan(0);
    Object.assign(g.player, SHOPS[2].drop); // parado no registro
    rodar(g, 2000);
    expect(g.sv.agua).toBeGreaterThan(0);
    rodar(g, 4000, () => { banhos += g.sv.chuveiros.filter(c => c.user).length });
    expect(banhos).toBeGreaterThan(0);
  });

  it('cadeira bagunçada não é alugada; arrumada, volta a alugar', () => {
    const g = mundo([5, 5, 1]); g.sv.agua = 0;
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

describe('ajudantes das áreas 3 e 4', () => {
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
    const g = mundo([5, 5, 5]); // chuveirão, cadeiras, salva-vidas, caixa maior, 2º chuveiro
    expect(g.helpers.some(h => h.shop === 2)).toBe(true);
    expect(semTravar(g, 2)).toBeGreaterThan(150);
    expect(g.sv.cadeiras.some(c => c.user)).toBe(true);
  });

  it('cozinheiro nunca fica travado: milho e pastel vendem 10 min sem o jogador', () => {
    const g = mundo([5, 5, 5, 4]); // barraca do milho, cardápio, fritadeira, cozinheiro
    expect(g.helpers.some(h => h.shop === 3)).toBe(true);
    expect(semTravar(g, 3)).toBeGreaterThan(60);
  });
});

function SLOTS_X(slot: string) { return SLOTS[slot].x }
