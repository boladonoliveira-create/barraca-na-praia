import { ACAI_NAMES, SORV_NAMES, MILHO_NAMES, BASE_PLAN, SORV_PLAN, SORV_AT, SERV_PLAN, SERV_AT, PREP_PLAN, PREP_AT, ECONOMIA as E, type PlanStep } from '../dados/planos.ts';

export interface Step { k: 'build' | 'up'; id: string; name: string; slot: string; price: number }

/** Preço da compra i na praia b: base × cresce^i × praia^b, em múltiplos de 5. */
export const stepPrice = (i: number, b: number) => Math.round(E.base * Math.pow(E.cresce, i) * Math.pow(E.praia, b) / 5) * 5;

export function makePlan(b: number): Step[] {
  const list: PlanStep[] = BASE_PLAN.map(s => [...s]);
  if (b >= 1) SORV_PLAN.forEach((s, i) => list.splice(Math.min(SORV_AT[i], list.length), 0, [...s]));
  if (b >= 2) SERV_PLAN.forEach((s, i) => list.splice(Math.min(SERV_AT[i], list.length), 0, [...s]));
  if (b >= 3) PREP_PLAN.forEach((s, i) => list.splice(Math.min(PREP_AT[i], list.length), 0, [...s]));
  const tail: PlanStep[] = [['up', 'turbo', 'Máquinas turbo', 'turbo'], ['up', 'cardapio', '#A', 'cardapio']];
  if (b >= 1) tail.push(['up', 'cardapioS', '#S', 'cardapioS']);
  if (b >= 2) tail.push(['up', 'aluguel', 'Aluguel mais caro', 'aluguel']);
  if (b >= 3) tail.push(['up', 'cardapioM', '#M', 'cardapioM']);
  for (let r = 0; list.length < 80; r++) list.push([...tail[r % tail.length]]);
  const cnt: Record<string, number> = {};
  return list.map(([k, id, name, slot], i) => {
    const n = cnt[id] = (cnt[id] || 0) + 1;
    if (name === '#A') name = ACAI_NAMES[n - 1] || ('Cardápio caprichado ' + n);
    else if (name === '#S') name = SORV_NAMES[n - 1] || ('Sorvete caprichado ' + n);
    else if (name === '#M') name = MILHO_NAMES[n - 1] || ('Milho caprichado ' + n);
    else if (id === 'aluguel' && n > 2) name = 'Aluguel mais caro ' + n;
    else if (id === 'turbo' && n > 1) name = 'Máquinas turbo ' + n;
    return { k, id, name, slot, price: stepPrice(i, b) };
  });
}

export function fmt(n: number) {
  n = Math.floor(n);
  return n >= 10000 ? (n / 1000).toFixed(n >= 100000 ? 0 : 1).replace('.', ',') + ' mil' : String(n);
}
