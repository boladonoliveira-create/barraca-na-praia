# Roteiro: Barraca na Praia

Status: AGUARDANDO REVISÃO
Rodada: 8
Porta: 5175
Quem faz: parte A = Claude Code. Parte B = OpenCode.

## Contexto

A rodada 7 foi aprovada.
- **O que entrou:** a praia em faixas, a câmera vertical, os quiosques na grama, os ambulantes com caminhão e bancada, a praia cheia de banhistas e o palco com os 8 músicos.
- **Testes:** o revisor rodou os 58 testes do núcleo, e todos passaram.
- **Simulador:** dentro das metas (7,6 a 7,7 h).

O revisor desenhou a Praia 10 inteira e ficou viva. Ajustes que faltam:

1. **Legibilidade.** Em volta da Sorveteria, do Chuveirão e das filas, os banhistas se misturam com os clientes, os quadros de compra e o jogador. Fica difícil ver o que importa.
2. **Calçadão.** A pedra portuguesa ficou em listras retas, parece faixa de pedestre. O certo são as ondas pretas e brancas, como no calçadão de Copacabana.
3. **Faltam:** a recompensa diária, o material da loja e o APK.

O usuário instalou o Android Studio.

## Fluxo desta rodada

1. **Claude Code** faz a parte A, com um commit por item. Depois:
   - escreve `RELATORIO.md` no formato de `../RODADA.md`;
   - troca o status para `Status: PRONTO PARA OPENCODE`;
   - faz um commit.
2. **OpenCode** faz a parte B, seguindo as regras de `AGENTS.md`. Depois:
   - acrescenta a seção dele no `RELATORIO.md`;
   - troca o status para `Status: AGUARDANDO REVISÃO`;
   - faz um commit.

## Parte A [CLAUDE]: legibilidade, recompensa diária e APK

**A1. Legibilidade.**
- **Distância:** os banhistas não escolhem pontos a menos de 50 de balcões, quadros de compra, filas, zonas de entrega, pilhas de caixas e bancada.
- **Durante o jogo:** se um banhista passar por cima do jogador, desenhe o jogador por cima (ele sempre visível).
- **Clientes:** ficam um pouco mais saturados que os banhistas, ou os banhistas um pouco mais claros. Escolha o que ficar melhor e explique no relatório.
- **Teste:** nenhum ponto de banhista fica dentro dessa distância.

**A2. Recompensa diária.** Na primeira abertura de cada dia aparece um cartão com o calendário de 7 dias:

| Dia | Prêmio |
|---|---|
| 1 | Dinheiro (3 min de lucro da praia atual) |
| 2 | Turbo ×2 por 5 min |
| 3 | Dinheiro (5 min) |
| 4 | Turbo ×2 por 10 min |
| 5 | Dinheiro (8 min) |
| 6 | Turbo ×3 por 5 min |
| 7 | +10% de fama da praia atual e confete |

- **Botões:** "Pegar" e "Pegar em dobro (anúncio)". O cartão fecha com 1 toque e não volta no mesmo dia.
- **Dia perdido:** volta 1 dia.
- **Testes:** com data simulada.
- **Analytics:** `recompensa_diaria` (dia, dobrou).

**A3. Ambiente.**
- Confira `ANDROID_HOME` (o SDK em `%LOCALAPPDATA%\Android\Sdk`) e `JAVA_HOME` (o `jbr` do Android Studio).
- Se não estiverem certas, escreva os comandos `setx` exatos no relatório e pule A4 e A5.

**A4. APK de teste.**
- **Versão:** `versionCode 1`, `versionName "1.0.0"`, nome do app "Barraca na Praia".
- **Comandos:**
  ```
  npm run build
  npx cap sync android
  cd android
  .\gradlew.bat assembleDebug
  ```
- **Arquivo:** copie o resultado para `dist-android/barraca-na-praia-debug.apk`, que entra no `.gitignore`.
- **Ícones:** use os provisórios de hoje. O ícone final vem da parte B, e os ícones são gerados de novo na próxima rodada.

**A5. Assinatura e pacote.**
- **Chave:** crie a chave de upload em `C:\dev jogos\chaves\barraca-upload.jks`, com a senha da variável `JOGOS_CHAVE_SENHA`. Se ela não existir, pule e explique no relatório.
- **Configuração:** crie `android/key.properties` (no `.gitignore`) e a configuração `release` no `build.gradle`.
- **Pacote:** rode `.\gradlew.bat bundleRelease` e copie o resultado para `dist-android/barraca-na-praia-1.0.0.aab`.

## Parte B [OPENCODE]: calçadão e material da loja

| Item | O que fazer | Arquivos |
|---|---|---|
| B1. Pedra portuguesa | Troque as listras retas pelas ondas pretas e brancas do calçadão de Copacabana: faixas onduladas, largas e paralelas à rua. Desenhe em cache, se a orla já for em cache. | `render/cenarios.ts` (só a função da calçada) |
| B2. Página `?loja` | Uma página só de dev que desenha no canvas o ícone 512 × 512, a imagem de destaque 1024 × 500 e 6 capturas 1080 × 1920, cada uma com um botão "Baixar". Use como exemplo o `src/render/previaLoja.ts` do Metrô (pasta `C:\dev jogos\Metro lotado`): só leia, não mexa nele. | Arquivo novo `src/render/previaLoja.ts` e a entrada em `main.ts` só para `?loja` em dev |
| B3. Textos | Crie `loja/textos-pt-BR.md` e `loja/privacidade.md` com os textos abaixo, sem mudar. Para o checklist e a privacidade, siga o modelo do Metrô e troque o nome do app. | `loja/` |

**O que desenhar em B2:**
- **Ícone:** a barraca com guarda-sol listrado e um coco com canudinho, com o mar ao fundo. Sem texto, e legível em 48 × 48 (mostre a prévia).
- **Destaque:** o nome "Barraca na Praia" e a praia cheia.
- **Capturas** (cada uma com uma faixa de título no topo):
  1. "Monte o seu point na praia": Praia 4 cheia.
  2. "Contrate ajudantes".
  3. "Viaje para praias novas".
  4. "Show de pagode na areia": o palco no show.
  5. "Seja campeão da praia": o torneio.
  6. "Jogue só com um dedo": Praia 1 com a seta.

  Use o próprio `desenhar` do jogo com o `Jogo` montado como o `?praia=N` faz.

**Textos da loja:**
- **Título (29):** Barraca na Praia: Idle Tycoon
- **Descrição curta (70):** Venda açaí, abra quiosques e transforme sua barraca no point da praia!
- **Descrição longa:**

```
Comece com uma barraquinha de açaí e coco e transforme a praia no lugar mais animado do litoral! Ande com um dedo só, leve os produtos até o balcão, junte o dinheiro e expanda.

🏖️ 10 PRAIAS PARA CONQUISTAR
Cada praia libera algo novo: sorveteria, chuveirão, milho e pastel, quadra de futevôlei, ambulantes, escolinha de surf, sucos, palco de pagode e o grande torneio.

⭐ FAMA QUE FICA
A cada praia nova você ganha fama e recomeça mais forte. O que levava minutos passa voando.

👷 CONTRATE A EQUIPE
Ajudantes, sorveteiros, cozinheiros, instrutores e barmen trabalham por você, até com o jogo fechado.

🎶 SHOW E CAMPEONATO
Shows de pagode lotam a praia, e o torneio de futevôlei transforma você em campeão.

😌 FEITO PARA RELAXAR
Sem derrota e sem pressa. Jogue um pouquinho por dia ou passe a tarde na praia.
```

**Regras da parte B:**
- **Commits:** um por item.
- **Antes de cada commit:** `npm test` e `npm run build` passando.
- **No fim:** escreva no `RELATORIO.md` a seção "## Parte B (OpenCode)" e troque o status para `Status: AGUARDANDO REVISÃO`.

## Critérios de pronto

- [ ] Nenhum banhista para perto de balcão, quadro, fila ou entrega. O jogador fica sempre visível.
- [ ] A recompensa diária funciona, inclusive dobrando com anúncio, com testes.
- [ ] `dist-android/barraca-na-praia-debug.apk` existe. O AAB também existe, ou o relatório diz o que falta.
- [ ] A calçada tem as ondas pretas e brancas.
- [ ] `?loja` gera o ícone, a imagem de destaque e as 6 capturas. Os textos e a privacidade estão em `loja/`.
- [ ] `npm test` e `npm run build` passam.

## Fora do escopo

Arena, praias 11 em diante, Acampamento de inverno, co-op, anúncios reais e compras dentro do app.
