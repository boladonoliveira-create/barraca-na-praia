# Roteiro: Barraca na Praia

Status: AGUARDANDO REVISÃO
Rodada: 6
Porta: 5175
Quem faz: partes A, B e C = Claude Code. Parte D = OpenCode.

## Contexto

A rodada 5 foi aprovada: praias como no Cash Inc, fama, começo rápido, litoral, viagem e save v4. O simulador ficou dentro das metas nas 3 sementes (praias 1 a 5 em 108 a 113 min).

O revisor desenhou os 10 cenários fora do jogo e conferiu. Funcionam, mas uma praia parece pouco diferente da outra:
- tudo muda só numa faixa de 34 de altura no topo, enquanto a areia, que é o que o jogador mais vê, é igual em todas;
- os coqueiros da Praia 4 parecem boiar no horizonte.

Nesta rodada entram as áreas 6 a 10 (praias 6 a 10), a faixa grande de areia da Praia 7 e a decoração da areia por praia.

| Praia | Área nova | Tipo |
|---|---|---|
| 6 Praia Dourada | Ambulantes | Venda automática |
| 7 Praia Brava | Escolinha de surf | Serviço com fila |
| 8 Baía Azul | Sucos e vitaminas | Preparo e venda |
| 9 Praia do Pôr do Sol | Palco de pagode | Atração em evento |
| 10 Praia do Campeonato | Torneio de futevôlei | Meta do lançamento |

**Cada área nova entra como dados** (`SHOPS`, `LOTS`, `TRILHAS`, regras em `dados/`), sem reescrever o motor. Toda área nova começa manual, e o ajudante dela automatiza depois (pilar 5).

## Fluxo desta rodada

1. **Claude Code** faz as partes A, B e C, com um commit por parte. Depois:
   - escreve `RELATORIO.md` no formato de `../RODADA.md`;
   - troca o status para `Status: PRONTO PARA OPENCODE`;
   - faz um commit.
2. **OpenCode** faz a parte D, seguindo as regras de `AGENTS.md`. Depois:
   - acrescenta a seção dele no `RELATORIO.md`;
   - troca o status para `Status: AGUARDANDO REVISÃO`;
   - faz um commit.

Se uma sessão cair, a próxima continua da primeira parte sem commit.

## Parte A [CLAUDE]: Ambulantes, Escolinha de surf e a faixa grande

**A0. Correções da rodada 5.**
- **Nome:** a área 2 se chama "Sorveteria" em todo lugar.
- **Analytics:** `step_buy` e `session_*` passam a contar a praia a partir de 1, como `praia_nova`.
- **"Dinheiro em dobro":** não quebra em 2 linhas em 375 px (texto curto "Dobro" com ícone, ou outro arranjo).
- **Nuvens:** ganham a cor da hora (alaranjadas no pôr do sol).
- **Bandeirinhas e faixas da Praia 10:** não podem ficar atrás do painel de fama.

**A1. Ambulantes (área 6, venda automática).**
- **Depósito:** o jogador abastece os carrinhos de isopor no depósito (mate e biscoito).
- **Vendedores:** cada carrinho cheio sai com um vendedor que anda pela areia, vende sozinho para os clientes que passam e volta vazio.
- **Trilha:** mais vendedores, isopor maior, carrinho mais rápido, cardápio (mate → mate com limão → biscoito de polvilho → combo).
- **Ajudante:** o gerente abastece os carrinhos.
- **Nada de travar:** os vendedores não podem atrapalhar o caminho do jogador nem prender clientes.

**A2. Escolinha de surf (área 7, serviço com fila).**
- **Fila e pagamento:** o aluno entra na fila, aluga uma prancha, vai ao mar, volta e paga.
- **Prancha molhada:** volta molhada e precisa secar na arara (o jogador pega da areia e leva até a arara). Prancha molhada não é alugada.
- **Trilha:** mais pranchas, arara maior, aula mais cara, instrutor (ajudante que leva as pranchas para secar).
- **Visual:** os alunos aparecem surfando no mar, que é a faixa da água.

**A3. A faixa grande da Praia 7.**
- **Ao chegar na Praia 7:** abre uma faixa larga de areia para os lotes 7, 8 e 9.
- **Na Praia 7:** o lote 7 é a Escolinha, e os lugares do 8 e do 9 ficam vazios: areia sem cerca, sem placa e sem silhueta (decisão do usuário).
- **Praias 8 e 9:** o 8 e o 9 aparecem nesse espaço quando chegar a vez deles.
- **Lote 10:** a regra "lote N+1 cercado com a placa da próxima praia" continua valendo para ele.

**Testes:**
- os vendedores sempre voltam ao depósito e nunca travam (simulação longa);
- prancha molhada não é alugada;
- na Praia 7, os lotes 8 e 9 não existem para o jogo;
- as áreas continuam independentes.

## Parte B [CLAUDE]: Sucos, Palco e Torneio

**B1. Sucos e vitaminas (área 8, preparo e venda).**
- **Ciclo:** o jogador leva a fruta à liquidificadora, espera a barra e leva o copo ao balcão.
- **Sabores:** dois, laranja e açaí com banana. Cada um tem a sua caixa de frutas.
- **Trilha:** liquidificadora 2, mais rápida, copo maior, cardápio, barman (ajudante que faz o ciclo).

**B2. Palco de pagode (área 9, atração em evento).**
- **Show:** de tempos em tempos (começa a cada 4 min), um show de 60 s traz multidão e multiplica a chegada de clientes em todas as áreas.
- **Na tela:** a contagem "Próximo show em 2:10" fica visível. Durante o show, o palco tem luzes e notas musicais.
- **Trilha:** show mais longo, intervalo menor, bônus maior, som melhor (só visual).
- **Fora do show:** o bônus só vale durante o show.

**B3. Torneio de futevôlei (área 10, meta do lançamento).**
- **Etapas:** 3, em ordem: Classificatória, Semifinal, Final.
- **Cada etapa:** custa uma compra e leva um tempo, com uma partida animada na quadra.
- **Prêmio:** cada etapa vencida dá um troféu e um bônus permanente de público, que vale nesta e nas próximas praias.
- **Fim:** "Campeão da Praia!", com confete, e uma prévia da Arena: "A Arena de futevôlei chega na próxima temporada".
- **Depois da Praia 10:** o quadro de nova praia mostra "Praia 11 · em breve".

**Testes:**
- o palco só dá bônus durante o show;
- as etapas do torneio liberam em ordem;
- o bônus do troféu fica depois da viagem.

## Parte C [CLAUDE]: balanceamento das praias 6 a 10

**C1. Simulador:** o bot sabe operar as mecânicas novas (carrinhos, pranchas, liquidificadora, etapas do torneio) e roda as praias de 1 a 10.

**C2. Metas** (bot humano, sementes 1, 2 e 3):

| Praia | Meta |
|---|---|
| 1 a 5 | as mesmas de antes |
| 6 | 45 a 55 min |
| 7 | 55 a 65 min |
| 8 | 60 a 75 min |
| 9 | 70 a 85 min |
| 10 | 80 a 95 min |

Também valem:
- as áreas antigas abrem em até 25% do tempo da praia;
- nenhuma espera passa de 150 s;
- o total das 10 praias fica entre 8 e 10 horas de jogo ativo.

Coloque a tabela no relatório.

**C3. Praia 2:** a espera chega a 142 s. Baixe a espera para menos de 120 s, se der sem sair das metas.

**C4. Documentação:** atualize as seções 6 a 8 do GDD e o `CLAUDE.md`.

## Parte D [OPENCODE]: decoração da areia por praia

**O problema:** hoje cada praia só muda numa faixa fina de céu e mar. O jogador passa o tempo olhando a areia, e ela é igual em todas.

**D1. Molde do Claude.** Antes de trocar o status, o Claude Code cria:
- `docs/MOLDE-AREIA.md`, com:
  - onde a decoração pode ficar (só nas bordas e entre os lotes, nunca nos balcões, quadros, filas ou no caminho);
  - o limite de formas;
  - o uso de `hash(i)`, sem `Math.random`;
- `enfeitesAreia` em `PRAIAS`;
- um exemplo pronto na Praia 1: conchas e um castelinho de areia.

**D2. OpenCode.** Siga `docs/MOLDE-AREIA.md` e coloque 2 ou 3 enfeites de areia em cada praia de 2 a 10:

| Praia | Enfeites de areia |
|---|---|
| 2 | guarda-sóis coloridos e cangas |
| 3 | pedras e redes de pesca |
| 4 | coqueiros plantados na areia, com sombra; tire os coqueiros do horizonte |
| 5 | canhão antigo e pedras do forte |
| 6 | areia com brilho e estrelas-do-mar |
| 7 | pranchas fincadas e marcas de pé |
| 8 | âncora e boias de veleiro |
| 9 | tochas acesas e esteiras |
| 10 | placas de patrocínio genéricas (sem marcas reais), cones e bandeiras |

- **Commits:** um a cada 3 praias.
- **Arquivos:** mexa só em `src/dados/praias.ts` e `src/render/cenarios.ts`.
- **Conferir:** use `?praia=N`.
- **Antes de cada commit:** `npm test` e `npm run build` passando.
- **No fim:** escreva no `RELATORIO.md` a seção "## Parte D (OpenCode)" e troque o status para `Status: AGUARDANDO REVISÃO`.

## Critérios de pronto

- [ ] As praias 6 a 10 são jogáveis, cada uma com a sua área nova funcionando manual e com o seu ajudante.
- [ ] Na Praia 7, a faixa grande aparece e os lugares do 8 e do 9 ficam vazios.
- [ ] O torneio termina em "Campeão da Praia!", com a prévia da Arena.
- [ ] O simulador está dentro das metas da C2 nas 3 sementes, com a tabela no relatório.
- [ ] As correções da A0 estão feitas.
- [ ] Cada praia tem decoração de areia própria. Os coqueiros da Praia 4 estão na areia.
- [ ] `npm test` e `npm run build` passam.

## Fora do escopo

Arena, praias 11 em diante, Acampamento de inverno, co-op, recompensa diária e APK.
