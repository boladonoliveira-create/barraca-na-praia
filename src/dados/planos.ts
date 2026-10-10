/* Trilhas de compra: cada área da praia tem a sua, independente das outras (GDD seção 8).
   Cada passo: [tipo, id, nome ('#A'/'#S'/'#M' = nome do cardápio), slot no chão, dentro da área]. */
export type PlanStep = [kind: 'build' | 'up', id: string, name: string, slot: string];

export const ACAI_NAMES = ['Açaí com granola', 'Leite condensado', 'Morango no açaí', 'Paçoca no açaí', 'Açaí completo'];
export const SORV_NAMES = ['Duas bolas', 'Três bolas', 'Granulado', 'Cereja no topo'];
export const MILHO_NAMES = ['Milho na manteiga', 'Pastel de queijo', 'Milho com queijo ralado', 'Pastel de carne', 'Milho completo'];

/** Áreas, da esquerda para a direita. A área i é a loja SHOPS[i] e o lote LOTS[i]. */
export const AREAS = ['Barraca do Sol', 'Sorvete', 'Chuveirão', 'Milho e Pastel', 'Quadra de futevôlei', 'Ambulantes'];

/** Trilha de cada área. O primeiro passo das áreas 2 a 4 abre a área (o quadro aparece na cerca). */
export const TRILHAS: PlanStep[][] = [
  [ // 1. Barraca do Sol: começa aberta, com uma máquina de açaí
    ['build', 'maq2', 'Máquina de açaí 2', 'maq2'], ['up', 'sombras', 'Guarda-sol', 'sombra'], ['build', 'coco', 'Coqueiro', 'coco'], ['up', 'ajud', 'Ajudante', 'equipe'],
    ['up', 'cardapio', '#A', 'cardapio'], ['up', 'bolsa', 'Bolsa maior', 'voce'], ['up', 'cofre0', 'Cofre automático', 'cofre0'], ['up', 'sombras', 'Mais um guarda-sol', 'sombra'],
    ['up', 'turbo', 'Máquinas turbo', 'turbo'], ['build', 'coco2', 'Coqueiro 2', 'coco2'], ['up', 'cardapio', '#A', 'cardapio'], ['up', 'ajud', 'Mais um ajudante', 'equipe'],
    ['up', 'sombras', 'Mais um guarda-sol', 'sombra'], ['up', 'turbo', 'Máquinas turbo 2', 'turbo'], ['up', 'cardapio', '#A', 'cardapio'], ['up', 'chinelo', 'Chinelo novo', 'voce'],
    ['up', 'sombras', 'Mais um guarda-sol', 'sombra'], ['up', 'turbo', 'Máquinas turbo 3', 'turbo'], ['up', 'cardapio', '#A', 'cardapio'], ['up', 'ajud', 'Mais um ajudante', 'equipe'],
  ],
  [ // 2. Sorvete
    ['build', 'sorv', 'Quiosque de sorvete', 'fence'], ['up', 'cardapioS', '#S', 'cardapioS'], ['up', 'ajudS', 'Sorveteiro', 'equipeS'], ['up', 'freezer', 'Freezer maior', 'frzUp'],
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
];
/** Depois da trilha fixa, cada área repete estas melhorias para sempre ter o que comprar. */
export const CAUDAS: PlanStep[][] = [
  [['up', 'turbo', 'Máquinas turbo', 'turbo'], ['up', 'cardapio', '#A', 'cardapio']],
  [['up', 'cardapioS', '#S', 'cardapioS'], ['up', 'turboS', 'Depósito rápido', 'extraS'], ['up', 'freezer', 'Freezer maior', 'frzUp']],
  [['up', 'aluguel', 'Aluguel mais caro', 'aluguel'], ['up', 'banhoUp', 'Banho caprichado', 'chuveiro2'], ['up', 'caixaAgua', "Caixa d'água maior", 'caixaAgua']],
  [['up', 'cardapioM', '#M', 'cardapioM'], ['up', 'fritaRapida', 'Fritadeira mais rápida', 'fritaUp'], ['up', 'panelaMaior', 'Panela maior', 'panelaUp']],
  [['up', 'torneio', 'Torneio da tarde', 'torneio'], ['up', 'arquibancada', 'Arquibancada maior', 'arquib'], ['up', 'rede', 'Rede de campeonato', 'rede']],
];

/** A área N+1 abre (o quadro aparece na cerca) quando a área N chega a este nível. */
export const NIVEL_ABRE = 5;
/** Nestes níveis a área dobra a produção (o dinheiro que ela gera) e muda de visual. */
export const MARCOS = [5, 10, 15, 20];
/** Nova praia: o quadro dourado aparece quando a área nova da praia (a área N na praia N) chega a este nível. */
export const NIVEL_NOVA_PRAIA = 10;
/** O 1º ajudante de cada área (começo rápido: vem de graça, com o cofre, a partir da Praia 3). */
export const AJUDANTE = ['ajud', 'ajudS', 'salva', 'cozinheiro', ''];

/** Números da economia (GDD seção 8). Ajustados com o simulador: npm run sim. */
export const ECONOMIA = {
  abrir: [0, 8500, 100000, 300000, 900000],  // preço de abrir cada área (o quadro na cerca), na Praia 1
  base: [100, 700, 8500, 26000, 120000],      // preço da primeira melhoria de cada área, na Praia 1
  cresce: [1.55, 1.4, 1.3, 1.3, 1.35],        // cada nível custa isto vezes o anterior, dentro da área
  praia: 1.45,     // cada praia multiplica os preços de compra (praia^b); as vendas sobem com a fama
  antiga: 0.2,     // começo rápido (Praia 3 em diante): as áreas antigas custam esta fração do preço
  famaK: 2000,     // fama ganha numa praia = floor(sqrt(ganho na praia / famaK))
  taxaFama: 0.07,  // lucro de todas as áreas × (1 + taxaFama × fama total)
  /** fama de quem viaja assim que o quadro libera, em cada praia (conversão do save v3; medida com o simulador) */
  famaMinima: [3, 7, 27, 65, 178],
};
