/* Relatório do simulador de economia: npm run sim [--perfeito] [semente] */
import { simular, foraDaFaixa } from '../src/core/simulador.ts';
import { AREAS } from '../src/dados/planos.ts';

const humano = !process.argv.includes('--perfeito'), seed = Number(process.argv.find(a => /^\d+$/.test(a))) || 1;
const r = simular({ humano, seed });
console.log((humano ? 'Bot humano' : 'Bot perfeito') + ', semente ' + seed);
for (const c of r.compras) console.log(`Fase ${c.fase + 1}  ${c.segundos.toFixed(1).padStart(6)} s  ${AREAS[c.area].padEnd(15)} nv ${String(c.nivel).padStart(2)}  ${c.nome} (R$ ${c.preco})`);
r.fases.forEach((m, n) => console.log(`${AREAS[n + 1]} abriu ${m.toFixed(1)} min depois da anterior`));
console.log(`4 áreas abertas em ${r.total.toFixed(1)} min`);
const erros = foraDaFaixa(r);
console.log(erros.length ? `\nFora da faixa (${erros.length}):\n  ` + erros.join('\n  ') : '\nTudo dentro da faixa.');
