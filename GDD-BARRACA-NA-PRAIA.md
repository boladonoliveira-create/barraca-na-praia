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
6. **O futuro fica à vista.** Lotes que ainda não abriram ficam atrás de uma cerca com placa ("abre na Praia N"). É o principal motivo para buscar a próxima praia.

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

Uma praia só, desenhada uma vez, dividida em **áreas** da esquerda para a direita. A câmera segue o jogador na horizontal e mostra 140 unidades além da última área aberta, para o jogador espiar o que vem.

| Área | Largura | Conteúdo | Abre quando |
|---|---|---|---|
| 1 | 400 | Barraca do Sol (açaí e coco) | já começa aberta |
| 2 | 200 | Sorvete | Barraca do Sol no nível 5 |
| 3 | 300 | Chuveirão e cadeiras de aluguel | Sorvete no nível 5 |
| 4 | 300 | Milho e pastel | Chuveirão no nível 5 |
| 5 | 200 | Quadra de futevôlei (por enquanto só a placa) | Milho e pastel no nível 5 |

Cada área fechada mostra uma cerca, a silhueta do que vai ter ali e uma placa com cadeado com o progresso: "Sorvete · abre com Barraca do Sol nv 5 (3/5)". Quando a área anterior chega ao nível mínimo, a placa diz "pronta para abrir" e o **quadro de compra da área nova aparece na cerca**. Comprar esse quadro abre a área.

"Praia" é o nível de prestígio (seção 8). O mapa é o mesmo, mas cada praia nova tem nome e cor do mar diferentes: Praia do Sol, Praia Grande, Praia do Farol, Praia Dourada, Ilha do Coqueiro, e depois repete com número.

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
| 5 | Quadra de futevôlei | Atração | Compra arquibancada e melhorias; jogo rolando traz público | Não precisa |

**Próximas áreas (próximas rodadas):** ambulantes, escolinha de surf, sucos e vitaminas, palco de pagode, torneio de futevôlei.

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

- **Barraca do Sol:** a melhoria k custa 100 × 1,6^k.
- **Áreas 2 a 4:** abrir custa 12 mil (Sorvete), 55 mil (Chuveirão) e 72 mil (Milho e pastel). As melhorias seguem base × cresce^(k-1):

  | Área | Base | Cresce |
  |---|---|---|
  | Sorvete | 1.000 | 1,4 |
  | Chuveirão | 3.000 | 1,3 |
  | Milho e pastel | 6.000 | 1,3 |

  Todos os números ficam em `ECONOMIA` (`src/dados/planos.ts`).
- **Praia:** cada praia multiplica todos os preços de compra e de venda por 1,5^b.

### Nova praia (prestígio)

- **Opcional:** só fica disponível com a praia completa, isto é, as 4 áreas abertas e todas no nível 10. Aparece num quadrado dourado, no canto da Barraca do Sol, fora do caminho do trabalho.
- **Recomeço:** todas as áreas fecham de novo, mas o **multiplicador da praia fica para sempre**, e o mar muda de cor.
- **Começo rápido:** cada praia nova começa com o dinheiro exato para as 2 primeiras compras da Barraca do Sol.

### Cardápio visível

Cada nível aumenta o preço em 25% e muda o desenho do produto:

- **Açaí:** granola → leite condensado → morango → paçoca → açaí completo (copo maior).
- **Coco:** canudo colorido → guarda-chuvinha → limão.
- **Sorvete:** duas bolas → três bolas → granulado → cereja.
- **Milho e pastel:** milho na manteiga → pastel de queijo → milho com queijo ralado → pastel de carne → milho completo.

O preço atual aparece numa plaquinha em cima de cada produto, e a compra mostra "Açaí agora R$ X".

### Ritmo alvo (bot humano do simulador)

- **Dentro de cada fase** (de uma área aberta até a próxima): compras de ~15 s no começo, subindo até ~90 s.
- **Áreas novas:** uma a cada 8 a 15 minutos.
- **As 4 áreas abertas:** em 35 a 60 minutos.
- **Hoje:** 11 / 12 / 14 minutos por área, e as 4 abertas em 37 minutos.
- Os valores finais saem do simulador (seção 11) e das métricas do teste fechado.

### Ganhos com o app fechado

24 × número de ajudantes × multiplicador da praia por minuto, até no máximo 2 horas. Ao voltar, o jogador pode pegar ou dobrar com anúncio.

## 9. Monetização

- **Anúncio recompensado:**
  - "Dinheiro em dobro" por 2 minutos (já existe, simulado).
  - Dobrar os ganhos com o app fechado (já existe, simulado).
  - Pular a espera de uma máquina ou contratar um ajudante temporário por 3 minutos (a fazer).
- **Intersticial:** só a partir da Praia 2, no máximo a cada 4 minutos, e só logo depois de uma compra (nunca no meio do trabalho).
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

Guardar a versão do formato junto do progresso. O protótipo já usa versões separadas a cada mudança de estrutura.

### Analytics (Firebase)

Eventos: `step_buy` (praia, índice, segundos desde a compra anterior), `prestige`, `session_start`, `session_end`, `ad_offer`, `ad_watch`, `offline_claim`.

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
