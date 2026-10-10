/* Planos de compra. Cada passo: [tipo, id, nome ('#A'/'#S' = nome do cardápio), slot no chão]. */
export type PlanStep = [kind: 'build' | 'up', id: string, name: string, slot: string];

export const ACAI_NAMES = ['Açaí com granola', 'Leite condensado', 'Morango no açaí', 'Paçoca no açaí', 'Açaí completo'];
export const SORV_NAMES = ['Duas bolas', 'Três bolas', 'Granulado', 'Cereja no topo'];
export const MILHO_NAMES = ['Milho na manteiga', 'Pastel de queijo', 'Milho com queijo ralado', 'Pastel de carne', 'Milho completo'];

export const BASE_PLAN: PlanStep[] = [
  ['build', 'maq2', 'Máquina de açaí 2', 'maq2'], ['up', 'sombras', 'Guarda-sol', 'sombra'], ['build', 'coco', 'Coqueiro', 'coco'], ['up', 'ajud', 'Ajudante', 'equipe'],
  ['up', 'cardapio', '#A', 'cardapio'], ['up', 'bolsa', 'Bolsa maior', 'voce'], ['up', 'sombras', 'Mais um guarda-sol', 'sombra'], ['up', 'turbo', 'Máquinas turbo', 'turbo'],
  ['build', 'coco2', 'Coqueiro 2', 'coco2'], ['up', 'cardapio', '#A', 'cardapio'], ['up', 'ajud', 'Mais um ajudante', 'equipe'], ['up', 'sombras', 'Mais um guarda-sol', 'sombra'],
  ['up', 'turbo', 'Máquinas turbo 2', 'turbo'], ['up', 'cardapio', '#A', 'cardapio'], ['up', 'chinelo', 'Chinelo novo', 'voce'], ['up', 'sombras', 'Mais um guarda-sol', 'sombra'],
  ['up', 'turbo', 'Máquinas turbo 3', 'turbo'], ['up', 'cardapio', '#A', 'cardapio'], ['up', 'ajud', 'Mais um ajudante', 'equipe'], ['up', 'cardapio', '#A', 'cardapio'],
];

export const SORV_PLAN: PlanStep[] = [
  ['build', 'sorv', 'Quiosque de sorvete', 'fence'], ['up', 'cardapioS', '#S', 'cardapioS'], ['up', 'ajudS', 'Sorveteiro', 'equipeS'], ['up', 'freezer', 'Freezer maior', 'frzUp'],
  ['up', 'cardapioS', '#S', 'cardapioS'], ['up', 'freezer', 'Freezer maior 2', 'frzUp'], ['up', 'cardapioS', '#S', 'cardapioS'],
];
// posições onde o plano do sorvete entra na lista base (a partir da Praia 2)
export const SORV_AT = [3, 6, 9, 12, 15, 18, 21];

// Praia 3: serviço. O chuveirão é construído no fim do lote do sorvete (por isso vem depois dele no plano)
export const SERV_PLAN: PlanStep[] = [
  ['build', 'servico', 'Chuveirão', 'fence2'], ['up', 'cadeiras', 'Mais cadeiras', 'cadeiras'], ['up', 'salva', 'Salva-vidas', 'salva'],
  ['up', 'caixaAgua', "Caixa d'água maior", 'caixaAgua'], ['build', 'chuveiro2', 'Mais um chuveiro', 'chuveiro2'], ['up', 'aluguel', 'Aluguel mais caro', 'aluguel'],
  ['up', 'cadeiras', 'Mais cadeiras 2', 'cadeiras'], ['up', 'caixaAgua', "Caixa d'água maior 2", 'caixaAgua'], ['up', 'aluguel', 'Aluguel mais caro 2', 'aluguel'],
];
export const SERV_AT = [4, 6, 9, 11, 14, 17, 20, 23, 26];

// Praia 4: venda com preparo. A barraca do milho é construída no fim do lote do chuveirão
export const PREP_PLAN: PlanStep[] = [
  ['build', 'milho', 'Barraca do milho', 'fence3'], ['up', 'cardapioM', '#M', 'cardapioM'], ['build', 'pastel', 'Fritadeira de pastel', 'pastel'],
  ['up', 'cozinheiro', 'Cozinheiro', 'cozinheiro'], ['up', 'panelaMaior', 'Panela maior', 'panelaUp'], ['build', 'panela2', 'Mais uma panela', 'panela2'],
  ['up', 'fritaRapida', 'Fritadeira mais rápida', 'fritaUp'], ['up', 'cardapioM', '#M', 'cardapioM'], ['up', 'panelaMaior', 'Panela maior 2', 'panelaUp'],
];
export const PREP_AT = [6, 8, 10, 12, 15, 18, 21, 24, 27];

export const PRESTIGE_AFTER = 14;

/** Números da economia (GDD seção 8). Ajustados com o simulador: npm run sim. */
export const ECONOMIA = {
  base: 100,       // preço da compra 0 na Praia 1
  cresce: 1.31,    // cada compra custa isto vezes a anterior
  praia: 1.5,      // cada praia multiplica preços de compra e de venda
  novaPraia: 4000, // custo da nova praia (× praia^b)
};
