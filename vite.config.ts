import { defineConfig } from 'vite';
import { existsSync } from 'node:fs';

export default defineConfig({
  // Firebase Analytics só liga quando o arquivo do projeto Firebase existir (o usuário baixa do console do Firebase)
  define: { __FIREBASE__: JSON.stringify(existsSync('android/app/google-services.json')) },
  server: { port: 5175, strictPort: true },
});
