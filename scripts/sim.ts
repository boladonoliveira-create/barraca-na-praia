/* Relatório do simulador de economia: npm run sim [--perfeito] [semente ...] (sem semente: 1, 2 e 3) */
import { simular, foraDaFaixa, METAS, cadenciaInicial } from '../src/core/simulador.ts';
import { AREAS } from '../src/dados/planos.ts';

const humano = !process.argv.includes('--perfeito'), detalhe = process.argv.includes('--compras');
const sementes = process.argv.filter(a => /^\d+$/.test(a)).map(Number);
for (const seed of sementes.length ? sementes : [1, 2, 3]) {
  const r = simular({ humano, seed });
  console.log(`\n${humano ? 'Bot humano' : 'Bot perfeito'}, semente ${seed}`);
  console.log('| Praia | Minutos | Meta | Áreas antigas abertas | Maior espera | Fama ganha |');
  console.log('|---|---|---|---|---|---|');
  for (const p of r.praias) {
    if (detalhe) for (const c of p.compras) console.log(`  ${c.segundos.toFixed(1).padStart(6)} s  ${AREAS[c.area].padEnd(15)} nv ${String(c.nivel).padStart(2)}  ${c.nome} (R$ ${c.preco})`);
    console.log(`| ${p.praia} | ${p.minutos.toFixed(1)} | ${METAS[p.praia - 1].join(' a ')} | ${p.praia > 1 ? p.antigas.toFixed(0) + '%' : '-'} | ${p.maiorEspera.toFixed(0)} s | ${p.fama} |`);
  }
  if (r.praias[0]) { const c=cadenciaInicial(r.praias[0]); console.log(`Ritmo na Praia 1: ${c.antes.toFixed(1)} s/compra nos primeiros 5 min; ${c.depois.toFixed(1)} s/compra depois (inclui viagem).`) }
  console.log(`Total: ${r.total.toFixed(1)} min (${(r.total / 60).toFixed(1)} h)`);
  const erros = foraDaFaixa(r);
  console.log(erros.length ? `Fora da faixa (${erros.length}):\n  ` + erros.join('\n  ') : 'Tudo dentro da faixa.');
}
