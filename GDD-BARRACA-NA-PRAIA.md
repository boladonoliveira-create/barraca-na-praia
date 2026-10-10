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

| Praia | Nome | Área nova | Largura da área |
|---|---|---|---|
| 1 | Praia do Sol | Barraca do Sol (açaí e coco) | 400 |
| 2 | Praia Grande | Sorveteria | 200 |
| 3 | Praia do Farol | Chuveirão e cadeiras | 300 |
| 4 | Praia dos Coqueiros | Milho e pastel | 300 |
| 5 | Praia do Forte | Quadra de futevôlei (atração) | 200 |
| 6 | Praia Dourada | Ambulantes (próxima rodada) | 200 |
| 7 | Praia Brava | Escolinha de surf | |
| 8 | Baía Azul | Sucos e vitaminas | |
| 9 | Praia do Pôr do Sol | Palco de pagode | |
| 10 | Praia do Campeonato | Torneio de futevôlei | |

- **Dentro da praia,** as áreas abrem em ordem: a área N+1 abre quando a área N chega ao nível 5. Cada área fechada mostra uma cerca, a silhueta do que vai ter ali e uma placa com cadeado com o progresso: "Sorvete · abre com Barraca do Sol nv 5 (3/5)". Quando a área anterior chega ao nível mínimo, a placa diz "pronta para abrir" e o **quadro de compra da área nova aparece na cerca**.
- **A próxima praia fica à vista:** a câmera segue o jogador na horizontal e mostra 140 unidades além da última área aberta, até o lote da área N+1. Esse lote aparece cercado, com a silhueta e a placa "Na próxima praia: Sorveteria". Os lotes depois dele não aparecem.
- **Cenário:** cada praia tem cores do mar, da areia e do céu, hora do dia (manhã, tarde ou pôr do sol) e enfeites de fundo próprios (`src/dados/praias.ts`, `src/render/cenarios.ts`; regras em `docs/MOLDE-CENARIOS.md`).
- **Litoral:** o jogo abre direto na praia atual (sem menus). Um botão pequeno "Litoral" mostra a costa com as 10 praias: as concluídas com a fama ganha, a atual em destaque, a próxima com o nome e a área nova ("Praia Grande · Sorveteria"), as seguintes só com o nome e um cadeado (a área é surpresa) e, no fim, "Praia 11 em diante · em breve".

## 7. As áreas

Quatro tipos de mecânica, combinados para que cada área traga um trabalho novo:

- **Venda:** pegar o produto na máquina e entregar no balcão.
- **Abastecer:** levar um insumo até um equipamento que vende sozinho.
- **Serviço:** o cliente usa algo e paga; o jogador mantém funcionando.
- **Atração:** não vende nada; aumenta a demanda de todas as áreas.

| Área | O que é | Tipo | O que o jogador faz | O que o ajudante automatiza |
|---|---|---|---|---|
| 1 | Barraca do Sol: açaí e coco | Venda | Leva da máquina ao balcão | Ajudante: leva da máquina ao balcão |
| 2 | Sorvete | Abastecer | Leva caixas do depósito ao freezer (1 caixa = 6 sorvetes) | Sorveteiro abastece |
| 3 | Chuveirão e cadeiras | Serviço | Chuveirão: clientes saindo do mar fazem fila, tomam banho e pagam; a caixa d'água esvazia a cada alguns banhos e o jogador enche parado no registro (com a caixa vazia, a fila para). Cadeiras: o cliente senta, fica um tempo e paga ao sair; a cadeira fica bagunçada até o jogador passar por cima, e cadeira bagunçada não é alugada | Salva-vidas enche a caixa e arruma as cadeiras |
| 4 | Milho e pastel | Venda com preparo | Pega o cru na caixa, leva à panela ou à fritadeira, espera o preparo (barra de tempo) e leva ao balcão | Cozinheiro faz o ciclo todo |
| 5 | Quadra de futevôlei | Atração | Não vende nada. Um jogo rola na quadra e junta público: a área multiplica a chegada de clientes em todas as outras ("Clientes x1,31"). Trilha própria: arquibancada (+0,10 por nível), rede nova (+0,06), torneio da tarde (+0,15), sobre 1,15 ao abrir; os marcos dobram esse bônus | Não precisa |

**Próximas áreas (próximas rodadas):** ambulantes (área 6, já com placa), escolinha de surf, sucos e vitaminas, palco de pagode, torneio de futevôlei.

**Fora do lançamento (atualizações):** arena de beach soccer, temporadas (Carnaval, Réveillon, Copa) com decoração e produtos temporários.

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
- **Seta:** sugere a compra de melhor custo-benefício que cabe no bolso, sem obrigar. Abrir uma área nova vale 3 vezes mais, e chegar a um marco ou ao nível que abre a próxima área vale 2 vezes mais. O topo da tela mostra essa sugestão ("Barraca do Sol: Mais um guarda-sol").

### Preços (ajustados com o simulador)

- **Barraca do Sol:** a melhoria k custa 100 × 1,55^k.
- **Áreas 2 a 5:** abrir custa 8.500 (Sorvete), 100 mil (Chuveirão), 300 mil (Milho e pastel) e 900 mil (Quadra), na Praia 1. As melhorias seguem base × cresce^(k-1):

  | Área | Base | Cresce |
  |---|---|---|
  | Sorvete | 700 | 1,4 |
  | Chuveirão | 8.500 | 1,3 |
  | Milho e pastel | 26.000 | 1,3 |
  | Quadra | 120.000 | 1,35 |

  Todos os números ficam em `ECONOMIA` (`src/dados/planos.ts`).
- **Praia:** cada praia multiplica os preços de compra por 1,45^b. As vendas não sobem com a praia: sobem com a fama.

### Nova praia e fama

- **Quadro de nova praia:** aparece quando a área N (a novidade da praia N) chega ao nível 10. É um quadro dourado no canto da Barraca do Sol: "Viajar para a Praia Grande · +X de fama". Custa o preço do próximo nível da área N.
- **Obrigatório para avançar,** mas sem pressa: o jogador pode continuar crescendo antes de comprar para ganhar mais fama.
- **Depois da Praia 5,** o quadro mostra "Praia Dourada · em breve" e não pode ser comprado (as áreas 6 a 10 vêm nas próximas rodadas).
- **Ao comprar:** zeram o dinheiro e os níveis; ficam a fama total e as preferências.
- **Fama ganha:** floor(√(ganho na praia ÷ 2000)), em que o ganho é tudo o que entrou na praia (vendas e ganhos com o app fechado). A curva desacelera.
- **Fama total:** o lucro de todas as áreas é multiplicado por 1 + 0,07 × fama total. O canto da tela mostra "⭐ Fama x1,8".
- **Começo rápido (Praia 3 em diante):** as áreas que já foram a novidade de uma praia anterior recomeçam com o cofre automático e o 1º ajudante já comprados (contam como níveis feitos, sem custo), e o resto da trilha delas custa 20% do preço. Assim as áreas antigas voltam a funcionar logo no começo da praia, e o trabalho manual fica na área nova (pilar 5).
- **Seta:** a melhoria da área nova (já aberta) vale 2 vezes mais na conta do custo-benefício.
- **Viagem:** ao comprar, o litoral abre com um barquinho indo até a próxima praia. Depois, a tela mostra a fama ganha e o botão opcional "Ver anúncio: +20% de fama". A praia nova começa com o nome grande na tela.

### Cardápio visível

Cada nível aumenta o preço em 25% e muda o desenho do produto:

- **Açaí:** granola → leite condensado → morango → paçoca → açaí completo (copo maior).
- **Coco:** canudo colorido → guarda-chuvinha → limão.
- **Sorvete:** duas bolas → três bolas → granulado → cereja.
- **Milho e pastel:** milho na manteiga → pastel de queijo → milho com queijo ralado → pastel de carne → milho completo.

O preço atual aparece numa plaquinha em cima de cada produto, e a compra mostra "Açaí agora R$ X".

### Ritmo alvo (bot humano do simulador)

O bot compra a nova praia assim que ela libera.

| Praia | Meta | Hoje (sementes 1, 2 e 3) |
|---|---|---|
| 1 | 8 a 10 min | 8,8 / 9,0 / 9,0 |
| 2 | 15 a 20 min | 17,4 / 17,8 / 17,6 |
| 3 | 20 a 25 min | 21,2 / 20,3 / 21,5 |
| 4 | 25 a 35 min | 26,7 / 25,1 / 27,5 |
| 5 | 35 a 45 min | 38,9 / 35,5 / 35,3 |

- **Nenhuma espera** entre compras passa de 150 s (hoje, no máximo 142 s).
- **As áreas antigas** voltam a funcionar nos primeiros 25% do tempo da praia (hoje, de 9% a 18%).
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

Eventos: `step_buy` (praia, índice, segundos desde a compra anterior), `praia_nova` (praia, fama_ganha, minutos, anuncio), `session_start`, `session_end`, `ad_offer`, `ad_watch`, `offline_claim`.

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
