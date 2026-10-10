import { ACAI_NAMES, SORV_NAMES, MILHO_NAMES, AMB_NAMES, TRILHAS, CAUDAS, AJUDANTE, ECONOMIA as E } from '../dados/planos.ts';

export interface Step { k: 'build' | 'up'; id: string; name: string; slot: string; price: number }

/** Preço do passo k da trilha da área a na praia b, em múltiplos de 5.
    Áreas 2 a 4: o passo 0 abre a área e custa abrir[a]; as melhorias seguem base[a] × cresce[a]^(k-1).
    Barraca do Sol (já aberta): base[0] × cresce[0]^k. Tudo × praia^b. */
export function stepPrice(a: number, k: number, b: number) {
  const p = a === 0 ? E.base[0] * Math.pow(E.cresce[0], k) : k === 0 ? E.abrir[a] : E.base[a] * Math.pow(E.cresce[a], k - 1);
  return Math.round(p * Math.pow(E.praia, b) / 5) * 5;
}

/** Trilha completa da área a na praia b: a lista fixa e depois a cauda repetida (60 passos).
    rapido (começo rápido): o 1º ajudante e o cofre vão para logo depois da abertura, com preço 0 (o jogo os aplica sozinho),
    e o resto custa ECONOMIA.antiga do preço (área antiga volta a funcionar logo no começo da praia). */
export function makeTrilha(a: number, b: number, rapido = false): Step[] {
  const list = TRILHAS[a].map(s => [...s] as typeof s);
  for (let r = 0; list.length < 60; r++) list.push([...CAUDAS[a][r % CAUDAS[a].length]]);
  const cnt: Record<string, number> = {};
  const steps = list.map(([k, id, name, slot], i): Step => {
    const n = cnt[id] = (cnt[id] || 0) + 1, extra = n > 1 && !/\d$/.test(name) ? ' ' + n : '';
    if (name === '#A') name = ACAI_NAMES[n - 1] || ('Cardápio caprichado ' + n);
    else if (name === '#S') name = SORV_NAMES[n - 1] || ('Sorvete caprichado ' + n);
    else if (name === '#M') name = MILHO_NAMES[n - 1] || ('Milho caprichado ' + n);
    else if (name === '#B') name = AMB_NAMES[n - 1] || ('Combo caprichado ' + n);
    else if (i >= TRILHAS[a].length) name = name.replace(/ \d+$/, '') + extra; // cauda: numera de novo
    return { k, id, name, slot, price: stepPrice(a, i, b) };
  });
  if (!rapido) return steps;
  const gratis = [AJUDANTE[a], 'cofre' + a].map(id => steps.findIndex(s => s.id === id)).filter(i => i >= 0);
  const resto = steps.filter((_, i) => !gratis.includes(i)).map(s => ({ ...s, price: Math.round(s.price * E.antiga / 5) * 5 })), ini = a === 0 ? 0 : 1;
  resto.splice(ini, 0, ...gratis.map(i => ({ ...steps[i], price: 0 })));
  return resto;
}

export function fmt(n: number) {
  n = Math.floor(n);
  return n >= 10000 ? (n / 1000).toFixed(n >= 100000 ? 0 : 1).replace('.', ',') + ' mil' : String(n);
}
