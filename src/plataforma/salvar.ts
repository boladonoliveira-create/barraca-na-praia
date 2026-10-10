/* Salvamento. O progresso fica numa chave própria, junto com a versão do formato: { versao, jogo }.
   Mudou a estrutura do Save: suba SAVE_VERSION e converta em lerSave.
   No navegador grava no localStorage; no app, no @capacitor/preferences (que é assíncrono: as chaves são
   carregadas para a memória em iniciarArmazenamento, antes do jogo começar, e a interface continua síncrona). */
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import type { Save } from '../core/jogo.ts';

// v3: progresso por área (niveis) no lugar da lista única de compras. Saves antigos recomeçam do zero
// (ainda não há jogadores; decisão do roteiro da rodada 4).
export const SAVE_KEY = 'barraca-na-praia:save', SAVE_VERSION = 3;
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

/** Lê o progresso da versão atual; qualquer outra versão (ou save quebrado) devolve null e o jogo recomeça. */
export function lerSave(get: Get = ls.get): Save | null {
  try {
    const s = JSON.parse(get(SAVE_KEY) || 'null');
    return s && s.versao === SAVE_VERSION && Array.isArray(s.jogo?.niveis) ? s.jogo : null;
  } catch { return null }
}

/** Grava o progresso. Não sobrescreve um save de versão mais nova (ex.: jogou numa versão do app e voltou para outra). */
export function gravarSave(jogo: Save, get: Get = ls.get, set = ls.set) {
  try { const atual = JSON.parse(get(SAVE_KEY) || 'null'); if (atual && atual.versao > SAVE_VERSION) return false } catch { /* save corrompido: sobrescreve */ }
  return set(SAVE_KEY, JSON.stringify({ versao: SAVE_VERSION, jogo }));
}

/** Preferências do jogador (fora do progresso). */
export interface Prefs { som: boolean; vibra: boolean; teste: boolean }
export function lerPrefs(): Prefs {
  const d: Prefs = { som: true, vibra: true, teste: false };
  try { return { ...d, ...JSON.parse(ls.get(PREFS_KEY) || '{}') } } catch { return d }
}
export function gravarPrefs(p: Prefs) { ls.set(PREFS_KEY, JSON.stringify(p)) }
