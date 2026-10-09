import { describe, it, expect, vi } from 'vitest';
import { analytics, consoleAnalytics, iniciarAnalytics } from './analytics.ts';

describe('analytics', () => {
  it('fora do app fica no console', async () => {
    await iniciarAnalytics();
    expect(analytics).toBe(consoleAnalytics);
    const log = vi.spyOn(console, 'info').mockImplementation(() => {});
    analytics.registrar('step_buy', { praia: 1, indice: 3, segundos: 12 });
    expect(log).toHaveBeenCalledWith('[analytics]', 'step_buy', { praia: 1, indice: 3, segundos: 12 });
    log.mockRestore();
  });
});
