# Relatório: Barraca na Praia, rodada 5

Resultado: CONCLUÍDA (partes A e B, do Claude Code). A parte C fica para o OpenCode.
Commit: af36019 (parte A), 07ba09e (parte B); o deste relatório vem logo depois.

## Critérios de pronto
- [x] A praia 1 começa só com a Barraca do Sol, e a praia N tem as áreas 1 a N. Evidência: teste "a praia N só tem as áreas 1 a N" (N de 1 a 5, com todas as áreas levadas ao nível 12, só as N primeiras abrem). No navegador, `?praia=2` mostra Barraca e Sorvete, e o lote do Chuveirão aparece cercado.
- [x] O quadro de nova praia libera com a área N no nível 10, e a viagem mostra a fama e o anúncio opcional. Evidência: teste "a nova praia só libera com a área N no nível 10". No navegador, o quadro dourado "Viajar para a Praia Grande · +X de fama", depois o litoral com o barquinho, depois o cartão "+3 de fama ⭐" com "Ver anúncio: +20% de fama". O anúncio simulado levou a fama a +4.
- [x] A fama aparece no HUD e aumenta o lucro. Evidência: "⭐ Fama x1,2" na Praia 2 e "Fama x8,1" na Praia 5. Teste "a fama aumenta o lucro": vendas e ganhos offline × (1 + 0,07 × fama).
- [x] O começo rápido vale a partir da praia 3. Evidência: teste do começo rápido. Na Praia 2 não há ajudante nem cofre. Na Praia 3 a Barraca começa no Nv 2, com ajudante e cofre, e o Sorvete, ao abrir, já vem com sorveteiro e cofre. A área nova (Chuveirão) começa manual.
- [x] Só o lote da próxima praia aparece cercado, e os outros ficam escondidos. Evidência: na Praia 2, o lote 3 mostra "Na próxima praia: Chuveirão e cadeiras". Na Praia 5, o lote dos Ambulantes mostra "Na próxima praia: Ambulantes". Os lotes depois do N+1 não são desenhados.
- [x] O litoral mostra as 10 praias, cada uma no estado certo. Evidência: no navegador, as concluídas aparecem com "+X de fama ⭐", a atual com "Você está aqui" e destaque, a próxima com a área nova e as seguintes com cadeado. No fim, "Praia 11 em diante · em breve".
- [x] O simulador está dentro das metas da A5, e a tabela está abaixo. Evidência: "Tudo dentro da faixa." nas sementes 1, 2 e 3. O teste do simulador exige `foraDaFaixa = []`.
- [x] O save v4 tem `mundo` e converte o v3. Evidência: testes "grava com chave própria, versão 4 e o mundo", "o mundo é criado uma vez e nunca muda" e "o v3 vira a praia igual ao número de áreas abertas".
- [ ] As praias 1 a 10 têm cenário próprio. As praias 1 e 2 estão completas. As praias 3 a 10 têm só nome, cores provisórias e sol: elas são a parte C (OpenCode), que segue `docs/MOLDE-CENARIOS.md`.
- [x] `npm test` e `npm run build` passam. Evidência: 48 testes passando, e o build gera `dist/`.

## O que foi feito

### Parte A: praias e fama
- **A1. Regras** (`src/core/jogo.ts`):
  - `areasPraia()`: com ela, `liberada(a)` só vale para as áreas 1 a N.
  - `novaPraiaAberta()`: a área N no nível `NIVEL_NOVA_PRAIA` (10).
  - `proximaExiste()`: falso depois da Praia 5.
  - `custoNovaPraia()`: o preço do próximo nível da área N.
  - `viajar()`: zera o dinheiro, os níveis e o ganho, e guarda a fama em `famas` e `famaTotal`.
  - `famaGanha()`: floor(√(ganho ÷ K)). `lucro()` vale 1 + taxa × fama e substitui o antigo `mult()` nas vendas e nos ganhos offline.
  - Começo rápido: `makeTrilha(a, b, rapido)` em `economia.ts` põe o 1º ajudante e o cofre logo depois da abertura, com preço 0. `Jogo.gratis(a)` aplica esses passos sozinho, e eles contam como níveis.
  - Saíram `NIVEL_PRESTIGIO`, `prestige()`, `prestigeOpen()`, `prestigeCost()` e `BEACHES`.
- **A2. Mapa** (`src/render/desenho.ts`):
  - Só aparecem os lotes da praia e o lote N+1, este com a placa "Na próxima praia: …".
  - O quadro dourado (`drawPadPraia`) é maior que os outros, para caber o nome. Na Praia 5 mostra "Praia Dourada · em breve".
  - O pilar 6 foi atualizado no `CLAUDE.md` e no GDD.
- **A3. Cenários:**
  - `src/dados/praias.ts` tem `PRAIAS[10]` com nome, área nova, mar, areia, céu, hora e enfeites.
  - `src/render/cenarios.ts` desenha o céu (faixa nova de 34 de altura), o mar, as ondas, a areia, a luz da hora e os enfeites `sol`, `nuvens`, `gaivotas`, `boias`, `ilha`, `navio` e `jangadas`. Todos são determinísticos (`hash(i)`, sem `Math.random`) e ficam acima de `SHORE - 6`.
  - Praia do Sol (manhã): sol, nuvens, gaivotas e boias. Praia Grande (tarde): ilha, navio e jangadas. As praias 3 a 10 têm cores provisórias e só o sol.
  - Prévia `?praia=N` em `main.ts`, só em dev: abre a praia com as áreas abertas, dinheiro e a fama mínima, sem gravar o save.
  - `docs/MOLDE-CENARIOS.md` tem as regras, um enfeite comentado e a tabela das praias 3 a 10.
  - O desenho do cenário não estava em cache, então os enfeites são desenhados a cada quadro.
- **A4. Save v4** (`src/plataforma/salvar.ts`):
  - Formato `{ versao: 4, mundo: { id, criadoEm }, jogo }`. O `jogo` traz `praia` (de 1 a 10), `famaTotal`, `famas`, `ganho` e `tempo`.
  - O `lerMundo` reaproveita o mundo já salvo ou cria um (`crypto.randomUUID`).
  - O `deV3` leva o save v3 para a praia igual ao número de áreas abertas (no máximo 5), com `ECONOMIA.famaMinima` das praias anteriores, e começa essa praia do zero. O `Jogo.load` aplica o começo rápido depois de carregar.
- **A5. Simulador** (`src/core/simulador.ts`, `scripts/sim.ts`):
  - O bot joga as praias de 1 a 5 e compra a viagem assim que ela libera.
  - O resultado é por praia: minutos, % do tempo até as áreas antigas abrirem, maior espera e fama.
  - `METAS`, `ESPERA_MAX` e `ANTIGAS_MAX` estão em `foraDaFaixa`.
  - `npm run sim` roda as sementes 1, 2 e 3 (`-- --compras` lista as compras).
- **A6. Analytics:** evento `praia_nova` com `{ praia, fama_ganha, minutos, anuncio }`, disparado depois que o jogador escolhe ver ou não o anúncio. O antigo `prestige` saiu.
- **Testes:**
  - `jogo.test.ts`: praias, viagem, "em breve", fama, começo rápido e save com praia e fama.
  - `economia.test.ts`: trilha do começo rápido.
  - `salvar.test.ts`: v4, mundo e conversão do v3.
  - `simulador.test.ts`: metas por praia.
  - O teste de áreas independentes continua.

### Parte B: litoral e viagem
- **B1. Litoral:**
  - O jogo continua abrindo direto na praia.
  - O botão "Litoral" fica no rodapé, ao lado de "Dinheiro em dobro", e abre `#ovLitoral`: um SVG com a costa e as 10 praias nos estados pedidos (`hud.ts`, `desenharLitoral`).
  - Com o litoral aberto, o jogo fica parado (estado `litoral`).
- **B2. Viagem** (`hud.viagem`):
  1. O litoral abre com o barquinho indo da praia antiga à nova (transição CSS de 1,6 s; com "reduzir movimento", não há animação).
  2. Vem o intersticial, se puder.
  3. Aparece o cartão "+X de fama ⭐", com "Ver anúncio: +20% de fama" (`Jogo.bonusFama`) e "Continuar".
  4. O nome da praia nova aparece grande na tela (`#praiaNome`).
- **B3. Anúncios:**
  - `podeIntersticial` agora exige que a praia deixada seja a 4 ou uma depois dela, e vale no máximo 1 a cada 4 min.
  - Saiu o intersticial logo depois de uma compra (`main.ts`), que contrariava "nunca durante o jogo".
  - Não há banner (já não havia).
- **B4. Documentação:**
  - GDD: seções 6 (litoral, mapa e cenário), 8 (preços, nova praia e fama, começo rápido, ritmo por praia, ganhos offline), 9 (intersticial e o anúncio de fama) e 11 (save v4, `praia_nova`).
  - `CLAUDE.md` do jogo: praias, estrutura, save, prévia, anúncios e balanceamento.

## Números

Simulador (`npm run sim`, bot humano, sementes 1, 2 e 3), com o código final:

```
Bot humano, semente 1
| Praia | Minutos | Meta | Áreas antigas abertas | Maior espera | Fama ganha |
|---|---|---|---|---|---|
| 1 | 8.8 | 8 a 10 | - | 116 s | 3 |
| 2 | 17.4 | 15 a 20 | 0% | 139 s | 7 |
| 3 | 21.2 | 20 a 25 | 9% | 139 s | 28 |
| 4 | 26.7 | 25 a 35 | 18% | 103 s | 69 |
| 5 | 38.9 | 35 a 45 | 15% | 120 s | 193 |
Total: 113.0 min
Tudo dentro da faixa.
Bot humano, semente 2
| Praia | Minutos | Meta | Áreas antigas abertas | Maior espera | Fama ganha |
|---|---|---|---|---|---|
| 1 | 9.0 | 8 a 10 | - | 113 s | 3 |
| 2 | 17.8 | 15 a 20 | 0% | 142 s | 7 |
| 3 | 20.3 | 20 a 25 | 11% | 140 s | 28 |
| 4 | 25.1 | 25 a 35 | 18% | 105 s | 65 |
| 5 | 35.5 | 35 a 45 | 16% | 136 s | 178 |
Total: 107.8 min
Tudo dentro da faixa.
Bot humano, semente 3
| Praia | Minutos | Meta | Áreas antigas abertas | Maior espera | Fama ganha |
|---|---|---|---|---|---|
| 1 | 9.0 | 8 a 10 | - | 120 s | 3 |
| 2 | 17.6 | 15 a 20 | 0% | 138 s | 7 |
| 3 | 21.5 | 20 a 25 | 10% | 139 s | 27 |
| 4 | 27.5 | 25 a 35 | 17% | 105 s | 70 |
| 5 | 35.3 | 35 a 45 | 16% | 117 s | 181 |
Total: 111.0 min
Tudo dentro da faixa.
```

Antes do ajuste (os números da rodada 4, com a progressão nova): a Praia 1 levava 11 min, a 3 levava 32 a 33 e a 4, de 50 a 66. Havia esperas de até 307 s, e as áreas antigas só abriam a 27 a 31% do tempo da praia.

`ECONOMIA` final (`src/dados/planos.ts`):

| | Barraca | Sorvete | Chuveirão | Milho e pastel | Quadra |
|---|---|---|---|---|---|
| abrir | - | 8.500 | 100.000 | 300.000 | 900.000 |
| base | 100 | 700 | 8.500 | 26.000 | 120.000 |
| cresce | 1,55 | 1,4 | 1,3 | 1,3 | 1,35 |

O fator de preço por praia é 1,45^b. A fama usa K = 2000 e taxa 0,07. As áreas antigas custam 20% do preço (`antiga`). A fama mínima, que é a medida pelo bot, é `[3, 7, 27, 65, 178]`.

## O que depende do usuário
- Nada nesta parte. O APK está fora do escopo da rodada.
- A parte C (cenários das praias 3 a 10) é do OpenCode. O status do roteiro foi trocado para `PRONTO PARA OPENCODE`.

## Problemas e decisões
- **Desconto das áreas antigas (`ECONOMIA.antiga = 0,2`).** Mexendo só em K, na taxa e no fator de preço, as áreas antigas abriam a 28 a 54% do tempo da praia, porque reabrir em ordem custava caro. Criei esse desconto, que vale junto com o começo rápido (Praia 3 em diante) e fica num lugar só (`makeTrilha`).
- **Preços das áreas 2 a 5 mudaram.** O Sorvete ficou mais barato, e o Chuveirão, o Milho e a Quadra, mais caros. Era preciso para cada praia caber na meta, já que a área nova é o que mais pesa no tempo da praia.
- **A seta dá mais peso à área nova.** Na conta do custo-benefício, a melhoria da área nova (já aberta) vale 2 vezes mais. Sem isso, o bot (e a seta) espalhava o dinheiro pelas áreas antigas, e a Praia 5 variava de 27 a 52 min conforme a semente. Com isso, a variação ficou em 35 a 39 min.
- **O desvio do bot foi corrigido.** O bot pisava sem querer nos quadros das áreas antigas enquanto juntava dinheiro para a viagem, gastando o dinheiro e esperando até 250 s. Agora ele contorna o quadro pela quina mais perto do alvo. A primeira versão desse desvio prendia o bot numa quina (espera de 520 s); a versão final escolhe a quina só pela distância até o alvo.
- **A viagem custa** o preço do próximo nível da área N, para que pisar no quadro seja uma decisão (o pagamento leva cerca de 1 s) e não um acidente.
- **"O recorde"** pedido no roteiro não existia no save. A informação nova que fica entre as praias é `famas`, a fama de cada praia concluída, que o litoral mostra.
- **Os "minutos" de `praia_nova`** contam o tempo de jogo na praia (`tempo`, salvo). Tempo com o app fechado e telas abertas não conta.
- **Intersticial:** a regra "nunca nas praias 1 a 3" usa a praia que o jogador está deixando. O primeiro pode aparecer na viagem da Praia 4 para a 5.
- **Conversão do v3:** o jogador vai para a praia certa com a fama mínima, mas o dinheiro e os níveis zeram, como numa viagem. Os ganhos pendentes (`pendente`) ficam.
- **O "⭐ Fama x…"** fica no canto do canvas, no lugar do antigo "R$ x1,5". O botão "Litoral" foi para o rodapé porque o topo já está cheio no celular. Com ele, "Dinheiro em dobro" quebra em 2 linhas numa tela de 375 px.

## Sugestões
- **Analytics:** `step_buy` e `session_*` mandam a praia começando do 0, e `praia_nova` manda a praia começando do 1 (como pede o roteiro). Vale unificar antes de ligar o Firebase.
- **Nomes:** o nome da área 2 é "Sorvete" no jogo (`AREAS`) e "Sorveteria" no litoral (tabela do roteiro). Vale escolher um só.
- **Praia 2:** a espera antes da Barraca nv 10 fica em 138 a 142 s, perto do limite de 150. Se o teste fechado mostrar tédio ali, baixe `cresce[0]`.
- **Simulador:** a métrica das áreas antigas mede quando elas abrem. Se "voltar a funcionar" tiver de incluir o nível 5, dá para medir isso também.

## Parte C (OpenCode)

Cenários das praias 3 a 10, seguindo `docs/MOLDE-CENARIOS.md`. Só `src/dados/praias.ts` e `src/render/cenarios.ts` foram mexidos.

### Commits
- `31b3efa` Parte C: cenários das praias 3 e 4 (farol, pedras e coqueiros).
- `86f44cd` Parte C: cenários das praias 5 e 6 (muralha do forte e barquinhos).
- `c2e4130` Parte C: cenários das praias 7 e 8 (ondas grandes, pranchas e veleiros).
- `06fc75d` Parte C: cenários das praias 9 e 10 (reflexo do sol, bandeirinhas e faixas).
- Este commit: relatório da parte C e status do roteiro para AGUARDANDO REVISÃO.

`npm test` (48 testes) e `npm run build` passaram antes de cada um dos quatro commits.

### O que foi feito
- **Enfeites novos** (`src/render/cenarios.ts`), todos determinísticos (`hash(i)`, sem `Math.random`), com movimento por `e.t` e dentro da faixa permitida (acima de `SHORE - 6`, com as pranchas descendo até `SHORE + 4`):
  - `farol` (torre listrada, uma por mundo, com a luz piscando) e `pedras` (rochas na beira da água) — Praia 3.
  - `coqueiros` (coqueiros curvados pelo vento, repetidos a cada 130) — Praia 4.
  - `muralha` (pedra e ameias do forte correndo pelo horizonte) — Praia 5.
  - `barquinhos` (barcos coloridos balançando na água) — Praia 6.
  - `ondasGrandes` (cristas brancas mais altas no mar) e `pranchas` (pranchas fincadas na beira) — Praia 7.
  - `veleiros` (barcos à vela atravessando a baía devagar) — Praia 8.
  - `reflexo` (brilho do sol tremulando na água, na mesma coluna do enfeite `sol`) — Praia 9.
  - `bandeirinhas` (cordão de bandeirinhas entre postes no céu) e `faixas` (painéis coloridos de campeonato no horizonte) — Praia 10.
- **Praias 3 a 10** (`src/dados/praias.ts`): cores definitivas (mar, areia e céu pela hora do dia), hora conforme a tabela do molde e a lista de enfeites de cada uma. Cada praia ficou com pelo menos 3 enfeites e pelo menos 1 novo, como pede o molde. Saíram as cores provisórias e o `['sol']`.

### O que ficou fraco ou não deu
- **Não deu para conferir no navegador.** Não tenho acesso a browser nesta sessão, então a checagem do `?praia=N` foi feita por leitura: confirmei que todo enfeite fica no céu (`y < 34`) ou no mar (`34..112`) e que as pranchas (Praia 7) são as únicas que encostam na areia, até `SHORE + 4`. Vale abrir cada praia no dev e olhar a composição.
- **Nuvens brancas no pôr do sol (Praia 9).** O enfeite `nuvens` é branco fixo; contra o céu laranja pode ficar destoante. Se incomodar, dá para tingir as nuvens por hora.
- **Bandeirinhas e faixas (Praia 10)** ficam no alto do céu, na faixa que o painel "Fama" cobre no canto de cima da tela. Não são informação importante, mas podem aparecer atrás do painel.
- **Densidade dos enfeites** foi estimada contando as formas por tela (limite de ~30 por enfeite do molde). Ficou dentro do limite, mas sem ver rodando não confirmei a sensação visual (ex.: os coqueiros a cada 130 unidades).

### Dúvidas
- O mar da Praia 4 (`#0e7d8c`/`#3ac7c0`) ficou esverdeado para combinar com os coqueiros. Se a intenção era um mar mais azul só com os coqueiros no horizonte, é uma troca rápida.
- O `reflexo` da Praia 9 só faz sentido colado ao `sol`; ele assume que a hora é `porDoSol`. Se alguém puser `reflexo` numa praia de manhã ou à tarde, ele vai parecer um brilho solto no mar. Posso condicionar a `P.hora` se preferirem.
