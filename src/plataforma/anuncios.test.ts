import { describe, it, expect } from 'vitest';
import { podeIntersticial, IDS } from './anuncios.ts';

describe('anúncios', () => {
  it('intersticial só a partir da Praia 2 e no máximo a cada 4 min', () => {
    expect(podeIntersticial(0, 10 * 60000, 0)).toBe(false);
    expect(podeIntersticial(1, 4 * 60000, 0)).toBe(true);
    expect(podeIntersticial(1, 4 * 60000 - 1, 0)).toBe(false);
  });

  it('usa os IDs de teste do Google enquanto não houver conta AdMob', () => {
    expect(IDS.app).toBe('ca-app-pub-3940256099942544~3347511713');
    expect(IDS.recompensado.startsWith('ca-app-pub-3940256099942544/')).toBe(true);
  });
});
