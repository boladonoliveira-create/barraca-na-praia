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


## Parte C (OpenCode) — ordem da orla, exploração e banhistas

Data: 14/10/2026. Resultado: as três partes pedidas foram concluídas, em ordem, com um commit por parte. O relatório anterior foi preservado. O `ROTEIRO.md` da rodada anterior continua em `Status: AGUARDANDO REVISÃO`; o escopo desta rodada foi o pedido direto do usuário.

### Commits e validação

| Parte | Commit | Validação antes do commit |
|---|---|---|
| 1. Ordem das áreas | `6cb1817` | `npm test`: 77 testes; `npm run build`: passou |
| 2. Limite até os Ambulantes | `75c29c5` | `npm test`: 80 testes; `npm run build`: passou |
| 3. Banhistas e calibração final | `4c1f284` | `npm test`: 81 testes; `npm run build`: passou |

O relatório é registrado num commit separado, também depois de `npm test` e `npm run build`.

### O que foi feito

1. **Ordem das áreas:** os centros dos negócios agora seguem Barraca do Sol, Sorveteria, Chuveirão, Milho e pastel, Quadra, Ambulantes, Escolinha de surf, Sucos, Palco e Torneio, da esquerda para a direita. A orla passou de 2600 para 3500 de largura para conservar o espaço de trabalho; as faixas e as alturas foram mantidas. O Torneio ganhou uma quadra própria no último trecho, e a Quadra da área 5 continua aparecendo depois que o Torneio abre. Balcões, filas, caixas, pranchas, máquinas, pontos de compra e a câmera da captura do Torneio foram ajustados. As áreas futuras continuam com quadrado e placa trancados. Os testes verificam a ordem, as faixas, as zonas sem sobreposição e as máquinas alcançáveis.
2. **Exploração:** antes de abrir a área 6, `Jogo.limitePraia()` limita a largura a 2044, incluindo as áreas 1 a 5 e todo o quadrado trancado dos Ambulantes. Jogador e câmera respeitam esse limite; uma corda baixa com estacas marca a divisa. A abertura dos Ambulantes libera a largura inteira, remove a corda e deixa todas as áreas futuras trancadas visíveis. Viajar e reiniciar a praia volta a limitar a exploração até reabrir os Ambulantes. Não foi criado campo novo no save. Os testes cobrem o limite, a compra alcançável, a liberação e o reinício.
3. **Banhistas:** densidade de 12,5 a 20 por tela de largura 400, variando por praia. Aproximadamente 50% ficam em cangas, 20% em cadeiras sob guarda-sol, 10% em grupinhos parados, 10% no mar e até 10% têm passeios curtos. As fileiras têm pequenos desvios, alternam o alinhamento e agrupam até três pessoas. Nenhum banhista ocupa exatamente o mesmo ponto que outro. Lugares e passeios reservam a silhueta dos enfeites além dos 50 de afastamento das zonas de trabalho. Banhistas continuam fora das colisões, desenhados abaixo do jogador e dos clientes. Os testes conferem a densidade, grupos, afastamento e comportamento por 10 minutos.

A densidade é uma média por faixa horizontal de 400: as zonas de trabalho ficam mais vazias, e a areia livre concentra os grupos. `amostrasBanhistas` mantém o orçamento anterior de sorteios de candidatos; a organização visual usa um hash próprio, evitando alterar a sequência aleatória das vendas quando muda a densidade. As mudanças nos lugares dos banhistas alteram somente o destino visual dos produtos vendidos pelos Ambulantes, não o pagamento deles.

### Economia e simulador

Rodei `npm run sim` depois das mudanças no mapa e depois do limite. As execuções intermediárias diagnosticaram praias fora do tempo, uma espera de 170 s na viagem da Praia 8 e um total ligeiramente abaixo de 7,5 h. Não alterei o bot, as metas nem as asserções do simulador.

Calibração final em `ECONOMIA`:

| Número | Antes | Depois |
|---|---|---|
| Base de Milho e pastel | 38000 | 37000 |
| Base de Sucos | 6500000 | 6000000 |
| Base do Palco | 13000000 | 11650000 |
| Base do Torneio | 18000000 | 17700000 |
| Fator de viagem da Praia 8 | 1 | 0,85 |

A execução final de `npm run sim`, com bot humano e sementes 1, 2 e 3, terminou as 10 praias e deu **Tudo dentro da faixa** nas três sementes. Todas as metas por praia, espera máxima de 150 s, áreas antigas abertas nos primeiros 25% e total entre 7,5 e 9 h passaram. O script imprime problemas sem retornar código de erro; conferi as mensagens e os resultados, além do teste econômico da semente 1.

#### Semente 1

| Praia | Minutos | Meta | Áreas antigas abertas | Maior espera | Fama ganha |
|---|---|---|---|---|---|
| 1 | 8.6 | 8 a 10 | - | 109 s | 3 |
| 2 | 18.5 | 15 a 20 | 0% | 118 s | 8 |
| 3 | 21.8 | 20 a 25 | 8% | 83 s | 40 |
| 4 | 28.8 | 25 a 35 | 19% | 107 s | 97 |
| 5 | 41.2 | 35 a 45 | 17% | 115 s | 242 |
| 6 | 50.8 | 45 a 55 | 15% | 96 s | 520 |
| 7 | 62.6 | 55 a 65 | 9% | 89 s | 1192 |
| 8 | 64.1 | 60 a 75 | 9% | 90 s | 2105 |
| 9 | 75.4 | 70 a 85 | 11% | 87 s | 3817 |
| 10 | 85.3 | 80 a 95 | 12% | 78 s | 6142 |
Total: 457.0 min (7.6 h)

Resultado: tudo dentro da faixa.

#### Semente 2

| Praia | Minutos | Meta | Áreas antigas abertas | Maior espera | Fama ganha |
|---|---|---|---|---|---|
| 1 | 8.7 | 8 a 10 | - | 109 s | 3 |
| 2 | 18.3 | 15 a 20 | 0% | 111 s | 8 |
| 3 | 22.1 | 20 a 25 | 9% | 87 s | 40 |
| 4 | 28.8 | 25 a 35 | 18% | 105 s | 98 |
| 5 | 37.4 | 35 a 45 | 18% | 113 s | 226 |
| 6 | 50.9 | 45 a 55 | 15% | 110 s | 510 |
| 7 | 56.8 | 55 a 65 | 10% | 91 s | 1093 |
| 8 | 66.7 | 60 a 75 | 9% | 106 s | 2087 |
| 9 | 78.3 | 70 a 85 | 11% | 88 s | 3810 |
| 10 | 92.6 | 80 a 95 | 11% | 93 s | 6437 |
Total: 460.6 min (7.7 h)

Resultado: tudo dentro da faixa.

#### Semente 3

| Praia | Minutos | Meta | Áreas antigas abertas | Maior espera | Fama ganha |
|---|---|---|---|---|---|
| 1 | 8.7 | 8 a 10 | - | 109 s | 3 |
| 2 | 18.4 | 15 a 20 | 0% | 117 s | 8 |
| 3 | 22.0 | 20 a 25 | 9% | 85 s | 40 |
| 4 | 29.6 | 25 a 35 | 18% | 121 s | 99 |
| 5 | 37.0 | 35 a 45 | 18% | 96 s | 225 |
| 6 | 52.2 | 45 a 55 | 14% | 128 s | 514 |
| 7 | 60.3 | 55 a 65 | 9% | 102 s | 1159 |
| 8 | 67.2 | 60 a 75 | 9% | 113 s | 2180 |
| 9 | 73.3 | 70 a 85 | 11% | 78 s | 3696 |
| 10 | 82.8 | 80 a 95 | 12% | 75 s | 5929 |
Total: 451.5 min (7.5 h)

Resultado: tudo dentro da faixa.

Os totais foram 457,0 / 460,6 / 451,5 min (aproximadamente 7,62 / 7,68 / 7,52 h). A maior espera observada foi 128 s; as áreas antigas abriram em até 19% do tempo da praia. Os valores das tabelas estão arredondados como na saída do simulador; as verificações usam os valores sem arredondamento.

### Ambiente na nuvem e verificação visual

- Li `CLAUDE.md`, `AGENTS.md`, `ROTEIRO.md`, o relatório anterior e `docs/MOLDE-ORLA.md` antes das alterações. O `../CLAUDE.md` citado nas instruções não existe neste checkout.
- Node 24.19.0; dependências instaladas com `npm ci`, preservando manifestos, lockfile, integridade e TLS. O cache padrão em `/home/agent/.npm` falhou por não ser gravável; usar `--cache /tmp/barraca-npm-cache` resolveu a instalação.
- `npm run dev -- --host 0.0.0.0` iniciou o Vite na porta 5175, e uma requisição local confirmou o HTML e o canvas. Chromium abriu o jogo e executou as prévias sem exceções de JavaScript.
- Na prévia da Praia 5, tentar posicionar o jogador em x=3000 o manteve na divisa, com câmera em aproximadamente 1644 e corda visível. Na Praia 6, a mesma posição foi alcançada, com câmera em aproximadamente 2800, sem corda e com Palco/Torneio trancados à vista. Também conferi a distribuição das cangas/cadeiras na Praia 10 e o Palco na nova posição.
- Atualizei `CLAUDE.md` e o molde da orla para refletir a exploração, as coordenadas e os banhistas.
- Salvei `install_script` e `start_skill` no rascunho do ambiente, com diretório, Node 24, instalação pelo lockfile, reinício do Vite e verificações. Não foram necessários novos segredos ou domínios. O salvamento foi confirmado; ele não publica o ambiente. Para reutilizar o snapshot, revisar/salvar as configurações e publicar o ambiente pela interface.

### O que ficou fraco ou não deu

- Nenhuma das três partes ficou bloqueada; todos os testes finais, build e as três sementes passaram. As falhas intermediárias de economia foram resolvidas pela calibração acima.
- A validação visual foi feita em Chromium headless; não houve teste manual em celular físico nem avaliação de FPS em aparelho. Isso continua sendo uma conferência útil para revisão, principalmente nos grupos de banhistas e na corda junto à borda da câmera.
- APK e AAB não foram gerados nesta rodada: não faziam parte das três mudanças pedidas. As pendências Android registradas no relatório anterior não foram tratadas.
- A publicação do ambiente e a restauração numa nova tarefa não foram executadas; o fluxo web foi validado na instância atual e as instruções reutilizáveis foram salvas.

### Dúvidas

Nenhuma dúvida bloqueante. A quadra separada do Torneio foi necessária para cumprir sua posição depois do Palco mantendo a área 5 no quinto trecho.


## Parte C (OpenCode) — anúncios automáticos mais raros (15/10/2026)

Pedido direto do usuário: diminuir os anúncios automáticos para reduzir as interrupções.

- Antes: um automático elegível em cada viagem saindo das Praias 4 a 9, com intervalo mínimo de 4 minutos.
- Agora: somente nas viagens saindo das Praias 6 e 9, com intervalo mínimo de 60 minutos e primeira hora da sessão livre de automáticos. São no máximo duas ocasiões na progressão das dez praias, em vez de seis.
- Após terminar ou fechar uma tentativa de anúncio opcional, há 15 minutos sem automáticos. Os anúncios de recompensa continuam dependendo do toque do jogador e não receberam limite de frequência.
- Mantidos o barquinho antes do automático, a ausência de banners e a regra de não interromper o jogo durante as tarefas.
- Testes verificam as duas praias elegíveis, a fronteira de uma hora e o descanso de 15 minutos após recompensados. Documentação do jogo e GDD atualizados.
- Validação: `npm test` passou com 83 testes e `npm run build` passou antes do commit. A economia não foi alterada.
- Limitação: não houve teste de anúncio real em celular/AdMob; os IDs continuam em modo de teste. Os intervalos são controlados por sessão, como antes; reiniciar o app inicia uma nova hora sem automáticos.
- Commit: registrado junto com esta seção, em português. Nenhuma dúvida bloqueante.

## Parte C (OpenCode) — APK para baixar (17/10/2026)

- Gerado `dist-android/barraca-na-praia-debug.apk` (10,3 MiB), versão 1.0.0, versionCode 1, pacote `com.jogosbr.barracanapraia`. Inclui todas as alterações atuais, inclusive os anúncios automáticos reduzidos.
- Comandos: `npm test` (83 testes passaram), `npm run build`, `npx cap sync android` e `bash gradlew --no-daemon --max-workers=2 assembleDebug` (BUILD SUCCESSFUL).
- Ambiente: SDK Android 36 e Build Tools 35.0.0 em `/workspace/android-sdk`; JDK 21 completo em `/workspace/android-build/jdk`. O Java original só tinha o runtime. As ferramentas foram baixadas das fontes oficiais com checksums conferidos; o Java foi configurado para usar o proxy e o repositório de certificados do sistema, mantendo TLS verificado. Configuração local em `/workspace/android-build/java-network.env`, fora do repositório.
- Verificação: assinatura APK v2 válida, arquivo ZIP íntegro e os 10 arquivos web empacotados idênticos aos de `dist/`. Requer Android 7 (API 24) ou superior. Não foi instalado em dispositivo físico nesta tarefa.
- SHA256: `95febbd4c5a29c2d55725ca1488c4aaa8cec6874566448c7a21b87ea2a1a996a`.
- APK de depuração, com assinatura de teste gerada neste ambiente e IDs de teste do AdMob; não é o pacote de publicação da Play Store. O arquivo fica ignorado pelo Git. Nenhum código ou configuração Android versionada precisou ser alterado; este commit registra somente o relatório.

## Parte C (OpenCode) — publicação do APK para download

A pedido do usuário, o APK de teste foi incluído em `downloads/barraca-na-praia-debug.apk`, junto do SHA256, no ramo `entrega/apk-teste-20261017`. O ramo mantém as alterações anteriores do jogo e acrescenta o binário para permitir download pelo GitHub. A API de Releases permanece bloqueada pela rede, mas o envio por Git foi verificado; a `main` não é alterada. O APK é o mesmo 1.0.0 validado na seção anterior, com as alterações de anúncios. Testes e build são executados antes do commit de entrega.

## Parte C (OpenCode) — mochila, barreiras e compras livres (17/10/2026)

Pedido direto do usuário, executado na ordem solicitada. Li `AGENTS.md`, `CLAUDE.md`, `ROTEIRO.md`, o relatório anterior e `docs/MOLDE-ORLA.md`. O `../CLAUDE.md` continua ausente neste ambiente. O roteiro antigo já estava em `AGUARDANDO REVISÃO`; o pedido atual autorizou esta rodada, e essa linha foi mantida.

### Commits e verificações por parte

1. `d3d71c5` — **Amplia a mochila e a carga proporcional dos ajudantes**. `npm test`: 85 testes passaram; `npm run build`: passou.
2. `d8be54b` — **Limita as primeiras praias e cria terrenos sólidos com rotas de desvio**. `npm test`: 94 testes passaram; `npm run build`: passou.
3. `89e192d` — **Libera os quadros de compra e preserva melhorias fora de ordem**. `npm test`: 105 testes passaram; `npm run build`: passou.

A calibração final e esta seção são registradas em um commit adicional, com testes e build passando antes dele. As três partes ficaram em commits separados no ramo `melhorias/carga-barreiras-compras`.

### O que foi feito

**Carga:** capacidade inicial real de 8 itens e quatro melhorias para 12, 16, 24 e 32. A pilha desenha todos os itens nas costas, em três colunas, crescendo por fileiras; as animações de coleta e entrega acompanham a posição da carga. Ajudantes gerais carregam metade da capacidade do jogador (4/6/8/12/16), e sorveteiros/instrutores carregam um quarto (2/3/4/6/8), inclusive quando já contratados. Caixas e pranchas respeitam a capacidade real. A Barraca ganhou três posições extras na trilha (63 ao todo), preservando as 60 melhorias anteriores.

**Barreiras e colisão:** nas Praias 1 a 5, o limite acompanha os terrenos abertos; jogador e câmera não avançam além dele. Corda de praia e placa com seta, nome e praia da próxima área indicam a continuidade. Da Praia 6 em diante, o mapa inteiro fica disponível, e todo terreno ainda fechado é sólido até sua compra. O quadro de abertura fica do lado de fora. A colisão considera deslocamentos grandes e permite deslizar na borda. Jogador/bot e ajudantes usam rotas com desvios nas quinas; o bot considera também máquinas e os quadros que não pretende comprar. Os banhistas mantêm seu caráter visual, sem bloquear o jogador ou os clientes.

**Compras:** os dois próximos quadros em pontos distintos de cada área aberta podem ser pagos em qualquer ordem. Não existe mais o estado “depois”. Só dependências concretas ficam com “Precisa de: X”, incluindo fritadeira não construída e conclusão da etapa anterior do torneio. A seta continua sugerindo custo-benefício, e o nível continua sendo a quantidade de melhorias compradas. O sucessor no mesmo chão aparece após sair dele, evitando que a comemoração de uma compra já inicie outro gasto involuntário. Os demais quadros visíveis continuam disponíveis imediatamente.

**Save:** formato v5 guarda os índices exatos das compras e os pagamentos parciais. A conversão de v4 preserva as melhorias antigas, inclusive níveis altos da cauda, a identidade do mundo e os pagamentos nos índices remapeados. O v3 mantém sua conversão anterior. Testes cobrem compra alternativa, retomada de pagamento parcial, dependências, impedimento de compras repetidas, ordem e recuperação do progresso.

**Navegação durante as compras livres:** corrigi oscilações de entrega de cargas mistas e a aproximação às quinas com muitos níveis de chinelo. A decisão humana do simulador continua com reação de 200–400 ms, desvio leve e pausas de 3–5 s a cada 30 s; as metas e asserções não foram relaxadas.

### Economia e simulador final

As mochilas extras têm preços-base próprios de R$ 8.000, R$ 24.000 e R$ 64.000, multiplicados pelos fatores de praia e começo rápido existentes. Inserir essas compras não encarece as melhorias antigas da cauda. A capacidade maior e as compras livres aceleraram a progressão; os preços-base foram recalibrados na `ECONOMIA` para manter as metas originais.

| Área | Base antes desta rodada | Base final |
|---|---:|---:|
| Chuveirão | 11.000 | 13.000 |
| Quadra | 130.000 | 170.000 |
| Ambulantes | 1.050.000 | 1.470.000 |
| Escolinha de surf | 3.000.000 | 4.575.000 |
| Sucos e vitaminas | 6.000.000 | 9.000.000 |
| Palco de pagode | 11.650.000 | 18.000.000 |
| Torneio de futevôlei | 17.700.000 | 32.000.000 |

Metas originais: durações conforme a tabela, total de 450–540 min (7,5–9 h), espera máxima de 150 s e áreas antigas funcionando nos primeiros 25% da praia. Fama crescente e conclusão das dez praias também verificadas. Comando final: `npm run sim` (bot humano, sementes 1, 2 e 3). Os valores abaixo são os arredondados pelo comando; a avaliação usa valores completos.

### Semente 1

| Praia | Minutos | Meta | Áreas antigas abertas | Maior espera | Fama ganha |
|---|---|---|---|---|---|
| 1 | 8.5 | 8 a 10 | - | 104 s | 3 |
| 2 | 17.2 | 15 a 20 | 0% | 120 s | 7 |
| 3 | 21.2 | 20 a 25 | 9% | 99 s | 40 |
| 4 | 27.7 | 25 a 35 | 17% | 96 s | 96 |
| 5 | 36.7 | 35 a 45 | 17% | 114 s | 243 |
| 6 | 50.3 | 45 a 55 | 13% | 92 s | 585 |
| 7 | 61.0 | 55 a 65 | 8% | 92 s | 1339 |
| 8 | 64.9 | 60 a 75 | 10% | 77 s | 2455 |
| 9 | 79.4 | 70 a 85 | 11% | 74 s | 4595 |
| 10 | 94.8 | 80 a 95 | 11% | 78 s | 7894 |
Total: 461.5 min (7.7 h)
Tudo dentro da faixa.

### Semente 2

| Praia | Minutos | Meta | Áreas antigas abertas | Maior espera | Fama ganha |
|---|---|---|---|---|---|
| 1 | 8.4 | 8 a 10 | - | 102 s | 3 |
| 2 | 18.3 | 15 a 20 | 0% | 115 s | 8 |
| 3 | 20.4 | 20 a 25 | 10% | 102 s | 40 |
| 4 | 27.1 | 25 a 35 | 19% | 89 s | 96 |
| 5 | 36.4 | 35 a 45 | 17% | 108 s | 242 |
| 6 | 49.1 | 45 a 55 | 13% | 93 s | 573 |
| 7 | 62.0 | 55 a 65 | 7% | 90 s | 1339 |
| 8 | 65.3 | 60 a 75 | 10% | 74 s | 2457 |
| 9 | 79.7 | 70 a 85 | 11% | 78 s | 4594 |
| 10 | 88.8 | 80 a 95 | 12% | 72 s | 7437 |
Total: 455.6 min (7.6 h)
Tudo dentro da faixa.

### Semente 3

| Praia | Minutos | Meta | Áreas antigas abertas | Maior espera | Fama ganha |
|---|---|---|---|---|---|
| 1 | 8.6 | 8 a 10 | - | 110 s | 3 |
| 2 | 18.4 | 15 a 20 | 0% | 117 s | 8 |
| 3 | 20.3 | 20 a 25 | 9% | 97 s | 40 |
| 4 | 27.2 | 25 a 35 | 18% | 96 s | 96 |
| 5 | 36.3 | 35 a 45 | 17% | 106 s | 242 |
| 6 | 50.5 | 45 a 55 | 14% | 88 s | 585 |
| 7 | 63.1 | 55 a 65 | 7% | 80 s | 1383 |
| 8 | 68.9 | 60 a 75 | 9% | 78 s | 2624 |
| 9 | 75.4 | 70 a 85 | 11% | 76 s | 4550 |
| 10 | 93.7 | 80 a 95 | 11% | 72 s | 7902 |
Total: 462.3 min (7.7 h)
Tudo dentro da faixa.

### Validação final e limites

- `npm run sim`: as dez praias dentro de todas as metas nas três sementes; totais de **461,5 / 455,6 / 462,3 min** (aproximadamente 7,69 / 7,59 / 7,71 h). Nenhuma semente travou. As maiores esperas arredondadas ficaram em 120 / 115 / 117 s; as áreas antigas abriram antes dos primeiros 20% da praia (meta: até 25%).
- `npm test`: **105 testes passaram em 8 arquivos**, após a calibração final. `npm run build`: passou. `git diff --check`: sem erros. Nenhuma meta do simulador foi alterada.
- Verificação visual em Chromium headless: capacidades 8/12/16/24/32, corda e placa na Praia 1, terrenos futuros na Praia 6 e quadro “Precisa de: Fritadeira de pastel”, com texto legível. As capturas e logs de trabalho ficaram em `/workspace/barraca-validacao/`, fora do repositório.
- Atualizados `CLAUDE.md`, GDD e o molde da orla conforme as regras implementadas.

### O que ficou fraco ou não deu

Nenhuma das três partes foi abandonada. As execuções intermediárias mostraram travamentos nas quinas e tempos fora da faixa; os desvios, a aproximação e os preços foram corrigidos antes da validação final acima.

Não houve teste manual em celular físico nem medição de FPS em aparelho. O balanceamento está validado para o bot humano das três sementes, e a experiência de jogadores reais ainda precisa de teste no aparelho. Não gerei um APK novo nesta rodada: o APK publicado anteriormente continua com a versão anterior destas três mudanças. Os novos commits ficaram locais neste ramo; não houve nova publicação no GitHub.

### Dúvidas

Nenhuma dúvida bloqueante.
