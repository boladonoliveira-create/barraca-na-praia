# Roteiro: Barraca na Praia

Status: AGUARDANDO REVISÃO
Rodada: 5
Porta: 5175
Quem faz: partes A e B = Claude Code. Parte C = OpenCode.

## Contexto

O usuário testou a rodada 4. O problema é que dá para sair comprando área por área numa praia só, e a "nova praia" é opcional e reabre o mesmo mapa.

A estrutura certa segue o Cash Inc:
- **Começo devagar:** a primeira praia começa devagar.
- **A cada praia nova:** o jogador recomeça mais forte (fama) e libera a próxima área da lista.

| Praia | Área nova |
|---|---|
| 1 Praia do Sol | Barraca do Sol (açaí e coco) |
| 2 Praia Grande | Sorveteria |
| 3 Praia do Farol | Chuveirão e cadeiras |
| 4 Praia dos Coqueiros | Milho e pastel |
| 5 Praia do Forte | Quadra de futevôlei |
| 6 Praia Dourada | Ambulantes |
| 7 Praia Brava | Escolinha de surf |
| 8 Baía Azul | Sucos e vitaminas |
| 9 Praia do Pôr do Sol | Palco de pagode |
| 10 Praia do Campeonato | Torneio de futevôlei |

Hoje existem as áreas 1 a 5. Esta rodada troca a progressão e deixa as praias 1 a 5 jogáveis. As áreas 6 a 10 entram na próxima rodada.

## Fluxo desta rodada

1. **Claude Code** faz as partes A e B, com um commit por parte. Depois:
   - escreve `RELATORIO.md` no formato de `../RODADA.md`;
   - troca o status para `Status: PRONTO PARA OPENCODE`;
   - faz um commit.
2. **OpenCode** faz a parte C, seguindo as regras de `AGENTS.md`. Depois:
   - acrescenta a seção dele no `RELATORIO.md`;
   - troca o status para `Status: AGUARDANDO REVISÃO`;
   - faz um commit.

Se uma sessão cair, a próxima continua da primeira parte sem commit.

## Parte A [CLAUDE]: praias e fama

**A1. Regras da praia.**
- **Áreas disponíveis:** na praia N estão as áreas 1 a N.
  - A área N é a novidade e só existe a partir da praia N.
  - Dentro da praia, as áreas abrem em ordem, como hoje: a próxima abre quando a anterior chega ao nível `NIVEL_ABRE`.
- **Quadro de nova praia:** aparece quando a área N chega ao nível 10 (`NIVEL_NOVA_PRAIA`).
  - É um quadro dourado no chão, no lugar do quadro de prestígio de hoje: "Viajar para a Praia Grande · +X de fama".
  - É obrigatório para avançar, mas o jogador pode continuar crescendo antes de comprar para ganhar mais fama.
- **Ao comprar:**
  - zeram o dinheiro e os níveis;
  - ficam a fama total, as preferências e o recorde.
- **Fama:**
  - a fama ganha cresce com o total ganho na praia, numa curva que desacelera (algo como `floor(sqrt(ganho / K))`);
  - o lucro de todas as áreas é multiplicado por `1 + taxa × famaTotal`;
  - ajuste `K`, `taxa` e o fator de preço por praia com o simulador (A5).
  - O HUD mostra "⭐ Fama x1,8".
- **Começo rápido:** a partir da praia 3, as áreas que já foram a área nova de uma praia anterior recomeçam com o cofre automático e o 1º ajudante já comprados. Esses passos da trilha contam como feitos, sem custo.
- **O que sai:** o prestígio opcional antigo (`NIVEL_PRESTIGIO`).

**A2. O que aparece no mapa.**
- **Câmera:** vai até o lote N+1.
- **Lote N+1:** aparece cercado, com a silhueta e a placa "Na próxima praia: Sorveteria".
- **Lotes depois disso:** não aparecem (nada de cerca, placa ou silhueta).
- **Depois da praia 5:** o quadro da praia 6 mostra "Praia Dourada · em breve" e não pode ser comprado.
- **Documentação:** atualize o pilar 6 no `CLAUDE.md` e no GDD: "o futuro próximo fica à vista: a área da próxima praia aparece cercada; o resto fica escondido".

**A3. Cenário de cada praia (molde).** Crie `src/dados/praias.ts` com `PRAIAS[10]`. Cada praia tem:
- `nome` (da tabela);
- `mar`, `areia` e `ceu: [topo, base]`;
- `hora`: `manha`, `tarde` ou `porDoSol`;
- `enfeites: string[]`, os ids de desenhos de fundo, como farol, coqueiros ou barcos.

Faça também:
- **Função de desenho:** `src/render/cenarios.ts`, com as funções dos enfeites, aplicadas no desenho do cenário (em cache, se o desenho atual for em cache).
- **Praias 1 e 2:** preencha completas, com o capricho final. Elas são o molde.
- **Praias 3 a 10:** deixe só o nome e as cores provisórias. O OpenCode faz o resto.
- **Prévia (só em dev):** `?praia=N` abre direto na praia N, com as áreas abertas e um pouco de dinheiro.
- **Molde:** escreva `docs/MOLDE-CENARIOS.md` com:
  - as regras (cores, onde os enfeites podem ficar sem atrapalhar o jogo, sem `Math.random`);
  - um enfeite comentado;
  - a lista do que cada praia de 3 a 10 deve ter:

| Praia | Hora | O que deve ter |
|---|---|---|
| 3 | manhã | Farol na ponta e pedras |
| 4 | manhã | Muitos coqueiros |
| 5 | tarde | Muralha de forte antigo ao fundo |
| 6 | tarde | Areia dourada, barquinhos |
| 7 | tarde | Ondas maiores, pranchas na areia |
| 8 | tarde | Mar bem azul, veleiros |
| 9 | pôr do sol | Céu alaranjado, sol baixo |
| 10 | tarde | Bandeirinhas e faixas de campeonato |

**A4. Save v4.** O formato passa a ser `{ versao: 4, mundo: { id, criadoEm }, jogo }`, com `praia`, `famaTotal` e o resto de hoje.
- **O `mundo`:** um identificador aleatório criado uma vez. Serve para salvar na nuvem e para o co-op no futuro.
- **Conversão do v3:** vai para a praia igual ao número de áreas abertas (no máximo 5), com a fama mínima de quem passou pelas praias anteriores.

**A5. Simulador.** O bot compra a nova praia assim que ela libera. Rode com 3 sementes.

Metas por praia:
- Praia 1: 8 a 10 min.
- Praia 2: 15 a 20 min.
- Praia 3: 20 a 25 min.
- Praia 4: 25 a 35 min.
- Praia 5: 35 a 45 min.

Outras metas:
- as áreas antigas voltam a funcionar nos primeiros 20 a 25% do tempo da praia;
- nenhuma espera passa de 150 s;
- os ganhos com o app fechado são multiplicados pela fama.

Coloque a tabela no relatório.

**A6. Analytics.** Evento `praia_nova` com `{ praia, fama_ganha, minutos, anuncio }`.

**Testes:**
- a praia N só tem as áreas 1 a N;
- a nova praia só libera com a área N no nível 10;
- a fama aumenta o lucro;
- o começo rápido vale a partir da praia 3;
- a conversão de v3 para v4 funciona;
- as áreas continuam independentes entre si.

## Parte B [CLAUDE]: litoral e viagem

**B1. O jogo continua abrindo direto na praia atual** (pilar "sem menus"). Um botão pequeno "Litoral" no HUD abre o mapa do litoral:
- **Desenho:** uma costa com as 10 praias em sequência.
- **Concluídas:** mostram a fama ganha.
- **Atual:** aparece em destaque.
- **Próxima:** mostra o nome e a área nova ("Praia Grande · Sorveteria").
- **Seguintes:** mostram o nome e um cadeado, sem dizer a área (é surpresa).
- **No fim:** "Praia 11 em diante · em breve".

**B2. Viagem.** Ao comprar a nova praia:
1. O litoral abre com um barquinho indo até a próxima praia.
2. A tela mostra a fama ganha e o botão opcional "Ver anúncio: +20% de fama".
3. A praia nova começa com o nome grande na tela.

**B3. Anúncios.**
- **Intersticial:**
  - nunca nas praias 1 a 3;
  - depois disso, só na viagem (depois da animação), e no máximo 1 a cada 4 min;
  - nunca durante o jogo.
- **Banner:** nenhum.
- Confira as regras que já existem e retire as que contrariam isso.

**B4. Documentação.** Atualize as seções 6 a 8 do GDD e o `CLAUDE.md`.

## Parte C [OPENCODE]: cenários das praias 3 a 10

- **O que fazer:** siga `docs/MOLDE-CENARIOS.md` e preencha as praias 3 a 10 em `src/dados/praias.ts`, com os enfeites em `src/render/cenarios.ts`.
- **Arquivos:** mexa só nesses dois.
- **Commits:** um a cada 2 praias.
- **Conferir:** veja cada praia em `?praia=N`. Os enfeites não podem cobrir balcões, quadros de compra nem o caminho do jogador.
- **Antes de cada commit:** `npm test` e `npm run build` passando.
- **No fim:** escreva no `RELATORIO.md` a seção "## Parte C (OpenCode)". Depois troque o status para `Status: AGUARDANDO REVISÃO` e faça um commit.

## Critérios de pronto

- [ ] A praia 1 começa só com a Barraca do Sol. A praia N tem as áreas 1 a N.
- [ ] O quadro de nova praia libera com a área N no nível 10. A viagem mostra a fama e o anúncio opcional.
- [ ] A fama aparece no HUD e aumenta o lucro. O começo rápido vale a partir da praia 3.
- [ ] Só o lote da próxima praia aparece cercado. Os outros ficam escondidos.
- [ ] O litoral mostra as 10 praias, cada uma no estado certo.
- [ ] O simulador está dentro das metas da A5, e a tabela está no relatório.
- [ ] O save v4 tem `mundo` e converte o v3.
- [ ] As praias 1 a 10 têm cenário próprio.
- [ ] `npm test` e `npm run build` passam.

## Fora do escopo

Mecânicas das áreas 6 a 10, a faixa grande de areia da praia 7, Arena, Acampamento de inverno, co-op, recompensa diária e APK.
