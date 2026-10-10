/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import { existsSync } from 'node:fs';

export default defineConfig({
  // Firebase Analytics só liga quando o arquivo do projeto Firebase existir (o usuário baixa do console do Firebase)
  define: { __FIREBASE__: JSON.stringify(existsSync('android/app/google-services.json')) },
  server: { port: 5175, strictPort: true },
  // os testes de "nunca trava" simulam 10 min de jogo, e o do simulador joga as 10 praias
  test: { testTimeout: 60000, hookTimeout: 600000 },
});
