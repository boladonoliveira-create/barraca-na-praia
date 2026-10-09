/* Planos de compra. Cada passo: [tipo, id, nome ('#A'/'#S' = nome do cardápio), slot no chão]. */
export type PlanStep = [kind: 'build' | 'up', id: string, name: string, slot: string];

export const ACAI_NAMES = ['Açaí com granola', 'Leite condensado', 'Morango no açaí', 'Paçoca no açaí', 'Açaí completo'];
export const SORV_NAMES = ['Duas bolas', 'Três bolas', 'Granulado', 'Cereja no topo'];

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

export const PRESTIGE_AFTER = 14;
