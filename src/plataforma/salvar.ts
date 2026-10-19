/* Salvamento. O progresso fica numa chave própria, junto com a versão do formato: { versao, jogo }.
   Mudou a estrutura do Save: suba SAVE_VERSION e converta em lerSave.
   No navegador grava no localStorage; no app, no @capacitor/preferences (que é assíncrono: as chaves são
   carregadas para a memória em iniciarArmazenamento, antes do jogo começar, e a interface continua síncrona). */
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import type { Save } from '../core/jogo.ts';
import { makeTrilha } from '../core/economia.ts';
import { ECONOMIA } from '../dados/planos.ts';

// v7 normaliza pagamentos após a nova economia; v6 migra mochilas e v5 compras individuais. v4/v3 são convertidos.
export const SAVE_KEY = 'barraca-na-praia:save', SAVE_VERSION = 7;
/** Identificador criado uma vez por jogador (para salvar na nuvem e para o co-op no futuro). */
export interface Mundo { id: string; criadoEm: number }
const PREFS_KEY = 'barraca-na-praia:prefs';

type Get = (k: string) => string | null;
const nativo = Capacitor.isNativePlatform(), cache = new Map<string, string>();
const ls = nativo
  ? {
    get: (k: string) => cache.get(k) ?? null,
    set: (k: string, v: string) => { cache.set(k, v); Preferences.set({ key: k, value: v }).catch(() => { /* segue com a memória */ }); return true },
  }
  : {
    get: (k: string) => { try { return localStorage.getItem(k) } catch { return null } },
    set: (k: string, v: string) => { try { localStorage.setItem(k, v); return true } catch { return false } },
  };

/** No app, carrega as chaves salvas para a memória. Chame (e espere) antes de lerSave/lerPrefs. */
export async function iniciarArmazenamento() {
  if (!nativo) return;
  for (const key of [SAVE_KEY, PREFS_KEY]) { try { const { value } = await Preferences.get({ key }); if (value != null) cache.set(key, value) } catch { /* sem save */ } }
}

/** v3 (uma praia com as áreas abertas): vai para a praia igual ao número de áreas abertas (no máximo 5),
    com a fama mínima das praias anteriores, e começa essa praia do zero (dinheiro e níveis). */
export function deV3(j: { niveis: number[]; last?: number; tutorial?: number; pendente?: number }): Save {
  const praia = Math.min(5, 1 + j.niveis.slice(1).filter(n => n > 0).length), famas = ECONOMIA.famaMinima.slice(0, praia - 1);
  return { money: 0, niveis: [], paid: {}, praia, famaTotal: famas.reduce((a, b) => a + b, 0), famas, ganho: 0, tempo: 0, last: j.last || 0, tutorial: j.tutorial || 0, pendente: j.pendente || 0 };
}

/** Converte o prefixo v4 para os índices individuais v5 sem ganhar/perder compras ao inserir as mochilas. */
export function deV4(j: Save): Save {
  const b = Math.max(0, Math.min(9, (j.praia || 1) - 1)), mapas: Map<number, number>[] = [];
  const chaves = (t: ReturnType<typeof makeTrilha>) => { const n: Record<string, number> = {}; return t.map(s => s.id + ':' + (n[s.id] = (n[s.id] || 0) + 1)) };
  for (let a = 0; a < 10; a++) {
    const rapido = b >= 2 && a < b, antiga = chaves(makeTrilha(a, b, rapido, true)), nova = chaves(makeTrilha(a, b, rapido));
    mapas.push(new Map(antiga.map((id, k) => [k, nova.indexOf(id)])));
  }
  const compradas = Array.from({ length: 10 }, (_, a) => Array.from({ length: Math.min(60, Math.max(0, Math.floor(j.niveis[a] || 0))) }, (_, k) => mapas[a].get(k)!).filter(k => k >= 0));
  const paid: Record<string, number> = {};
  for (const [key, valor] of Object.entries(j.paid || {})) {
    if (key === 'praia') { paid[key] = valor; continue }
    const [a, k] = key.split(':').map(Number), novo = mapas[a]?.get(k);
    if (novo !== undefined && novo >= 0) paid[a + ':' + novo] = valor;
  }
  return { ...j, paid, compradas };
}

/** Retira a quarta mochila v5, já coberta pela de 60, e devolve seu pagamento. */
export function deV5(j: Save): Save {
  const b = Math.max(0, Math.min(9, (j.praia || 1) - 1)), compradas: number[][] = [], paid: Record<string, number> = {};
  let money = j.money || 0;
  const chaves = (t: ReturnType<typeof makeTrilha>) => { const n: Record<string, number> = {}; return t.map(s => s.id + ':' + (n[s.id] = (n[s.id] || 0) + 1)) };
  for (let a = 0; a < 10; a++) {
    const rapido = b >= 2 && a < b, antiga = makeTrilha(a, b, rapido, 5), nova = chaves(makeTrilha(a, b, rapido)), ids = chaves(antiga);
    const mapa = ids.map(id => nova.indexOf(id));
    const indices = j.compradas?.[a] ?? Array.from({length: j.niveis[a] || 0}, (_, k) => k);
    compradas[a] = indices.map(k => mapa[k]).filter(k => k >= 0);
    for (const k of indices) if (mapa[k] === -1) money += antiga[k].price;
    for (const [key, valor] of Object.entries(j.paid || {})) {
      const [ar, k] = key.split(':').map(Number); if (ar !== a) continue;
      if (mapa[k] >= 0) paid[a + ':' + mapa[k]] = valor; else money += valor;
    }
  }
  if (j.paid?.praia) paid.praia = j.paid.praia;
  return {...j, money, compradas, niveis: compradas.map(cs => cs.length), paid};
}

/** Atualiza pagamentos de preços antigos sem perder dinheiro ou deixar quadros integralmente pagos travados. */
export function deV6(j: Save): Save {
  const b = Math.max(0, Math.min(9, (j.praia || 1) - 1));
  const compradas = Array.from({length:10}, (_, a) => new Set(j.compradas?.[a] ?? Array.from({length:j.niveis[a] || 0}, (_, k) => k)));
  const paid: Record<string, number> = {}; let money = j.money || 0;
  for (const [key, valor] of Object.entries(j.paid || {})) {
    if (key === 'praia') { const n=ECONOMIA.niveisViagem[b];const pr=Math.round(makeTrilha(b,b)[n].price*ECONOMIA.viagem[b]/5)*5; paid[key]=Math.min(valor,pr);money+=Math.max(0,valor-pr); continue }
    const [a,k] = key.split(':').map(Number), s = makeTrilha(a,b,b>=2&&a<b)[k];
    if (!s) {money+=valor;continue}
    if (compradas[a].has(k)) {paid[key]=valor;continue}
    if (valor>=s.price) {compradas[a].add(k);money+=valor-s.price} else paid[key]=valor;
  }
  return {...j,money,paid,compradas:compradas.map(cs=>[...cs]),niveis:compradas.map(cs=>cs.size)};
}

/** Lê o progresso da versão atual (ou converte o v4/v3); qualquer outra versão (ou save quebrado) devolve null e o jogo recomeça. */
export function lerSave(get: Get = ls.get): Save | null {
  try {
    const s = JSON.parse(get(SAVE_KEY) || 'null');
    if (!s || !Array.isArray(s.jogo?.niveis)) return null;
    return s.versao === SAVE_VERSION ? s.jogo : s.versao === 6 ? deV6(s.jogo) : s.versao === 5 ? deV6(deV5(s.jogo)) : s.versao === 4 ? deV6(deV4(s.jogo)) : s.versao === 3 ? deV3(s.jogo) : null;
  } catch { return null }
}

const novoId = () => globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36) + Math.random().toString(36).slice(2);
/** O mundo deste jogador: o que já está salvo ou um novo (gravado na próxima vez que o jogo salvar). */
export function lerMundo(get: Get = ls.get): Mundo {
  try { const m = JSON.parse(get(SAVE_KEY) || 'null')?.mundo; if (m?.id) return m } catch { /* sem save */ }
  return { id: novoId(), criadoEm: Date.now() };
}

/** Grava o progresso. Não sobrescreve um save de versão mais nova (ex.: jogou numa versão do app e voltou para outra). */
export function gravarSave(jogo: Save, get: Get = ls.get, set = ls.set) {
  try { const atual = JSON.parse(get(SAVE_KEY) || 'null'); if (atual && atual.versao > SAVE_VERSION) return false } catch { /* save corrompido: sobrescreve */ }
  return set(SAVE_KEY, JSON.stringify({ versao: SAVE_VERSION, mundo: lerMundo(get), jogo }));
}

/** Preferências do jogador (fora do progresso). */
export interface Prefs { som: boolean; vibra: boolean; teste: boolean }
export function lerPrefs(): Prefs {
  const d: Prefs = { som: true, vibra: true, teste: false };
  try { return { ...d, ...JSON.parse(ls.get(PREFS_KEY) || '{}') } } catch { return d }
}
export function gravarPrefs(p: Prefs) { ls.set(PREFS_KEY, JSON.stringify(p)) }
