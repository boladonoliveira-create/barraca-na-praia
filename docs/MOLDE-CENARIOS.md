# Molde: cenários das praias

Cada praia do litoral tem um cenário próprio: cores, hora do dia e enfeites de fundo. As Praias 1 e 2 estão prontas e são o modelo. As Praias 3 a 10 têm só nome e cores provisórias.

## Onde fica cada coisa

| Arquivo | O que tem |
|---|---|
| `src/dados/praias.ts` | `PRAIAS[10]`: nome, área nova, cores, hora e a lista de enfeites de cada praia |
| `src/render/cenarios.ts` | as funções dos enfeites (`ENFEITES`) e o desenho do céu, do mar e da areia |

Para mexer numa praia: troque as cores e a hora em `PRAIAS[i]`, escreva os enfeites novos em `cenarios.ts` e ponha os ids deles em `enfeites`. Não mexa em outro arquivo.

## Conferir

- Abra `http://localhost:5175/?praia=N` (só em `npm run dev`). A praia N abre com as áreas abertas e um pouco de dinheiro, sem mexer no save.
- Ande até o fim da praia (a câmera vai até o lote cercado da próxima praia) e confira o cenário inteiro.
- Antes de cada commit: `npm test` e `npm run build`.

## Regras

### Cores

- `mar: [fundo, perto da areia]`: o fundo é mais escuro que a parte perto da areia.
- `ceu: [topo, horizonte]`: o horizonte é mais claro que o topo. No pôr do sol, o céu vai do laranja ao amarelo claro.
- `areia`: perto de `#f6e3b4`. A areia é o fundo de todo o jogo, então precisa continuar clara para os balcões, os quadros e o texto aparecerem bem.
- Use cores parecidas com as do resto do jogo (as de `SHIRTS` e `SKINS` em `src/dados/mapa.ts` e as das Praias 1 e 2). Evite neon e preto puro.

### Hora

- `manha`: sol alto à esquerda, sem filtro.
- `tarde`: sol alto à direita, filtro quente bem leve por cima de tudo.
- `porDoSol`: sol grande e baixo, metade no mar, e filtro laranja mais forte.

O sol e o filtro já existem: basta pôr `'sol'` nos enfeites e escolher a hora.

### Onde os enfeites podem ficar

O céu vai de `y = 0` a `y = HORIZONTE` (34). O mar vai de `HORIZONTE` até `SHORE` (118). Daí para baixo é a areia, e é onde o jogo acontece: clientes, filas, guarda-sóis, balcões, máquinas e quadros de compra.

- **Todo enfeite fica acima de `SHORE - 6`** (no céu ou no mar). Nada na areia, para não cobrir balcões, quadros de compra nem o caminho do jogador.
- Exceção: algo que encosta na beira da água (como uma prancha fincada) pode descer até `SHORE + 4`, e só isso.
- Coisas grandes (farol, muralha, morro) ficam no horizonte, apoiadas em `HORIZONTE` e subindo para o céu. Barcos e boias ficam no mar.
- O painel "Fama" fica no canto de cima, à esquerda da tela (uns 110 x 30). Não ponha nada importante ali: ele cobre.
- O mundo vai de `x = 0` a `x = 1600`. Use `cada(e, passo, ...)` para repetir o enfeite pelo mundo todo e cobrir qualquer parte que a câmera mostre.

### Sem `Math.random`

O desenho roda a cada quadro. Com `Math.random` o enfeite pularia de lugar o tempo todo. Para variar a posição ou o tamanho, use `hash(i)`, que devolve um número de 0 a 1 que é sempre o mesmo para o mesmo `i`.

### Movimento

- Use `e.t` (o tempo em ms) para mexer: `Math.sin(e.t / 600 + i)` balança, `(e.t / 900) % 400` anda.
- Com "reduzir movimento" ligado, `e.t` fica parado em 0. Não use `Date.now()` nem `performance.now()`.
- Movimento devagar: o fundo não pode chamar mais atenção que o jogo.

### Desempenho

- Formas simples (`arc`, `ellipse`, `fillRect`, caminhos curtos), sem imagens, sem `shadowBlur` e sem `filter`.
- No máximo umas 30 formas por enfeite em cada tela.

## Um enfeite comentado

As boias da Praia do Sol (`boias` em `src/render/cenarios.ts`):

```ts
/** Boias: listradas, balançando na água perto da areia (bem acima da faixa onde os clientes andam). */
const boias: Enfeite = (c, e) => {
  // uma boia a cada 400 unidades do mundo, só nas que estão visíveis
  cada(e, 400, (x, i) => {
    // posição: hash(i) espalha a boia dentro do trecho (sempre no mesmo lugar);
    // y: 22 acima da areia, balançando 2 para cima e para baixo
    const bx = x + 120 + hash(i) * 160, by = SHORE - 22 + Math.sin(e.t / 600 + i) * 2;
    // corpo branco e as duas faixas vermelhas
    c.fillStyle = '#fff'; circ(c, bx, by, 6);
    c.fillStyle = '#ff6b6b'; c.beginPath(); c.arc(bx, by, 6, -0.6, 0.6); c.arc(bx, by, 6, Math.PI - 0.6, Math.PI + 0.6); c.fill();
    // reflexo na água, logo abaixo
    c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(bx - 8, by + 5, 16, 1.5);
  });
};
```

Depois de escrever a função, coloque-a em `ENFEITES` (`{ ..., boias }`) e o id na praia: `enfeites: ['sol', 'nuvens', 'gaivotas', 'boias']`. Os enfeites são desenhados na ordem da lista, então o que fica mais longe (morro, farol) vem antes do que fica mais perto (barcos).

Enfeites prontos, que podem ser usados em outras praias: `sol`, `nuvens`, `gaivotas`, `boias`, `ilha`, `navio`, `jangadas`.

## O que cada praia deve ter

| Praia | Nome | Hora | O que deve ter |
|---|---|---|---|
| 3 | Praia do Farol | manhã | Farol na ponta e pedras |
| 4 | Praia dos Coqueiros | manhã | Muitos coqueiros |
| 5 | Praia do Forte | tarde | Muralha de forte antigo ao fundo |
| 6 | Praia Dourada | tarde | Areia dourada, barquinhos |
| 7 | Praia Brava | tarde | Ondas maiores, pranchas na areia |
| 8 | Baía Azul | tarde | Mar bem azul, veleiros |
| 9 | Praia do Pôr do Sol | pôr do sol | Céu alaranjado, sol baixo |
| 10 | Praia do Campeonato | tarde | Bandeirinhas e faixas de campeonato |

Notas:

- **Muitos coqueiros (4):** no horizonte, como silhuetas, ou numa ilha. Não na areia.
- **Ondas maiores (7):** desenhe cristas brancas mais altas no mar, como enfeite; não mude o desenho das ondas em `desenharCenario`.
- **Pranchas na areia (7):** fincadas na beira da água (até `SHORE + 4`, veja a exceção acima).
- **Bandeirinhas e faixas (10):** penduradas no céu (um cordão entre dois postes no horizonte) ou numa faixa puxada por um avião.
- Cada praia deve ter pelo menos 3 enfeites, e pelo menos 1 deles novo.
