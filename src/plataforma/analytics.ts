/* Analytics (GDD seção 11). Uma interface só; a padrão escreve no console (e é a dos testes).
   A do Firebase entra apenas no app e apenas se android/app/google-services.json existir no build (__FIREBASE__). */
import { Capacitor } from '@capacitor/core';

export type Evento = 'step_buy' | 'prestige' | 'session_start' | 'session_end' | 'ad_offer' | 'ad_watch' | 'offline_claim';
export type Params = Record<string, string | number | boolean>;
export interface Analytics { registrar(evento: Evento, params?: Params): void }

export const consoleAnalytics: Analytics = { registrar: (e, p = {}) => console.info('[analytics]', e, p) };
export let analytics: Analytics = consoleAnalytics;

export async function iniciarAnalytics() {
  if (!__FIREBASE__ || !Capacitor.isNativePlatform()) return;
  try {
    const { FirebaseAnalytics } = await import('@capacitor-firebase/analytics');
    analytics = { registrar: (e, p = {}) => { FirebaseAnalytics.logEvent({ name: e, params: p }).catch(() => consoleAnalytics.registrar(e, p)) } };
  } catch { /* fica no console */ }
}
