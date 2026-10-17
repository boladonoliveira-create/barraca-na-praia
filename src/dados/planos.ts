/* Trilhas de compra: cada área da praia tem a sua, independente das outras (GDD seção 8).
   Cada passo: [tipo, id, nome ('#A'/'#S'/'#M' = nome do cardápio), slot no chão, dentro da área]. */
export type PlanStep = [kind: 'build' | 'up', id: string, name: string, slot: string];

/** Capacidade real da mochila em cada uma das quatro melhorias. */
export const BOLSA_CAPACIDADES = [8, 12, 16, 24, 32];

export const ACAI_NAMES = ['Açaí com granola', 'Leite condensado', 'Morango no açaí', 'Paçoca no açaí', 'Açaí completo'];
export const SORV_NAMES = ['Duas bolas', 'Três bolas', 'Granulado', 'Cereja no topo'];
export const MILHO_NAMES = ['Milho na manteiga', 'Pastel de queijo', 'Milho com queijo ralado', 'Pastel de carne', 'Milho completo'];
export const AMB_NAMES = ['Mate com limão', 'Combo mate e biscoito'];
export const SUCO_NAMES = ['Suco com gelo', 'Vitamina caprichada', 'Suco com hortelã', 'Combo do verão'];

/** Áreas, da esquerda para a direita. A área i é a loja SHOPS[i] e o lote LOTS[i]. */
export const AREAS = ['Barraca do Sol', 'Sorveteria', 'Chuveirão', 'Milho e Pastel', 'Quadra de futevôlei', 'Ambulantes', 'Escolinha de surf', 'Sucos e vitaminas', 'Palco de pagode', 'Torneio de futevôlei'];

/** Trilha de cada área. O primeiro passo das áreas 2 a 4 abre a área (o quadro aparece na cerca). */
export const TRILHAS: PlanStep[][] = [
  [ // 1. Barraca do Sol: começa aberta, com uma máquina de açaí
    ['build', 'maq2', 'Máquina de açaí 2', 'maq2'], ['up', 'sombras', 'Guarda-sol', 'sombra'], ['build', 'coco', 'Coqueiro', 'coco'], ['up', 'ajud', 'Ajudante', 'equipe'],
    ['up', 'cardapio', '#A', 'cardapio'], ['up', 'bolsa', 'Mochila para 12 itens', 'voce'], ['up', 'cofre0', 'Cofre automático', 'cofre0'], ['up', 'sombras', 'Mais um guarda-sol', 'sombra'],
    ['up', 'turbo', 'Máquinas turbo', 'turbo'], ['build', 'coco2', 'Coqueiro 2', 'coco2'], ['up', 'cardapio', '#A', 'cardapio'], ['up', 'ajud', 'Mais um ajudante', 'equipe'],
    ['up', 'sombras', 'Mais um guarda-sol', 'sombra'], ['up', 'turbo', 'Máquinas turbo 2', 'turbo'], ['up', 'cardapio', '#A', 'cardapio'], ['up', 'chinelo', 'Chinelo novo', 'voce'],
    ['up', 'sombras', 'Mais um guarda-sol', 'sombra'], ['up', 'turbo', 'Máquinas turbo 3', 'turbo'], ['up', 'cardapio', '#A', 'cardapio'], ['up', 'ajud', 'Mais um ajudante', 'equipe'],
    ['up', 'bolsa', 'Mochila para 16 itens', 'voce'], ['up', 'bolsa', 'Mochila para 24 itens', 'voce'], ['up', 'bolsa', 'Mochila para 32 itens', 'voce'],
  ],
  [ // 2. Sorveteria
    ['build', 'sorv', 'Sorveteria', 'fence'], ['up', 'cardapioS', '#S', 'cardapioS'], ['up', 'ajudS', 'Sorveteiro', 'equipeS'], ['up', 'freezer', 'Freezer maior', 'frzUp'],
    ['up', 'cofre1', 'Cofre automático', 'extraS'], ['up', 'cardapioS', '#S', 'cardapioS'], ['up', 'turboS', 'Depósito rápido', 'extraS'], ['up', 'freezer', 'Freezer maior 2', 'frzUp'],
    ['up', 'cardapioS', '#S', 'cardapioS'], ['up', 'ajudS', 'Mais um sorveteiro', 'equipeS'], ['up', 'cardapioS', '#S', 'cardapioS'], ['up', 'freezer', 'Freezer maior 3', 'frzUp'],
    ['up', 'turboS', 'Depósito rápido 2', 'extraS'],
  ],
  [ // 3. Chuveirão e cadeiras (serviço)
    ['build', 'servico', 'Chuveirão', 'fence2'], ['up', 'cadeiras', 'Mais cadeiras', 'cadeiras'], ['up', 'salva', 'Salva-vidas', 'salva'], ['up', 'caixaAgua', "Caixa d'água maior", 'caixaAgua'],
    ['build', 'chuveiro2', 'Mais um chuveiro', 'chuveiro2'], ['up', 'aluguel', 'Aluguel mais caro', 'aluguel'], ['up', 'cofre2', 'Cofre automático', 'cofre2'], ['up', 'banhoUp', 'Banho caprichado', 'chuveiro2'],
    ['up', 'cadeiras', 'Mais cadeiras 2', 'cadeiras'], ['up', 'caixaAgua', "Caixa d'água maior 2", 'caixaAgua'], ['up', 'aluguel', 'Aluguel mais caro 2', 'aluguel'], ['up', 'banhoUp', 'Banho caprichado 2', 'chuveiro2'],
    ['up', 'caixaAgua', "Caixa d'água maior 3", 'caixaAgua'],
  ],
  [ // 4. Milho e pastel (preparo)
    ['build', 'milho', 'Barraca do milho', 'fence3'], ['up', 'cardapioM', '#M', 'cardapioM'], ['build', 'pastel', 'Fritadeira de pastel', 'pastel'], ['up', 'cozinheiro', 'Cozinheiro', 'cozinheiro'],
    ['up', 'panelaMaior', 'Panela maior', 'panelaUp'], ['build', 'panela2', 'Mais uma panela', 'panela2'], ['up', 'fritaRapida', 'Fritadeira mais rápida', 'fritaUp'], ['up', 'cofre3', 'Cofre automático', 'cofre3'],
    ['up', 'cardapioM', '#M', 'cardapioM'], ['up', 'panelaMaior', 'Panela maior 2', 'panelaUp'], ['up', 'fritaRapida', 'Fritadeira mais rápida 2', 'fritaUp'], ['up', 'cardapioM', '#M', 'cardapioM'],
    ['up', 'cozinheiro', 'Mais um cozinheiro', 'cozinheiro'],
  ],
  [ // 5. Quadra de futevôlei (atração: não vende, traz público para todas as áreas)
    ['build', 'quadra', 'Quadra de futevôlei', 'fence4'], ['up', 'arquibancada', 'Arquibancada', 'arquib'], ['up', 'rede', 'Rede nova', 'rede'], ['up', 'torneio', 'Torneio da tarde', 'torneio'],
    ['up', 'arquibancada', 'Arquibancada maior', 'arquib'], ['up', 'rede', 'Rede de campeonato', 'rede'], ['up', 'torneio', 'Torneio da tarde 2', 'torneio'], ['up', 'arquibancada', 'Arquibancada maior 2', 'arquib'],
  ],
  [ // 6. Ambulantes (venda automática): o jogador leva as caixas do caminhão à bancada; o ajudante do caminhão automatiza
    ['build', 'ambulantes', 'Ambulantes', 'fence5'], ['up', 'cardapioA', '#B', 'cardapioA'], ['up', 'gerente', 'Ajudante do caminhão', 'equipeA'], ['up', 'isopor', 'Isopor maior', 'isopor'],
    ['up', 'carrinhos', 'Mais um ambulante', 'carrinhos'], ['build', 'biscoito', 'Biscoito de polvilho', 'cardapioA'], ['up', 'carrinhoRapido', 'Carrinho mais rápido', 'rapidoA'], ['up', 'cofre5', 'Cofre automático', 'cofre5'],
    ['up', 'cardapioA', '#B', 'cardapioA'], ['up', 'carrinhos', 'Mais um ambulante 2', 'carrinhos'], ['up', 'isopor', 'Isopor maior 2', 'isopor'], ['up', 'carrinhoRapido', 'Carrinho mais rápido 2', 'rapidoA'],
    ['up', 'carrinhos', 'Mais um ambulante 3', 'carrinhos'],
  ],
  [ // 7. Escolinha de surf (serviço com fila): o jogador leva as pranchas molhadas à arara; o instrutor automatiza
    ['build', 'escola', 'Escolinha de surf', 'fence6'], ['up', 'pranchas', 'Mais pranchas', 'pranchas'], ['up', 'instrutor', 'Instrutor', 'instrutor'], ['up', 'arara', 'Arara maior', 'arara'],
    ['up', 'aulaUp', 'Aula mais cara', 'aulaUp'], ['up', 'pranchas', 'Mais pranchas 2', 'pranchas'], ['up', 'cofre6', 'Cofre automático', 'cofre6'], ['up', 'arara', 'Arara maior 2', 'arara'],
    ['up', 'aulaUp', 'Aula mais cara 2', 'aulaUp'], ['up', 'pranchas', 'Mais pranchas 3', 'pranchas'], ['up', 'instrutor', 'Mais um instrutor', 'instrutor'], ['up', 'aulaUp', 'Aula mais cara 3', 'aulaUp'],
    ['up', 'arara', 'Arara maior 3', 'arara'],
  ],
  [ // 8. Sucos e vitaminas (preparo e venda): fruta → liquidificadora → balcão; o barman faz o ciclo
    ['build', 'sucos', 'Sucos e vitaminas', 'abreSucos'], ['up', 'cardapioJ', '#J', 'cardapioJ'], ['build', 'liqui2', 'Liquidificadora 2', 'liqui2'], ['up', 'barman', 'Barman', 'barman'],
    ['up', 'copoMaior', 'Copo maior', 'copoMaior'], ['up', 'liquiRapida', 'Liquidificadora mais rápida', 'liquiRapida'], ['up', 'cofre7', 'Cofre automático', 'cofre7'], ['up', 'cardapioJ', '#J', 'cardapioJ'],
    ['up', 'copoMaior', 'Copo maior 2', 'copoMaior'], ['up', 'liquiRapida', 'Liquidificadora mais rápida 2', 'liquiRapida'], ['up', 'cardapioJ', '#J', 'cardapioJ'], ['up', 'barman', 'Mais um barman', 'barman'],
  ],
  [ // 9. Palco de pagode (atração em evento): o show multiplica a chegada de clientes enquanto dura
    ['build', 'palco', 'Palco de pagode', 'abrePalco'], ['up', 'showLongo', 'Show mais longo', 'showLongo'], ['up', 'intervalo', 'Mais shows', 'intervalo'], ['up', 'bonusShow', 'Bônus do show', 'bonusShow'],
    ['up', 'somMelhor', 'Som melhor', 'somMelhor'], ['up', 'showLongo', 'Show mais longo 2', 'showLongo'], ['up', 'intervalo', 'Mais shows 2', 'intervalo'], ['up', 'bonusShow', 'Bônus do show 2', 'bonusShow'],
  ],
  [ // 10. Torneio de futevôlei (meta do lançamento): 3 etapas em ordem; cada troféu dá público para sempre
    ['build', 'arena', 'Arena do torneio', 'fence9'], ['up', 'arquibT', 'Arquibancada do torneio', 'arquibT'], ['up', 'etapa1', 'Classificatória', 'etapa'], ['up', 'patrocinio', 'Patrocínio', 'patroc'],
    ['up', 'etapa2', 'Semifinal', 'etapa'], ['up', 'arquibT', 'Arquibancada do torneio 2', 'arquibT'], ['up', 'etapa3', 'Final', 'etapa'],
  ],
];
/** Depois da trilha fixa, cada área repete estas melhorias para sempre ter o que comprar. */
export const CAUDAS: PlanStep[][] = [
  [['up', 'turbo', 'Máquinas turbo', 'turbo'], ['up', 'cardapio', '#A', 'cardapio']],
  [['up', 'cardapioS', '#S', 'cardapioS'], ['up', 'turboS', 'Depósito rápido', 'extraS'], ['up', 'freezer', 'Freezer maior', 'frzUp']],
  [['up', 'aluguel', 'Aluguel mais caro', 'aluguel'], ['up', 'banhoUp', 'Banho caprichado', 'chuveiro2'], ['up', 'caixaAgua', "Caixa d'água maior", 'caixaAgua']],
  [['up', 'cardapioM', '#M', 'cardapioM'], ['up', 'fritaRapida', 'Fritadeira mais rápida', 'fritaUp'], ['up', 'panelaMaior', 'Panela maior', 'panelaUp']],
  [['up', 'torneio', 'Torneio da tarde', 'torneio'], ['up', 'arquibancada', 'Arquibancada maior', 'arquib'], ['up', 'rede', 'Rede de campeonato', 'rede']],
  [['up', 'cardapioA', '#B', 'cardapioA'], ['up', 'isopor', 'Isopor maior', 'isopor'], ['up', 'carrinhoRapido', 'Carrinho mais rápido', 'rapidoA']],
  [['up', 'aulaUp', 'Aula mais cara', 'aulaUp'], ['up', 'arara', 'Arara maior', 'arara'], ['up', 'pranchas', 'Mais pranchas', 'pranchas']],
  [['up', 'cardapioJ', '#J', 'cardapioJ'], ['up', 'liquiRapida', 'Liquidificadora mais rápida', 'liquiRapida'], ['up', 'copoMaior', 'Copo maior', 'copoMaior']],
  [['up', 'bonusShow', 'Bônus do show', 'bonusShow'], ['up', 'showLongo', 'Show mais longo', 'showLongo'], ['up', 'somMelhor', 'Som melhor', 'somMelhor']],
  [['up', 'arquibT', 'Arquibancada do torneio', 'arquibT'], ['up', 'patrocinio', 'Patrocínio', 'patroc']],
];

/** A área N+1 abre (o quadro aparece na cerca) quando a área N chega a este nível. */
export const NIVEL_ABRE = 5;
/** Nestes níveis a área dobra a produção (o dinheiro que ela gera) e muda de visual. */
export const MARCOS = [5, 10, 15, 20];
/** Nova praia: o quadro dourado aparece quando a área nova da praia (a área N na praia N) chega a este nível. */
export const NIVEL_NOVA_PRAIA = 10;
/** O 1º ajudante de cada área (começo rápido: vem de graça, com o cofre, a partir da Praia 3). */
export const AJUDANTE = ['ajud', 'ajudS', 'salva', 'cozinheiro', '', 'gerente', 'instrutor', 'barman', '', ''];

/** Números da economia (GDD seção 8). Ajustados com o simulador: npm run sim. */
export const ECONOMIA = {
  abrir: [0, 6000, 130000, 450000, 1200000, 800000, 2000000, 4000000, 12000000, 18000000],  // preço de abrir cada área (o quadro na cerca), na Praia 1
  base: [110, 700, 13000, 37000, 170000, 1470000, 4575000, 9000000, 18000000, 32000000],          // preço da primeira melhoria de cada área, na Praia 1
  cresce: [1.5, 1.4, 1.3, 1.3, 1.3, 1.15, 1.15, 1.15, 1.15, 1.25],                          // cada nível custa isto vezes o anterior, dentro da área
  mochilas: [8000, 24000, 64000], // melhorias extras: 16, 24 e 32 itens, sem inflacionar a cauda antiga
  praia: 1.45,     // cada praia multiplica os preços de compra (praia^b); as vendas sobem com a fama
  viagem: [1.6, 1.6, 1.6, 1.4, 1.3, 1, 1, 0.85, 1, 1], // em cada praia, a viagem custa isto × o preço do próximo nível da área nova
  antiga: 0.2,     // começo rápido (Praia 3 em diante): as áreas antigas custam esta fração do preço
  famaK: 2000,     // fama ganha numa praia = floor(sqrt(ganho na praia / famaK))
  taxaFama: 0.07,  // lucro de todas as áreas × (1 + taxaFama × fama total)
  /** fama de quem viaja assim que o quadro libera, em cada praia (conversão do save v3; medida com o simulador) */
  famaMinima: [3, 8, 40, 95, 219, 480, 1067, 1964, 3704, 6263],
};
