import { describe, it, expect } from 'vitest';
import { Jogo, padOf, NUM_AREAS, BANHISTA_LONGE, TROCA_MS } from './jogo.ts';
import { rng } from './simulador.ts';
import { NIVEL_ABRE, NIVEL_NOVA_PRAIA, ECONOMIA } from '../dados/planos.ts';
import { SHOPS, LUGARES, SLOTS, ESCOLA, PALCO, TORNEIO, PRODUCTS, FAIXAS, WORLD_H, WORLD_W, H, AMBULANTE, livre, type Rect } from '../dados/mapa.ts';
import type { Save } from './jogo.ts';

const DT = 1000 / 60, PARADO = { x: 0, y: 0 };
/** As 5 áreas disponíveis, mas com a trilha e os preços da Praia 1 (sem começo rápido): para testar as mecânicas. */
function novo(seed = 1) { const g = new Jogo({}, rng(seed)); g.load(null); g.beach = NUM_AREAS - 1; g.tutorial = 4; return g }
/** Começa na praia n (1 a 10) do jeito que a viagem deixa: níveis zerados e o começo rápido aplicado. */
function naPraia(n: number, famaTotal = 0) {
  const s: Save = { money: 0, niveis: [], paid: {}, praia: n, famaTotal, famas: [], ganho: 0, tempo: 0, last: 0, tutorial: 4 };
  const g = new Jogo({}, rng(1)); g.load(s); return g;
}
/** Sobe a área a até o nível n, como o jogador (com o começo rápido depois de cada compra). */
function subir(g: Jogo, a: number, n: number) { while (g.nivel[a] < n && g.liberada(a)) { g.applyStep(a, true); g.gratis(a) } }
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

describe('fila sem travar', () => {
  it('balcão cheio de açaí e a fila pedindo coco: depois de um tempo, quem espera troca o pedido e compra', () => {
    const g = novo(); g.addMachine('coco', 110, 612); g.S[0].spawnT = 1e9;
    for (let i = 0; i < 4; i++) { g.spawnCustomer(0); g.S[0].queue.at(-1)!.want = 'coco' }
    for (let i = 0; i < 20; i++) g.S[0].counter.acai.push('acai');
    rodar(g, 4000, () => { g.S[0].spawnT = 1e9 }); expect(g.S[0].cashValue).toBe(0); // ainda esperando o coco
    rodar(g, TROCA_MS + 4000, () => { g.S[0].spawnT = 1e9 });
    expect(g.S[0].cashValue).toBeGreaterThan(0); expect(g.S[0].counter.acai.length).toBeLessThan(20);
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
    expect(v.a).toBe(0); // no nível 5, a melhoria da Barraca (R$ 895) rende mais por real que abrir o Sorvete
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

  it('1 ou 2 por área, em quadrados diferentes e dentro do lugar da área', () => {
    const g = mundo([8, 6, 6, 6, 2]);
    for (let n = 0; n < 30; n++) {
      const vs = g.visibleSteps();
      for (let a = 0; a < 5; a++) {
        const da = vs.filter(v => v.a === a); expect(da.length).toBeGreaterThan(0); expect(da.length).toBeLessThanOrEqual(2);
        if (da.length === 2) expect(da[0].s.slot).not.toBe(da[1].s.slot);
        for (const v of da) expect(dentroDe(SLOTS[v.s.slot], LUGARES[a].zona)).toBe(true);
      }
      g.applyStep(n % 5, true);
    }
  });

  it('a 2ª compra de uma área só é paga depois da 1ª', () => {
    const g = novo(); const [v1, v2] = g.visibleSteps(); expect(v2.k).toBe(1);
    Object.assign(g.player, padOf(v2.s.slot)); g.money = 5000; rodar(g, 3000);
    expect(g.nivel[0]).toBe(0); expect(g.money).toBe(5000);
    expect(v1.k).toBe(0);
  });
});

describe('praias', () => {
  it('a praia N só tem as áreas 1 a N; a área N é a última que abre', () => {
    for (let n = 1; n <= NUM_AREAS; n++) {
      const g = naPraia(n);
      for (let a = 0; a < NUM_AREAS; a++) subir(g, a, 12);
      expect(g.S.map(s => s.open)).toEqual(Array.from({ length: NUM_AREAS }, (_, a) => a < n));
      expect(g.visibleSteps().every(v => v.a < n)).toBe(true);
    }
  });

  it(`a nova praia só libera com a área N no nível ${NIVEL_NOVA_PRAIA}; comprar zera dinheiro e níveis e guarda a fama`, () => {
    const g = naPraia(2); subir(g, 0, 12); subir(g, 1, NIVEL_NOVA_PRAIA - 1);
    expect(g.novaPraiaAberta()).toBe(false);
    g.applyStep(1, true); expect(g.novaPraiaAberta()).toBe(true); expect(g.proximaExiste()).toBe(true);
    g.ganho = 50 * ECONOMIA.famaK; expect(g.famaGanha()).toBe(7); // floor(sqrt(50))
    Object.assign(g.player, padOf('praia')); g.money = g.custoNovaPraia() + 123; g.S[0].spawnT = 1e9;
    rodar(g, 3000);
    expect(g.beach).toBe(2); expect(g.state).toBe('beach');
    expect(g.money).toBe(0); expect(g.famas).toEqual([7]); expect(g.famaTotal).toBe(7); expect(g.ganho).toBe(0);
    expect(g.S.map(s => s.open)).toEqual(g.S.map((_, a) => a === 0));
  });

  it('depois da última praia pronta o quadro aparece, mas a seguinte ainda não pode ser comprada', () => {
    const g = naPraia(NUM_AREAS); for (let a = 0; a < NUM_AREAS; a++) subir(g, a, a < NUM_AREAS - 1 ? NIVEL_ABRE : NIVEL_NOVA_PRAIA);
    expect(g.novaPraiaAberta()).toBe(true); expect(g.proximaExiste()).toBe(false);
    Object.assign(g.player, padOf('praia')); g.money = 1e12; rodar(g, 3000);
    expect(g.beach).toBe(NUM_AREAS - 1); expect(g.paid.praia).toBeUndefined();
  });

  it('a fama aumenta o lucro de todas as áreas e os ganhos com o app fechado', () => {
    const sem = naPraia(5), com = naPraia(5, 10);
    for (const g of [sem, com]) { subir(g, 0, 5); subir(g, 1, 5); subir(g, 2, 5); subir(g, 3, 2) }
    const k = 1 + ECONOMIA.taxaFama * 10;
    expect(com.lucro()).toBeCloseTo(k);
    for (const p of ['acai', 'sorvete', 'milho'] as const) expect(com.price(p)).toBeCloseTo(sem.price(p) * k, -1); // arredondado ao real
    expect(com.precoBanho()).toBeGreaterThan(sem.precoBanho());
    expect(com.offlineGain(1000, 1000 + 10 * 60000)).toBe(Math.round(10 * 24 * com.helpers.length * k));
  });

  it('o começo rápido (1º ajudante e cofre de graça) vale a partir da Praia 3, nas áreas antigas', () => {
    const p2 = naPraia(2);
    expect(p2.helpers).toHaveLength(0); expect(p2.L('cofre0')).toBe(0); expect(p2.nivel[0]).toBe(0);
    const p3 = naPraia(3);
    expect(p3.helpers.map(h => h.shop)).toEqual([0]); expect(p3.L('cofre0')).toBe(1); expect(p3.nivel[0]).toBe(2);
    subir(p3, 0, NIVEL_ABRE); subir(p3, 1, 1); // abre o Sorvete (área antiga): sorveteiro e cofre vêm junto
    expect(p3.helpers.map(h => h.shop)).toEqual([0, 1]); expect(p3.L('cofre1')).toBe(1); expect(p3.nivel[1]).toBe(3);
    subir(p3, 1, NIVEL_ABRE); subir(p3, 2, 1); // a área nova (Chuveirão) começa manual
    expect(p3.helpers.some(h => h.shop === 2)).toBe(false); expect(p3.L('cofre2')).toBe(0);
    expect(p3.trilhas[2][1].price).toBeGreaterThan(0);
  });
});

describe('salvar', () => {
  it('salva e carrega praia, fama e o progresso por área; ganhos com o app fechado = 24 × ajudantes × fama por minuto, até 2 h', () => {
    const g = mundo([12, 3]); g.beach = 1; g.money = 321; g.famaTotal = 5; g.famas = [5]; g.ganho = 777; g.tempo = 60000;
    const s = JSON.parse(JSON.stringify(g.snapshot(1000)));
    const niveis = [12, 3, ...Array(NUM_AREAS - 2).fill(0)];
    expect(s).toMatchObject({ praia: 2, famaTotal: 5, famas: [5], ganho: 777, tempo: 60000, niveis });
    const h = new Jogo(); const off = h.load(s, 1000 + 30 * 60000);
    expect(h.beach).toBe(1); expect(h.money).toBe(321); expect(h.nivel).toEqual(niveis); expect(h.famaTotal).toBe(5);
    expect(h.helpers.length).toBe(g.helpers.length); expect(h.aberta(1)).toBe(true);
    const k = 1 + ECONOMIA.taxaFama * 5;
    expect(off).toBe(Math.round(30 * 24 * h.helpers.length * k));
    expect(new Jogo().load(s, 10 * 3600000)).toBe(Math.round(120 * 24 * h.helpers.length * k));
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
    expect(avisos).toEqual([[1, 0, 1, 15], [1, 0, 2, 25]]);
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

describe('área 6: ambulantes', () => {
  it('caminhão, pilha, bancada, ambulante e dinheiro fecham o ciclo (trabalho manual)', () => {
    const g = mundo([5, 5, 5, 5, 5, 1]); g.lv.cofre5 = 0; // só a abertura: 1 ambulante, sem ajudante
    const pilha = g.machines.find(m => m.pilha)!, v = g.vend[0];
    expect(g.vend).toHaveLength(1); expect(pilha.type).toBe('caixaMate'); expect(pilha.pile).toBe(0);
    rodar(g, 8000); expect(pilha.pile).toBeGreaterThan(2); // o caminhão chegou e descarregou na calçada
    expect(v.estado).toBe('doca'); expect(v.carga).toHaveLength(0); // sem estoque na bancada, o ambulante espera
    Object.assign(g.player, { x: pilha.x, y: pilha.y + 50 }); rodar(g, 600); // pega as caixas
    expect(g.player.stack.filter(t => t === 'caixaMate').length).toBe(3);
    Object.assign(g.player, SHOPS[5].drop); rodar(g, 600); // larga na bancada
    expect(g.player.stack).toHaveLength(0); expect(g.S[5].counter.mate.length + v.carga.length).toBe(3 * AMBULANTE.caixa);
    g.player.x = 1000; g.player.y = 300;
    let saiu = false; rodar(g, 120000, () => { saiu ||= v.estado === 'rota' });
    expect(saiu).toBe(true); expect(g.S[5].cashValue).toBeGreaterThan(0); // voltou e deixou o dinheiro na bancada
  });

  it('os ambulantes sempre voltam e nunca travam; andam pela areia, nunca na rua (10 min com o ajudante do caminhão)', () => {
    const g = mundo([5, 5, 5, 5, 5, 10]); g.lv.cofre5 = 0;
    expect(g.vend.length).toBe(3); expect(g.helpers.some(h => h.shop === 5)).toBe(true);
    const viagens = g.vend.map(() => 0), fora = g.vend.map(() => 0), antes = g.vend.map(v => v.estado);
    let pagamentos = 0, ultimo = 0;
    rodar(g, 600000, () => {
      const c = g.S[5].cashValue; if (c > ultimo) pagamentos++; ultimo = c;
      g.vend.forEach((v, i) => {
        if (antes[i] === 'volta' && v.estado === 'doca') { viagens[i]++; expect(v.carga).toHaveLength(0); expect(v.dinheiro).toBe(0) }
        fora[i] = v.estado === 'doca' ? 0 : fora[i] + DT; expect(fora[i]).toBeLessThan(120000);
        expect(v.y).toBeLessThan(FAIXAS.rua.y0); expect(v.x).toBeGreaterThan(0); expect(v.x).toBeLessThan(WORLD_W);
        antes[i] = v.estado;
      });
    });
    for (const n of viagens) expect(n).toBeGreaterThan(4);
    expect(pagamentos).toBeGreaterThan(15);
  });
});

describe('área 7: escolinha de surf', () => {
  it('prancha molhada não é alugada; seca na arara, volta a alugar', () => {
    const g = mundo([5, 5, 5, 5, 5, 5, 1]), es = g.esc;
    es.pranchas.forEach((b, i) => { b.estado = 'molhada'; b.spot = i; Object.assign(b, ESCOLA.molhadas[i]) });
    rodar(g, 20000);
    expect(es.pranchas.every(b => b.estado === 'molhada')).toBe(true); expect(es.fila.length).toBeGreaterThan(0);
    Object.assign(g.player, ESCOLA.molhadas[0]); rodar(g, 300); // passa por cima: pega
    expect(g.player.stack).toContain('prancha');
    Object.assign(g.player, SHOPS[6].drop); rodar(g, 300); // pendura na arara
    expect(g.player.stack).not.toContain('prancha'); expect(es.pranchas.filter(b => b.estado === 'secando')).toHaveLength(1);
    g.player.x = 1950; g.player.y = 740;
    let alugou = false; rodar(g, ESCOLA.secarMs + 3000, () => { alugou ||= es.pranchas.some(b => b.estado === 'aluno') });
    expect(alugou).toBe(true);
  });

  it('o instrutor nunca fica travado: a escolinha rende 10 min sem o jogador', () => {
    const g = mundo([5, 5, 5, 5, 5, 5, 6]); g.lv.cofre6 = 0;
    expect(g.helpers.some(h => h.shop === 6)).toBe(true);
    let aulas = 0, ultimo = 0, parado = 0;
    rodar(g, 600000, () => { const c = g.S[6].cashValue; if (c > ultimo) { aulas++; parado = 0 } else parado += DT; ultimo = c; expect(parado).toBeLessThan(40000) });
    expect(aulas).toBeGreaterThan(60);
  });

  it('a área trancada não muda nada no jogo: dá para passar por cima', () => {
    const g = naPraia(7); for (let a = 0; a < NUM_AREAS; a++) subir(g, a, 12);
    g.money = 5000; const antes = JSON.stringify([g.money, g.nivel, g.paid, g.S.map(s => s.open)]);
    for (const a of [7, 8]) {
      expect(g.liberada(a)).toBe(false); expect(g.aberta(a)).toBe(false);
      expect(g.machines.some(m => dentroDe(m, LUGARES[a].zona))).toBe(false);
      Object.assign(g.player, { x: LUGARES[a].rect.x, y: LUGARES[a].rect.y }); rodar(g, 2000, () => { g.money = 5000 });
      expect(g.player.x).toBeCloseTo(LUGARES[a].rect.x); // ninguém empurra o jogador para fora
    }
    expect(JSON.stringify([g.money, g.nivel, g.paid, g.S.map(s => s.open)])).toBe(antes);
    expect(g.visibleSteps().every(v => v.a <= 6)).toBe(true);
  });

  it('melhorias das áreas 6 e 7 não alteram as outras', () => {
    const g = mundo([5, 5, 5, 5, 5, 1, 1]);
    const outras = () => [g.price('acai'), g.price('sorvete'), g.precoBanho(), g.price('milho'), g.publico(), g.freezerCap(), g.aguaCap()];
    const antes = outras(), amb = [g.isoporCap(), g.price('mate')];
    while (g.nivel[6] < 20) g.applyStep(6, true);
    expect([g.isoporCap(), g.price('mate')]).toEqual(amb);
    while (g.nivel[5] < 20) g.applyStep(5, true);
    expect(outras()).toEqual(antes);
  });
});

describe('área 8: sucos e vitaminas', () => {
  it('o barman nunca fica travado: laranja e açaí com banana vendem 10 min sem o jogador', () => {
    const g = mundo([5, 5, 5, 5, 5, 5, 5, 4]); g.lv.cofre7 = 0; // sucos, cardápio, liquidificadora 2, barman
    expect(g.helpers.some(h => h.shop === 7)).toBe(true); expect(g.machines.filter(m => m.needs && PRODUCTS[m.type].shop === 7)).toHaveLength(2);
    let vendas = 0, ultimo = 0, parado = 0;
    rodar(g, 600000, () => { const c = g.S[7].cashValue; if (c > ultimo) { vendas++; parado = 0 } else parado += DT; ultimo = c; expect(parado).toBeLessThan(30000) });
    expect(vendas).toBeGreaterThan(60);
  });
});

describe('área 9: palco de pagode', () => {
  it('o palco só dá bônus durante o show', () => {
    const g = mundo([5, 5, 5, 5, 5, 5, 5, 5, 1]), base = g.publico();
    expect(g.showAtivo()).toBe(false); expect(g.palco.t).toBe(PALCO.intervaloMs);
    rodar(g, PALCO.intervaloMs - 2000); expect(g.showAtivo()).toBe(false); expect(g.publico()).toBeCloseTo(base);
    rodar(g, 3000); expect(g.showAtivo()).toBe(true); expect(g.publico()).toBeCloseTo(base * (1 + PALCO.bonus));
    rodar(g, PALCO.showMs); expect(g.showAtivo()).toBe(false); expect(g.publico()).toBeCloseTo(base);
  });
});

describe('área 10: torneio', () => {
  it('as etapas liberam em ordem, uma partida por vez; a final faz campeão', () => {
    let campeao = 0; const g = new Jogo({ campeao: () => { campeao++ } }, rng(1)); g.load(null); g.beach = NUM_AREAS - 1;
    [5, 5, 5, 5, 5, 5, 5, 5, 5, 2].forEach((n, a) => { while (g.nivel[a] < n) g.applyStep(a, true) });
    const proxima = () => g.visibleSteps().filter(v => v.a === 9 && v.k === g.nivel[9]).map(v => v.s.id)[0];
    for (let e = 1; e <= 3; e++) {
      while (proxima() !== 'etapa' + e) { expect(proxima()).not.toMatch(/^etapa/); g.applyStep(9) }
      g.applyStep(9); // compra a etapa: começa a partida e o quadro seguinte espera
      expect(g.partida).toEqual({ etapa: e, ms: TORNEIO.partidaMs[e - 1] }); expect(proxima()).toBeUndefined();
      rodar(g, TORNEIO.partidaMs[e - 1] + 100);
      expect(g.trofeus).toBe(e);
    }
    expect(campeao).toBe(1); expect(g.campeao()).toBe(true);
  });

  it('o bônus do troféu fica depois da viagem e no save', () => {
    const g = naPraia(9); g.trofeus = 2; const k = 1 + 2 * TORNEIO.bonusTrofeu;
    expect(g.publico()).toBeCloseTo(k);
    g.viajar(); expect(g.trofeus).toBe(2); expect(g.publico()).toBeCloseTo(k);
    const h = new Jogo(); h.load(JSON.parse(JSON.stringify(g.snapshot()))); expect(h.trofeus).toBe(2); expect(h.publico()).toBeCloseTo(k);
  });

  it('depois da Praia 10 o quadro de nova praia diz "Praia 11 · em breve"', () => {
    const g = naPraia(10); for (let a = 0; a < NUM_AREAS; a++) subir(g, a, a < 9 ? NIVEL_ABRE : NIVEL_NOVA_PRAIA);
    expect(g.novaPraiaAberta()).toBe(true); expect(g.proximaExiste()).toBe(false); expect(g.goalText()).toBe('Praia 11 · em breve');
  });
});

describe('áreas no mapa', () => {
  it('nenhuma área fica fora da faixa dela; o balcão fica dentro do lugar da área', () => {
    LUGARES.forEach((L, a) => {
      const F = FAIXAS[L.faixa], r = L.rect;
      expect(r.y - r.h / 2).toBeGreaterThanOrEqual(F.y0); expect(r.y + r.h / 2).toBeLessThanOrEqual(F.y1);
      expect(r.x - r.w / 2).toBeGreaterThanOrEqual(0); expect(r.x + r.w / 2).toBeLessThanOrEqual(WORLD_W);
      if (SHOPS[a].kind !== 'atracao') expect(dentroDe(SHOPS[a].counter, L.rect)).toBe(true);
      expect(dentroDe(SHOPS[a].drop, L.zona)).toBe(true);
    });
    // os quiosques ficam na grama; a escolinha, na beira da água; os ambulantes, no calçadão
    expect([1, 3, 7].map(a => LUGARES[a].faixa)).toEqual(['grama', 'grama', 'grama']);
    expect(LUGARES[6].rect.y - LUGARES[6].rect.h / 2).toBeLessThan(FAIXAS.areia.y0 + 60); expect(LUGARES[5].faixa).toBe('calcadao');
  });

  it('as zonas das áreas não se sobrepõem (o torneio usa a da quadra)', () => {
    const z = LUGARES.map(L => L.zona);
    for (let a = 0; a < z.length; a++) for (let b = a + 1; b < z.length; b++) {
      if (a === 4 && b === 9) { expect(z[b]).toEqual(z[a]); continue }
      const sep = Math.abs(z[a].x - z[b].x) >= (z[a].w + z[b].w) / 2 || Math.abs(z[a].y - z[b].y) >= (z[a].h + z[b].h) / 2;
      expect(sep, a + ' e ' + b).toBe(true);
    }
  });

  it('todas as máquinas ficam no lugar da área delas, onde o jogador alcança', () => {
    const g = mundo([20, 15, 15, 15, 10, 15, 15, 15, 10, 9]);
    for (const m of g.machines) {
      const a = PRODUCTS[m.type].shop >= 0 ? PRODUCTS[m.type].shop : g.machines.find(x => x.needs === m.type)!.type && PRODUCTS[g.machines.find(x => x.needs === m.type)!.type].shop;
      expect(dentroDe(m, LUGARES[a].zona), m.type).toBe(true);
      const z = { x: m.x, y: m.y + 50 }; expect(z.y).toBeLessThan(FAIXAS.calcadao.y1); // a bandeja (onde se pega) fica antes da rua
    }
  });
});

describe('banhistas', () => {
  it('de 25 a 40 por tela, variando por praia; a Praia do Pôr do Sol tem menos', () => {
    const por = (n: number) => naPraia(n).banhistas.length / (WORLD_W / 400);
    for (let n = 1; n <= 10; n++) { expect(por(n)).toBeGreaterThanOrEqual(24.5); expect(por(n)).toBeLessThanOrEqual(40.5) }
    expect(por(9)).toBeLessThan(Math.min(...[1, 2, 3, 4, 5, 6, 7, 8, 10].map(por)));
  });

  it(`param a ${BANHISTA_LONGE} ou mais de balcões, quadros, filas, entregas, pilhas e bancada (em todas as praias)`, () => {
    for (let n = 1; n <= 10; n++) for (const b of naPraia(n).banhistas) b.pts.forEach((p, k) => {
      if (b.acao[k] !== 'nada') expect(livre(p.x, p.y, BANHISTA_LONGE), `praia ${n}: (${p.x.toFixed(0)}, ${p.y.toFixed(0)})`).toBe(true);
    });
  });

  it('nunca travam: andam, param e voltam a andar; ficam no mar ou em lugar livre da areia, nunca na rua (10 min)', () => {
    const g = naPraia(5), antes = g.banhistas.map(b => g.posBanhista(b, 0));
    const mexeu = g.banhistas.map(() => 0);
    for (let t = 0; t < 600000; t += 1000) g.banhistas.forEach((b, i) => {
      const q = g.posBanhista(b, t); if (Math.hypot(q.x - antes[i].x, q.y - antes[i].y) > 1) mexeu[i]++; antes[i] = q;
      expect(q.y).toBeLessThan(FAIXAS.grama.y0); expect(q.x).toBeGreaterThan(0); expect(q.x).toBeLessThan(WORLD_W + 50);
      if (q.acao === 'nada') expect(q.y).toBeLessThan(FAIXAS.areia.y0);
      else if (q.acao !== 'anda' && b.par < 0) expect(livre(q.x, q.y)).toBe(true);
    });
    expect(mexeu.every(n => n > 10)).toBe(true);
  });

  it('não mudam o jogo: com a mesma semente, a praia rende igual com ou sem eles na tela', () => {
    const a = mundo([8]), b = mundo([8]); b.banhistas = [];
    rodar(a, 60000); rodar(b, 60000);
    expect(a.S[0].cashValue + a.money).toBe(b.S[0].cashValue + b.money);
  });
});

describe('orla em faixas', () => {
  it('o jogador anda até o fim da calçada e não entra na rua; a câmera desce junto', () => {
    const g = novo(); g.player.x = 200; g.player.y = 600;
    for (let t = 0; t < 8000; t += DT) { g.now += DT; g.update(DT, { x: 0, y: 1 }) }
    expect(g.player.y).toBeLessThan(FAIXAS.rua.y0); expect(g.player.y).toBeGreaterThan(FAIXAS.calcadao.y0);
    expect(g.camY).toBeGreaterThan(0); expect(g.camY).toBeLessThanOrEqual(WORLD_H - H);
  });

  it('livre(x, y): não deixa enfeite em balcão, quadro, mar fundo ou rua', () => {
    expect(livre(SHOPS[0].counter.x, SHOPS[0].counter.y)).toBe(false);
    expect(livre(SLOTS.maq2.x, SLOTS.maq2.y)).toBe(false);
    expect(livre(200, 40)).toBe(false); expect(livre(200, FAIXAS.rua.y0 + 30)).toBe(false);
    expect(livre(200, FAIXAS.grama.y0 + 50)).toBe(true);
  });
});

function SLOTS_X(slot: string) { return SLOTS[slot].x }
function dentroDe(p: { x: number; y: number }, r: Rect) { return Math.abs(p.x - r.x) <= r.w / 2 && Math.abs(p.y - r.y) <= r.h / 2 }
