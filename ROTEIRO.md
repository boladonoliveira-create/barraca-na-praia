# Roteiro: Barraca na Praia

Status: PRONTO PARA EXECUTAR
Rodada: 7
Porta: 5175
Quem faz: partes A e B = Claude Code. Parte C = OpenCode.

## Contexto

A rodada 6 foi aprovada: as áreas 6 a 10, a faixa grande da Praia 7, o torneio com "Campeão da Praia!" e as 10 praias dentro das faixas. O revisor rodou 56 testes do núcleo, e todos passaram.

**Total das 10 praias.** O total de 7,8 h fica aceito. A meta de 8 a 10 h era quase incompatível com as faixas por praia (erro do revisor). A meta nova é **de 7,5 a 9 h**.

**A decoração da areia (D2) não resolveu o problema.** O revisor desenhou as praias na escala real do celular (400 × 760):
- os enfeites são pequenos e ficam quase todos na beira da água;
- o resto da tela é areia lisa, igual em todas as praias;
- na Praia dos Coqueiros aparecem só uns cocos;
- na Praia do Pôr do Sol quase nada aparece.

A culpa não é do OpenCode: o molde limitou demais onde e quanto desenhar. **Esta rodada refaz a identidade visual das praias com um molde novo.**

## Fluxo desta rodada

1. **Claude Code** faz as partes A e B, com um commit por parte. Depois:
   - escreve `RELATORIO.md` no formato de `../RODADA.md`;
   - troca o status para `Status: PRONTO PARA OPENCODE`;
   - faz um commit.
2. **OpenCode** faz a parte C, seguindo as regras de `AGENTS.md`. Depois:
   - acrescenta a seção dele no `RELATORIO.md`;
   - troca o status para `Status: AGUARDANDO REVISÃO`;
   - faz um commit.

## Parte A [CLAUDE]: identidade das praias e acertos

**A1. A regra nova.** Em qualquer tela de 400 × 760 do jogo, com as áreas abertas, o jogador tem que perceber em que praia está **sem olhar o nome**. Para isso, cada praia tem 3 camadas.

1. **Chão:**
   - um tom de areia;
   - uma textura própria, desenhada em cache: grãos, ondulações de vento, conchinhas espalhadas;
   - um piso nos caminhos e divisas entre os lotes. Exemplos:
     - Praia 5: pedra portuguesa ondulada em preto e branco, como num calçadão;
     - Praia 8: deck de madeira;
     - Praia 10: grama sintética com linhas.
2. **Elemento grande:** um elemento de identidade com 60 a 140 de altura, repetido nas divisas e no rodapé, de forma que sempre haja pelo menos 1 inteiro na tela. Exemplos:
   - Praia 4: coqueiros grandes com sombra;
   - Praia 3: farol de verdade na ponta esquerda e barcos de pesca na areia.
3. **Detalhes:** de 2 a 3 tipos espalhados (os enfeites que o OpenCode já fez podem ser reaproveitados, maiores).

**Regras para todas as camadas:**
- nada cobre balcões, quadros de compra, filas, máquinas ou o caminho principal;
- teste `livre(x, y)` com as zonas do mapa;
- mínimo de 3 elementos fora da beira em qualquer tela;
- tudo determinístico (sem `Math.random`) e desenhado em cache sempre que der.

**A2. Molde.**
- **Praias completas:** faça a 1, a 4 e a 9 do jeito final. São o exemplo do sol da manhã, do verde dos coqueiros e da noite que chega.
- **Praia 9:** ganha luzinhas penduradas entre postes e tochas maiores. O chão fica mais quente.
- **Documento:** reescreva `docs/MOLDE-AREIA.md` com:
  - as 3 camadas;
  - os tamanhos mínimos (elemento grande de 60 a 140; detalhe com pelo menos 20 de altura);
  - a densidade;
  - a função `livre`;
  - a lista do que cada uma das praias 2, 3, 5, 6, 7, 8 e 10 deve ter.
- **Prévia:** `?praia=N` continua servindo para conferir.

**A3. Acertos.**
- **Meta total:** passa a ser de 7,5 a 9 h (`TOTAL_HORAS` e o teste).
- **Placa dos lotes 8 e 9:** dentro da faixa grande, ganha uma estaca de madeira.
- **Tutorial:** mostra uma seta quando:
  - a fila da escolinha parar por falta de prancha seca ("Leve as pranchas molhadas para secar");
  - todos os carrinhos dos ambulantes estiverem parados e vazios ("Abasteça os carrinhos").
  - Cada uma só aparece nas 2 primeiras vezes.
- **Teste do simulador:** no `npm test`, roda 1 semente. O `npm run sim` continua com as 3.

## Parte B [CLAUDE]: recompensa diária e material da loja

**B1. Recompensa diária.** Na primeira abertura de cada dia, aparece um cartão com o calendário de 7 dias:
- **Prêmios:**
  - dia 1: dinheiro (3 min de lucro da praia atual);
  - dia 2: turbo ×2 por 5 min;
  - dia 3: dinheiro (5 min);
  - dia 4: turbo ×2 por 10 min;
  - dia 5: dinheiro (8 min);
  - dia 6: turbo ×3 por 5 min;
  - dia 7: +10% de fama da praia atual e confete.
- **Botões:** "Pegar" e "Pegar em dobro (anúncio)". Fecha com 1 toque e não volta no mesmo dia.
- **Dia perdido:** volta 1 dia, a mesma regra do Metrô.
- **Testes:** com data simulada.
- **Analytics:** `recompensa_diaria` (dia, dobrou).

**B2. Material da loja** (página só de dev, `?loja`). Desenha no canvas e oferece um botão "Baixar" por imagem, que salva um PNG.

- **Ícone 512 × 512:**
  - a barraca com guarda-sol listrado e um coco com canudinho;
  - o mar ao fundo;
  - sem texto;
  - legível em 48 × 48 (mostre a prévia).
- **Imagem de destaque 1024 × 500:** o nome "Barraca na Praia", a praia cheia de clientes, o vendedor e as áreas.
- **6 capturas 1080 × 1920.** Cada uma tem uma faixa de título no topo, com texto grande, e embaixo o jogo de verdade:
  1. "Monte o seu point na praia": Praia 4 cheia.
  2. "Contrate ajudantes": ajudantes trabalhando.
  3. "Viaje para praias novas": o litoral na viagem.
  4. "Show de pagode na areia": o palco durante o show.
  5. "Seja campeão da praia": o torneio.
  6. "Jogue só com um dedo": Praia 1 com a seta do tutorial.
- **Pasta:** salve os PNGs também em `loja/`.

**B3. Textos da loja.** Crie `loja/textos-pt-BR.md` com estes textos, sem mudar:

- **Título (29):** Barraca na Praia: Idle Tycoon
- **Descrição curta (70):** Venda açaí, abra quiosques e transforme sua barraca no point da praia!
- **Descrição longa:**

```
Comece com uma barraquinha de açaí e coco e transforme a praia no lugar mais animado do litoral! Ande com um dedo só, leve os produtos até o balcão, junte o dinheiro e expanda.

🏖️ 10 PRAIAS PARA CONQUISTAR
Cada praia libera algo novo: sorveteria, chuveirão, milho e pastel, quadra de futevôlei, ambulantes, escolinha de surf, sucos, palco de pagode e o grande torneio.

⭐ FAMA QUE FICA
A cada praia nova você ganha fama e recomeça mais forte. O que levava minutos passa voando.

👷 CONTRATE A EQUIPE
Ajudantes, sorveteiros, cozinheiros, instrutores e barmen trabalham por você, até com o jogo fechado.

🎶 SHOW E CAMPEONATO
Shows de pagode lotam a praia, e o torneio de futevôlei transforma você em campeão.

😌 FEITO PARA RELAXAR
Sem derrota e sem pressa. Jogue um pouquinho por dia ou passe a tarde na praia.
```

- **Checklist do Play Console** (igual ao do Metrô, preencha olhando os pacotes):
  - categoria: Simulação ou Casual;
  - questionário IARC;
  - público de 13 anos ou mais;
  - segurança dos dados (AdMob, Firebase, UMP);
  - `loja/privacidade.md`.

**B4. Documentação.** Atualize o GDD e o `CLAUDE.md`.

## Parte C [OPENCODE]: identidade das praias 2, 3, 5, 6, 7, 8 e 10

- **O que fazer:** siga o novo `docs/MOLDE-AREIA.md`. Cada praia ganha as 3 camadas (chão, elemento grande, detalhes), seguindo a lista do molde.
- **Arquivos:** mexa só em `src/dados/praias.ts` e `src/render/cenarios.ts`.
- **Commits:** um a cada 2 ou 3 praias.
- **Antes de cada commit:** `npm test` e `npm run build` passando.
- **Conferir:** abra `?praia=N` se tiver navegador. Se não tiver, confira pela função `livre` e pela regra de densidade do molde.
- **No fim:** escreva no `RELATORIO.md` a seção "## Parte C (OpenCode)" e troque o status para `Status: AGUARDANDO REVISÃO`.

## Critérios de pronto

- [ ] As praias 1, 4 e 9 (Claude) e 2, 3, 5, 6, 7, 8 e 10 (OpenCode) têm chão, elemento grande e detalhes próprios. Em qualquer tela dá para saber a praia.
- [ ] Nenhum enfeite cobre balcão, quadro, fila, máquina ou caminho (`livre`).
- [ ] A meta total é de 7,5 a 9 h, e o simulador passa.
- [ ] A estaca nas placas 8 e 9 e as duas setas novas do tutorial estão feitas.
- [ ] A recompensa diária funciona, inclusive dobrando com anúncio, com testes.
- [ ] `?loja` gera o ícone, a imagem de destaque e as 6 capturas. Os textos e a privacidade estão em `loja/`.
- [ ] `npm test` e `npm run build` passam.

## Fora do escopo

Arena, praias 11 em diante, Acampamento de inverno, co-op, compras dentro do app e APK.
