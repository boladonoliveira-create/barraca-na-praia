# Barraca na Praia: documento de design

Protótipo de referência: `barraca-na-praia.html` (arquivo único, canvas 2D). Tudo que está marcado como **já existe no protótipo** deve ser reproduzido com o mesmo comportamento; o resto é o que falta construir.

---

## 1. Visão

Um jogo para jogar com a cabeça cansada: no sofá, antes de dormir, no ônibus. O jogador anda com um dedo por uma praia brasileira, leva produtos até as barracas, junta dinheiro e transforma uma barraca simples num complexo de praia.

O formato segue o dos jogos de "idle arcade" que estão no topo da Google Play (como o Pizza Ready, 2º lugar em downloads em agosto de 2026): andar, carregar, entregar, expandir e automatizar.

**Público:** todas as idades, sessões curtas (5 a 15 minutos), várias vezes por dia.

## 2. Pilares (não quebrar)

1. **Um dedo só.** Arrastar em qualquer lugar da tela move o personagem. Nada exige precisão.
2. **Sem derrota e sem relógio.** O pior que acontece é ganhar mais devagar.
3. **Sem menus.** Comprar é pisar num quadrado no chão. A próxima compra aparece ao lado da coisa que ela melhora.
4. **Progresso sempre visível.** Toda compra muda algo na tela (máquina nova, guarda-sol novo, copo de açaí com mais ingredientes, plaquinha de preço subindo).
5. **Trabalho manual vira automação, área por área.** Cada área nova começa manual; o ajudante dela automatiza depois. Sempre existe uma área onde o jogador ainda trabalha com as mãos.
6. **O futuro próximo fica à vista.** A área da próxima praia aparece cercada, com a silhueta e a placa ("Na próxima praia: Sorveteria"); o resto fica escondido. É o principal motivo para viajar para a próxima praia.

## 3. Ciclo principal (já existe no protótipo)

- **Movimento:** joystick virtual que aparece onde o dedo toca (raio 48). Velocidade base 3,6 unidades por quadro, +12% por nível de "Chinelo novo".
- **Pilha:** o personagem carrega itens empilhados nas costas. Capacidade 8, +3 por nível de "Bolsa maior". Caixas de sorvete: no máximo 3 por vez.
- **Máquinas:** produzem 1 item a cada intervalo (açaí 900 ms, coco 1400 ms, caixa 1800 ms) até encher a bandeja (10 itens, 4 caixas). "Máquinas turbo" divide o intervalo por (1 + 0,25 × nível).
- **Pegar:** parado na bandeja da máquina, pega 1 item a cada 90 ms.
- **Entregar:** parado na zona "Entregar" do balcão, solta 1 item a cada 75 ms. Solta qualquer item da pilha que caiba (não só o de cima). O balcão guarda 20 de cada produto.
- **Dinheiro:** os clientes pagam numa pilha de notas ao lado do balcão. O dinheiro vai sozinho para o jogador quando ele passa a menos de 72 unidades da pilha ou pisa no "Entregar".
- **Comprar:** parado num quadrado de compra, o dinheiro é transferido aos poucos (1/28 do preço a cada 40 ms) e o quadrado enche de verde.

## 4. Clientes e demanda (já existe no protótipo)

- **A demanda reage ao estoque.** Intervalo de chegada = base ÷ demanda × fator de estoque.
  - Base: 1500 ms na barraca, 1600 ms no quiosque.
  - Fator de estoque: 0,5 com 8 ou mais itens no balcão, 0,75 com 3 a 7, 1,25 com menos de 3.
  - Cada guarda-sol multiplica a demanda da barraca por +0,35.
- **Fila:** até 6 pessoas + 1 por guarda-sol. Os 4 primeiros podem comprar, então quem quer açaí não fica preso atrás de quem quer coco.
- **Escolha do produto:** pesa mais o produto que tem mais estoque no balcão.
- **Guarda-sóis:** quem compra senta se houver cadeira livre (2 por guarda-sol). Depois de 4 a 7 segundos, 55% voltam para a fila e compram de novo.
- **Falas** aleatórias em 28% das compras ("Valeu, chefe!", "Tá caro, hein!", etc.).

## 5. Ajudantes (já existe no protótipo)

- Cada ajudante pertence a **uma loja só**.
- **Na barraca:** antes de buscar, escolhe o produto com mais espaço livre no balcão, somado a 3 pontos por cliente na fila que quer esse produto. Ignora produtos com balcão cheio. Se ficar 1,2 s sem conseguir entregar, volta e busca outro produto.
- **No quiosque (sorveteiro):** busca caixas no depósito sempre que o freezer está com mais de 3 vagas.
- Carga: 4 itens (barraca), 2 caixas (quiosque).

## 6. O mapa

O jogo é um **litoral com 10 praias** em sequência (no estilo do Cash Inc). Cada praia é o mesmo mapa, dividido em **áreas** da esquerda para a direita, e a **praia N tem as áreas 1 a N**: a área N é a novidade dela.

| Praia | Nome | Área nova | Lote (x) |
|---|---|---|---|
| 1 | Praia do Sol | Barraca do Sol (açaí e coco) | 0 a 400 |
| 2 | Praia Grande | Sorveteria | 400 a 600 |
| 3 | Praia do Farol | Chuveirão e cadeiras | 600 a 900 |
| 4 | Praia dos Coqueiros | Milho e pastel | 900 a 1200 |
| 5 | Praia do Forte | Quadra de futevôlei (atração) | 1200 a 1400 |
| 6 | Praia Dourada | Ambulantes (venda automática) | 1400 a 1700 |
| 7 | Praia Brava | Escolinha de surf (serviço com fila) | 1700 a 2000, começo da faixa grande |
| 8 | Baía Azul | Sucos e vitaminas (preparo e venda) | 2000 a 2300, na faixa grande |
| 9 | Praia do Pôr do Sol | Palco de pagode (atração em evento) | 2300 a 2600, na faixa grande |
| 10 | Praia do Campeonato | Torneio de futevôlei (meta do lançamento) | 2600 a 2900 |

- **Dentro da praia,** as áreas abrem em ordem: a área N+1 abre quando a área N chega ao nível 5. Cada área fechada mostra uma cerca, a silhueta do que vai ter ali e uma placa com cadeado com o progresso: "Sorveteria · abre com Barraca do Sol nv 5 (3/5)". Quando a área anterior chega ao nível mínimo, a placa diz "pronta para abrir" e o **quadro de compra da área nova aparece na cerca**.
- **A próxima praia fica à vista:** a câmera segue o jogador na horizontal e mostra 140 unidades além da última área aberta, até o lote da área N+1. Esse lote aparece cercado, com a silhueta e a placa "Na próxima praia: Sorveteria". Os lotes depois dele não aparecem.
- **A faixa grande (Praia 7 em diante):** quando a Escolinha abre, abre junto uma faixa larga de areia que vai até o fim do lote 9 (x = 2600). Na Praia 7, os lugares do 8 e do 9 ficam vazios: areia sem cerca, sem placa e sem silhueta. Nas Praias 8 e 9, o lote da vez aparece nesse espaço, só com a placa (sem cerca) e com o quadro de abrir no meio do lote. O lote 10 segue a regra normal: aparece cercado, com a placa da próxima praia, na Praia 9.
- **Cenário:** cada praia tem cores do mar, da areia e do céu, hora do dia (manhã, tarde ou pôr do sol) e enfeites de fundo próprios (`src/dados/praias.ts`, `src/render/cenarios.ts`; regras em `docs/MOLDE-CENARIOS.md`). A decoração da areia segue `docs/MOLDE-AREIA.md`.
- **Litoral:** o jogo abre direto na praia atual (sem menus). Um botão pequeno "Litoral" mostra a costa com as 10 praias: as concluídas com a fama ganha, a atual em destaque, a próxima com o nome e a área nova ("Praia Grande · Sorveteria"), as seguintes só com o nome e um cadeado (a área é surpresa) e, no fim, "Praia 11 em diante · em breve".

## 7. As áreas

Os tipos de mecânica, combinados para que cada área traga um trabalho novo:

- **Venda:** pegar o produto na máquina e entregar no balcão.
- **Abastecer:** levar um insumo até um equipamento que vende sozinho.
- **Serviço:** o cliente usa algo e paga; o jogador mantém funcionando.
- **Atração:** não vende nada; aumenta a demanda de todas as áreas.

Toda área nova começa manual, e o ajudante dela automatiza depois (pilar 5). Cada área entra como dados (`SHOPS`, `LOTS`, `TRILHAS` e as regras em `src/dados/`), sem reescrever o motor.

| Área | O que é | Tipo | O que o jogador faz | O que o ajudante automatiza |
|---|---|---|---|---|
| 1 | Barraca do Sol: açaí e coco | Venda | Leva da máquina ao balcão | Ajudante: leva da máquina ao balcão |
| 2 | Sorveteria | Abastecer | Leva caixas do depósito ao freezer (1 caixa = 6 sorvetes) | Sorveteiro abastece |
| 3 | Chuveirão e cadeiras | Serviço | Chuveirão: clientes saindo do mar fazem fila, tomam banho e pagam; a caixa d'água esvazia a cada alguns banhos e o jogador enche parado no registro (com a caixa vazia, a fila para). Cadeiras: o cliente senta, fica um tempo e paga ao sair; a cadeira fica bagunçada até o jogador passar por cima, e cadeira bagunçada não é alugada | Salva-vidas enche a caixa e arruma as cadeiras |
| 4 | Milho e pastel | Venda com preparo | Pega o cru na caixa, leva à panela ou à fritadeira, espera o preparo (barra de tempo) e leva ao balcão | Cozinheiro faz o ciclo todo |
| 5 | Quadra de futevôlei | Atração | Não vende nada. Um jogo rola na quadra e junta público: a área multiplica a chegada de clientes em todas as outras ("Clientes x1,31"). Trilha própria: arquibancada (+0,10 por nível), rede nova (+0,06), torneio da tarde (+0,15), sobre 1,15 ao abrir; os marcos dobram esse bônus | Não precisa |
| 6 | Ambulantes | Venda automática | Leva mate e biscoito das máquinas do depósito ao carrinho de isopor parado na vaga. Cheio, o carrinho sai com um vendedor pela faixa de cima da areia (a dos clientes, onde o jogador não anda), vende sozinho para quem passa e volta vazio. Trilha: mais vendedores, isopor maior, carrinho mais rápido, cardápio (mate → mate com limão → biscoito de polvilho → combo) | Gerente abastece os carrinhos |
| 7 | Escolinha de surf | Serviço com fila | O aluno faz fila, aluga uma prancha seca da arara, vai surfar no mar, volta e paga. A prancha volta molhada e fica na areia; prancha molhada não é alugada. O jogador pega as pranchas da areia (passando por cima) e pendura na arara, onde elas secam. Trilha: mais pranchas, arara maior, aula mais cara | Instrutor leva as pranchas para secar |
| 8 | Sucos e vitaminas | Preparo e venda | Leva a fruta da caixa à liquidificadora, espera a barra e leva o copo ao balcão. Dois sabores, cada um com a sua caixa: laranja e, com a liquidificadora 2, açaí com banana. Trilha: liquidificadora mais rápida, copo maior (lote), cardápio | Barman faz o ciclo todo |
| 9 | Palco de pagode | Atração em evento | Não vende nada. De tempos em tempos (no começo, a cada 4 min), um show de 60 s traz multidão e multiplica a chegada de clientes em todas as áreas (×1,5 no começo). A contagem "Próximo show em 2:10" fica na tela; no show, o palco tem banda, luzes e notas. O bônus só vale durante o show. Trilha: show mais longo (+15 s), mais shows (−25 s no intervalo, no mínimo 2 min), bônus maior (+0,15), som melhor (só visual) | Não precisa |
| 10 | Torneio de futevôlei | Meta do lançamento | Três etapas, em ordem: Classificatória, Semifinal e Final. Cada etapa é uma compra e uma partida animada na quadra (40, 55 e 70 s); enquanto ela rola, a próxima espera. Cada etapa vencida dá um troféu e +15% de público para sempre (nesta e nas próximas praias). Ao vencer a final: "Campeão da Praia!", com confete, e a prévia "A Arena de futevôlei chega na próxima temporada". Arquibancada e patrocínio somam público, como na quadra | Não precisa |

**Fora do lançamento (atualizações):** Arena de futevôlei (prévia no fim do torneio), praias 11 em diante, temporadas (Carnaval, Réveillon, Copa) com decoração e produtos temporários.

## 8. Progressão e economia

A estrutura segue dois jogos de referência. No Idle Miner Tycoon, cada parte da mina tem a sua trilha de níveis e o jogador escolhe onde investir. No My Perfect Hotel, as áreas novas abrem por marcos.

### Trilhas por área

- **Cada área tem a sua trilha de níveis:** máquinas, ajudante, cardápio, capacidade, cofre e o que for próprio dela. O nível da área é quantas melhorias ela já comprou; o número aparece num selo ao lado do balcão ("Nv 7 ★").
- **Melhorar uma área nunca depende de outra.** Cada área tem o seu turbo, o seu cardápio e as suas capacidades.
- **As melhorias aparecem no chão só dentro da área, ao lado do que melhoram:** a próxima da trilha e, se ficar em outro lugar, uma prévia da seguinte (apagada, com "depois"). A prévia só pode ser paga depois da próxima.
- **Depois da lista fixa,** cada área repete melhorias de cardápio, velocidade e capacidade, para sempre ter algo a comprar.

### Liberação, marcos e cofre

- **Liberação:** a área N+1 abre quando a área N chega ao **nível 5** (`NIVEL_ABRE`).
- **Marcos:** nos níveis 5, 10, 15 e 20, a área **dobra o dinheiro que gera** (×2, ×4, ×8, ×16 no preço de venda) e muda de visual: bandeirinhas (nível 5), selo dourado (10), luzinhas (15), moldura dourada (20). Vem com comemoração na tela ("Barraca do Sol nível 5! Produção x2").
- **Cofre automático:** melhoria de cada área. Com ele, o dinheiro daquela área entra sozinho no caixa e não precisa ser buscado. No lugar da pilha de notas aparece um cofre.
- **Dinheiro:** um caixa só, compartilhado. As melhorias são independentes, mas o lucro de uma área ajuda a abrir a próxima.
- **Seta:** sugere a compra de melhor custo-benefício que cabe no bolso, sem obrigar. Abrir uma área nova vale 3 vezes mais; chegar a um marco ou ao nível que abre a próxima área vale 2 vezes mais; a melhoria da área nova da praia (já aberta) vale 2 vezes mais. O topo da tela mostra a melhor compra, mesmo a que ainda não cabe ("Barraca do Sol: Mais um guarda-sol").

### Preços (ajustados com o simulador)

- **Barraca do Sol:** a melhoria k custa 110 × 1,5^k.
- **Áreas 2 a 10:** abrir custa o valor abaixo, na Praia 1; as melhorias seguem base × cresce^(k-1).

  | Área | Abrir | Base | Cresce |
  |---|---|---|---|
  | Sorveteria | 6.000 | 700 | 1,4 |
  | Chuveirão | 130 mil | 11 mil | 1,3 |
  | Milho e pastel | 450 mil | 38 mil | 1,3 |
  | Quadra | 1,3 milhão | 190 mil | 1,3 |
  | Ambulantes | 800 mil | 1,8 milhão | 1,15 |
  | Escolinha de surf | 3 milhões | 4,9 milhões | 1,15 |
  | Sucos e vitaminas | 6 milhões | 10 milhões | 1,15 |
  | Palco de pagode | 12 milhões | 20 milhões | 1,15 |
  | Torneio | 25 milhões | 30 milhões | 1,25 |

  Nas áreas 6 a 10, abrir é barato e as melhorias são caras e sobem devagar: assim a área nova ocupa a maior parte da praia, e não a espera para abrir.
- **Praia:** cada praia multiplica os preços de compra por 1,45^b. As vendas não sobem com a praia: sobem com a fama.
- **Venda nas áreas novas:** mate 50, biscoito 70, aula de surf 60, suco de laranja 90, açaí com banana 120 (antes da fama, do cardápio e dos marcos).
- Todos os números ficam em `ECONOMIA` (`src/dados/planos.ts`) e nas regras de cada área em `src/dados/mapa.ts` (`AMBULANTE`, `ESCOLA`, `PALCO`, `TORNEIO`, `RECEITAS`).

### Nova praia e fama

- **Quadro de nova praia:** aparece quando a área N (a novidade da praia N) chega ao nível 10. É um quadro dourado no canto da Barraca do Sol: "Viajar para a Praia Grande · +X de fama". Custa `viagem[N]` × o preço do próximo nível da área N: 1,6 nas Praias 1 a 4, 1,3 na Praia 5 e 1 da Praia 6 em diante.
- **Obrigatório para avançar,** mas sem pressa: o jogador pode continuar crescendo antes de comprar para ganhar mais fama.
- **Na Praia 10** não há viagem: o quadro mostra "Praia 11 · em breve". A meta é ser campeão do torneio.
- **Ao comprar:** zeram o dinheiro e os níveis; ficam a fama total, os troféus do torneio e as preferências.
- **Fama ganha:** floor(√(ganho na praia ÷ 2000)), em que o ganho é tudo o que entrou na praia (vendas e ganhos com o app fechado). A curva desacelera.
- **Fama total:** o lucro de todas as áreas é multiplicado por 1 + 0,07 × fama total. O canto da tela mostra "⭐ Fama x1,8".
- **Começo rápido (Praia 3 em diante):** as áreas que já foram a novidade de uma praia anterior recomeçam com o cofre automático e o 1º ajudante já comprados (contam como níveis feitos, sem custo), e o resto da trilha delas custa 20% do preço. Assim as áreas antigas voltam a funcionar logo no começo da praia, e o trabalho manual fica na área nova (pilar 5).
- **Viagem:** ao comprar, o litoral abre com um barquinho indo até a próxima praia. Depois, a tela mostra a fama ganha e o botão opcional "Ver anúncio: +20% de fama". A praia nova começa com o nome grande na tela.

### Cardápio visível

Cada nível aumenta o preço em 25% e muda o desenho do produto:

- **Açaí:** granola → leite condensado → morango → paçoca → açaí completo (copo maior).
- **Coco:** canudo colorido → guarda-chuvinha → limão.
- **Sorvete:** duas bolas → três bolas → granulado → cereja.
- **Milho e pastel:** milho na manteiga → pastel de queijo → milho com queijo ralado → pastel de carne → milho completo.
- **Ambulantes:** mate → mate com limão → biscoito de polvilho (máquina nova) → combo.
- **Sucos:** suco com gelo → vitamina caprichada → suco com hortelã → combo do verão.

O preço atual aparece numa plaquinha em cima de cada produto, e a compra mostra "Açaí agora R$ X".

### Ritmo alvo (bot humano do simulador)

O bot segue a seta: compra a melhor que já cabe no bolso e, se nada cabe, junta para a melhor de todas; compra a viagem assim que ela libera. A Praia 10 termina quando ele é campeão do torneio.

| Praia | Meta | Hoje (sementes 1, 2 e 3) |
|---|---|---|
| 1 | 8 a 10 min | 8,7 / 8,7 / 8,6 |
| 2 | 15 a 20 min | 18,2 / 18,2 / 18,5 |
| 3 | 20 a 25 min | 22,8 / 22,0 / 22,9 |
| 4 | 25 a 35 min | 31,2 / 28,4 / 31,2 |
| 5 | 35 a 45 min | 37,5 / 40,2 / 38,0 |
| 6 | 45 a 55 min | 49,8 / 51,3 / 52,6 |
| 7 | 55 a 65 min | 64,3 / 57,9 / 57,1 |
| 8 | 60 a 75 min | 65,1 / 74,1 / 67,9 |
| 9 | 70 a 85 min | 79,7 / 80,4 / 84,5 |
| 10 | 80 a 95 min | 90,1 / 84,9 / 90,2 |
| Total | 8 a 10 h | 7,8 / 7,8 / 7,9 h |

- **Nenhuma espera** entre compras passa de 150 s (hoje, no máximo 148 s; na Praia 2, 118 s).
- **As áreas antigas** voltam a funcionar nos primeiros 25% do tempo da praia (hoje, de 6% a 18%).
- **O total** ainda fica abaixo das 8 h: a soma dos meios das faixas por praia é 7,7 h, então passar de 8 h exige todas as praias perto do teto ao mesmo tempo.
- Os valores finais saem do simulador (seção 11) e das métricas do teste fechado.

### Ganhos com o app fechado

24 × número de ajudantes × multiplicador da fama por minuto, até no máximo 2 horas. Ao voltar, o jogador pode pegar ou dobrar com anúncio.

## 9. Monetização

- **Anúncio recompensado:**
  - "Dinheiro em dobro" por 2 minutos (já existe, simulado).
  - Dobrar os ganhos com o app fechado (já existe, simulado).
  - +20% de fama na viagem para a próxima praia.
  - Pular a espera de uma máquina ou contratar um ajudante temporário por 3 minutos (a fazer).
- **Intersticial:** nunca nas Praias 1 a 3. Depois disso, só na viagem (depois da animação do barquinho), no máximo 1 a cada 4 minutos. Nunca durante o jogo.
- **Sem banner.**
- **Compras:** remover anúncios (mantém os recompensados como opção) e pacote inicial com dinheiro e um ajudante extra.

## 10. Retenção

- Ganhos com o app fechado (já existe).
- Recompensa diária com bônus no 7º dia seguido.
- Notificação local depois de 24 h sem jogar ("Sua barraca juntou R$ X!"). Pedir permissão só depois da Praia 2.
- Lotes trancados com placa (já existe).

## 11. Técnico

### Estrutura

Vite + TypeScript, empacotado com Capacitor para Android.

```
src/
  dados/           lotes, planos de compra por praia, produtos, preços (JSON ou TS puro)
  core/            estado do jogo, economia, clientes, ajudantes, compras (sem canvas)
  core/simulador   bot que joga sozinho para medir o ritmo (tempo até cada compra)
  render/          câmera, cenário, personagens, máquinas, efeitos
  ui/              placar, telas, botões
  plataforma/      salvar, anúncios, analytics, vibração, ciclo de vida
```

Cada mecânica nova da seção 7 deve ser uma "loja" com dados próprios (produtos, zonas, regra de ajudante), seguindo o modelo de `SHOPS` do protótipo. Assim, adicionar uma praia é adicionar dados, não reescrever o motor.

### Testes e balanceamento

- **Simulador de economia:** um jogador automático que sempre vai à máquina mais cheia, entrega e compra a próxima melhoria. Ele mede o tempo até cada compra em cada praia. O teste falha se algum tempo sair da faixa da seção 8.
- **Testes do núcleo:** demanda, ajudantes (nunca ficam travados), compras e prestígio.

### Salvar

Guardar a versão do formato junto do progresso. Hoje é `{ versao: 4, mundo: { id, criadoEm }, jogo }`, com `praia`, `famaTotal`, `famas` (fama de cada praia concluída) e os níveis por área. O `mundo` é criado uma vez e serve para salvar na nuvem e para o co-op no futuro. O v3 (uma praia só) é convertido: vai para a praia igual ao número de áreas abertas (no máximo 5), com a fama mínima das praias anteriores.

### Analytics (Firebase)

Eventos (a praia sempre de 1 a 10): `step_buy` (praia, área, nível, segundos desde a compra anterior), `praia_nova` (praia, fama_ganha, minutos, anuncio), `session_start`, `session_end`, `ad_offer`, `ad_watch`, `offline_claim`.

### Modo teste

O botão ∞ de dinheiro infinito do protótipo deve existir só na versão de desenvolvimento, atrás de uma flag de build. Nunca na versão da loja.

## 12. Ordem de trabalho

1. **Base:** projeto Vite + TS, portar o protótipo para a estrutura da seção 11 mantendo o comportamento igual. Testes do núcleo e simulador.
2. **Praias 1 e 2 polidas:** arte dos personagens, sons, vibração, tela inicial, salvamento, ganhos offline.
3. **App:** Capacitor, AdMob com IDs de teste, Firebase, ciclo de vida (pausar ao sair do app). Gerar o pacote para o teste fechado com as Praias 1 e 2.
4. **Praias 3 e 4:** serviço (chuveirão e cadeiras) e preparo (milho e pastel).
5. **Praias 5 a 7:** futevôlei, ambulantes, escolinha de surf.
6. **Praias 8 a 10:** sucos, palco de pagode, torneio.
7. **Balanceamento final** com o simulador e com os dados do teste fechado, e depois o lançamento.
