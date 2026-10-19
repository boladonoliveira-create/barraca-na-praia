/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import { existsSync } from 'node:fs';
import { permiteModoTeste } from './src/plataforma/modoTeste.ts';

export default defineConfig(({ command, mode }) => {
  const teste = permiteModoTeste(command, mode, process.env.VITE_MODO_TESTE);
  return {
    define: { __FIREBASE__: JSON.stringify(existsSync('android/app/google-services.json')), __MODO_TESTE__: JSON.stringify(teste) },
    plugins: [{ name: 'botao-teste-somente-debug', transformIndexHtml: (html: string) => teste ? html : html.replace(/<button\b[^>]*\bid="testBtn"[^>]*>[\s\S]*?<\/button>/g, '') }],
    server: { port: 5175, strictPort: true },
    test: { testTimeout: 60000, hookTimeout: 600000 },
  };
});
