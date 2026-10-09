/* Mapa: uma praia, vários lotes. Coordenadas do mundo em unidades do canvas lógico (400 x 760). */
export const W = 400, H = 760, WORLD_W = 1200;
export const SHORE = 118, WALL_Y = 326, PLAY_BOTTOM = 742;

export interface Rect { x: number; y: number; w: number; h: number }
export interface Lot { x0: number; x1: number; title?: string; praia?: number; kind?: string }
export type Item = 'acai' | 'coco' | 'sorvete' | 'caixa';

export const LOTS: Lot[] = [
  { x0: 0, x1: 400 },
  { x0: 400, x1: 600, title: 'QUIOSQUE DE SORVETE', praia: 2 },
  { x0: 600, x1: 900, title: 'CHUVEIRÃO E CADEIRAS', praia: 3, kind: 'shower' },
  { x0: 900, x1: 1200, title: 'MILHO E PASTEL', praia: 4, kind: 'corn' },
];

// price 0 = não é vendido; rate 0 = não sai de máquina
export const PRODUCTS: Record<Item, { price: number; rate: number; shop: number }> = {
  acai: { price: 6, rate: 900, shop: 0 },
  coco: { price: 10, rate: 1400, shop: 0 },
  sorvete: { price: 12, rate: 0, shop: 1 },
  caixa: { price: 0, rate: 1800, shop: 1 },
};
export const BOX_SORVETES = 6, BOX_MAX_CARRY = 3;

export interface Shop {
  kind: 'counter' | 'kiosk'; name: string; cx: number; products: Item[]; side: number; base: number; spawnX: number;
  counter: Rect; drop: Rect; cash: { x: number; y: number };
}
export const SHOPS: Shop[] = [
  { kind: 'counter', name: 'BARRACA DO SOL', cx: 200, products: ['acai', 'coco'], side: -1, base: 1500, spawnX: -24,
    counter: { x: 200, y: 300, w: 200, h: 40 }, drop: { x: 200, y: 360, w: 104, h: 44 }, cash: { x: 296, y: 362 } },
  { kind: 'kiosk', name: 'SORVETE', cx: 500, products: ['sorvete'], side: 1, base: 1600, spawnX: 780,
    counter: { x: 500, y: 298, w: 92, h: 44 }, drop: { x: 500, y: 362, w: 92, h: 40 }, cash: { x: 574, y: 364 } },
];
export const CASH_MAGNET = 72, COUNTER_CAP = 20;

export const BEACHES = [
  { n: 'Praia do Sol', sea: ['#0f7f99', '#33c2c9'] }, { n: 'Praia Grande', sea: ['#155f9e', '#3aa0d8'] }, { n: 'Praia do Farol', sea: ['#0d7a6a', '#2fc4a4'] },
  { n: 'Praia Dourada', sea: ['#1c5a8a', '#5fb7d6'] }, { n: 'Ilha do Coqueiro', sea: ['#0a6d84', '#26d0ce'] },
];

export const SLOTS: Record<string, { x: number; y: number }> = {
  maq2: { x: 290, y: 470 }, sombra: { x: 40, y: 446 }, voce: { x: 350, y: 696 }, equipe: { x: 200, y: 690 }, coco: { x: 110, y: 612 },
  cardapio: { x: 92, y: 372 }, turbo: { x: 200, y: 470 }, coco2: { x: 290, y: 612 }, praia: { x: 200, y: 548 },
  fence: { x: 360, y: 548 }, cardapioS: { x: 450, y: 440 }, frzUp: { x: 550, y: 440 }, equipeS: { x: 500, y: 690 },
};

export const UMBRELLA_POS = [{ x: 64, y: 226 }, { x: 336, y: 226 }, { x: 316, y: 158 }, { x: 40, y: 168 }];
export const PHRASES = ['Valeu, chefe!', 'Capricha!', 'Bom demais!', 'Tá caro, hein!', 'Que delícia!', 'Volto amanhã!', 'Top!', 'Gelado demais!', 'Mais um!'];
export const SHIRTS = ['#ff6b6b', '#4dabf7', '#ffd43b', '#69db7c', '#f783ac', '#ff922b', '#9775fa', '#38d9a9'];
export const SKINS = ['#f1c6a0', '#d9a37a', '#a8714c', '#7a4b2e', '#e8b48e'];
