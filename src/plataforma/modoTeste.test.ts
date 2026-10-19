import { it, expect } from 'vitest';
import { build } from 'vite';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { permiteModoTeste } from './modoTeste.ts';

it('dev e debug explícito permitem o botão; produção e release recusam qualquer flag', () => {
 expect(permiteModoTeste('serve','development')).toBe(true);
 expect(permiteModoTeste('build','android-debug','true')).toBe(true);
 expect(permiteModoTeste('build','android-debug')).toBe(false);
 expect(permiteModoTeste('build','production','true')).toBe(false);
 expect(permiteModoTeste('build','android-release','true')).toBe(false);
});

it('o HTML gerado para release não contém o botão, mesmo com a variável de debug ligada', async () => {
 const dir=await mkdtemp(join(tmpdir(),'barraca-build-'));
 const anterior=process.env.VITE_MODO_TESTE;
 try {
  process.env.VITE_MODO_TESTE='true';
  for(const mode of ['android-debug','android-release']) {
   const out=join(dir,mode);
   await build({mode,logLevel:'silent',build:{outDir:out,emptyOutDir:true}});
   const html=await readFile(join(out,'index.html'),'utf8');
   expect(html.includes('id="testBtn"')).toBe(mode==='android-debug');
   expect(html.includes('aria-label="Modo teste: dinheiro infinito"')).toBe(mode==='android-debug');
  }
 } finally {
  if(anterior===undefined)delete process.env.VITE_MODO_TESTE;else process.env.VITE_MODO_TESTE=anterior;
  await rm(dir,{recursive:true,force:true});
 }
},60000);
