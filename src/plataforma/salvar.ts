/* Salvamento no localStorage. O progresso fica numa chave própria, junto com a versão do formato:
   { versao, jogo }. Mudou a estrutura do Save: suba SAVE_VERSION e converta em lerSave. */
import type { Save } from '../core/jogo.ts';

export const SAVE_KEY = 'barraca-na-praia:save', SAVE_VERSION = 1;
const OLD_KEY = 'barracaPraia.v5'; // formato do protótipo, sem versão dentro

type Get = (k: string) => string | null;
const ls = {
  get: (k: string) => { try { return localStorage.getItem(k) } catch { return null } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); return true } catch { return false } },
};

/** Lê o progresso. Aceita a versão atual e o save do protótipo; versão desconhecida devolve null. */
export function lerSave(get: Get = ls.get): Save | null {
  try {
    const raw = get(SAVE_KEY);
    if (raw) { const s = JSON.parse(raw); return s && s.versao === SAVE_VERSION ? s.jogo : null }
    const old = get(OLD_KEY);
    return old ? JSON.parse(old) : null;
  } catch { return null }
}

/** Grava o progresso. Não sobrescreve um save de versão mais nova (ex.: jogou numa versão do app e voltou para outra). */
export function gravarSave(jogo: Save, get: Get = ls.get, set = ls.set) {
  try { const atual = JSON.parse(get(SAVE_KEY) || 'null'); if (atual && atual.versao > SAVE_VERSION) return false } catch { /* save corrompido: sobrescreve */ }
  return set(SAVE_KEY, JSON.stringify({ versao: SAVE_VERSION, jogo }));
}

/** Preferências do jogador (fora do progresso). */
export interface Prefs { som: boolean; vibra: boolean; teste: boolean }
const PREFS_KEY = 'barraca-na-praia:prefs';
export function lerPrefs(): Prefs {
  const d: Prefs = { som: true, vibra: true, teste: false };
  try { return { ...d, ...JSON.parse(ls.get(PREFS_KEY) || '{}') } } catch { return d }
}
export function gravarPrefs(p: Prefs) { ls.set(PREFS_KEY, JSON.stringify(p)) }
