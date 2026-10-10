# Molde: decoração da areia

Cada praia já tem céu e mar próprios (`docs/MOLDE-CENARIOS.md`). Agora a areia, que é o que o jogador mais vê, também ganha decoração própria. A Praia 1 está pronta e é o modelo: conchas e um castelinho de areia.

## Onde fica cada coisa

| Arquivo | O que tem |
|---|---|
| `src/dados/praias.ts` | `enfeitesAreia` de cada praia: a lista de ids, desenhados nesta ordem |
| `src/render/cenarios.ts` | `ENFEITES_AREIA` (as funções), `AREIA` (as zonas livres), `livreNaBeira(x)` e `divisas(e, fn)` |

Para fazer uma praia: escreva os enfeites em `cenarios.ts`, ponha cada um em `ENFEITES_AREIA` e os ids em `enfeitesAreia` da praia. Não mexa em outro arquivo.

A decoração é desenhada logo depois da areia, por baixo de tudo o que é do jogo (balcões, máquinas, quadros, pessoas). Mesmo assim, ela só pode ficar nas zonas livres abaixo.

## Onde a decoração pode ficar

Só nas bordas e entre os lotes. Nunca em balcões, quadros de compra, filas ou no caminho do jogador.

| Zona | Onde | Como usar |
|---|---|---|
| Beira | a faixa de areia molhada logo abaixo da água: `y` de `AREIA.beira.y0` a `AREIA.beira.y1` (126 a 140) | antes de desenhar em `x`, confira `livreNaBeira(x)`: ele recusa os trechos onde as filas dos balcões crescem para o lado e onde ficam as filas do chuveirão e da escolinha |
| Divisa | a fresta entre dois lotes: até `AREIA.divisa.meia` (6) de cada lado do `x0` do lote, com `y` de `AREIA.divisa.y0` a `AREIA.divisa.y1` | use `divisas(e, (x, i) => ...)`, que entrega o `x` de cada divisa visível |
| Rodapé | a faixa de baixo, abaixo de onde o jogador pisa: `y` de `AREIA.rodape.y0` a `AREIA.rodape.y1` | só coisas baixas (pegadas, conchinhas, uma corda) |

Regras:

- **A base fica na zona.** Algo alto, como um coqueiro, uma tocha ou uma bandeira, apoia a base na beira e sobe em direção ao mar (para cima na tela). Nunca desce para a areia de baixo, onde o jogador anda.
- **Fora dos lotes do jogo.** Não desenhe no meio de um lote, nem nos espaços vazios da faixa grande (Praia 7): ali vão entrar as áreas 8 e 9.
- **Nada de quadros, setas ou texto:** a decoração não pode ser confundida com algo que se compra ou se pisa.
- **Sombra** só como uma elipse clara (`rgba(120,80,30,0.15)`), do tamanho do objeto.

## Limite de formas

- No máximo **25 formas** por enfeite em cada tela (uma tela tem 400 de largura). Conte cada `fill` ou `stroke`.
- Formas simples (`arc`, `ellipse`, `fillRect`, caminhos curtos), sem imagens, sem `shadowBlur` e sem `filter`.
- Na beira, um enfeite a cada 60 a 120 unidades já enche a praia. Coisas grandes, como um castelinho ou um canhão, ficam no máximo uma por tela.

## Sem `Math.random`

O desenho roda a cada quadro. Com `Math.random`, o enfeite pularia de lugar o tempo todo. Para variar a posição, o tamanho, a cor ou o giro, use `hash(i)`, que devolve um número de 0 a 1 que é sempre o mesmo para o mesmo `i`. Para pôr coisas grandes em lugares certos, use uma lista fixa de `x` (como `CASTELOS`), conferida com `livreNaBeira`.

Movimento (uma tocha que tremula, uma bandeira que balança) usa `e.t`, que fica parado em 0 com "reduzir movimento".

## O exemplo: Praia 1

`enfeitesAreia: ['conchas', 'castelinho']`

```ts
/** Conchas: pequenas, espalhadas pela beira (uma a cada 70 unidades, quando o lugar está livre). */
const conchas: Enfeite = (c, e) => {
  const B = AREIA.beira;
  cada(e, 70, (x, i) => {
    // hash(i) escolhe o lugar dentro do trecho e a altura dentro da beira; se o x é de fila, pula
    const cx = x + hash(i) * 50, cy = B.y0 + hash(i + 3) * (B.y1 - B.y0); if (!livreNaBeira(cx)) return;
    // giro e cor também saem do hash: cada concha é diferente, mas sempre igual a si mesma
    c.save(); c.translate(cx, cy); c.rotate((hash(i + 5) - 0.5) * 1.2); c.scale(1.3, 1.3);
    c.fillStyle = ['#ffd8a8', '#ffc9c9', '#fff4e6'][((i % 3) + 3) % 3]; /* leque */ ...; c.fill();
    c.strokeStyle = 'rgba(160,110,70,0.5)'; /* três riscos */ ...; c.stroke();
    c.restore(); // 2 formas por concha, no máximo ~12 por tela
  });
};
```

O `castelinho` usa uma lista fixa de `x` livres (`CASTELOS`) e apoia a base em `AREIA.beira.y1`, subindo em direção ao mar. São 10 formas.

## O que cada praia deve ter (parte D)

Duas ou três decorações por praia:

| Praia | Enfeites de areia |
|---|---|
| 2 | guarda-sóis coloridos e cangas |
| 3 | pedras e redes de pesca |
| 4 | coqueiros plantados na areia, com sombra; tire os coqueiros do horizonte (o id `coqueiros` de `enfeites`) |
| 5 | canhão antigo e pedras do forte |
| 6 | areia com brilho e estrelas-do-mar |
| 7 | pranchas fincadas e marcas de pé |
| 8 | âncora e boias de veleiro |
| 9 | tochas acesas e esteiras |
| 10 | placas de patrocínio genéricas (sem marcas reais), cones e bandeiras |

Notas:

- **Guarda-sóis (2):** pequenos e fechados ou meio abertos, na beira. Não podem parecer os guarda-sóis da Barraca do Sol, que são uma compra.
- **Coqueiros (4):** a base fica na beira ou numa divisa, com a copa subindo para o mar. Tirar `coqueiros` de `enfeites` é a única mudança em `enfeites` permitida nesta parte.
- **Marcas de pé (7):** no rodapé ou na beira, bem claras.
- **Tochas (9):** a chama tremula com `e.t`; a luz é um círculo claro e pequeno, sem `shadowBlur`.
- **Placas de patrocínio (10):** nomes inventados e genéricos ("Sorvetão do Zé", "Rádio Praia FM"). Nenhuma marca real.

## Conferir

- Abra `http://localhost:5175/?praia=N` (só em `npm run dev`) e ande pela praia inteira.
- Confira que nada cobre um balcão, uma fila, um quadro de compra ou o caminho do jogador.
- Antes de cada commit: `npm test` e `npm run build`.
