/* Anúncios (GDD seção 9). No app: AdMob de verdade (@capacitor-community/admob). No navegador: devolve null e a UI
   mostra o anúncio simulado. Os IDs ficam só em admob.config.json (teste até a conta AdMob existir). */
import { Capacitor, type PluginListenerHandle } from '@capacitor/core';
import { AdMob, AdmobConsentStatus, RewardAdPluginEvents } from '@capacitor-community/admob';
import cfg from '../../admob.config.json';

const r = cfg.reais, usarReais = cfg.usarReais && !!(r.app && r.recompensado && r.intersticial);
export const IDS = usarReais ? r : cfg.teste;

/** Intersticial: nunca nas Praias 1 a 3; depois, só na viagem (quem chama garante: depois da animação do barquinho),
    no máximo a cada 4 min. praia: o número da praia que o jogador está deixando. Nunca durante o jogo. Sem banner. */
export const INTERSTICIAL_INTERVALO = 4 * 60000;
export function podeIntersticial(praia: number, agoraMs: number, ultimoMs: number) {
  return praia >= 4 && agoraMs - ultimoMs >= INTERSTICIAL_INTERVALO;
}

export interface Anuncios {
  /** Mostra o recompensado; true se o jogador ganhou a recompensa. */
  recompensado(): Promise<boolean>;
  intersticial(): Promise<void>;
}

// Os anúncios são carregados antes, para aparecerem na hora (o intersticial sem carga é pulado, sem esperar)
let pronto: Promise<unknown> | null = null, intPronto: Promise<unknown> | null = null;
const carregar = () => (pronto = AdMob.prepareRewardVideoAd({ adId: IDS.recompensado, isTesting: !usarReais }).catch(() => null));
const carregarInt = () => (intPronto = AdMob.prepareInterstitial({ adId: IDS.intersticial, isTesting: !usarReais }).catch(() => null));

/** null no navegador (usa o simulado). */
export async function iniciarAnuncios(): Promise<Anuncios | null> {
  if (!Capacitor.isNativePlatform()) return null;
  try {
    await AdMob.initialize({ initializeForTesting: !usarReais });
    // UMP: obrigatório na Europa e no Reino Unido; fora de lá vem NOT_REQUIRED e não mostra nada
    let info = await AdMob.requestConsentInfo();
    if (info.status === AdmobConsentStatus.REQUIRED && info.isConsentFormAvailable) info = await AdMob.showConsentForm();
    if (!info.canRequestAds) return null; // sem consentimento: o app segue sem anúncios
  } catch { return null }
  carregar(); carregarInt();
  return {
    async recompensado() {
      if (!(await pronto) && !(await carregar())) return false; // sem anúncio carregado (sem internet ou sem estoque)
      let ganhou = false; const hs: PluginListenerHandle[] = [];
      try {
        // a recompensa chega pelo evento Rewarded; o fim é o Dismissed (ou falha ao mostrar)
        await new Promise<void>(async res => {
          hs.push(await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => { ganhou = true }));
          hs.push(await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => res()));
          hs.push(await AdMob.addListener(RewardAdPluginEvents.FailedToShow, () => res()));
          AdMob.showRewardVideoAd().catch(() => res());
        });
      } finally { hs.forEach(h => h.remove()); carregar() }
      return ganhou;
    },
    async intersticial() {
      if (!(await intPronto)) { carregarInt(); return }
      try { await AdMob.showInterstitial() } catch { /* sem anúncio: segue o jogo */ }
      carregarInt();
    },
  };
}
