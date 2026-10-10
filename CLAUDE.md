# Barraca na Praia

Jogo mobile "idle arcade" (no estilo do Pizza Ready): o jogador anda com um dedo por uma praia brasileira, leva produtos das máquinas até as barracas, junta dinheiro e transforma uma barraca simples num complexo de praia. O ciclo é andar, carregar, entregar, expandir e automatizar. Público de todas as idades, sessões de 5 a 15 minutos.

- Design completo: `GDD-BARRACA-NA-PRAIA.md` (fonte da verdade para regras e números).
- Protótipo de referência: `barraca-na-praia.html`. O que o GDD marca como "já existe no protótipo" precisa manter o mesmo comportamento.
- **Orla em faixas:** do mar até a rua: mar, areia, grama, calçadão e rua (só visual). O jogador anda pela praia inteira, da areia ao fim da calçada, e a câmera segue também na vertical (`FAIXAS` em `dados/mapa.ts`).
- **Áreas:** 10, cada uma num lugar da orla (`LUGARES`): Barraca do Sol (areia, à esquerda), Sorveteria, Milho e pastel e Sucos (quiosques na grama), Chuveirão e Quadra (areia, perto da grama), Palco (centro da areia), Escolinha de surf (beira da água), Ambulantes (bancada no calçadão e caminhão na rua) e Torneio (na quadra). As áreas futuras aparecem trancadas no lugar delas. A praia fica cheia de banhistas, que não compram e não atrapalham (GDD seções 6 e 7).
- **Trilhas:** cada área tem a sua trilha de níveis, independente das outras, e a área N+1 abre quando a área N chega ao nível 5 (GDD seções 6 a 8).
- **Praias:** o litoral tem 10 praias (`src/dados/praias.ts`). A praia N tem as áreas 1 a N; a área N é a novidade. Com a área N no nível 10 aparece o quadro dourado da viagem: zera dinheiro e níveis e dá fama, que multiplica o lucro de tudo. As 10 praias existem; na Praia 10 o quadro diz "Praia 11 · em breve" e a meta é ser campeão do torneio. Os troféus do torneio dão público para sempre (GDD seções 6 e 8).

## Pilares (GDD seção 2, não quebrar)

1. **Um dedo só.** Arrastar em qualquer lugar move o personagem. Nada exige precisão.
2. **Sem derrota e sem relógio.** O pior que acontece é ganhar mais devagar.
3. **Sem menus.** Comprar é pisar num quadrado no chão. A próxima compra aparece ao lado da coisa que ela melhora.
4. **Progresso sempre visível.** Toda compra muda algo na tela.
5. **Trabalho manual vira automação, área por área.** Cada área nova começa manual e o ajudante dela automatiza depois. Sempre existe uma área onde o jogador ainda trabalha com as mãos.
6. **O futuro fica à vista.** As áreas das próximas praias aparecem trancadas no lugar delas, com placa ("Trancado · Palco de pagode · Praia 9"); dá para passar por cima.

## Estrutura (GDD seção 11)

Vite + TypeScript, empacotado com Capacitor 8 para Android (`android/`, id `com.jogosbr.barracanapraia`).

```
src/
  dados/        mapa.ts (FAIXAS da orla, LUGARES das áreas, livre(x, y), lojas/SHOPS, regras das áreas: SERVICO, PREPARO/RECEITAS,
                ATRACAO, AMBULANTE, ESCOLA, PALCO, TORNEIO; produtos, slots), planos.ts (AREAS, TRILHAS, ECONOMIA),
                praias.ts (PRAIAS: nome, área nova, cores, hora, enfeites do céu, do mar e da areia, banhistas por tela)
  core/         jogo.ts (estado, clientes, banhistas, ajudantes, compras; sem canvas e sem DOM)
                economia.ts (trilhas e preços), simulador.ts (bot que mede o ritmo)
  render/       desenho.ts (câmera, personagens, máquinas, efeitos), cenarios.ts (céu, mar e enfeites de cada praia)
  ui/           hud.ts (placar, telas, botões, litoral e viagem), estilo.css
  plataforma/   salvar.ts (save versionado e preferências; Preferences no app, localStorage no navegador)
                som.ts (sons, mar, vibração; Haptics no app), anuncios.ts (AdMob no app, simulado no navegador)
                analytics.ts (console; Firebase só com android/app/google-services.json)
  main.ts       entrada (joystick/teclado) e laço principal
scripts/sim.ts  relatório do simulador no terminal
scripts/icones.mjs  gera assets/*.png (ícone e abertura provisórios)
admob.config.json   único lugar dos IDs do AdMob (teste até usarReais = true)
docs/MOLDE-CENARIOS.md  regras para fazer o cenário de uma praia (céu e mar)
docs/MOLDE-AREIA.md     regras para a decoração da areia de uma praia
docs/MOLDE-ORLA.md      as faixas, os lugares das áreas, livre(x, y), a paleta e o que desenhar na orla
```

- O núcleo (`core/`) não toca em canvas nem DOM. Som, vibração, salvar e telas saem pela interface `Io` passada ao `Jogo`. A aleatoriedade vem de `rand`, que os testes e o simulador trocam por um gerador com semente.
- **Uma área nova:** a área i é a loja `SHOPS[i]`, o lugar `LUGARES[i]` (o retângulo na faixa e a zona das coisas dela) e a trilha `TRILHAS[i]`. Ela entra como dados em `dados/` (produtos, zonas, trilha, regra de ajudante), não reescrevendo o motor.
- **Independência:** melhorias de uma área não podem mudar outra. Cada área tem o seu turbo e o seu cardápio, e há teste para isso.
- **Salvar:**
  - O progresso fica em `barraca-na-praia:save` como `{ versao: 4, mundo: { id, criadoEm }, jogo }`, com `praia`, `famaTotal`, `famas`, `trofeus`, a partida do torneio em andamento e `niveis` por área. O `mundo` é criado uma vez (nuvem e co-op no futuro).
  - Se a estrutura do `Save` mudar, suba `SAVE_VERSION` e converta em `lerSave`. O v3 é convertido (`deV3`); antes disso, recomeça do zero.
  - Um save de versão mais nova nunca é sobrescrito.
  - Som, vibração e modo teste ficam em `barraca-na-praia:prefs`.
- Ganhos offline valem ao abrir o jogo e ao voltar do segundo plano (`Jogo.offlineGain`). O valor do cartão fica no save (`pendente`) até ser pego ou dobrado.
- Ciclo de vida: `@capacitor/app` no app, `visibilitychange` no navegador (`aoSair`/`aoVoltar` em `main.ts`).
- Modo teste (botão ∞): só existe em `npm run dev` (`import.meta.env.DEV`). Nunca na versão da loja.
- Prévia de cenário: `?praia=N` (só em `npm run dev`) abre na praia N com as áreas abertas e um pouco de dinheiro, sem gravar o save.
- Anúncios: intersticial nunca nas Praias 1 a 3; depois, só na viagem (depois do barquinho), no máximo a cada 4 min. Sem banner.

## Comandos

```
npm run dev     # jogo em http://localhost:5175
npm test        # testes do núcleo e do simulador (vitest)
npm run sim     # minutos por praia (sementes 1, 2 e 3) e o que está fora das metas da seção 8 (-- --perfeito, -- 2 = semente)
npm run build   # checa os tipos e gera dist/
npx cap sync android                      # copia dist/ e plugins para android/
cd android && gradlew.bat assembleDebug   # APK de depuração (precisa do Android SDK)
```

O `npm run sim` roda com o Node 24, que executa TypeScript direto. Por isso os imports usam a extensão `.ts`.

## Balanceamento

- **O que o simulador mede:** o bot joga as praias 1 a 10, compra a viagem assim que ela libera e termina quando é campeão do torneio. Metas por praia (`METAS` em `simulador.ts`): 8 a 10, 15 a 20, 20 a 25, 25 a 35, 35 a 45, 45 a 55, 55 a 65, 60 a 75, 70 a 85 e 80 a 95 min; nenhuma espera acima de 150 s; as áreas antigas abertas nos primeiros 25% do tempo da praia; o total entre 7,5 e 9 h. `npm run sim` roda as sementes 1, 2 e 3 (cerca de 1 min cada; `-- --compras` lista as compras); o `npm test` roda só a semente 1.
- **O bot:**
  - segue a seta: compra a melhor que já cabe no bolso (`Jogo.melhorCompra(true)`); se nada cabe, junta para a melhor de todas; a viagem vem antes de tudo;
  - leva as caixas do caminhão à bancada, leva as pranchas molhadas à arara (sem instrutor) e opera as liquidificadoras;
  - enquanto junta dinheiro, contorna os outros quadros pela quina;
  - recolhe as pilhas paradas;
  - opera chuveirão, cadeiras e panelas.
- **Variações:** o bot humano (padrão) reage com 200 a 400 ms de atraso, anda com desvio leve e para 3 a 5 s a cada 30 s. `npm run sim -- --perfeito` usa o bot perfeito.
- **Números:** ficam em `ECONOMIA` (`src/dados/planos.ts`): preços, fator por praia (1,45), custo da viagem por praia (`viagem`), fama (K = 2000, taxa 0,07) e o desconto das áreas antigas (20%). Hoje as 10 praias ficam dentro da meta nas 3 sementes (~9 / 18 / 22 / 30 / 37 / 49 / 58 / 66 / 80 / 89 min), e o total fica em 7,6 a 7,7 h.
- **Sensível:** o resultado muda bastante com pequenas mudanças de preço (o bot escolhe compras diferentes e a fama acumula). Ao mexer num número, rode as 3 sementes de novo.

## Ordem de trabalho (GDD seção 12)

Feitas: etapa 1 (base, porte, testes, simulador) e etapa 2 (personagens, sons e mar, vibração, tela inicial, save versionado, ganhos offline). Rodada 3 (etapa 3: Capacitor, AdMob de teste, analytics) feita. Rodada 4 (refeita): consentimento de anúncios, progressão por áreas independentes com as áreas 3 e 4, e a área 5 (quadra). Rodada 5: litoral de praias com fama (Cash Inc), começo rápido, cenários das praias 1 e 2, save v4, viagem e litoral. Rodada 6: áreas 6 a 10 (praias 6 a 10), balanceamento das 10 praias e o molde da areia. Rodada 7 (parte A): orla em faixas com câmera vertical, áreas reposicionadas, ambulantes com caminhão e bancada, banhistas e rebalanceamento; ver RELATORIO.md. Não avance além do roteiro sem o usuário pedir.
