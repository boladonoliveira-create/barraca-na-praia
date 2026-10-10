# Relatório: Barraca na Praia, rodada 7

Resultado: CONCLUÍDA (parte A, do Claude Code). A parte B fica para o OpenCode.
Commit:
- `67f24bf`: roteiro novo;
- `2ec0286`: A1;
- `0b555c6`: A2;
- `e565f7c` e `823dbaa`: A3;
- `fbe05e8`: A4;
- `1fedd5a`: A5;
- o deste relatório vem logo depois.

## Critérios de pronto
- [x] A praia tem as faixas mar, areia, grama, calçadão e rua, a câmera anda na vertical e ninguém entra na rua. Evidências:
  - teste "o jogador anda até o fim da calçada e não entra na rua; a câmera desce junto";
  - no navegador, a câmera desce até mostrar a grama, a ciclovia, a calçada e a rua.
- [x] As áreas ficam nos lugares da tabela da A2, e os quiosques ficam na grama. Evidências:
  - teste "nenhuma área fica fora da faixa dela": cada `LUGARES[i].rect` dentro da sua faixa; Sorveteria, Milho e pastel e Sucos na grama; Escolinha a menos de 60 da água; Ambulantes no calçadão;
  - teste "as zonas das áreas não se sobrepõem";
  - teste "todas as máquinas ficam no lugar da área delas".
- [x] As áreas futuras aparecem trancadas, com placa, e dá para passar por cima. Evidências:
  - teste "a área trancada não muda nada no jogo": na Praia 7, ficar 2 s em cima dos lugares do Sucos e do Palco não muda dinheiro, níveis, pagamentos nem lojas abertas;
  - no navegador, "TRANCADO · Palco de pagode · Praia 9".
- [x] Os ambulantes funcionam com caminhão, bancada, carrinhos rodando entre as pessoas e ajudante do caminhão. Evidências:
  - teste "caminhão, pilha, bancada, ambulante e dinheiro fecham o ciclo";
  - teste "os ambulantes sempre voltam e nunca travam... (10 min com o ajudante do caminhão)";
  - no navegador, as pilhas "CAIXAS DE MATE", a bancada com o estoque e os ambulantes andando pela areia.
- [x] A praia está cheia de banhistas que não atrapalham, e a Praia do Pôr do Sol tem menos. Evidências:
  - teste "de 25 a 40 por tela...", com 25 na Praia 9;
  - teste "nunca travam..." (10 min);
  - teste "não mudam o jogo";
  - o desenho ainda é simples: o acabamento é o item B2.
- [ ] O palco central tem os 8 músicos e o camarote. É o item B4 (OpenCode).
- [ ] Os números aparecem curtos. É o item B6 (OpenCode).
- [x] O simulador está dentro das metas. Evidência: nas 3 sementes, as 10 praias estão na faixa, o total fica entre 7,6 e 7,7 h, nenhuma espera passa de 147 s e as áreas antigas abrem entre 9% e 19% do tempo da praia (tabela abaixo).
- [x] `npm test` (67 testes, com o simulador na semente 1) e `npm run build` passam.

## O que foi feito

### A1. Mapa em faixas e câmera vertical
- **Mundo:** passou a ter 1140 de altura. `FAIXAS` fica em `src/dados/mapa.ts`, com mar (0 a 118), areia (118 a 820), grama (820 a 920), calçadão (920 a 1060, com a ciclovia em cima) e rua (1060 a 1140).
- **Limite do jogador:** `ANDA` vai de y 152 (perto da água) a 1048 (fim da calçada); a rua fica de fora.
- **Câmera:** `camY` em `jogo.ts`. Na areia de cima ela não se mexe, então o começo da Praia 1 e o tutorial ficam iguais. A partir de 60 do pé da tela ela desce, 1,6 vez mais depressa que o jogador, para a grama e a calçada aparecerem inteiras.
- **Seta do tutorial:** aponta na direção do alvo em qualquer borda da tela (`bordaArrow`), e não só nas laterais.
- **`livre(x, y)`:** recusa o mar fundo, a rua, balcões, zonas de entrega, dinheiro, filas, quadros de compra e as zonas das áreas.
- **Desenho:** grama, ciclovia, calçada e rua lisas (`orla` em `cenarios.ts`). O acabamento é o item B1.

### A2. Áreas reposicionadas
- **Lotes:** os lotes de cima a baixo (`LOTS`) e a faixa grande da Praia 7 saíram. Cada área tem `LUGARES[i]`: a faixa, o `rect` (o lugar dela, que é o quadrado trancado) e a `zona` (onde ficam as coisas dela). As zonas não se sobrepõem.
- **Coordenadas:** foram refeitas as de todas as lojas (`SHOPS`), quadros (`SLOTS`), máquinas, chuveiros, cadeiras, fila e caixa d'água (`SERVICO`), fila, mar e pranchas da escolinha (`ESCOLA`) e o caminho das filas.
  - **Barraca do Sol:** ficou igual, à esquerda.
  - **Quiosques** (Sorveteria, Milho e pastel, Sucos): o prédio fica na grama, as máquinas ao lado e os quadros na calçada; a fila sobe para a areia.
  - **Areia:** o Chuveirão e a Quadra ficam perto da grama, o Palco no centro e a Escolinha na beira da água.
  - **Ambulantes:** a bancada fica no calçadão.
  - **Torneio:** usa a quadra.
- **A praia inteira é aberta para andar.** Na areia, a câmera vai de uma ponta à outra (0 a 2600).
- **Áreas fechadas** (`drawTrancado`): quadrado tracejado no lugar da área, com cadeado e placa na estaca.
  - Praia futura: "TRANCADO · Palco de pagode · Praia 9".
  - Praia atual: "abre com X nv 5 (n/5)" ou "Pronta para abrir!", e o quadro de abrir aparece no lugar da área.
  - O Torneio mostra só a placa, ao lado da quadra.
- **Decoração da areia:** é recortada para fora das zonas das áreas, e `divisas()` usa a lista fixa `DIVISAS`.
- **Avisos:** as mensagens ("Açaí agora R$ X", "Leve o milho cru à panela!") aparecem em cima do balcão de cada área.

### A3. Ambulantes com caminhão e bancada
- **Caminhão:** chega sozinho à baia da rua a cada 14 s, deixa até 6 caixas, uma a cada 0,45 s, nas pilhas da calçada (até 8 por pilha) e vai embora. As caixas de mate vêm desde a abertura; as de biscoito, a partir do passo "Biscoito de polvilho" do cardápio.
- **Trabalho manual:** o jogador leva as caixas (até 3 na mão) até a bancada. Cada caixa vira 6 unidades; a bancada guarda até 36 de cada produto.
- **Ambulantes:** a abertura já traz 1; "Mais um ambulante" traz outros.
  1. O primeiro parado na bancada enche o carrinho com o estoque. Sai cheio, ou com o que tiver depois de 2,5 s com a bancada vazia.
  2. Anda pela areia, de um ponto sorteado a outro (y 190 a 790), vendendo para o cliente ou banhista mais perto.
  3. Volta vazio e deixa o dinheiro da volta na bancada, ou no caixa com o cofre.
- **Ajudante do caminhão** (o antigo gerente): leva as caixas das pilhas para a bancada.
- **O bot do simulador** leva as caixas à bancada.

### A4. Banhistas
- **Quantidade:** de 25 a 40 por tela, conforme a praia (`PRAIAS[b].banhistas`; 25 na Praia do Pôr do Sol), o que dá de 160 a 260 na orla inteira.
- **Roteiro:** cada banhista tem 3 pontos de interesse sorteados com `rand` ao criar a praia, fora das zonas das áreas (`livre`) ou no mar. Em cada ponto faz uma coisa: deita na canga, fica em pé, nada, joga frescobol (em dupla) ou, se for criança, brinca.
- **Posição:** sai do tempo (`posBanhista`). Não há atualização a cada quadro: ninguém trava e o custo no simulador é zero.
- **Sem colisão:** os banhistas nunca bloqueiam o jogador nem os clientes. Os clientes de verdade continuam iguais.
- **Desenho:** simples, com bonecos do jogo, canga, cabeça no mar e a bola do frescobol.

### A5. Simulador, balanceamento e documentos
- **Bot:** opera tudo no mapa novo. Também foi corrigida uma falha dele com as caixas dos ambulantes.
- **Metas:** `TOTAL_HORAS` passou para 7,5 a 9 h. O teste de metas voltou a valer: o `npm test` roda só a semente 1, e o `npm run sim` roda as 3.
- **Rebalanceamento:** no mapa novo, as Praias 5 a 10 ficaram uns 20% mais longas (o jogador anda mais entre as áreas). Baixei os preços das áreas 5 a 10, uma praia por vez. Os números estão abaixo.
- **Documentos:**
  - GDD, seção 6: reescrita com as faixas, os lugares, as áreas trancadas e os banhistas.
  - GDD, seções 7 e 8: os ambulantes, os preços e o ritmo.
  - GDD e `CLAUDE.md`: o pilar 6.
  - `CLAUDE.md`: áreas, estrutura, simulador e números.
- **`docs/MOLDE-ORLA.md`:** as faixas e as coordenadas, `livre`, onde fica cada área, a paleta e o que desenhar em cada item de B1 a B6.
- **Separação para a parte B3:** o desenho do prédio dos 3 quiosques foi para `drawQuiosque(si)`, assim o OpenCode não mexe na Barraca do Sol.

## Números

Simulador (`npm run sim`, bot humano, sementes 1, 2 e 3), com o código final:

```
Bot humano, semente 1
| Praia | Minutos | Meta | Áreas antigas abertas | Maior espera | Fama ganha |
|---|---|---|---|---|---|
| 1 | 8.7 | 8 a 10 | - | 110 s | 3 |
| 2 | 18.5 | 15 a 20 | 0% | 116 s | 8 |
| 3 | 21.7 | 20 a 25 | 9% | 84 s | 40 |
| 4 | 30.4 | 25 a 35 | 17% | 147 s | 100 |
| 5 | 38.2 | 35 a 45 | 18% | 100 s | 232 |
| 6 | 48.1 | 45 a 55 | 16% | 118 s | 492 |
| 7 | 60.4 | 55 a 65 | 9% | 91 s | 1140 |
| 8 | 61.2 | 60 a 75 | 9% | 80 s | 1964 |
| 9 | 83.8 | 70 a 85 | 9% | 118 s | 3922 |
| 10 | 90.1 | 80 a 95 | 11% | 83 s | 6386 |
Total: 461.1 min (7.7 h)
Tudo dentro da faixa.

Bot humano, semente 2
| Praia | Minutos | Meta | Áreas antigas abertas | Maior espera | Fama ganha |
|---|---|---|---|---|---|
| 1 | 8.7 | 8 a 10 | - | 107 s | 3 |
| 2 | 18.6 | 15 a 20 | 0% | 114 s | 8 |
| 3 | 21.6 | 20 a 25 | 9% | 85 s | 40 |
| 4 | 28.3 | 25 a 35 | 19% | 119 s | 95 |
| 5 | 36.8 | 35 a 45 | 19% | 107 s | 219 |
| 6 | 50.5 | 45 a 55 | 16% | 121 s | 493 |
| 7 | 57.4 | 55 a 65 | 10% | 91 s | 1077 |
| 8 | 67.7 | 60 a 75 | 9% | 102 s | 2071 |
| 9 | 80.1 | 70 a 85 | 11% | 99 s | 3842 |
| 10 | 88.3 | 80 a 95 | 12% | 99 s | 6263 |
Total: 457.9 min (7.6 h)
Tudo dentro da faixa.

Bot humano, semente 3
| Praia | Minutos | Meta | Áreas antigas abertas | Maior espera | Fama ganha |
|---|---|---|---|---|---|
| 1 | 8.7 | 8 a 10 | - | 114 s | 3 |
| 2 | 18.4 | 15 a 20 | 0% | 117 s | 8 |
| 3 | 22.0 | 20 a 25 | 9% | 86 s | 40 |
| 4 | 30.3 | 25 a 35 | 17% | 142 s | 100 |
| 5 | 37.4 | 35 a 45 | 18% | 104 s | 227 |
| 6 | 47.2 | 45 a 55 | 16% | 106 s | 480 |
| 7 | 57.3 | 55 a 65 | 9% | 94 s | 1067 |
| 8 | 69.6 | 60 a 75 | 9% | 87 s | 2120 |
| 9 | 76.5 | 70 a 85 | 11% | 91 s | 3704 |
| 10 | 89.7 | 80 a 95 | 11% | 82 s | 6264 |
Total: 457.1 min (7.6 h)
Tudo dentro da faixa.
```

**Antes do ajuste** (mapa novo com os preços da rodada 6, semente 1), as praias 6 a 10 passavam da meta:

| Praia | Minutos | Meta |
|---|---|---|
| 6 | 62,6 | 45 a 55 |
| 7 | 74,2 | 55 a 65 |
| 8 | 78,1 | 60 a 75 |
| 9 | 98,1 | 70 a 85 |
| 10 | 109,1 | 80 a 95 |

O total era de 9,1 h. Nas sementes 2 e 3 havia ainda esperas de 151 a 198 s, e a Praia 5 passava da meta (45,1 min) na semente 3.

**`ECONOMIA` alterada** (o resto ficou igual):

| | Quadra | Ambulantes | Escolinha | Sucos | Palco | Torneio |
|---|---|---|---|---|---|---|
| abrir | 1,2 mi | 800 mil | 2 mi | 4 mi | 12 mi | 18 mi |
| base | 130 mil | 1,05 mi | 3 mi | 6 mi | 13 mi | 19 mi |

A `famaMinima` passou a ser [3, 8, 40, 95, 219, 480, 1067, 1964, 3704, 6263].

## O que depende do usuário
- Nada nesta parte.

## Problemas e decisões
- **Erro de processo na A3.** O commit `e565f7c` entrou com o teste do simulador quebrando (o bot lia o estoque de "caixa de mate" como se fosse produto de balcão). Rodei o teste e o commit na mesma linha, sem parar na falha. Corrigi no commit seguinte (`823dbaa`); dali em diante, cada commit só sai com os testes verdes.
- **Teste de metas pulado de A1 a A4.** Ficou marcado como pulado, com o motivo escrito, enquanto o mapa mudava. Voltou na A5, quando refiz o balanceamento.
- **O jogador passa por cima dos balcões.** Agora ele anda pela areia toda e não há colisão com balcões, como já não havia com clientes. Pôr colisão em balcões de 200 de largura arriscava prender o bot do simulador.
- **Quiosques "pequenos".** O prédio de cada quiosque fica dentro da faixa da grama. O Milho e pastel, porém, ocupa uma faixa larga da grama (905 a 1580), porque as 5 máquinas dele (2 caixas de cru e 3 panelas) ficam ao lado do prédio. Os quadros de compra dos quiosques ficam na calçada, em frente.
- **Quadra deslocada para a direita** (x 2130 a 2500). No primeiro lugar que testei, a fila do quiosque de Sucos subia para dentro da quadra.
- **Ambulantes.**
  - **A abertura já traz o 1º ambulante.** O roteiro diz que os ambulantes são comprados, mas sem nenhum a área abriria sem render nada.
  - **O dinheiro é pago quando o ambulante volta,** e o "Dinheiro em dobro" vale no momento da venda.
- **Banhistas calculados pelo tempo.** Atualizar uns 200 banhistas por quadro pesaria no simulador (cerca de 8 h de jogo por semente). Com o roteiro sorteado na criação, o `rand` só é usado ao criar a praia, e o resultado continua dependendo da semente.
- **O pilar 6 mudou de texto.** Antes, só a área da próxima praia aparecia. Agora todas as áreas futuras aparecem trancadas, com o nome e a praia, como pede a A2.
- **O litoral ainda esconde as áreas futuras.** No mapa do litoral, as praias seguintes continuam com cadeado e sem dizer a área ("é surpresa"), mas agora a orla mostra o nome delas nas placas.
- **Tempo de teste.** Pus `testTimeout` de 60 s no `vite.config.ts`, porque os testes de "nunca trava" simulam 10 min e um deles passava de 5 s. O `npm test` leva cerca de 60 s.

## Sugestões
- **Litoral:** decidir se ele passa a mostrar a área de todas as praias, já que a orla mostra.
- **`docs/MOLDE-AREIA.md`:** atualizar ou aposentar em favor do `MOLDE-ORLA.md`.
  - A "divisa" agora é a lista fixa `DIVISAS`.
  - O "rodapé" (y 748 a 758) agora fica no meio da areia; o recorte das zonas evita que cubra as áreas.
  - `livreNaBeira` ainda bloqueia a beira na frente dos quiosques, que agora estão na grama. É inofensivo, mas desnecessário.
- **Tutorial:** pôr setas para as caixas do caminhão e para as pranchas molhadas na primeira vez.
- **Desempenho no celular:** conferir com ~40 banhistas desenhados por tela (eles são desenhados a cada quadro).
- **Quiosque do Milho e pastel:** se a faixa ficar comprida demais na tela, dá para empilhar as panelas em duas fileiras na grama.
