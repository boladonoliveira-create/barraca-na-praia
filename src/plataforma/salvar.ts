/* localStorage com prefixo. A versão do formato vai na chave ('v5'); mudou a estrutura, muda a chave. */
export const SAVE_KEY = 'v5';
export const store = {
  get<T>(k: string, d: T): T { try { const v = localStorage.getItem('barracaPraia.' + k); return v == null ? d : JSON.parse(v) } catch { return d } },
  set(k: string, v: unknown) { try { localStorage.setItem('barracaPraia.' + k, JSON.stringify(v)) } catch { /* sem espaço ou bloqueado: segue sem salvar */ } },
};
