/* Mapa: uma praia, vários lotes. Coordenadas do mundo em unidades do canvas lógico (400 x 760). */
export const W = 400, H = 760, WORLD_W = 2900;
export const SHORE = 118, WALL_Y = 326, PLAY_BOTTOM = 742;

export interface Rect { x: number; y: number; w: number; h: number }
/** faixa: lote dentro da faixa grande de areia da Praia 7 (sem cerca e sem silhueta; só a placa, quando é da praia atual). */
export interface Lot { x0: number; x1: number; title?: string; praia?: number; kind?: string; faixa?: boolean }
export type Item = 'acai' | 'coco' | 'sorvete' | 'caixa' | 'milho' | 'pastel' | 'milhoCru' | 'pastelCru' | 'mate' | 'biscoito' | 'prancha' | 'laranja' | 'acaiBanana' | 'sucoLaranja' | 'sucoAcai';

export const LOTS: Lot[] = [
  { x0: 0, x1: 400 },
  { x0: 400, x1: 600, title: 'SORVETERIA', praia: 2 },
  { x0: 600, x1: 900, title: 'CHUVEIRÃO E CADEIRAS', praia: 3, kind: 'shower' },
  { x0: 900, x1: 1200, title: 'MILHO E PASTEL', praia: 4, kind: 'corn' },
  { x0: 1200, x1: 1400, title: 'QUADRA DE FUTEVÔLEI', praia: 5, kind: 'volei' },
  { x0: 1400, x1: 1700, title: 'AMBULANTES', praia: 6, kind: 'ambulantes' },
  // A faixa grande (Praia 7): abre inteira com a Escolinha, de 1700 a FAIXA_FIM; os lotes 8 e 9 ficam dentro dela
  { x0: 1700, x1: 2000, title: 'ESCOLINHA DE SURF', praia: 7, kind: 'surf' },
  { x0: 2000, x1: 2300, title: 'SUCOS E VITAMINAS', praia: 8, faixa: true },
  { x0: 2300, x1: 2600, title: 'PALCO DE PAGODE', praia: 9, faixa: true },
  { x0: 2600, x1: 2900, title: 'TORNEIO DE FUTEVÔLEI', praia: 10, kind: 'volei' },
];
/** A faixa grande vai da Escolinha (lote 7) até o fim do lote 9. */
export const FAIXA = { lote: 6, fim: 2600 };

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
};
export const BOX_SORVETES = 6, BOX_MAX_CARRY = 3;

export interface Shop {
  kind: 'counter' | 'kiosk' | 'servico' | 'atracao' | 'ambulante' | 'escola'; name: string; cx: number; products: Item[]; side: number; base: number; spawnX: number;
  counter: Rect; drop: Rect; cash: { x: number; y: number };
}
export const SHOPS: Shop[] = [
  { kind: 'counter', name: 'BARRACA DO SOL', cx: 200, products: ['acai', 'coco'], side: -1, base: 1500, spawnX: -24,
    counter: { x: 200, y: 300, w: 200, h: 40 }, drop: { x: 200, y: 360, w: 104, h: 44 }, cash: { x: 296, y: 362 } },
  { kind: 'kiosk', name: 'SORVETERIA', cx: 500, products: ['sorvete'], side: 1, base: 1600, spawnX: 780,
    counter: { x: 500, y: 298, w: 92, h: 44 }, drop: { x: 500, y: 362, w: 92, h: 40 }, cash: { x: 574, y: 364 } },
  // Praia 3: serviço. O "drop" é o registro da caixa d'água; as regras ficam em SERVICO
  { kind: 'servico', name: 'CHUVEIRÃO', cx: 740, products: [], side: 1, base: 1800, spawnX: 0,
    counter: { x: 740, y: 296, w: 240, h: 30 }, drop: { x: 840, y: 372, w: 84, h: 44 }, cash: { x: 676, y: 392 } },
  // Praia 4: venda com preparo. Balcão comum; o milho e o pastel saem das panelas (PREPARO)
  { kind: 'counter', name: 'MILHO E PASTEL', cx: 1050, products: ['milho', 'pastel'], side: 1, base: 1500, spawnX: 1460,
    counter: { x: 1050, y: 300, w: 200, h: 40 }, drop: { x: 1050, y: 360, w: 104, h: 44 }, cash: { x: 1146, y: 362 } },
  // Área 5: atração. Não vende: "counter" é a quadra (enfeites e comemoração); drop e caixa não são usados
  { kind: 'atracao', name: 'QUADRA', cx: 1300, products: [], side: 1, base: 0, spawnX: 0,
    counter: { x: 1300, y: 236, w: 160, h: 104 }, drop: { x: 1300, y: 372, w: 0, h: 0 }, cash: { x: 1300, y: 372 } },
  // Área 6: venda automática. "counter" é o depósito; "drop" é a vaga do carrinho que está sendo abastecido (AMBULANTE)
  { kind: 'ambulante', name: 'AMBULANTES', cx: 1550, products: ['mate', 'biscoito'], side: 1, base: 0, spawnX: 0,
    counter: { x: 1550, y: 296, w: 160, h: 40 }, drop: { x: 1550, y: 372, w: 100, h: 44 }, cash: { x: 1640, y: 372 } },
  // Área 7: serviço com fila. "counter" é a arara das pranchas; "drop" é onde se pendura a prancha molhada (ESCOLA)
  { kind: 'escola', name: 'ESCOLINHA DE SURF', cx: 1850, products: [], side: 1, base: 1900, spawnX: 0,
    counter: { x: 1860, y: 298, w: 170, h: 30 }, drop: { x: 1860, y: 366, w: 120, h: 44 }, cash: { x: 1960, y: 390 } },
  // Área 8: preparo e venda (como o milho): a fruta vai da caixa para a liquidificadora, o copo vai para o balcão
  { kind: 'counter', name: 'SUCOS E VITAMINAS', cx: 2150, products: ['sucoLaranja', 'sucoAcai'], side: 1, base: 1500, spawnX: 2340,
    counter: { x: 2150, y: 300, w: 200, h: 40 }, drop: { x: 2150, y: 360, w: 104, h: 44 }, cash: { x: 2246, y: 362 } },
  // Área 9: atração em evento. Não vende: "counter" é o palco
  { kind: 'atracao', name: 'PALCO DE PAGODE', cx: 2450, products: [], side: 1, base: 0, spawnX: 0,
    counter: { x: 2450, y: 236, w: 180, h: 100 }, drop: { x: 2450, y: 372, w: 0, h: 0 }, cash: { x: 2450, y: 372 } },
  // Área 10: o torneio (meta do lançamento). "counter" é a quadra do torneio
  { kind: 'atracao', name: 'TORNEIO', cx: 2750, products: [], side: 1, base: 0, spawnX: 0,
    counter: { x: 2750, y: 236, w: 170, h: 104 }, drop: { x: 2750, y: 372, w: 0, h: 0 }, cash: { x: 2750, y: 372 } },
];

/** Área 9: de tempos em tempos um show junta multidão e multiplica a chegada de clientes em todas as áreas, só durante o show.
    intervalo = max(intervaloMin, intervaloMs - intervaloMenos × "intervalo"); show = showMs + showMais × "showLongo";
    bônus do show = (bonus + bonusPorNivel × "bonusShow") × marco do palco. "somMelhor" é só visual. */
export const PALCO = { intervaloMs: 240000, intervaloMenos: 25000, intervaloMin: 120000, showMs: 60000, showMais: 15000, bonus: 0.5, bonusPorNivel: 0.15 };

/** Área 10: 3 etapas em ordem. Cada uma é uma compra e uma partida de partidaMs; vencida, dá um troféu, que soma
    bonusTrofeu de público para sempre (nesta e nas próximas praias). Arquibancada e patrocínio somam público como a quadra. */
export const TORNEIO = { etapas: ['Classificatória', 'Semifinal', 'Final'], partidaMs: [40000, 55000, 70000], bonusTrofeu: 0.15, arquibT: 0.08, patrocinio: 0.06 };

/** Área 6: os carrinhos de isopor. O jogador abastece o carrinho parado na vaga; cheio, ele sai com um vendedor pela
    faixa de cima da areia (a dos clientes, onde o jogador não anda), vende sozinho e volta vazio. */
export const AMBULANTE = {
  vagas: [{ x: 1550, y: 410 }, { x: 1495, y: 410 }, { x: 1440, y: 410 }, { x: 1605, y: 410 }, { x: 1440, y: 446 }, { x: 1500, y: 446 }],
  rotaY: 196, rotaX0: 40, // anda até x = 40 e volta, vendendo
  isoporBase: 6, isoporPorNivel: 3, // itens por carrinho: isoporBase + isoporPorNivel × "isopor"
  velocidade: 1.7, rapidoPorNivel: 0.25, // carrinho mais rápido: velocidade × (1 + rapidoPorNivel × "carrinhoRapido")
  vendaMs: 1300, // uma venda a cada vendaMs ÷ público, enquanto anda
};

/** Área 7: pranchas e arara. A prancha seca vai com o aluno para o mar e volta molhada para a areia (em `molhadas`);
    molhada não é alugada. Pendurada na arara, seca em secarMs. A arara guarda araraBase + araraPorNivel × "arara" pranchas. */
export const ESCOLA = {
  filaX: 1760, filaMax: 5,
  pranchasBase: 2, araraBase: 3, araraPorNivel: 2,
  aulaMs: 5000, secarMs: 3500, precoAula: 60,
  molhadas: [{ x: 1760, y: 580 }, { x: 1830, y: 580 }, { x: 1900, y: 580 }, { x: 1970, y: 580 }, { x: 1760, y: 650 }, { x: 1830, y: 650 }, { x: 1900, y: 650 }, { x: 1970, y: 650 }],
  maxPranchas: 8,
};

/** Área 5: o jogo na quadra junta público e aumenta a chegada de clientes em todas as outras áreas.
    publico = 1 + (aberta + por nível de cada melhoria) × marco da quadra; com a quadra fechada, 1. */
export const ATRACAO = { aberta: 0.15, arquibancada: 0.1, rede: 0.06, torneio: 0.15 };

/** Praia 3: chuveirão (fila, banho, caixa d'água) e cadeiras de aluguel. */
export const SERVICO = {
  chuveiros: [{ x: 660, y: 296 }, { x: 760, y: 296 }], // o 2º entra com a melhoria "chuveiro2"
  filaX: 710, filaMax: 5,
  banhoMs: 2400, precoBanho: 8, // banhos por caixa: aguaBase + aguaPorNivel × "caixaAgua"
  aguaBase: 5, aguaPorNivel: 4, encherMs: 110, // no registro, 1 banho de água a cada encherMs
  cadeiras: [{ x: 650, y: 572 }, { x: 715, y: 572 }, { x: 780, y: 572 }, { x: 845, y: 572 }, { x: 650, y: 652 }, { x: 715, y: 652 }, { x: 780, y: 652 }, { x: 845, y: 652 }],
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
  maq2: { x: 290, y: 470 }, sombra: { x: 40, y: 446 }, voce: { x: 350, y: 696 }, equipe: { x: 200, y: 690 }, coco: { x: 110, y: 612 },
  cardapio: { x: 92, y: 372 }, turbo: { x: 200, y: 470 }, coco2: { x: 290, y: 612 }, praia: { x: 52, y: 704 }, // nova praia: no canto, fora do caminho do trabalho
  fence: { x: 360, y: 548 }, cardapioS: { x: 450, y: 440 }, frzUp: { x: 550, y: 440 }, equipeS: { x: 446, y: 690 }, extraS: { x: 554, y: 690 }, cofre0: { x: 344, y: 410 },
  // Praia 3 (lote 600-900)
  fence2: { x: 560, y: 548 }, cadeiras: { x: 740, y: 480 }, salva: { x: 760, y: 712 }, cofre2: { x: 640, y: 712 }, caixaAgua: { x: 850, y: 460 }, chuveiro2: { x: 766, y: 412 }, aluguel: { x: 650, y: 480 },
  // Praia 4 (lote 900-1200)
  fence3: { x: 860, y: 548 }, pastel: { x: 1150, y: 470 }, panela2: { x: 1050, y: 612 }, cozinheiro: { x: 1150, y: 700 }, panelaUp: { x: 1050, y: 712 }, fritaUp: { x: 1150, y: 612 }, cardapioM: { x: 960, y: 372 }, cofre3: { x: 1094, y: 410 },
  // Área 5 (lote 1200-1400); o quadro de abrir fica na cerca, no fim do lote do milho
  fence4: { x: 1166, y: 410 }, arquib: { x: 1250, y: 520 }, rede: { x: 1350, y: 520 }, torneio: { x: 1300, y: 660 },
  // Área 6 (lote 1400-1700); o quadro de abrir fica na cerca, no fim do lote da quadra
  fence5: { x: 1366, y: 620 }, cardapioA: { x: 1440, y: 630 }, carrinhos: { x: 1550, y: 630 }, isopor: { x: 1660, y: 630 },
  equipeA: { x: 1450, y: 712 }, rapidoA: { x: 1550, y: 712 }, cofre5: { x: 1675, y: 425 },
  // Área 7 (lote 1700-2000, começo da faixa grande)
  fence6: { x: 1670, y: 712 }, pranchas: { x: 1750, y: 470 }, arara: { x: 1860, y: 470 }, cofre6: { x: 1965, y: 470 },
  instrutor: { x: 1760, y: 720 }, aulaUp: { x: 1960, y: 720 },
  // Área 8 (lote 2000-2300, na faixa: o quadro de abrir fica no meio do lote)
  abreSucos: { x: 2150, y: 560 }, liqui2: { x: 2250, y: 470 }, barman: { x: 2250, y: 700 }, copoMaior: { x: 2150, y: 712 }, liquiRapida: { x: 2250, y: 612 },
  cardapioJ: { x: 2060, y: 372 }, cofre7: { x: 2194, y: 410 },
  // Área 9 (lote 2300-2600, na faixa)
  abrePalco: { x: 2450, y: 560 }, showLongo: { x: 2370, y: 520 }, intervalo: { x: 2450, y: 640 }, bonusShow: { x: 2530, y: 520 }, somMelhor: { x: 2450, y: 720 },
  // Área 10 (lote 2600-2900); o quadro de abrir fica na cerca, no fim da faixa
  fence9: { x: 2566, y: 640 }, arquibT: { x: 2680, y: 520 }, etapa: { x: 2750, y: 640 }, patroc: { x: 2830, y: 520 },
};

export const UMBRELLA_POS = [{ x: 64, y: 226 }, { x: 336, y: 226 }, { x: 316, y: 158 }, { x: 40, y: 168 }];
export const PHRASES = ['Valeu, chefe!', 'Capricha!', 'Bom demais!', 'Tá caro, hein!', 'Que delícia!', 'Volto amanhã!', 'Top!', 'Gelado demais!', 'Mais um!'];
export const SHIRTS = ['#ff6b6b', '#4dabf7', '#ffd43b', '#69db7c', '#f783ac', '#ff922b', '#9775fa', '#38d9a9'];
export const SKINS = ['#f1c6a0', '#d9a37a', '#a8714c', '#7a4b2e', '#e8b48e'];
