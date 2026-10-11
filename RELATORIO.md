# Relatório: Barraca na Praia, rodada 8

Resultado: PARCIAL. A1 e A2 estão feitas. A3 encontrou o `JAVA_HOME` errado e a variável `JOGOS_CHAVE_SENHA` faltando, então A4 (APK) e A5 (assinatura e AAB) foram puladas, como o roteiro manda. A parte B fica para o OpenCode.

Commit:
- `1ff9d1d`: roteiro;
- `bda63a4`: A1;
- `19ea356`: A2;
- o deste relatório vem logo depois.

A3 não mudou nenhum arquivo, então não teve commit.

## Critérios de pronto
- [x] Nenhum banhista para perto de balcão, quadro, fila ou entrega, e o jogador fica sempre visível. Evidências:
  - teste "param a 50 ou mais de balcões, quadros, filas, entregas, pilhas e bancada (em todas as praias)", que confere todos os pontos de parada, das 10 praias, com `livre(x, y, 50)`;
  - no navegador (Praia 3), a área do Chuveirão fica limpa;
  - os banhistas são desenhados numa camada por baixo do jogador e dos clientes.
- [x] A recompensa diária funciona, inclusive dobrando com anúncio, com testes. Evidências:
  - 7 testes em `src/core/diaria.test.ts`, com data simulada: avanço de dia, virada do mês e do ano, dia perdido, relógio voltando, os 3 tipos de prêmio, o dobro, não pegar duas vezes e o calendário no save;
  - no navegador, o cartão com os 7 dias; "Pegar em dobro (anúncio)" passou pelo anúncio simulado e deu R$ 360;
  - no console, `recompensa_diaria {dia: 1, dobrou: true}`.
- [ ] `dist-android/barraca-na-praia-debug.apk` existe. Não existe: A4 foi pulada pela regra da A3 (ver "O que depende do usuário"). O AAB também não existe, pelo mesmo motivo e por falta da senha.
- [ ] A calçada tem as ondas pretas e brancas. É o item B1 (OpenCode).
- [ ] `?loja` gera o ícone, a imagem de destaque e as 6 capturas, e os textos estão em `loja/`. São os itens B2 e B3 (OpenCode).
- [x] `npm test` (76 testes, com o simulador na semente 1) e `npm run build` passam.

## O que foi feito

### A1. Legibilidade
- **Distância:** os banhistas só escolhem pontos de parada a 50 ou mais (`BANHISTA_LONGE`) de balcões, zonas de entrega, dinheiro, filas, quadros de compra e da zona de cada área (que inclui as pilhas de caixas e a bancada). A dupla do frescobol confere os dois lugares. Quem não acha lugar livre na areia vai nadar, e fica com a ação "nada" (antes ficava com uma ação de areia dentro do mar).
- **Filas:** `livre` agora cobre a fila inteira dos balcões, inclusive a parte que dobra para o lado quando ela cresce.
- **Desenho:** os banhistas foram para uma camada própria, desenhada antes de clientes, ajudantes e jogador. Assim o jogador fica sempre por cima, e quem importa no jogo também.
- **Contraste:** escolhi deixar os banhistas mais claros (transparência de 0,75), e não saturar os clientes. Os clientes usam as mesmas camisas e peles dos banhistas, e saturar mudaria o visual do jogo inteiro. Clareando só os banhistas, eles viram "fundo" e os clientes, os ajudantes e o jogador saltam à vista.
- **Travamento corrigido** (achado pelo simulador). Com o balcão de açaí cheio, os 4 primeiros da fila pedindo coco e o jogador com a bolsa cheia de açaí, ninguém comprava e o jogador não conseguia pegar coco: a barraca travava. Agora quem está entre os 4 primeiros e espera mais de 6 s (`TROCA_MS`) por um produto em falta troca pelo que tem no balcão ("Então me vê esse!"). Tem teste.
- **Rebalanceamento leve:** o sorteio dos banhistas e a troca de pedido mudaram o caminho do bot. Para voltar às metas, mudei 3 números de `ECONOMIA`:
  - base dos Sucos: 6 → 6,5 mi;
  - base do Torneio: 19 → 18 mi;
  - viagem da Praia 4: 1,6 → 1,4.

### A2. Recompensa diária
- **Lógica:** `src/core/diaria.ts` tem o calendário de 7 dias (`PREMIOS`) e `diaDeHoje`, que recebe a data como texto, para os testes simularem.
  - **Dia seguinte:** avança 1 dia; depois do 7º, recomeça no 1.
  - **Dia perdido:** volta 1 dia, ou seja, repete o último que pegou.
  - **Relógio voltou:** espera chegar o dia de novo.
- **No `Jogo`:**
  - `pegarDiaria(hoje, dobro)`: dinheiro de 3, 5 ou 8 min de lucro da praia; turbo ×2 ou ×3; ou +10% da fama da praia (no mínimo 1), com confete. O dobro dobra o valor, o tempo ou a fama.
  - `lucroPorMin()`: o que entrou na praia ÷ o tempo jogado, com um mínimo de R$ 60 × fama no começo.
  - `turbo()`: o multiplicador das vendas, que agora pode ser 2 ou 3.
- **Cartão** (`index.html`, `estilo.css`, `hud.ts`):
  - aparece depois de tocar em "Jogar", na primeira abertura do dia, e antes do cartão dos ganhos com o app fechado;
  - mostra os 7 dias (os pegos em verde, o de hoje em destaque);
  - tem "Pegar" e "Pegar em dobro (anúncio)": se o anúncio fechar antes do fim, entrega o prêmio normal;
  - fecha com 1 toque e não volta no mesmo dia;
  - o selo do turbo na tela mostra "3x R$" quando é o ×3.
- **Save:** o calendário fica no campo novo `diaria`.
- **Analytics:** `recompensa_diaria` com `{ dia, dobrou }`.
- **Documentação:** GDD, seção 10, e o `CLAUDE.md`, item do save.

### A3. Ambiente
- **`ANDROID_HOME`:** `C:\Users\000\AppData\Local\Android\Sdk`. Está certo (tem `build-tools/36.0.0` e `platforms/android-37.0`).
- **`JAVA_HOME`:** `C:\Program Files\Java\jdk-17`. Está errado: não é o `jbr` do Android Studio.
- **Android Studio:** está instalado em `D:\Android`, e não no lugar padrão. O `jbr` dele está em `D:\Android\jbr` (OpenJDK 25.0.3).
- **`JOGOS_CHAVE_SENHA`:** não existe.

Seguindo a regra do roteiro, não tentei o build e pulei A4 e A5.

## Números

Simulador (`npm run sim`, bot humano, sementes 1, 2 e 3), com o código final:

```
Bot humano, semente 1
| Praia | Minutos | Meta | Áreas antigas abertas | Maior espera | Fama ganha |
|---|---|---|---|---|---|
| 1 | 8.6 | 8 a 10 | - | 110 s | 3 |
| 2 | 18.6 | 15 a 20 | 0% | 110 s | 8 |
| 3 | 21.8 | 20 a 25 | 9% | 79 s | 40 |
| 4 | 29.3 | 25 a 35 | 16% | 111 s | 98 |
| 5 | 36.6 | 35 a 45 | 18% | 99 s | 224 |
| 6 | 49.0 | 45 a 55 | 18% | 105 s | 490 |
| 7 | 58.3 | 55 a 65 | 10% | 86 s | 1092 |
| 8 | 73.7 | 60 a 75 | 9% | 87 s | 2267 |
| 9 | 74.3 | 70 a 85 | 12% | 88 s | 3737 |
| 10 | 86.7 | 80 a 95 | 12% | 74 s | 6125 |
Total: 457.0 min (7.6 h)
Tudo dentro da faixa.

Bot humano, semente 2
| Praia | Minutos | Meta | Áreas antigas abertas | Maior espera | Fama ganha |
|---|---|---|---|---|---|
| 1 | 8.6 | 8 a 10 | - | 112 s | 3 |
| 2 | 18.6 | 15 a 20 | 0% | 118 s | 8 |
| 3 | 22.2 | 20 a 25 | 9% | 86 s | 40 |
| 4 | 29.7 | 25 a 35 | 18% | 140 s | 99 |
| 5 | 38.5 | 35 a 45 | 18% | 108 s | 232 |
| 6 | 46.7 | 45 a 55 | 17% | 100 s | 480 |
| 7 | 61.9 | 55 a 65 | 9% | 98 s | 1136 |
| 8 | 68.3 | 60 a 75 | 9% | 89 s | 2152 |
| 9 | 78.3 | 70 a 85 | 11% | 88 s | 3800 |
| 10 | 86.2 | 80 a 95 | 12% | 71 s | 6075 |
Total: 459.0 min (7.7 h)
Tudo dentro da faixa.

Bot humano, semente 3
| Praia | Minutos | Meta | Áreas antigas abertas | Maior espera | Fama ganha |
|---|---|---|---|---|---|
| 1 | 8.7 | 8 a 10 | - | 113 s | 3 |
| 2 | 18.2 | 15 a 20 | 0% | 116 s | 8 |
| 3 | 21.8 | 20 a 25 | 9% | 84 s | 40 |
| 4 | 30.6 | 25 a 35 | 16% | 123 s | 100 |
| 5 | 37.3 | 35 a 45 | 18% | 104 s | 226 |
| 6 | 49.8 | 45 a 55 | 15% | 109 s | 501 |
| 7 | 57.9 | 55 a 65 | 7% | 98 s | 1092 |
| 8 | 67.4 | 60 a 75 | 9% | 86 s | 2109 |
| 9 | 81.8 | 70 a 85 | 11% | 104 s | 3921 |
| 10 | 84.5 | 80 a 95 | 12% | 89 s | 6091 |
Total: 458.0 min (7.6 h)
Tudo dentro da faixa.
```

**Antes da correção da fila,** com os banhistas já longe das áreas, o bot travou na Praia 1 da semente 3 ("o bot travou": balcão de açaí cheio, fila pedindo coco, bolsa cheia de açaí).

**Depois da correção, antes do rebalanceamento,** sobraram 4 desvios:

| Semente | Praia | O quê | Meta |
|---|---|---|---|
| 2 | 4 | espera de 156 s | até 150 s |
| 2 | 6 | espera de 157 s | até 150 s |
| 3 | 8 | 58,4 min | 60 a 75 |
| 3 | 10 | 97 min | 80 a 95 |

## O que depende do usuário
1. **Corrigir o `JAVA_HOME`** para o Java do Android Studio. No Prompt de Comando ou no PowerShell:
   ```
   setx JAVA_HOME "D:\Android\jbr"
   ```
   O `ANDROID_HOME` já está certo. Se quiser deixar explícito:
   ```
   setx ANDROID_HOME "%LOCALAPPDATA%\Android\Sdk"
   ```
2. **Criar a senha da chave de upload** (escolha uma senha forte e guarde-a num lugar seguro: sem ela não dá para publicar atualizações):
   ```
   setx JOGOS_CHAVE_SENHA "sua-senha-aqui"
   ```
3. **Fechar e abrir de novo** o terminal e o Claude Code, porque o `setx` só vale em janelas novas. Depois, rodar A4 e A5 de novo (APK e AAB).

## Problemas e decisões
- **Pulei A4 e A5 mesmo com um JDK 17 instalado.** O JDK 17 avulso provavelmente compilaria, mas o roteiro pede o `jbr` do Android Studio e manda pular se não estiver certo. Segui a regra, para não gerar um APK com um Java diferente do que o usuário vai usar.
- **Correção do travamento da fila.** É uma regra nova de jogo: o cliente troca de pedido depois de 6 s esperando um produto em falta. Ela era necessária porque o travamento acontecia com o jogador de verdade, não só com o bot, e quebrava o pilar 2 ("sem derrota").
- **Save:** o campo `diaria` é opcional e entrou sem subir `SAVE_VERSION`. Os saves v4 antigos carregam normalmente, com o calendário zerado, então não precisa de conversão.
- **Contraste:** escolhi clarear os banhistas, e não saturar os clientes (ver A1).

## Sugestões
- **Retomar A4 e A5** assim que o `JAVA_HOME` e a `JOGOS_CHAVE_SENHA` estiverem certos. Os passos estão no roteiro; pela A4, ainda falta conferir `versionCode 1`, `versionName "1.0.0"` e o nome do app no `android/`.
- **Calendário no litoral:** um selo "recompensa de amanhã" no HUD, para lembrar de voltar (fora do escopo desta rodada).
- **Recompensa diária e o tutorial:** na primeira abertura, o cartão aparece antes do tutorial. Vale avaliar se no dia 1 ele deveria aparecer só depois da primeira venda.

## Parte B (OpenCode)

Resultado: feita. B1, B2 e B3 entraram. Também regenerei o APK de teste (pedido do usuário), que estava pendente da parte A. O AAB assinado **não** foi gerado, por falta da senha (`JOGOS_CHAVE_SENHA`).

Commits:
- `5d6264c`: B1 (pedra portuguesa);
- `d42b7ec`: B2 (página `?loja`);
- `355d7a0`: B3 (textos e privacidade);
- `57460a8`: APK de teste (versionName e `.gitignore`);
- o deste relatório vem logo depois.

### B1. Pedra portuguesa
- Troquei as listras retas por **ondas largas, pretas sobre fundo claro**, no mesmo sentido paralelo à rua (Copacabana). Faixas com passo de 20, amplitude 7 e onda por `sin(x/45)`, recortadas na calçada; o banco e o poste continuam respeitando `livre()`. Arquivo: `src/render/cenarios.ts` (só a função da calçada).
- `npm test` (76) e `npm run build` OK.

### B2. Página `?loja`
- Arquivo novo `src/render/previaLoja.ts` e a entrada em `src/main.ts`, só para `?loja` em dev (o guard usa `import.meta.env.DEV`, então em produção o arquivo nem entra no pacote — conferido no `dist`).
- Monta o `Jogo` como o `?praia=N` faz e usa o próprio `desenhar` do jogo. Desenha:
  - **ícone 512 × 512** (barraca com guarda-sol listrado e coco com canudo, mar ao fundo, sem texto) e a **prévia 48 × 48**;
  - **destaque 1024 × 500** (nome "Barraca na Praia" e a praia cheia);
  - **6 capturas 1080 × 1920**, cada uma com faixa de título no topo: Monte o seu point (Praia 4 cheia), Contrate ajudantes, Viaje para praias novas, Show de pagode (palco), Seja campeão (torneio) e Jogue só com um dedo (Praia 1 com a seta).
- Cada imagem tem o botão **"Baixar"** (salva o PNG pelo `toDataURL`). **Não** repliquei o plugin do `vite.config.ts` do Metrô que grava direto em `loja/` (o `AGENTS.md` proíbe mudar configurações), então os PNGs **não** estão versionados: é preciso abrir `?loja` e clicar em "Baixar" para gerar os 8 arquivos.
- **Conferência (headless, Chromium):** a página abre sem nenhum erro de console/página; os 9 canvases (1 do jogo + 8 do material) saem com o tamanho certo e com conteúdo (512, prévia 48, 1024 × 500 e seis de 1080 × 1920).
- `npm test` (76) e `npm run build` OK.

### B3. Textos
- `loja/textos-pt-BR.md`: título, descrição curta e descrição longa **exatamente** como no roteiro, mais a tabela de imagens e o checklist do Play Console no modelo do Metrô (troquei o nome do app e ajustei os pacotes: aqui não tem `share` nem `local-notifications`).
- `loja/privacidade.md`: modelo do Metrô, trocando o nome do app e os itens do save (dinheiro, nível das áreas, praia, fama, recompensa diária).
- `npm test` (76) e `npm run build` OK.

### APK de teste (A4, pedido do usuário)
- **`versionCode 1` e `versionName "1.0.0"`** (mudei o `versionName`, que estava "1.0", como o roteiro A4 pede); nome do app "Barraca na Praia" (já estava certo).
- Comandos: `npm run build`, `npx cap sync android`, `gradlew assembleDebug`. Resultado copiado para **`dist-android/barraca-na-praia-debug.apk`** (10,8 MB). Confirmei com o `aapt2`: pacote `com.jogosbr.barracanapraia`, versionCode 1, versionName 1.0.0, label "Barraca na Praia".
- **Java:** o build quebra com o JDK 17 do `JAVA_HOME` ("invalid source release: 21"): o Capacitor 8 pede Java 21+. Usei o `jbr` do Android Studio (`D:\Android\jbr`, OpenJDK 25) só neste build. O `setx` recomendado pela A3 continua valendo (ver "O que depende do usuário").
- `.gitignore` da raiz ganhou `dist-android` e `android/key.properties` (o roteiro A4/A5 pede isso; o `android/.gitignore` já cobre APK/AAB/jks).

### AAB assinado (A5) — não gerado
- `JOGOS_CHAVE_SENHA` não existe e a chave `C:\dev jogos\chaves\barraca-upload.jks` também não. Como não há senha, não criei a chave, nem `android/key.properties`, nem a configuração `release` no `build.gradle`. Segui a regra do roteiro ("se a senha não existir, pule e explique").

### Critérios de pronto (parte B)
- [x] A calçada tem as ondas pretas e brancas (B1).
- [x] `?loja` gera o ícone, a imagem de destaque e as 6 capturas (B2); os textos e a privacidade estão em `loja/` (B3).
- [x] `dist-android/barraca-na-praia-debug.apk` existe.
- [ ] O AAB assinado não existe: falta a `JOGOS_CHAVE_SENHA` e a chave de upload (A5).
- [x] `npm test` (76) e `npm run build` passam.

### O que ficou fraco ou não deu
- **AAB assinado:** não deu, pela senha/chave ausentes (A5). Sem isso não há pacote de publicação.
- **Os PNGs da loja não estão no repositório.** O roteiro pediu só os botões "Baixar" e o `AGENTS.md` proíbe mexer no `vite.config.ts`, então não criei o "Salvar tudo em `loja/`" do Metrô. Para publicar, é preciso abrir `?loja` e baixar os 8 arquivos na mão.
- **Mexi em `android/app/build.gradle`** (só o `versionName`), o que o `AGENTS.md` normalmente proíbe, mas o usuário pediu para regerar o APK com os passos da parte A, e a A4 exige `1.0.0`.
- **Firebase sem `google-services.json`:** o arquivo não existe, então o plugin do Google não é aplicado e o build sai sem ele. Não afeta o APK de teste, mas vale criar antes de publicar.

### Dúvidas
1. **Commit do `android/app/build.gradle`:** tudo bem ter commitado a mudança do `versionName` (e do `.gitignore`)? Se preferir que a parte A refaça isso, é só reverter `57460a8`.
2. **PNGs versionados:** quer que eu grave os 8 PNGs em `loja/` e versione (como no Metrô), ou fica só pelos botões "Baixar"?
3. **`.gitignore`:** a regra do `AGENTS.md` diz para não mexer em configurações; adicionei `dist-android` e `android/key.properties` porque o roteiro A4/A5 manda. Confirmar que está certo.

### O que depende do usuário
1. Rodar, numa janela nova:
   ```
   setx JAVA_HOME "D:\Android\jbr"
   setx JOGOS_CHAVE_SENHA "sua-senha-aqui"
   ```
2. Com a senha criada, a parte A pode gerar a chave de upload e o AAB (A5).
3. Abrir `http://localhost:5175/?loja` e baixar os 8 PNGs para a loja.
