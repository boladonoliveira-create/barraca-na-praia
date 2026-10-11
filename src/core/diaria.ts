/* Recompensa diária: um calendário de 7 dias. Sem DOM: a data entra como texto 'AAAA-MM-DD' (os testes simulam). */
export type Premio = { tipo: 'dinheiro'; min: number } | { tipo: 'turbo'; x: number; min: number } | { tipo: 'fama'; pct: number };

/** O prêmio de cada dia (índice 0 = dia 1). Dinheiro: minutos de lucro da praia atual. Turbo: o dinheiro multiplicado por x. */
export const PREMIOS: Premio[] = [
  { tipo: 'dinheiro', min: 3 },
  { tipo: 'turbo', x: 2, min: 5 },
  { tipo: 'dinheiro', min: 5 },
  { tipo: 'turbo', x: 2, min: 10 },
  { tipo: 'dinheiro', min: 8 },
  { tipo: 'turbo', x: 3, min: 5 },
  { tipo: 'fama', pct: 0.1 },
];

/** ultimo: a data em que pegou pela última vez; dia: o dia do calendário que pegou nela (0 = nunca pegou). */
export interface Diaria { ultimo: string | null; dia: number }

const diasEntre = (a: string, b: string) => Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 86400000);

/** O dia do calendário (1 a 7) para pegar hoje, ou null se já pegou hoje.
    Dia seguinte: avança 1 (depois do 7, volta ao 1). Perdeu um ou mais dias: volta 1 dia (repete o último que pegou). */
export function diaDeHoje(d: Diaria, hoje: string): number | null {
  if (d.ultimo === hoje) return null;
  if (!d.ultimo) return 1;
  const gap = diasEntre(d.ultimo, hoje);
  if (gap < 0) return null; // o relógio do aparelho voltou: espera chegar o dia de novo
  return gap === 1 ? d.dia % 7 + 1 : Math.max(1, d.dia);
}

/** A data de hoje no fuso do aparelho, como 'AAAA-MM-DD'. */
export function hojeLocal(agora = new Date()) {
  const p = (n: number) => String(n).padStart(2, '0');
  return agora.getFullYear() + '-' + p(agora.getMonth() + 1) + '-' + p(agora.getDate());
}
