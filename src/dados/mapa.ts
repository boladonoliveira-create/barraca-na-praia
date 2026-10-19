/* Mapa: uma orla em faixas, do mar até a rua; cada área tem o seu lugar numa faixa (LUGARES). Coordenadas do mundo em unidades do canvas lógico (a tela é 400 x 760). */
export const W = 400, H = 760, WORLD_W = 3500, WORLD_H = 1140;
export const SHORE = 118, WALL_Y = 326, PLAY_BOTTOM = 742;

export interface Rect { x: number; y: number; w: number; h: number }

/** As faixas da orla, de cima para baixo (y0 a y1). O jogador anda da areia até o fim da calçada; a rua é só visual. */
export const FAIXAS = {
  mar: { y0: 0, y1: SHORE },
  areia: { y0: SHORE, y1: 820 },
  grama: { y0: 820, y1: 920 },
  calcadao: { y0: 920, y1: 1060 }, // ciclovia em cima (920 a 950), bancos e calçada embaixo
  rua: { y0: 1060, y1: WORLD_H },
};
export type Faixa = keyof typeof FAIXAS;
export const faixaDe = (y: number): Faixa => (Object.keys(FAIXAS) as Faixa[]).find(f => y < FAIXAS[f].y1) ?? 'rua';
/** Até onde o jogador pode andar na vertical (o centro dele). */
export const ANDA = { y0: SHORE + 34, y1: FAIXAS.calcadao.y1 - 12 };
export type Item = 'acai' | 'coco' | 'sorvete' | 'caixa' | 'milho' | 'pastel' | 'milhoCru' | 'pastelCru' | 'mate' | 'biscoito' | 'prancha' | 'laranja' | 'acaiBanana' | 'sucoLaranja' | 'sucoAcai' | 'caixaMate' | 'caixaBisc';

/** Onde fica cada área (a área i é LUGARES[i]). rect: o lugar dela na faixa (é o quadrado trancado antes de abrir);
    zona: onde ficam as coisas dela (balcão, máquinas, quadros), para nenhum enfeite cobrir; as zonas não se sobrepõem
    (cada quadra ocupa seu próprio trecho). A fila dos quiosques sobe para a areia, por cima de qualquer enfeite. Retângulos pelo centro. */
export interface Lugar { faixa: Faixa; rect: Rect; zona: Rect; titulo: string }
const R = (x0: number, y0: number, x1: number, y1: number): Rect => ({ x: (x0 + x1) / 2, y: (y0 + y1) / 2, w: x1 - x0, h: y1 - y0 });
export const LUGARES: Lugar[] = [
  { faixa: 'areia', rect: R(0, 140, 400, 760), zona: R(0, 140, 400, 760), titulo: 'BARRACA DO SOL' },
  { faixa: 'grama', rect: R(470, 828, 690, 912), zona: R(410, 828, 750, 1040), titulo: 'SORVETERIA' },
  { faixa: 'areia', rect: R(660, 455, 1050, 815), zona: R(660, 440, 1050, 815), titulo: 'CHUVEIRÃO E CADEIRAS' },
  { faixa: 'grama', rect: R(905, 828, 1580, 912), zona: R(905, 828, 1580, 1040), titulo: 'MILHO E PASTEL' },
  { faixa: 'areia', rect: R(1365, 485, 1735, 815), zona: R(1365, 489, 1735, 815), titulo: 'QUADRA DE FUTEVÔLEI' },
  { faixa: 'calcadao', rect: R(1600, 925, 2015, 1055), zona: R(1600, 828, 2020, 1060), titulo: 'AMBULANTES' },
  { faixa: 'areia', rect: R(2020, 150, 2400, 495), zona: R(2020, 150, 2400, 488), titulo: 'ESCOLINHA DE SURF' },
  { faixa: 'grama', rect: R(2220, 828, 2810, 912), zona: R(2220, 828, 2778, 1040), titulo: 'SUCOS E VITAMINAS' },
  { faixa: 'areia', rect: R(2690, 290, 2970, 625), zona: R(2680, 280, 2980, 630), titulo: 'PALCO DE PAGODE' },
  // O torneio tem sua própria quadra no fim da progressão.
  { faixa: 'areia', rect: R(3080, 485, 3450, 815), zona: R(3080, 489, 3450, 815), titulo: 'TORNEIO DE FUTEVÔLEI' },
];

/** Na areia, x de trechos livres entre as áreas (para enfeites de "divisa"), do mar até a grama. */
export const DIVISAS = [430, 1085, 1780, 2070, 2660, 3050, 3460];

// price 0 = não é vendido; rate 0 = não sai de máquina; shop -1 = cru (vai para a panela, não para o balcão)
export const PRODUCTS: Record<Item, { price: number; rate: number; shop: number }> = {
  acai: { price: 6, rate: 900, shop: 0 },
  coco: { price: 10, rate: 1400, shop: 0 },
  sorvete: { price: 12, rate: 0, shop: 1 },
  caixa: { price: 0, rate: 1800, shop: 1 },
  milho: { price: 20, rate: 0, shop: 3 },
  pastel: { price: 26, rate: 0, shop: 3 },
  milhoCru: { price: 0, rate: 700, shop: -1 },
  pastelCru: { price: 0, rate: 800, shop: -1 },
  mate: { price: 50, rate: 1100, shop: 5 },
  biscoito: { price: 70, rate: 1300, shop: 5 },
  prancha: { price: 0, rate: 0, shop: 6 }, // prancha molhada na mão: vai para a arara
  laranja: { price: 0, rate: 750, shop: -1 },
  acaiBanana: { price: 0, rate: 850, shop: -1 },
  sucoLaranja: { price: 90, rate: 0, shop: 7 },
  sucoAcai: { price: 120, rate: 0, shop: 7 },
  caixaMate: { price: 0, rate: 0, shop: 5 }, // caixas que o caminhão deixa na calçada: vão para a bancada
  caixaBisc: { price: 0, rate: 0, shop: 5 },
};
export const BOX_SORVETES = 6, BOX_MAX_CARRY = 3;

export interface Shop {
  kind: 'counter' | 'kiosk' | 'servico' | 'atracao' | 'ambulante' | 'escola'; name: string; cx: number; products: Item[]; side: number; base: number; spawnX: number;
  counter: Rect; drop: Rect; cash: { x: number; y: number };
}
export const SHOPS: Shop[] = [
  { kind: 'counter', name: 'BARRACA DO SOL', cx: 200, products: ['acai', 'coco'], side: -1, base: 1500, spawnX: -24,
    counter: { x: 200, y: 300, w: 200, h: 40 }, drop: { x: 200, y: 360, w: 104, h: 44 }, cash: { x: 296, y: 362 } },
  // quiosques na grama: os clientes fazem fila do lado da areia; o jogador trabalha do lado do calçadão
  { kind: 'kiosk', name: 'SORVETERIA', cx: 540, products: ['sorvete'], side: 1, base: 1600, spawnX: 780,
    counter: { x: 540, y: 862, w: 96, h: 40 }, drop: { x: 540, y: 936, w: 92, h: 40 }, cash: { x: 612, y: 950 } },
  // Praia 3: serviço. O "drop" é o registro da caixa d'água; as regras ficam em SERVICO
  { kind: 'servico', name: 'CHUVEIRÃO', cx: 820, products: [], side: 1, base: 1800, spawnX: 0,
    counter: { x: 820, y: 600, w: 220, h: 30 }, drop: { x: 990, y: 650, w: 84, h: 44 }, cash: { x: 700, y: 650 } },
  // Praia 4: venda com preparo. Quiosque na grama; o milho e o pastel saem das panelas (RECEITAS)
  { kind: 'counter', name: 'MILHO E PASTEL', cx: 1200, products: ['milho', 'pastel'], side: 1, base: 1500, spawnX: 1460,
    counter: { x: 1200, y: 862, w: 200, h: 40 }, drop: { x: 1200, y: 936, w: 104, h: 44 }, cash: { x: 1296, y: 950 } },
  // Área 5: atração. Não vende: "counter" é a quadra (enfeites e comemoração); drop e caixa não são usados
  { kind: 'atracao', name: 'QUADRA', cx: 1550, products: [], side: 1, base: 0, spawnX: 0,
    counter: { x: 1550, y: 650, w: 160, h: 104 }, drop: { x: 1550, y: 650, w: 0, h: 0 }, cash: { x: 1550, y: 650 } },
  // Área 6: venda automática. "counter" é a bancada no calçadão; "drop" é onde se abastece (AMBULANTE)
  { kind: 'ambulante', name: 'AMBULANTES', cx: 1860, products: ['mate', 'biscoito'], side: 1, base: 0, spawnX: 0,
    counter: { x: 1860, y: 962, w: 140, h: 36 }, drop: { x: 1860, y: 1012, w: 120, h: 40 }, cash: { x: 1765, y: 960 } },
  // Área 7: serviço com fila, na beira da água. "counter" é a arara; "drop" é onde se pendura a prancha molhada (ESCOLA)
  { kind: 'escola', name: 'ESCOLINHA DE SURF', cx: 2210, products: [], side: 1, base: 1900, spawnX: 0,
    counter: { x: 2210, y: 215, w: 170, h: 30 }, drop: { x: 2210, y: 272, w: 120, h: 44 }, cash: { x: 2330, y: 280 } },
  // Área 8: preparo e venda (como o milho), quiosque na grama
  { kind: 'counter', name: 'SUCOS E VITAMINAS', cx: 2430, products: ['sucoLaranja', 'sucoAcai'], side: 1, base: 1500, spawnX: 2660,
    counter: { x: 2430, y: 862, w: 200, h: 40 }, drop: { x: 2430, y: 936, w: 104, h: 44 }, cash: { x: 2526, y: 950 } },
  // Área 9: atração em evento, no centro da areia. Não vende: "counter" é o palco
  { kind: 'atracao', name: 'PALCO DE PAGODE', cx: 2830, products: [], side: 1, base: 0, spawnX: 0,
    counter: { x: 2830, y: 400, w: 200, h: 110 }, drop: { x: 2830, y: 400, w: 0, h: 0 }, cash: { x: 2830, y: 400 } },
  // Área 10: quadra do torneio, no fim da orla.
  { kind: 'atracao', name: 'TORNEIO', cx: 3265, products: [], side: 1, base: 0, spawnX: 0,
    counter: { x: 3265, y: 650, w: 160, h: 104 }, drop: { x: 3265, y: 650, w: 0, h: 0 }, cash: { x: 3265, y: 650 } },
];

/** Área 9: de tempos em tempos um show junta multidão e multiplica a chegada de clientes em todas as áreas, só durante o show.
    intervalo = max(intervaloMin, intervaloMs - intervaloMenos × "intervalo"); show = showMs + showMais × "showLongo";
    bônus do show = (bonus + bonusPorNivel × "bonusShow") × marco do palco. "somMelhor" é só visual. */
export const PALCO = { intervaloMs: 240000, intervaloMenos: 25000, intervaloMin: 120000, showMs: 60000, showMais: 15000, bonus: 0.5, bonusPorNivel: 0.15 };

/** Área 10: 3 etapas em ordem. Cada uma é uma compra e uma partida de partidaMs; vencida, dá um troféu, que soma
    bonusTrofeu de público para sempre (nesta e nas próximas praias). Arquibancada e patrocínio somam público como a quadra. */
export const TORNEIO = { etapas: ['Classificatória', 'Semifinal', 'Final'], partidaMs: [40000, 55000, 70000], bonusTrofeu: 0.15, arquibT: 0.08, patrocinio: 0.06 };

/** Área 6: o caminhão chega à baia da rua e deixa caixas de mate e de biscoito em pilhas na calçada; o jogador (ou o
    ajudante do caminhão) leva as caixas até a bancada; cada ambulante enche o carrinho na bancada, anda pela areia entre
    as pessoas vendendo, volta vazio e deixa o dinheiro na bancada (ou no cofre). */
export const AMBULANTE = {
  vagas: [{ x: 1860, y: 918 }, { x: 1805, y: 912 }, { x: 1915, y: 912 }, { x: 1750, y: 912 }, { x: 1970, y: 912 }, { x: 1695, y: 912 }],
  pilhas: { caixaMate: { x: 1720, y: 980 }, caixaBisc: { x: 1980, y: 980 } } as Record<string, { x: number; y: number }>, pilhaCap: 8,
  caixa: 6, bancadaCap: 36, // unidades por caixa; unidades de cada produto que cabem na bancada
  caminhao: { x: 1860, y: 1100, intervaloMs: 14000, descargaMs: 450, carga: 6 }, // a cada intervaloMs, deixa até `carga` caixas
  areia: { y0: 190, y1: 790 }, // por onde os ambulantes andam vendendo
  isoporBase: 6, isoporPorNivel: 3, // itens por carrinho: isoporBase + isoporPorNivel × "isopor"
  velocidade: 1.7, rapidoPorNivel: 0.25, // carrinho mais rápido: velocidade × (1 + rapidoPorNivel × "carrinhoRapido")
  vendaMs: 1300, // uma venda a cada vendaMs ÷ público, enquanto anda
};

/** Área 7: pranchas e arara. A prancha seca vai com o aluno para o mar e volta molhada para a areia (em `molhadas`);
    molhada não é alugada. Pendurada na arara, seca em secarMs. A arara guarda araraBase + araraPorNivel × "arara" pranchas. */
export const ESCOLA = {
  filaX: 2090, filaY: 290, filaMax: 5, marX: [2040, 2380], // fila (de filaY para cima) e onde os alunos surfam
  pranchasBase: 2, araraBase: 3, araraPorNivel: 2,
  aulaMs: 5000, secarMs: 3500, precoAula: 60,
  molhadas: [{ x: 2100, y: 345 }, { x: 2170, y: 345 }, { x: 2240, y: 345 }, { x: 2310, y: 345 }, { x: 2100, y: 405 }, { x: 2170, y: 405 }, { x: 2240, y: 405 }, { x: 2310, y: 405 }],
  maxPranchas: 8,
};

/** Área 5: o jogo na quadra junta público e aumenta a chegada de clientes em todas as outras áreas.
    publico = 1 + (aberta + por nível de cada melhoria) × marco da quadra; com a quadra fechada, 1. */
export const ATRACAO = { aberta: 0.15, arquibancada: 0.1, rede: 0.06, torneio: 0.15 };

/** Praia 3: chuveirão (fila, banho, caixa d'água) e cadeiras de aluguel. */
export const SERVICO = {
  chuveiros: [{ x: 770, y: 620 }, { x: 870, y: 620 }], // o 2º entra com a melhoria "chuveiro2"
  filaX: 820, filaY: 570, filaMax: 5, caixa: { x: 990, y: 535 }, // fila (de filaY para cima) e a caixa d'água (topo)
  banhoMs: 2400, precoBanho: 8, // banhos por caixa: aguaBase + aguaPorNivel × "caixaAgua"
  aguaBase: 5, aguaPorNivel: 4, encherMs: 110, // no registro, 1 banho de água a cada encherMs
  cadeiras: [{ x: 760, y: 730 }, { x: 825, y: 730 }, { x: 890, y: 730 }, { x: 955, y: 730 }, { x: 760, y: 790 }, { x: 825, y: 790 }, { x: 890, y: 790 }, { x: 955, y: 790 }],
  cadeirasBase: 3, cadeirasPorNivel: 2, precoCadeira: 14, aluguelMs: [6000, 9000], chegadaCadeiraMs: 2600,
};

/** Praia 4: panelas e fritadeira cozinham em lote o que recebem cru. */
export const PREPARO = {
  loteBase: 4, lotePorNivel: 2, // itens por panela: loteBase + lotePorNivel × melhoria de lote da receita
  saidaMax: 12, // prontos esperando na panela
};
/** O que cada panela (ou liquidificadora) faz: o cru que recebe, o tempo, a melhoria que acelera e a que aumenta o lote. */
export const RECEITAS: Partial<Record<Item, { cru: Item; cozinharMs: number; rapido?: string; lote: string }>> = {
  milho: { cru: 'milhoCru', cozinharMs: 5000, lote: 'panelaMaior' },
  pastel: { cru: 'pastelCru', cozinharMs: 4000, rapido: 'fritaRapida', lote: 'panelaMaior' },
  sucoLaranja: { cru: 'laranja', cozinharMs: 3500, rapido: 'liquiRapida', lote: 'copoMaior' },
  sucoAcai: { cru: 'acaiBanana', cozinharMs: 4200, rapido: 'liquiRapida', lote: 'copoMaior' },
};
export const CASH_MAGNET = 72, COUNTER_CAP = 20;


export const SLOTS: Record<string, { x: number; y: number }> = {
  // Barraca do Sol (como sempre foi)
  maq2: { x: 290, y: 470 }, sombra: { x: 40, y: 446 }, voce: { x: 350, y: 696 }, equipe: { x: 200, y: 690 }, coco: { x: 110, y: 612 },
  cardapio: { x: 92, y: 372 }, turbo: { x: 200, y: 470 }, coco2: { x: 290, y: 612 }, praia: { x: 52, y: 704 }, cofre0: { x: 344, y: 410 }, // nova praia: no canto, fora do caminho do trabalho
  // Sorveteria (quiosque na grama; os quadros ficam no calçadão)
  fence: { x: 535, y: 1005 }, cardapioS: { x: 450, y: 1005 }, frzUp: { x: 620, y: 1005 }, equipeS: { x: 705, y: 1005 }, extraS: { x: 710, y: 935 },
  // Chuveirão (areia, perto da grama)
  fence2: { x: 870, y: 520 }, aluguel: { x: 700, y: 520 }, cadeiras: { x: 785, y: 520 }, caixaAgua: { x: 990, y: 470 }, chuveiro2: { x: 870, y: 620 },
  cofre2: { x: 700, y: 730 }, salva: { x: 1010, y: 740 },
  // Milho e pastel (quiosque na grama; panelas na grama, quadros no calçadão)
  fence3: { x: 1200, y: 1005 }, cardapioM: { x: 1030, y: 1005 }, cozinheiro: { x: 1115, y: 1005 }, cofre3: { x: 1285, y: 1005 }, panelaUp: { x: 1370, y: 1005 },
  fritaUp: { x: 1455, y: 1005 }, pastel: { x: 1455, y: 852 }, panela2: { x: 1540, y: 852 },
  // Quadra (areia, perto da grama)
  fence4: { x: 1550, y: 520 }, torneio: { x: 1550, y: 520 }, arquib: { x: 1470, y: 770 }, rede: { x: 1630, y: 770 },
  // Ambulantes (bancada no calçadão; quadros na grama acima dela)
  fence5: { x: 1860, y: 1012 }, cardapioA: { x: 1710, y: 860 }, carrinhos: { x: 1795, y: 860 }, isopor: { x: 1880, y: 860 }, equipeA: { x: 1965, y: 860 },
  rapidoA: { x: 1640, y: 1015 }, cofre5: { x: 1975, y: 935 },
  // Escolinha de surf (beira da água)
  fence6: { x: 2210, y: 330 }, instrutor: { x: 2060, y: 462 }, pranchas: { x: 2145, y: 462 }, arara: { x: 2230, y: 462 }, aulaUp: { x: 2315, y: 462 }, cofre6: { x: 2360, y: 220 },
  // Sucos e vitaminas (quiosque na grama)
  abreSucos: { x: 2430, y: 1005 }, cardapioJ: { x: 2260, y: 1005 }, barman: { x: 2345, y: 1005 }, copoMaior: { x: 2515, y: 1005 }, liquiRapida: { x: 2600, y: 1005 },
  cofre7: { x: 2685, y: 1005 }, liqui2: { x: 2685, y: 852 },
  // Palco de pagode (centro da areia, com caminho livre em volta)
  abrePalco: { x: 2830, y: 520 }, showLongo: { x: 2740, y: 520 }, intervalo: { x: 2830, y: 520 }, bonusShow: { x: 2920, y: 520 }, somMelhor: { x: 2830, y: 590 },
  // Torneio (na quadra)
  fence9: { x: 3125, y: 650 }, arquibT: { x: 3125, y: 545 }, etapa: { x: 3405, y: 650 }, patroc: { x: 3405, y: 545 },
};

export const UMBRELLA_POS = [{ x: 64, y: 226 }, { x: 336, y: 226 }, { x: 316, y: 158 }, { x: 40, y: 168 }];
export const PHRASES = ['Valeu, chefe!', 'Capricha!', 'Bom demais!', 'Tá caro, hein!', 'Que delícia!', 'Volto amanhã!', 'Top!', 'Gelado demais!', 'Mais um!'];
export const SHIRTS = ['#ff6b6b', '#4dabf7', '#ffd43b', '#69db7c', '#f783ac', '#ff922b', '#9775fa', '#38d9a9'];
export const SKINS = ['#f1c6a0', '#d9a37a', '#a8714c', '#7a4b2e', '#e8b48e'];

/** Onde dá para desenhar enfeite sem atrapalhar: dentro da orla (fora do mar fundo e da rua) e longe de balcões,
    zonas de entrega, quadros de compra e da fila na frente dos balcões. */
export function livre(x: number, y: number, folga = 12) {
  if (x < 0 || x > WORLD_W || y < SHORE + 6 || y > FAIXAS.calcadao.y1) return false;
  const dentro = (r: Rect, mx = 0, my = 0) => Math.abs(x - r.x) < r.w / 2 + folga + mx && Math.abs(y - r.y) < r.h / 2 + folga + my;
  for (const d of SHOPS) {
    if (dentro(d.counter) || dentro(d.drop) || dentro({ ...d.cash, w: 40, h: 40 })) return false;
    // fila: sobe do balcão e, comprida, dobra para o lado (side)
    if (d.kind === 'counter' || d.kind === 'kiosk') { const top = d.counter.y - d.counter.h / 2; if (dentro({ x: d.cx + d.side * 45, y: top - 80, w: 150, h: 160 })) return false }
  }
  for (const k in SLOTS) if (dentro({ ...SLOTS[k], w: 72, h: 60 })) return false;
  for (const l of LUGARES) if (dentro(l.zona)) return false;
  return true;
}
