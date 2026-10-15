import { describe, it, expect } from 'vitest';
import { podeIntersticial, IDS } from './anuncios.ts';

describe('anúncios', () => {
  it('automáticos somente ao sair das Praias 6 e 9, no máximo duas ocasiões no litoral', () => {
    const elegiveis = Array.from({ length: 10 }, (_, i) => i + 1).filter(p => podeIntersticial(p, 120 * 60000, 0));
    expect(elegiveis).toEqual([6, 9]);
  });

  it('respeita uma hora entre automáticos, inclusive na fronteira do intervalo', () => {
    for (const p of [6, 9]) {
      const ultimo = 123456;
      expect(podeIntersticial(p, ultimo + 60 * 60000 - 1, ultimo)).toBe(false);
      expect(podeIntersticial(p, ultimo + 60 * 60000, ultimo)).toBe(true);
    }
  });

  it('não emenda um automático após anúncio opcional: dá 15 minutos de descanso', () => {
    const agora = 120 * 60000;
    for (const p of [6, 9]) {
      expect(podeIntersticial(p, agora, 0, agora)).toBe(false);
      expect(podeIntersticial(p, agora, 0, agora - 15 * 60000 + 1)).toBe(false);
      expect(podeIntersticial(p, agora, 0, agora - 15 * 60000)).toBe(true);
      expect(podeIntersticial(p, agora, agora - 30 * 60000, agora - 20 * 60000)).toBe(false);
    }
  });

  it('usa os IDs de teste do Google enquanto não houver conta AdMob', () => {
    expect(IDS.app).toBe('ca-app-pub-3940256099942544~3347511713');
    expect(IDS.recompensado.startsWith('ca-app-pub-3940256099942544/')).toBe(true);
  });
});
