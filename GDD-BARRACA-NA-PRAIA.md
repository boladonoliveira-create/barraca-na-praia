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

Uma praia só, desenhada uma vez, dividida em lotes da esquerda para a direita. A câmera segue o jogador na horizontal e mostra 140 unidades além do último lote aberto, para o jogador espiar o que vem.

| Lote | Largura | Conteúdo | Abre na |
|---|---|---|---|
| 1 | 400 | Barraca do Sol (açaí e coco) | Praia 1 |
| 2 | 200 | Quiosque de sorvete | Praia 2 |
| 3 | 300 | Areia livre: chuveirão e aluguel de cadeiras | Praia 3 |
| 4 a 10 | zona grande com áreas pré-definidas | ver seção 7 | Praias 4 a 10 |

Cada lote fechado mostra uma cerca, a silhueta do que vai ter ali e uma placa com cadeado: nome e "abre na Praia N".

"Praia" é o nível de prestígio. O mapa é o mesmo, mas cada praia nova tem nome e cor do mar diferentes: Praia do Sol, Praia Grande, Praia do Farol, Praia Dourada, Ilha do Coqueiro, e depois repete com número.

## 7. Os 10 níveis do lançamento

Quatro tipos de mecânica, combinados para que cada praia traga um trabalho novo:

- **Venda:** pegar o produto na máquina e entregar no balcão.
- **Abastecer:** levar um insumo até um equipamento que vende sozinho.
- **Serviço:** o cliente usa algo e paga; o jogador mantém funcionando.
- **Atração:** não vende nada; aumenta a demanda de todas as lojas.

| Praia | O que abre | Tipo | O que o jogador faz | O que o ajudante automatiza |
|---|---|---|---|---|
| 1 | Barraca do Sol: açaí e coco | Venda | Leva da máquina ao balcão | Leva da máquina ao balcão |
| 2 | Quiosque de sorvete (já existe) | Abastecer | Leva caixas do depósito ao freezer (1 caixa = 6 sorvetes) | Sorveteiro abastece |
| 3 | Chuveirão e aluguel de cadeiras | Serviço | Chuveirão: enche a caixa d'água quando esvazia. Cadeiras: arruma a cadeira bagunçada depois que o cliente sai | Salva-vidas cuida dos dois |
| 4 | Milho e pastel | Venda com preparo | Leva milho cru à panela; depois do tempo de cozimento, leva ao balcão | Cozinheiro |
| 5 | Quadra de futevôlei | Atração | Compra arquibancada e melhorias; jogo rolando traz público | Não precisa |
| 6 | Ambulantes | Venda automática | Abastece o carrinho dos ambulantes com mate e biscoito de polvilho; eles andam pela praia vendendo | Gerente de ambulantes |
| 7 | Escolinha de surf | Serviço com fila | Entrega as pranchas aos alunos e recolhe na volta | Instrutor |
| 8 | Quiosque de sucos e vitaminas | Preparo | Leva frutas ao liquidificador e o suco ao balcão | Barman |
| 9 | Palco de pagode | Atração em evento | Um show começa a cada alguns minutos e traz uma multidão por 60 s | Não precisa |
| 10 | Torneio de futevôlei | Meta | Pagar a inscrição e os prêmios; ao vencer, mostra a arena "em breve" | Não precisa |

**Fora do lançamento (atualizações):** arena de beach soccer, temporadas (Carnaval, Réveillon, Copa) com decoração e produtos temporários.

## 8. Progressão e economia

### Plano de compras (já existe no protótipo)

Cada praia tem uma lista ordenada de compras. Só as próximas 2 aparecem no chão, sempre em lugares diferentes. A lista alterna melhorias de **produção** (máquinas, ajudantes, turbo) e de **demanda** (guarda-sóis, cardápio), para nenhum dos lados virar gargalo por muito tempo.

- **Preço da compra número i na praia b:** 50 × 1,21^i × 1,5^b, arredondado para múltiplos de 5.
- **Renda:** cada praia multiplica todos os preços de venda por 1,5^b.
- **Nova praia:** aparece depois de 14 compras, num quadrado dourado. Custa 3000 × 1,5^b.
- **Começo rápido:** cada praia nova começa com o dinheiro exato para as 2 primeiras compras.
- **Depois da lista fixa,** a lista continua com turbo e cardápio, para sempre ter algo a comprar.

### Cardápio visível (já existe no protótipo)

Cada nível aumenta o preço em 25% e muda o desenho do produto:

- **Açaí:** granola → leite condensado → morango → paçoca → açaí completo (copo maior).
- **Coco:** canudo colorido → guarda-chuvinha → limão.
- **Sorvete:** duas bolas → três bolas → granulado → cereja.

O preço atual aparece numa plaquinha em cima de cada produto, e a compra mostra "Açaí agora R$ X".

### Ritmo alvo

- Tempo até a próxima compra: cerca de 15 s no começo de cada praia, subindo devagar até cerca de 90 s no fim dela.
- Uma praia completa: 8 a 15 minutos.
- Esses números são o ponto de partida. Os valores finais saem do simulador (seção 11) e das métricas do teste fechado.

### Ganhos com o app fechado (já existe no protótipo)

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
