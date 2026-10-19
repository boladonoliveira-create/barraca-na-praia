/** A loja nunca habilita ferramentas de teste, mesmo se uma variável do ambiente vazar. */
export function permiteModoTeste(command: string, mode: string, flag?: string) {
  return command === 'serve' || (mode === 'android-debug' && flag === 'true');
}
