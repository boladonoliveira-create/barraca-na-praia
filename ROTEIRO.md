# Roteiro: Barraca na Praia

Status: PRONTO PARA EXECUTAR
Rodada: 7 (substitui o roteiro anterior da rodada 7, que não foi executado)
Porta: 5175
Quem faz: parte A = Claude Code (estrutura, lógica e balanceamento). Parte B = OpenCode (visual e itens simples).

## Contexto

O usuário testou a rodada 6 e quer a praia com cara de orla de verdade, como no Recreio (RJ):
- **Hoje:** cada área é um lote fechado do topo ao rodapé, e a areia fica vazia. Parece uma praia particular.
- **A ideia:** a praia é organizada em faixas, do mar até a rua. Os negócios ocupam pouco espaço, e a praia fica cheia de gente.

```
MAR       nadadores e surfistas                → Escolinha de surf na beira da água
AREIA     banhistas, crianças, cangas, jogos   → Barraca do Sol (continua grande), Chuveirão,
                                                 Palco no centro, Quadra perto da grama,
                                                 ambulantes andando entre as pessoas
GRAMA     faixa estreita                       → quiosques pequenos: Sorveteria, Milho e pastel, Sucos
CALÇADÃO  ciclovia, bancos, calçada            → bancada dos ambulantes
RUA       só visual, não dá para andar         → baia do caminhão de mercadoria
```

**Mantém:**
- a progressão (a praia N libera a área N, fama, viagem, começo rápido);
- as mecânicas de cada área;
- os pilares do `CLAUDE.md`.

**Muda:** o mapa, onde cada coisa fica, os ambulantes, o palco e o que aparece trancado.

## Fluxo desta rodada

1. **Claude Code** faz a parte A, com um commit por item (A1 a A5). Depois:
   - escreve `RELATORIO.md` no formato de `../RODADA.md`;
   - troca o status para `Status: PRONTO PARA OPENCODE`;
   - faz um commit.
2. **OpenCode** faz a parte B, seguindo as regras de `AGENTS.md`, com um commit por item (B1 a B6). Depois:
   - acrescenta a seção dele no `RELATORIO.md`;
   - troca o status para `Status: AGUARDANDO REVISÃO`;
   - faz um commit.

Se uma sessão cair, a próxima continua do primeiro item sem commit.

## Parte A [CLAUDE]: estrutura, lógica e balanceamento

**A1. Mapa em faixas e câmera vertical.**
- **Altura:** o mundo fica mais alto (por volta de 1100). As faixas, de cima para baixo, são mar, areia (a área de hoje, um pouco maior), grama (cerca de 100), calçadão (ciclovia, bancos e calçada; cerca de 120) e rua (só visual).
- **Limite:** o jogador anda até o fim da calçada e não entra na rua.
- **Câmera:** segue o jogador também na vertical. O HUD e o joystick não mudam.
- **Dados:** as faixas ficam em `dados/mapa.ts` (`FAIXAS`), e a função `livre(x, y)` diz onde se pode desenhar enfeite sem atrapalhar.

**A2. Áreas reposicionadas.** Lotes do topo ao rodapé deixam de existir. Cada área passa a ter um retângulo próprio (posição e tamanho) numa faixa:

| Área | Onde fica | Tamanho |
|---|---|---|
| Barraca do Sol | Areia, à esquerda | Continua grande |
| Sorveteria | Quiosque na grama | Pequeno, uns 120 × 100 |
| Chuveirão e cadeiras | Areia, perto da grama | Médio |
| Milho e pastel | Quiosque na grama | Pequeno |
| Quadra de futevôlei | Areia, perto da grama | A quadra, sem cerca alta |
| Ambulantes | Baia do caminhão na rua e bancada no calçadão | Pequeno; os carrinhos rodam pela praia toda |
| Escolinha de surf | Beira da água | Médio |
| Sucos e vitaminas | Quiosque na grama | Pequeno |
| Palco de pagode | Centro da areia | Quadrado médio, com caminho livre em volta |
| Torneio | Na quadra, que ganha arquibancada | Usa a quadra |

- **Áreas futuras:** aparecem como um quadrado trancado no lugar delas, com a placa "Trancado · Palco de pagode · Praia 9". O jogador pode passar por cima e ver, e isso não muda a jogabilidade.
- **Lugar livre:** a areia entre as áreas é livre para andar.
- **Começo:** na Praia 1, a câmera e o caminho do tutorial ficam iguais aos de hoje (Barraca do Sol). O resto da praia já aparece, com gente e as áreas trancadas.

**A3. Ambulantes com caminhão e bancada.**
1. O caminhão chega sozinho à baia da rua e descarrega caixas de mate e de biscoito no chão da calçada.
2. **Trabalho manual:** o jogador leva as caixas até a bancada do calçadão.
3. **Ambulantes (comprados):** cada um pega o estoque na bancada, enche o carrinho, anda pela praia inteira entre as pessoas vendendo, volta e deixa o dinheiro na bancada (ou no cofre, com a melhoria).
4. **Ajudante do caminhão (comprado):** faz no lugar do jogador o trabalho de caminhão para a bancada.

Regras: os ambulantes nunca travam nem prendem ninguém. Mantenha os testes de "nunca trava" e adapte os que existem.

**A4. Banhistas (a lógica).**
- **Quem são:** um sistema simples de pessoas que não compram: andam devagar, ficam deitadas na canga, nadam, jogam frescobol e brincam na areia.
- **Movimento:** pontos de interesse sorteados com `rand`, que o simulador e os testes trocam por semente.
- **Regra:** nunca bloqueiam o jogador nem os clientes (passam por cima).
- **Quantidade:** de 25 a 40 na tela, variando por praia (`PRAIAS[b].banhistas`). A Praia do Pôr do Sol tem poucos.
- **Desenho:** fica simples (bonequinhos do jogo), porque o OpenCode capricha no B2.
- **Clientes:** os de verdade continuam vindo como hoje.

**A5. Simulador e balanceamento.**
- **O bot:** opera tudo no mapa novo (caixas do caminhão, quiosques na grama, escolinha na água).
- **Metas:** as mesmas da rodada 6 por praia, total de 7,5 a 9 h, esperas de no máximo 150 s.
- **Testes:** `npm test` roda 1 semente. As 3 sementes ficam no `npm run sim`.
- **Documentação:** atualize o GDD (mapa e áreas) e o `CLAUDE.md`.
- **Molde para o OpenCode:** escreva `docs/MOLDE-ORLA.md` com:
  - as faixas e as coordenadas;
  - a função `livre`;
  - onde fica cada área;
  - a paleta;
  - e o que a parte B deve desenhar, item por item.

**Testes:**
- nenhuma área fica fora da faixa dela;
- o jogador não entra na rua;
- banhistas e ambulantes nunca travam (simulação longa);
- o caminhão, a bancada, o ambulante e o dinheiro fecham o ciclo;
- a área trancada não muda nada no jogo;
- os testes que já existem continuam passando (adapte as coordenadas, não as regras).

## Parte B [OPENCODE]: visual e itens simples

Siga `docs/MOLDE-ORLA.md`. Faça um commit por item e rode `npm test` e `npm run build` antes de cada um. Mexa só nos arquivos que cada item cita.

| Item | O que fazer | Arquivos |
|---|---|---|
| B1. Orla | A faixa de grama com canteiros, o calçadão de pedra portuguesa ondulada em preto e branco, a ciclovia vermelha com faixa branca, bancos, postes, coqueiros na grama e a rua com o meio-fio (carros passando de vez em quando, só visual) | `render/cenarios.ts` |
| B2. Banhistas | Desenho bonito para a lógica da A4: canga colorida com a pessoa deitada, guarda-sol com cadeira, criança com baldinho e castelo, dupla de frescobol, nadador na água, gente andando de chapéu. Variação de cor e roupa por `hash` | `render/desenho.ts` (só as funções dos banhistas) |
| B3. Quiosques | Desenho dos 3 quiosques da grama (Sorveteria, Milho e pastel, Sucos) no estilo dos quiosques de orla, com toldo, balcão e banquinhos | `render/desenho.ts` (só as funções desses quiosques) |
| B4. Palco central | Quadrado no meio da areia com 8 músicos (3 na frente e 3 atrás sentados à mesa, 1 de cada lado), instrumentos (pandeiro, cavaquinho, surdo, violão), cercadinho do camarote com o quiosque dele e muita gente em volta durante o show | `render/desenho.ts` (só o palco) |
| B5. Placas trancadas | O quadrado trancado das áreas futuras: tracejado na areia, cadeado e placa de madeira "Trancado · <área> · Praia N" | `render/desenho.ts` (só a placa) |
| B6. Números curtos | Todo valor de dinheiro na tela no formato curto: 950, 12,5 mil, 3,2 mi, 1,1 bi. Função `fmt` em `core/economia.ts`, com teste | `core/economia.ts` e o teste |

**No fim:** escreva no `RELATORIO.md` a seção "## Parte B (OpenCode)" e troque o status para `Status: AGUARDANDO REVISÃO`.

## Critérios de pronto

- [ ] A praia tem as faixas mar, areia, grama, calçadão e rua. A câmera anda na vertical. Ninguém entra na rua.
- [ ] As áreas ficam nos lugares da tabela da A2. Os quiosques são pequenos e ficam na grama.
- [ ] As áreas futuras aparecem trancadas, com placa, e dá para passar por cima.
- [ ] Os ambulantes funcionam com caminhão, bancada e carrinhos rodando entre as pessoas, com ajudante do caminhão.
- [ ] A praia está cheia de banhistas que não atrapalham, e a Praia do Pôr do Sol tem menos.
- [ ] O palco central tem os 8 músicos e o camarote.
- [ ] Os números aparecem curtos.
- [ ] O simulador está dentro das metas.
- [ ] `npm test` e `npm run build` passam.

## Fora do escopo

Recompensa diária e material da loja (próxima rodada), Arena, praias 11 em diante, Acampamento de inverno, co-op e APK.
