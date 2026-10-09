# Barraca na Praia

Jogo mobile "idle arcade" (no estilo do Pizza Ready): o jogador anda com um dedo por uma praia brasileira, leva produtos das máquinas até as barracas, junta dinheiro e transforma uma barraca simples num complexo de praia. O ciclo é andar, carregar, entregar, expandir e automatizar. Público de todas as idades, sessões de 5 a 15 minutos.

- Design completo: `GDD-BARRACA-NA-PRAIA.md` (fonte da verdade para regras e números).
- Protótipo de referência: `barraca-na-praia.html`. O que o GDD marca como "já existe no protótipo" precisa manter o mesmo comportamento.
- "Praia" é o nível de prestígio. O mapa é o mesmo, dividido em lotes que abrem da esquerda para a direita (Praia 1: Barraca do Sol, açaí e coco; Praia 2: quiosque de sorvete; Praia 3 em diante: ver GDD seções 6 e 7).

## Pilares (GDD seção 2, não quebrar)

1. **Um dedo só.** Arrastar em qualquer lugar move o personagem. Nada exige precisão.
2. **Sem derrota e sem relógio.** O pior que acontece é ganhar mais devagar.
3. **Sem menus.** Comprar é pisar num quadrado no chão. A próxima compra aparece ao lado da coisa que ela melhora.
4. **Progresso sempre visível.** Toda compra muda algo na tela.
5. **Trabalho manual vira automação, área por área.** Cada área nova começa manual e o ajudante dela automatiza depois. Sempre existe uma área onde o jogador ainda trabalha com as mãos.
6. **O futuro fica à vista.** Lotes fechados ficam atrás de uma cerca com placa ("abre na Praia N").

## Estrutura (GDD seção 11)

Vite + TypeScript, empacotado com Capacitor 8 para Android (`android/`, id `com.jogosbr.barracanapraia`).

```
src/
  dados/        mapa.ts (lotes, lojas/SHOPS, produtos, slots), planos.ts (planos de compra)
  core/         jogo.ts (estado, clientes, ajudantes, compras; sem canvas e sem DOM)
                economia.ts (plano e preços), simulador.ts (bot que mede o ritmo)
  render/       desenho.ts (câmera, cenário, personagens, máquinas, efeitos)
  ui/           hud.ts (placar, telas, botões), estilo.css
  plataforma/   salvar.ts (save versionado e preferências; Preferences no app, localStorage no navegador)
                som.ts (sons, mar, vibração; Haptics no app), anuncios.ts (AdMob no app, simulado no navegador)
                analytics.ts (console; Firebase só com android/app/google-services.json)
  main.ts       entrada (joystick/teclado) e laço principal
scripts/sim.ts  relatório do simulador no terminal
scripts/icones.mjs  gera assets/*.png (ícone e abertura provisórios)
admob.config.json   único lugar dos IDs do AdMob (teste até usarReais = true)
```

- O núcleo (`core/`) não toca em canvas nem DOM. Som, vibração, salvar e telas saem pela interface `Io` passada ao `Jogo`. A aleatoriedade vem de `rand`, que os testes e o simulador trocam por um gerador com semente.
- Cada mecânica nova da seção 7 é uma "loja" com dados próprios em `dados/` (produtos, zonas, regra de ajudante), no modelo de `SHOPS`. Adicionar uma praia deve ser adicionar dados, não reescrever o motor.
- Salvar: progresso em `barraca-na-praia:save` como `{ versao, jogo }` (`SAVE_VERSION` em `plataforma/salvar.ts`). Se a estrutura do `Save` mudar, suba a versão e converta em `lerSave`. O save do protótipo (`barracaPraia.v5`) é lido uma vez. Um save de versão mais nova nunca é sobrescrito. Som, vibração e modo teste ficam em `barraca-na-praia:prefs`.
- Ganhos offline valem ao abrir o jogo e ao voltar do segundo plano (`Jogo.offlineGain`). O valor do cartão fica no save (`pendente`) até ser pego ou dobrado.
- Ciclo de vida: `@capacitor/app` no app, `visibilitychange` no navegador (`aoSair`/`aoVoltar` em `main.ts`).
- Modo teste (botão ∞): só existe em `npm run dev` (`import.meta.env.DEV`). Nunca na versão da loja.

## Comandos

```
npm run dev     # jogo em http://localhost:5175
npm test        # testes do núcleo e do simulador (vitest)
npm run sim 3   # tempos de compra por praia e o que está fora da faixa da seção 8
npm run build   # checa os tipos e gera dist/
npx cap sync android                      # copia dist/ e plugins para android/
cd android && gradlew.bat assembleDebug   # APK de depuração (precisa do Android SDK)
```

O `npm run sim` roda com o Node 24, que executa TypeScript direto. Por isso os imports usam a extensão `.ts`.

## Balanceamento

O simulador compara o ritmo com a faixa da seção 8: compras de ~15 s no começo da praia subindo até ~90 s no fim, e cada praia completa em 8 a 15 min. O bot humano (padrão) reage com 200 a 400 ms de atraso, anda com desvio leve e para 3 a 5 s a cada 30 s; `npm run sim -- 2 --perfeito` usa o bot perfeito. Os números ficam em `ECONOMIA` (`src/dados/planos.ts`). Com eles, a Praia 1 leva ~10,5 min e a Praia 2 ~13,5 min. A renda é limitada pela chegada de clientes, então mexer só no jogador muda pouco o ritmo.

## Ordem de trabalho (GDD seção 12)

Feitas: etapa 1 (base, porte, testes, simulador) e etapa 2 (personagens, sons e mar, vibração, tela inicial, save versionado, ganhos offline). Rodada 3 (etapa 3: Capacitor, AdMob de teste, analytics) entregue para revisão; ver RELATORIO.md. Não avance para a etapa 4 sem o usuário pedir.
