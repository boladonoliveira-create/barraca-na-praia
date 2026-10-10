# Molde: a orla em faixas

A praia agora é uma orla de verdade, como no Recreio (RJ): do mar até a rua, em faixas. Os negócios ocupam pouco espaço e a areia fica cheia de gente. O Claude Code fez a estrutura e a lógica (parte A); a parte B (OpenCode) faz o visual e itens simples. Este molde diz onde fica cada coisa e o que desenhar, item por item.

## As faixas

O mundo tem **2600 de largura e 1140 de altura**; a tela mostra 400 × 760. Os números ficam em `FAIXAS` (`src/dados/mapa.ts`).

| Faixa | y | O que tem | Jogador |
|---|---|---|---|
| Mar | 0 a 118 | céu (0 a 34), mar, nadadores, alunos surfando | não entra |
| Areia | 118 a 820 | banhistas, áreas da areia | anda (a partir de y 152) |
| Grama | 820 a 920 | quiosques e as máquinas deles | anda |
| Calçadão | 920 a 1060 | ciclovia (920 a 950); calçada (950 a 1060): quadros dos quiosques, bancada dos ambulantes, pilhas de caixas | anda (até y 1048) |
| Rua | 1060 a 1140 | meio-fio (1060 a 1066), asfalto, baia do caminhão | não entra (só visual) |

A câmera segue o jogador nas duas direções. Na areia de cima ela fica parada como sempre (y = 0); quando o jogador desce, ela desce junto, até mostrar a rua.

## A função `livre(x, y, folga = 12)`

Em `src/dados/mapa.ts`. Diz se dá para desenhar um enfeite em (x, y) sem atrapalhar. Ela devolve `false`:

- no mar fundo (y < 124) e na rua (y > 1060);
- em cima de balcão, zona de entrega e dinheiro de qualquer área;
- na fila na frente dos balcões;
- em cima de qualquer quadro de compra (`SLOTS`);
- dentro da **zona** de qualquer área (`LUGARES[i].zona`).

**Regra:** antes de desenhar qualquer enfeite fixo (banco, poste, coqueiro, canteiro, placa), confira `livre(x, y)` no ponto onde ele toca o chão e nas pontas dele. Se não estiver livre, pule aquele.

Na areia, a decoração das praias (`enfeitesAreia`) já é recortada para fora das zonas das áreas (`desenharCenario`, em `src/render/cenarios.ts`).

## Onde fica cada área

`LUGARES[i]` (`src/dados/mapa.ts`). `rect` é o lugar da área na faixa (é o quadrado trancado antes de ela abrir); `zona` é onde ficam as coisas dela (balcão, máquinas, quadros). Retângulos pelo centro; abaixo, em x0 a x1 e y0 a y1.

| # | Área | Faixa | Lugar (rect) | Zona | Balcão (SHOPS.counter) |
|---|---|---|---|---|---|
| 0 | Barraca do Sol | areia | 0–400 × 140–760 | igual | (200, 300), 200 × 40 |
| 1 | Sorveteria | grama | 470–690 × 828–912 | 410–750 × 828–1040 | (540, 862), 96 × 44 |
| 2 | Chuveirão e cadeiras | areia | 660–1050 × 455–815 | 660–1050 × 440–815 | chuveiros em (770, 620) e (870, 620) |
| 3 | Milho e pastel | grama | 905–1580 × 828–912 | 905–1580 × 828–1040 | (1200, 862), 200 × 40 |
| 4 | Quadra de futevôlei | areia | 2130–2500 × 485–815 | 2130–2500 × 489–815 | a quadra: (2315, 650), 160 × 104 |
| 5 | Ambulantes | calçadão | 2180–2595 × 925–1055 | 2180–2600 × 828–1060 | bancada (2440, 962), 140 × 36 |
| 6 | Escolinha de surf | areia (beira) | 1460–1840 × 150–495 | 1460–1840 × 150–488 | arara (1650, 215), 170 × 30 |
| 7 | Sucos e vitaminas | grama | 1620–2210 × 828–912 | 1620–2178 × 828–1040 | (1830, 862), 200 × 40 |
| 8 | Palco de pagode | areia (centro) | 1120–1400 × 290–625 | 1110–1410 × 280–630 | o palco: (1260, 400), 200 × 110 |
| 9 | Torneio | usa a quadra | igual à quadra | igual à quadra | a mesma quadra |

- **Quiosques na grama (1, 3 e 7):** o prédio fica na grama; os clientes fazem fila subindo para a areia; o jogador trabalha do lado do calçadão (zona de entrega em y 936, quadros em y 1005); as máquinas (caixas e panelas) ficam na grama, ao lado do prédio.
- **Ambulantes (5):** a bancada fica no calçadão; as pilhas de caixas, na calçada (x 2300 e 2560, y 1030); o caminhão para na rua em (2440, 1100); os ambulantes esperam em cima da bancada (y 912 a 918) e rodam pela areia (y 190 a 790).
- **Na areia livre** (entre as áreas) andam os banhistas. Trechos livres para enfeites de "divisa": `DIVISAS` = [430, 1085, 1440, 1980, 2560].

## Paleta

Use estas cores (as das praias ficam em `PRAIAS`, `src/dados/praias.ts`):

| Coisa | Cores |
|---|---|
| Grama | `#8cc56b`, borda `#6fae4f`, canteiro de flores `#ff8787` / `#ffd43b` / `#f783ac` |
| Ciclovia | `#c7442f`, faixa branca `#fff` |
| Calçada (pedra portuguesa) | `#ece6da` claro e `#2b2b2b` escuro, em ondas |
| Meio-fio e rua | meio-fio `#9aa0a6`, asfalto `#495057`, faixa `#ffd43b` |
| Bancos e postes | madeira `#a26b2f`, ferro `#495057`, luz `#fff3bf` |
| Coqueiros | tronco `#8d5a2b`, folhas `#2f8f3e` / `#4c9a2a`, sombra `rgba(120,80,30,0.18)` |
| Banhistas | camisas `SHIRTS`, pele `SKINS` (`src/dados/mapa.ts`), cangas `#ff6b6b` `#4dabf7` `#ffd43b` `#69db7c` `#f783ac` `#9775fa` |
| Quiosques | Sorveteria `#4dabf7`, Milho e pastel `#f59f00`, Sucos `#40c057`; toldo listrado com branco |

Contorno dos personagens: `rgba(58,35,22,0.55)`, como em `drawPerson`.

## Regras para toda a parte B

- **Sem `Math.random`** no desenho: use `hash(i)` (`src/render/cenarios.ts`) ou `b.cor` (banhistas) para variar.
- **Movimento** pelo tempo (`e.t` no cenário, `g.now` no desenho), e parado com "reduzir movimento" (`reduceMotion`).
- **Nada cobre** balcões, quadros de compra, filas, máquinas nem o caminho principal (confira com `livre`). O que fica no chão (calçada, grama, canteiros) é desenhado antes de tudo e não cobre nada.
- **Desempenho:** formas simples, sem imagens, sem `shadowBlur`. Desenhe só o que está na tela (`e.x0` a `e.x1`).
- **Testes:** `npm test` e `npm run build` antes de cada commit. Não mude testes nem a lógica do núcleo (`src/core/`), exceto o `fmt` do item B6.

## O que desenhar, item por item

### B1. Orla (`src/render/cenarios.ts`, função `orla`)

Hoje `orla(c, e)` pinta faixas lisas. Troque por:

- **Grama (820 a 920):** gramado com variação de tom (manchas por `hash`), canteiros de flores e coqueiros com sombra, a cada 160 a 240. Só onde `livre` deixa: a grama tem os quiosques e as máquinas deles.
- **Ciclovia (920 a 950):** vermelha com a faixa branca tracejada no meio e um desenho de bicicleta a cada 400.
- **Calçada (950 a 1060):** pedra portuguesa ondulada em preto e branco, como no calçadão de Copacabana. São ondas largas, em faixas horizontais. Bancos de madeira e postes a cada 200 a 300, só onde `livre` deixa (cuidado com os quadros em y 1005).
- **Rua (1060 a 1140):** meio-fio cinza, asfalto com a faixa amarela e, de vez em quando, um carro passando (só visual: um carro a cada 8 a 15 s por `e.t`, atravessando a tela). Não desenhe carro na baia do caminhão (x 2300 a 2580).
- **Limite:** no máximo 40 formas por faixa em cada tela.

### B2. Banhistas (`src/render/desenho.ts`, só `drawBanhista`)

A lógica está pronta (`Banhista` e `posBanhista` em `src/core/jogo.ts`). `drawBanhista(b, q)` recebe:

- **`q.acao`:** o que a pessoa está fazendo:
  - `'anda'`: andando;
  - `'canga'`: deitada na canga;
  - `'nada'`: no mar;
  - `'frescobol'`: em pé, jogando com a dupla;
  - `'brinca'`: criança brincando;
  - `'parado'`: em pé.
- **`q.face`:** 1 olhando para a direita, −1 para a esquerda.
- **`q.walk`:** a fase do passo.
- **`b.cor`:** um número de 0 a 999 para variar cor e roupa.
- **`b.crianca`:** criança desenhada menor.
- **`b.lado`:** na dupla de frescobol, 1 é quem fica à esquerda.

Desenhe:

- **Canga:** canga colorida com a pessoa deitada (de bruços ou de barriga para cima, pelo `b.cor`); às vezes um guarda-sol pequeno com cadeira ao lado.
- **Criança:** com baldinho, pá e um castelinho na frente.
- **Frescobol:** a dupla com as raquetes e a bolinha indo e voltando (a bola só é desenhada pelo `b.lado > 0`).
- **Nadador:** só a cabeça, os braços batendo e uma marola em volta.
- **Andando:** às vezes de chapéu ou boné, de óculos ou com uma bolsa de praia.

Varie roupa, cabelo e cor por `b.cor`. Mantenha o tamanho de hoje (a criança a 70%).

### B3. Quiosques (`src/render/desenho.ts`, só `drawQuiosque`)

`drawQuiosque(si)` desenha só o prédio dos 3 quiosques da grama: Sorveteria (`si` 1), Milho e pastel (3) e Sucos (7).

- **Estilo:** quiosque de orla, com cobertura de lona ou de telha, toldo listrado, balcão de madeira com tampo claro e 2 a 4 banquinhos altos na frente (do lado da areia, onde fica a fila), e o nome numa placa.
- **Limite:** caiba no retângulo do balcão (`SHOPS[si].counter`) mais 30 para cima e 12 para os lados.
- **Não mexa em:** os produtos no balcão, as plaquinhas de preço, a zona de entrega e o dinheiro, que são desenhados por quem chama.

### B4. Palco central (`src/render/desenho.ts`, só `drawPalco`)

O palco é o quadrado em (1260, 400), 200 × 110, no centro da areia, com caminho livre em volta.

- **Músicos, sempre no palco:** 8 no total.
  - 3 na frente, em pé: cavaquinho, pandeiro e vocal.
  - 3 atrás, sentados à mesa: surdo, violão e tantã.
  - 1 de cada lado: repique e banjo.
  - Fora do show, tocam devagar ou ficam parados. Durante o show (`g.showAtivo()`), tocam animados, com luzes e notas musicais.
- **Instrumentos reconhecíveis:** pandeiro redondo, cavaquinho pequeno, surdo grande, violão.
- **Camarote:** um cercadinho de um lado do palco, com um quiosque pequeno dele (bebidas).
- **Multidão:** durante o show, muita gente em volta (a frente do palco fica em y 455 a 500). Use `hash` para posições fixas e um pulinho por `g.now`.
- **Mantenha:** a placa "PALCO DE PAGODE" e as etiquetas "Próximo show em 2:10" / "SHOW!", que estão no fim da função.
- **Limite:** não cubra os quadros de compra do palco (y 520 e 590, x 1170, 1260 e 1350); fique dentro da zona (1110–1410 × 280–630).

### B5. Placas trancadas (`src/render/desenho.ts`, só `drawTrancado`)

Hoje o quadrado é tracejado, com uma placa simples.

- **Quadrado:** tracejado na areia (ou na grama ou no calçadão, conforme a faixa), com o chão levemente mais escuro.
- **Placa:** de madeira, com estaca e cadeado: "Trancado · <área> · Praia N" para as áreas de praias futuras, e o progresso ("abre com Barraca do Sol nv 5 (3/5)" ou "Pronta para abrir!") para as da praia atual.
- **Mantenha a lógica:** o que mostrar em cada caso e a regra do torneio (só a placa, ao lado da quadra).

### B6. Números curtos (`src/core/economia.ts`, `fmt`, com teste em `economia.test.ts`)

Todo valor de dinheiro aparece curto:

| Valor | Na tela |
|---|---|
| 950 | 950 |
| 12.500 | 12,5 mil |
| 3.200.000 | 3,2 mi |
| 1.100.000.000 | 1,1 bi |

- Uma casa decimal até 100 do milhar (12,5 mil, 3,2 mi); sem casa a partir de 100 (125 mil, 320 mi).
- Vírgula decimal e sem ",0" (12 mil, não 12,0 mil).
- Atualize o teste de `fmt` com esses casos.

## Conferir

Abra `http://localhost:5175/?praia=N` (só em `npm run dev`) e ande pela orla inteira, descendo até a calçada. Se não tiver navegador, confira pela função `livre` e pelos limites de cada item.
