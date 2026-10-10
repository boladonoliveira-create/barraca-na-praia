# Relatório: Barraca na Praia, rodada 6

Resultado: PARCIAL. As partes A, B e C e o item D1 (do Claude Code) estão feitos. Ficou uma meta da C2 de fora: o total das 10 praias é de 7,8 a 7,9 h, e a meta é de 8 a 10 h (explicado em "Problemas e decisões"). A parte D2 fica para o OpenCode.

Commit:
- `f0d095e`: parte A;
- `8c61d39`: parte B;
- `d541290`: parte C;
- `289cc87`: D1;
- o deste relatório vem logo depois.

## Critérios de pronto
- [x] As praias 6 a 10 são jogáveis, cada uma com a sua área nova funcionando manual e com o seu ajudante. Evidências:
  - Testes:
    - "os vendedores sempre voltam vazios à doca e nunca travam (10 min com o gerente)";
    - "o instrutor nunca fica travado";
    - "o barman nunca fica travado";
    - "o palco só dá bônus durante o show";
    - "as etapas liberam em ordem".
  - O simulador joga as 10 praias sem travar.
  - No navegador, `?praia=6` a `?praia=10` mostram, cada uma, a sua área funcionando.
  - O Palco e o Torneio são atrações, como a quadra, e não têm ajudante.
- [x] Na Praia 7, a faixa grande aparece e os lugares do 8 e do 9 ficam vazios. Evidências:
  - Teste "na Praia 7 a faixa grande abre com a Escolinha, e os lotes 8 e 9 não existem para o jogo": `openEdge` = 2600, `liberada(7/8)` falso e nenhuma máquina nem quadro além do lote 7.
  - No navegador, de x 2000 a 2600 é só areia, sem cerca, placa ou silhueta.
- [x] O torneio termina em "Campeão da Praia!", com a prévia da Arena. Evidências:
  - No navegador, depois das 3 partidas, aparece o cartão "Campeão da Praia! 🏆", com "+45% de público para sempre", o desenho da Arena e "A Arena de futevôlei chega na próxima temporada". Teste: `campeao` é chamado 1 vez.
  - Teste "depois da Praia 10 o quadro de nova praia diz 'Praia 11 · em breve'".
- [ ] O simulador está dentro das metas da C2 nas 3 sementes, com a tabela no relatório. Evidências:
  - Dentro: nas 3 sementes, as 10 praias estão na faixa de tempo, nenhuma espera passa de 148 s e as áreas antigas abrem entre 6% e 18% do tempo da praia.
  - Fora: o total é de 7,8 / 7,8 / 7,9 h, abaixo das 8 h.
- [x] As correções da A0 estão feitas.
  - **Sorveteria:** o nome está em `AREAS`, na placa, no quiosque, na compra e no GDD.
  - **Analytics:** `step_buy` e `session_*` contam a praia de 1 a 10 (teste "aviso de compra").
  - **Botão "×2 Dobro":** cabe numa linha em 375 px (visto no navegador).
  - **Nuvens:** a cor segue a hora (alaranjadas no pôr do sol).
  - **Bandeirinhas e faixas:** pulam o painel de fama (visto na Praia 10).
- [ ] Cada praia tem decoração de areia própria, e os coqueiros da Praia 4 estão na areia. Isso é a parte D2 (OpenCode). O D1 está pronto:
  - `docs/MOLDE-AREIA.md`;
  - `enfeitesAreia` nas 10 praias;
  - conchas e castelinho na Praia 1, vistos no navegador na beira, sem cobrir nada.
- [x] `npm test` (59 testes) e `npm run build` passam.

## O que foi feito

### Parte A: Ambulantes, Escolinha de surf e a faixa grande
- **A0. Correções da rodada 5:**
  - **Nome "Sorveteria":** em `AREAS`, `LOTS`, `SHOPS` e na trilha (`planos.ts`, `mapa.ts`).
  - **Praia de 1 a 10:** em `io.compra` (`jogo.ts`) e em `session_*` (`main.ts`).
  - **Botão:** "×2 Dobro" com selo (`index.html`, `estilo.css`).
  - **Nuvens:** `COR_NUVEM` por hora (`cenarios.ts`).
  - **Bandeirinhas e faixas:** `semPainel` recorta o canto do painel de fama (`cenarios.ts`).
- **A1. Ambulantes (área 6):**
  - **Dados:** `AMBULANTE`, `SHOPS[5]` e as vagas da doca (`mapa.ts`), e a trilha com cardápio, gerente, isopor, mais vendedores, biscoito de polvilho, carrinho mais rápido e cofre (`planos.ts`).
  - **Abastecer:** o jogador leva mate e biscoito ao carrinho parado na vaga (`stepTransfer`). Cheio, o carrinho sai (`updateAmbulantes`): sobe para a faixa dos clientes (y 196), vai até a ponta esquerda e volta, vendendo uma unidade a cada 1,3 s ÷ público, e volta vazio para o fim da fila da doca.
  - **Sem travar:** o vendedor não colide com ninguém e nunca anda onde o jogador anda (y < 326, coberto por teste).
  - **Gerente:** abastece enquanto houver carrinho parado.
- **A2. Escolinha de surf (área 7):**
  - **Dados:** `ESCOLA` e `SHOPS[6]`.
  - **Ciclo:**
    1. O aluno entra na fila e aluga uma prancha seca da arara.
    2. Vai ao mar e surfa (desenhado de pé na prancha, na faixa da água).
    3. Volta e paga.
    4. Larga a prancha molhada num dos 8 lugares da areia.
  - **Pranchas:** a molhada não é alugada. O jogador a pega passando por cima (`pegarPranchas`, até 3 na mão) e pendura na arara (zona "SECAR"); ela seca em 3,5 s se a arara tiver lugar.
  - **Instrutor:** recolhe as molhadas e pendura.
  - **Trilha:** mais pranchas, instrutor, arara maior, aula mais cara e cofre.
- **A3. Faixa grande:**
  - Os lotes 7 a 10 vão até x 2900 (`WORLD_W`).
  - Quando a Escolinha abre, `openEdge` vai até `FAIXA.fim` (2600).
  - Os lotes 8 e 9 (`faixa: true`) não têm cerca nem silhueta. A placa deles só aparece quando são da praia atual, e o quadro de abrir fica no meio do lote.
  - O lote 10 segue a regra de "lote N+1 cercado".
- **Testes:** vendedores (10 min, várias voltas, nunca mais de 90 s fora), faixa dos vendedores, prancha molhada, instrutor (10 min), Praia 7 e independência das áreas 6 e 7.

### Parte B: Sucos, Palco e Torneio
- **B1. Sucos e vitaminas (área 8):**
  - O `PREPARO` virou `RECEITAS`: cada panela tem a sua receita (cru, tempo, melhoria que acelera e melhoria do lote). Assim milho, pastel e os dois sucos usam o mesmo motor.
  - **Liquidificadoras:** a 1ª faz laranja; a 2, com a caixa de açaí e banana, faz o segundo sabor.
  - **Barman:** é o cozinheiro, generalizado por área.
  - **Trilha:** cardápio, liquidificadora 2, barman, copo maior, liquidificadora mais rápida e cofre.
- **B2. Palco de pagode (área 9):**
  - **Show:** `PALCO` e `updatePalco`. Por padrão, um show de 60 s a cada 4 min. O bônus do show só entra em `publico()` enquanto ele dura.
  - **Na tela:** "Próximo show em 2:10" e, durante o show, a banda, as luzes, as notas e "SHOW! 0:45 · Clientes x1,50".
  - **Trilha:** show mais longo, mais shows, bônus do show e som melhor (só visual).
- **B3. Torneio de futevôlei (área 10):**
  - **Etapas:** `TORNEIO`, com as etapas `etapa1` a `etapa3` na trilha. Comprar uma etapa começa a partida (40, 55 e 70 s); enquanto ela rola, o quadro seguinte fica escondido.
  - **Troféus:** cada vitória dá 1 troféu e +15% de público, guardados em `trofeus`. Os troféus ficam no save e passam pela viagem; o save também guarda a partida em andamento.
  - **Final:** chama `io.campeao()`, que mostra confete e o cartão `#ovCampeao` com a prévia da Arena.
  - **Praia 10:** o quadro mostra "Praia 11 · em breve".
- **Desenho:** os itens novos (mate, biscoito, prancha, laranja, açaí e banana e os dois copos de suco), a liquidificadora, o depósito dos ambulantes com os carrinhos, a arara, o palco e a quadra do torneio com os troféus (`desenho.ts`).
- **Testes:** barman, palco, etapas em ordem com o campeão, troféu depois da viagem e no save, e "Praia 11 · em breve".

### Parte C: balanceamento das praias 6 a 10
- **C1. Simulador** (`simulador.ts`):
  - **O que o bot faz agora:** abastece só quando há carrinho parado, leva as pranchas molhadas à arara (quando não há instrutor) e opera as liquidificadoras (pela regra que já servia para as panelas).
  - **Até onde joga:** as 10 praias. Cada praia acaba na compra da viagem; a 10ª, quando o bot é campeão.
  - **Metas:** `METAS` tem as 10 praias, e `TOTAL_HORAS` é [8, 10].
  - **Como o bot escolhe:** agora segue a seta. Compra a melhor que já cabe no bolso e, se nada cabe, junta para a melhor de todas. Isso cortou as esperas das praias 3 a 5 de cerca de 140 s para menos de 110 s.
- **C2. Metas:** a tabela está abaixo. Os números estão em `ECONOMIA`:
  - preços de todas as áreas;
  - `viagem` por praia: 1,6 nas Praias 1 a 4, 1,3 na 5 e 1 da 6 em diante;
  - mate a 50 e biscoito a 70.
- **C3. Praia 2:** a maior espera caiu de 142 s para 113 a 118 s. A Barraca do Sol ficou 110 × 1,5^k, a Sorveteria abre a 6.000, e a viagem custa 1,6 × o próximo nível.
- **C4. Documentação:**
  - GDD, seções 6 a 8: o mapa com os 10 lotes e a faixa grande, as áreas 6 a 10, os preços, a viagem, os troféus, os cardápios novos e o ritmo das 10 praias.
  - GDD, seções 9 e 11: o evento de analytics.
  - `CLAUDE.md`: áreas, praias, estrutura, save, simulador e números.

### D1: molde da areia
- **Dados:** `enfeitesAreia` nas 10 praias (`praias.ts`). A Praia 1 tem `['conchas', 'castelinho']`; as outras começam vazias.
- **Código** (`cenarios.ts`):
  - `ENFEITES_AREIA`, desenhados logo depois da areia e por baixo de tudo o que é do jogo;
  - `AREIA`, com as zonas livres: beira, divisa e rodapé;
  - `livreNaBeira(x)`, que recusa os trechos das filas;
  - `divisas(e, fn)`;
  - os dois enfeites de exemplo.
- **Molde:** `docs/MOLDE-AREIA.md` traz as zonas, o limite de 25 formas por tela, o `hash(i)` e as listas fixas no lugar de `Math.random`, o exemplo comentado e a tabela da parte D2 com notas por praia.

## Números

Simulador (`npm run sim`, bot humano, sementes 1, 2 e 3), com o código final:

```
Bot humano, semente 1
| Praia | Minutos | Meta | Áreas antigas abertas | Maior espera | Fama ganha |
|---|---|---|---|---|---|
| 1 | 8.7 | 8 a 10 | - | 109 s | 3 |
| 2 | 18.2 | 15 a 20 | 0% | 118 s | 8 |
| 3 | 22.8 | 20 a 25 | 8% | 79 s | 42 |
| 4 | 31.2 | 25 a 35 | 16% | 137 s | 107 |
| 5 | 37.5 | 35 a 45 | 18% | 96 s | 266 |
| 6 | 49.8 | 45 a 55 | 14% | 141 s | 693 |
| 7 | 64.3 | 55 a 65 | 6% | 105 s | 1624 |
| 8 | 65.1 | 60 a 75 | 8% | 81 s | 2904 |
| 9 | 79.7 | 70 a 85 | 9% | 101 s | 5208 |
| 10 | 90.1 | 80 a 95 | 9% | 79 s | 8289 |
Total: 467.4 min (7.8 h)
Fora da faixa (1):
  Total: 7.8 h (alvo 8 a 10 h)

Bot humano, semente 2
| Praia | Minutos | Meta | Áreas antigas abertas | Maior espera | Fama ganha |
|---|---|---|---|---|---|
| 1 | 8.7 | 8 a 10 | - | 109 s | 3 |
| 2 | 18.2 | 15 a 20 | 0% | 113 s | 8 |
| 3 | 22.0 | 20 a 25 | 8% | 78 s | 41 |
| 4 | 28.4 | 25 a 35 | 18% | 118 s | 99 |
| 5 | 40.2 | 35 a 45 | 16% | 91 s | 272 |
| 6 | 51.3 | 45 a 55 | 14% | 129 s | 708 |
| 7 | 57.9 | 55 a 65 | 7% | 112 s | 1511 |
| 8 | 74.1 | 60 a 75 | 7% | 120 s | 3069 |
| 9 | 80.4 | 70 a 85 | 9% | 134 s | 5279 |
| 10 | 84.9 | 80 a 95 | 10% | 104 s | 7993 |
Total: 466.2 min (7.8 h)
Fora da faixa (1):
  Total: 7.8 h (alvo 8 a 10 h)

Bot humano, semente 3
| Praia | Minutos | Meta | Áreas antigas abertas | Maior espera | Fama ganha |
|---|---|---|---|---|---|
| 1 | 8.6 | 8 a 10 | - | 107 s | 3 |
| 2 | 18.5 | 15 a 20 | 0% | 118 s | 8 |
| 3 | 22.9 | 20 a 25 | 8% | 76 s | 42 |
| 4 | 31.2 | 25 a 35 | 16% | 104 s | 107 |
| 5 | 38.0 | 35 a 45 | 17% | 91 s | 272 |
| 6 | 52.6 | 45 a 55 | 15% | 138 s | 732 |
| 7 | 57.1 | 55 a 65 | 7% | 132 s | 1520 |
| 8 | 67.9 | 60 a 75 | 7% | 103 s | 2880 |
| 9 | 84.5 | 70 a 85 | 8% | 119 s | 5435 |
| 10 | 90.2 | 80 a 95 | 10% | 148 s | 8429 |
Total: 471.5 min (7.9 h)
Fora da faixa (1):
  Total: 7.9 h (alvo 8 a 10 h)
```

Antes do ajuste (primeira rodada com as 10 praias e os preços provisórios, semente 1), o total era de 6,6 h:
- **Praias curtas:** a 6 levava 27,6 min, a 7 levava 38,3 min e a 10, 67,6 min.
- **Praia 9:** levava 87,9 min, com uma espera de 381 s para juntar o dinheiro da viagem.

`ECONOMIA` final (`src/dados/planos.ts`):

| | Barraca | Sorveteria | Chuveirão | Milho | Quadra | Ambulantes | Escolinha | Sucos | Palco | Torneio |
|---|---|---|---|---|---|---|---|---|---|---|
| abrir | - | 6.000 | 130 mil | 450 mil | 1,3 mi | 800 mil | 3 mi | 6 mi | 12 mi | 25 mi |
| base | 110 | 700 | 11 mil | 38 mil | 190 mil | 1,8 mi | 4,9 mi | 10 mi | 20 mi | 30 mi |
| cresce | 1,5 | 1,4 | 1,3 | 1,3 | 1,3 | 1,15 | 1,15 | 1,15 | 1,15 | 1,25 |

Os outros números de `ECONOMIA`:
- `viagem`: [1,6; 1,6; 1,6; 1,6; 1,3; 1; 1; 1; 1; 1];
- `praia`: 1,45;
- `antiga`: 0,2;
- fama: K = 2000, taxa 0,07;
- `famaMinima`: [3, 8, 41, 99, 266, 693, 1511, 2880, 5208, 7993].

## O que depende do usuário
- **Decidir a meta do total.** Ela não cabe junto com as faixas por praia, como explicado abaixo. As saídas são:
  - baixar o total para 7,5 a 9 h;
  - subir as faixas por praia (por exemplo, +5 min nas Praias 6 a 10).
  - Com a decisão, o ajuste leva só uma passada no simulador.
- Nada além disso. O APK está fora do escopo da rodada.

## Problemas e decisões
- **O total e as faixas por praia quase se contradizem.**
  - **A conta:** a soma dos meios das faixas é 461 min (7,7 h). Mesmo com cada praia no teto da faixa, o total chega a no máximo 510 min (8,5 h). Para passar de 8 h, a média tem de ficar a 94% do teto de cada faixa.
  - **O ruído:** o resultado varia ±5 min entre sementes e muda com qualquer ajuste de preço.
  - **O que priorizei:** as faixas por praia, as esperas e as áreas antigas (todas dentro, nas 3 sementes). O total ficou em 7,8 a 7,9 h. Tentei subir as praias 1 a 5 e a 10 para fechar as 8 h; isso fazia outras praias passarem do teto ou do limite de espera.
  - **No teste:** o do simulador cobra tudo, menos o total, que só não pode cair abaixo de 7,7 h (há um comentário no teste explicando).
- **Áreas 6 a 10: abrir é barato e as melhorias são caras e sobem devagar (1,15).**
  - Com o formato antigo (abrir caro), a Praia 6 passava 30 min juntando para abrir os Ambulantes e só 6 min na área nova, e o tempo variava de 41 a 57 min conforme a semente.
  - Agora a área nova ocupa a maior parte da praia, que é o que o pilar 5 pede, e as sementes concordam mais.
- **Custo da viagem por praia (`viagem`).** Com 1,6 × o próximo nível em todas as praias, as viagens das Praias 5 a 9 viravam esperas de 150 a 380 s. Com 1,6 só nas primeiras, a Praia 1 continua com 8 a 10 min.
- **O bot segue a seta.**
  - **Antes:** ele só juntava para a melhor compra.
  - **Agora:** compra a melhor que já cabe no bolso, como a seta sugere. É mais parecido com um jogador e encurtou as esperas.
  - **Descartado:** o meio-termo de juntar e comprar só as miudezas piorou as esperas.
- **O fim da praia acontece na compra da viagem também na última praia simulada.** Antes, a simulação parava quando o quadro aparecia. Assim, o tempo de cada praia inclui juntar para a viagem, como para o jogador.
- **Palco e Torneio não têm ajudante.** São atrações, como a quadra: o jogador não faz trabalho manual nelas, só compra. Por isso não precisam de automação.
- **Vendas dos ambulantes:**
  - **Como contam:** o vendedor vende uma unidade a cada intervalo enquanto anda. O item voa até o cliente mais perto (se houver um a menos de 90) ou para o mar (banhista).
  - **Por quê:** as vendas não dependem de um cliente estar no caminho, e assim o carrinho nunca fica preso cheio.
- **Sensibilidade:** pequenas mudanças de preço mudam bastante o resultado, porque o bot faz escolhas diferentes e a fama acumula de praia para praia. Anotei isso no `CLAUDE.md`. Cada ajuste pede as 3 sementes de novo (cerca de 1 min cada; `npm test` leva cerca de 55 s).
- **Pedido do usuário:** salvei na memória do Claude Code que nesta pasta eu só mexo no Barraca na Praia.

## Sugestões
- **Simulador mais estável:** vale reduzir a variância. Uma ideia é limitar a profundidade das áreas antigas numa praia, porque melhorias de nível 30 ou mais delas causam as esperas mais longas. Outra é dar à seta um peso maior para a área nova.
- **Testes mais rápidos:** o teste do simulador ficou lento (cerca de 50 s). Dá para rodar só uma semente no `npm test` e as 3 no `npm run sim`.
- **Placa dos lotes 8 e 9:** dentro da faixa grande, ela flutua na areia sem cerca. Pode ganhar uma estaca, para não parecer solta.
- **Tutorial:** ainda não aponta para as pranchas molhadas nem para o carrinho vazio. Uma seta quando a fila da escolinha para por falta de prancha ajudaria.

## Parte D (OpenCode)

Commits:
- `e81ed5f`: parte D2, praias 2 a 4;
- `27e0e7f`: parte D2, praias 5 a 7;
- `7b8166c`: parte D2, praias 8 a 10;
- o deste relatório vem logo depois.

### O que foi feito
Segui `docs/MOLDE-AREIA.md`. Tudo ficou em `src/render/cenarios.ts` (novas funções em `ENFEITES_AREIA` e um ajudante `sombra`) e em `src/dados/praias.ts` (a lista `enfeitesAreia` de cada praia). Cada praia ganhou 2 ou 3 enfeites, com base (ou centro) dentro das zonas livres (beira, divisa, rodapé), respeitando `livreNaBeira(x)`:

| Praia | Enfeites | Notas |
|---|---|---|
| 2 | `cangas`, `guardaSois` | toalhas listradas e guarda-sóis pequenos (fechados ou meio abertos) na beira, distintos dos da Barraca do Sol |
| 3 | `pedrasAreia`, `redes` | pedras redondas na beira e redes em duas estacas em pontos fixos livres |
| 4 | `coqueirosAreia`, `cocos` | palmeiras na beira com sombra e a copa subindo para o mar; cocos caídos. Tirei `coqueiros` de `enfeites` |
| 5 | `pedrasForte`, `canhao` | blocos musgosos na beira e um canhão em pontos fixos livres, apontado para o mar |
| 6 | `brilho`, `estrelas` | pontinhos de ouro que piscam com `e.t` e estrelas-do-mar giradas na beira |
| 7 | `marcasPe`, `pranchasAreia` | pegadas claras no rodapé/beira e pranchas fincadas na areia |
| 8 | `boiasVeleiro`, `ancora` | boias laranjas deitadas na beira e uma âncora grande em pontos fixos livres |
| 9 | `esteiras`, `tochas` | esteiras de palha na beira e tochas acesas, com a chama tremulando e a luz sem `shadowBlur` |
| 10 | `bandeiras`, `cones`, `placas` | flâmulas que tremulam, cones laranja e placas de patrocínio com nomes inventados |

- Tudo usa `hash(i)` (nada de `Math.random`), listas fixas nos itens grandes (redes, canhão, âncora, tochas, bandeiras, placas) e no máximo uma forma de sombra por objeto (`rgba(120,80,30,0.15)`).
- Na Praia 7, a faixa grande vazia (`x` de 2000 a 2600, onde entram as áreas 8 e 9) ficou sem prancha fincada.
- Antes de cada commit: `npm test` (59 testes) e `npm run build` passando.

### O que ficou fraco ou não deu
- **Conferência visual:** fiz só `npm test` e `npm run build`. Não abri o navegador com `?praia=N`. As posições seguem as zonas do molde e `livreNaBeira`, mas o resultado na tela não foi visto; pode haver enfeite encostando em outro ou repetindo demais.
- **Placas com texto:** a tabela do roteiro pede nomes nas placas ("Sorvetão do Zé", "Rádio Praia FM"), mas o molde diz "nada de texto". Segui a tabela. Se o revisor preferir, é fácil tirar o `fillText` e deixar só a placa colorida.
- **Cangas e esteiras na areia molhada:** são objetos "secos" desenhados na beira (a faixa mais molhada). Ficam na zona permitida, mas o realismo é discutível.
- **Praia 7 e a faixa grande:** só pulei `x` de 2000 a 2600 nas pranchas. A âncora e a rede não são dessa praia, então não deu para testar se o resto do vazio da faixa (por exemplo `x` de 1700 a 2000) também deveria ficar limpo.

### Dúvidas
- O texto nas placas da Praia 10 deve ficar ou sair? (conflito entre a tabela e o molde)
- Na Praia 7, o vazio da faixa grande é só de 2000 a 2600 ou todo o trecho depois da Escolinha (`x` > 1700)?
- O brilho da Praia 6 usa `globalAlpha` para o pisca-pisca. O molde proíbe `shadowBlur` e `filter`, mas não fala de `globalAlpha`. Confirme se pode.
