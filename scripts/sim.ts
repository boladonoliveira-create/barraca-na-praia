/* Relatório do simulador de economia: npm run sim [praias] [--perfeito] */
import { simular, foraDaFaixa } from '../src/core/simulador.ts';

const n = Number(process.argv[2]) || 2, humano = !process.argv.includes('--perfeito'), r = simular({ praias: n, humano });
console.log(humano ? 'Bot humano' : 'Bot perfeito');
for (const c of r.compras) console.log(`Praia ${c.praia + 1}  #${String(c.indice + 1).padStart(2)}  ${c.segundos.toFixed(1).padStart(6)} s  ${c.nome}${c.preco ? ' (R$ ' + c.preco + ')' : ''}`);
for (const p of r.praias) console.log(`Praia ${p.praia + 1} completa em ${(p.segundos / 60).toFixed(1)} min`);
const erros = foraDaFaixa(r);
console.log(erros.length ? `\nFora da faixa da seção 8 (${erros.length}):\n  ` + erros.join('\n  ') : '\nTudo dentro da faixa da seção 8.');
