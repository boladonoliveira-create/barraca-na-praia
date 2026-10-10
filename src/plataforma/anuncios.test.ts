import { describe, it, expect } from 'vitest';
import { podeIntersticial, IDS } from './anuncios.ts';

describe('anúncios', () => {
  it('intersticial nunca nas Praias 1 a 3; depois, no máximo a cada 4 min', () => {
    for (const p of [1, 2, 3]) expect(podeIntersticial(p, 60 * 60000, 0)).toBe(false);
    expect(podeIntersticial(4, 4 * 60000, 0)).toBe(true);
    expect(podeIntersticial(4, 4 * 60000 - 1, 0)).toBe(false);
  });

  it('usa os IDs de teste do Google enquanto não houver conta AdMob', () => {
    expect(IDS.app).toBe('ca-app-pub-3940256099942544~3347511713');
    expect(IDS.recompensado.startsWith('ca-app-pub-3940256099942544/')).toBe(true);
  });
});
