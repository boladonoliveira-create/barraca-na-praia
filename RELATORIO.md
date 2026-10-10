# Relatório: Barraca na Praia, rodada 4 (refeita)

Resultado: EM ANDAMENTO
Commit: (preenchido no fim)

## Partes
- [x] Parte 0: trabalho interrompido salvo (commit `0ee98cb`).
- [x] Parte A: consentimento de anúncios (UMP) (commit `c631874`).
- [x] Parte B: progressão por áreas independentes (commit `5447287`).
- [ ] Parte C: área 5, quadra de futevôlei.

## Parte 0: estado encontrado
- **`git status`:** 9 arquivos de código modificados sem commit, com 405 linhas a mais e 34 a menos, e o `ROTEIRO.md` atualizado pelo revisor. Os arquivos: `src/core/economia.ts`, `jogo.ts`, `jogo.test.ts`, `simulador.ts`, `simulador.test.ts`, `src/dados/mapa.ts`, `planos.ts`, `src/main.ts` e `src/render/desenho.ts`.
- **`npm test`:** 6 arquivos, 35 testes passando.
- **`npm run build`:** ok.
- **O que existia:**
  - no núcleo, as mecânicas do chuveirão, das cadeiras, do milho e do pastel, mais o salva-vidas e o cozinheiro;
  - o desenho dessas áreas;
  - o bot do simulador operando tudo isso;
  - a lista de compras intercalada (`SERV_AT`, `PREP_AT`), que esta rodada descarta.

## Parte A: consentimento (UMP)
- **Onde:** `src/plataforma/anuncios.ts`, em `iniciarAnuncios`.
- **Como funciona:** depois do `AdMob.initialize`, chama `requestConsentInfo`. Se o status for `REQUIRED` e houver formulário, chama `showConsentForm`. Se `canRequestAds` vier falso, devolve `null` e o app segue sem anúncios; a UI usa o anúncio simulado.
- **Origem:** copiado e adaptado do Metrô Lotado, sem código compartilhado entre os jogos.
- **No navegador:** nada muda, porque `iniciarAnuncios` sai antes, como já fazia.

## Parte B: progressão por áreas independentes

### Estrutura
- **Trilhas por área** (`src/dados/planos.ts`):
  - `AREAS` e `TRILHAS` (uma trilha por área), mais `CAUDAS` (melhorias repetidas depois da lista fixa);
  - `NIVEL_ABRE = 5`, `MARCOS = [5, 10, 15, 20]` e `NIVEL_PRESTIGIO = 10`;
  - `ECONOMIA` com `abrir`, `base` e `cresce` por área;
  - a lista única e a ordem intercalada (`SERV_AT`, `PREP_AT`, `PRESTIGE_AFTER`) foram removidas.
- **Núcleo** (`src/core/jogo.ts`): no lugar de `plan`/`done`, entram `trilhas` e `nivel[]`.
  - `visibleSteps()`: em cada área aberta, a próxima compra e uma prévia da seguinte. De uma área fechada, só o quadro de abrir, e só quando `liberada(a)`.
  - `applyStep(a)`: compra o próximo nível da área.
  - `marco(a)`: ×2 por marco no preço de venda da área, incluindo banho e cadeira.
  - `receber()`: com o cofre, a venda entra direto no caixa.
  - `melhorCompra()`: custo-benefício. Abrir uma área vale ×3; chegar a um marco ou ao nível que abre a próxima vale ×2.
  - `comemorar()`: efeito dos marcos (confete, "Barraca do Sol nível 5!", "Produção x2", vibração).
  - **Turbo por área:** agora há `turbo` na Barraca e `turboS` no depósito do sorvete. Antes, o turbo da Barraca acelerava também o depósito do sorvete.
- **Melhorias novas:**
  - cofre automático em cada área;
  - "Depósito rápido" e "Mais um sorveteiro" no Sorvete;
  - "Banho caprichado" no Chuveirão;
  - "Mais um cozinheiro" no Milho e pastel.
- **Lugares no chão:** dentro de cada área (`src/dados/mapa.ts`). O quadro de abrir uma área fica na cerca dela.
- **Desenho** (`src/render/desenho.ts`):
  - placa com progresso: "abre com Barraca do Sol nv 5 (3/5)" e, depois, "Pronta para abrir: compre na cerca";
  - prévia apagada ("depois");
  - selo "Nv N ★" ao lado do balcão;
  - visual dos marcos: bandeirinhas, selo dourado, luzinhas e moldura dourada;
  - cofre no lugar da pilha de dinheiro;
  - seta para a melhor compra que cabe no bolso.
- **HUD:** "próximo" mostra a sugestão ("Barraca do Sol: Mais um guarda-sol"), e o texto da tela de nova praia foi atualizado.
- **Mecânicas das áreas 3 e 4:** reaproveitadas da rodada interrompida (chuveirão, cadeiras, salva-vidas, milho, pastel, cozinheiro).
- **Salvamento:** `SAVE_VERSION = 3`, com `niveis` por área. **Aviso:** saves antigos (v1, v2 e o do protótipo) **recomeçam do zero**, sem conversão, como o roteiro permite.
- **Simulador** (`src/core/simulador.ts` e `scripts/sim.ts`): o bot escolhe a melhor compra entre as áreas abertas e mede o ritmo por fase (de uma área aberta até a próxima).
- **GDD:** seções 6, 7 e 8 reescritas com a estrutura nova.

### Testes novos
- a área N+1 só abre com a área N no nível mínimo;
- melhorias de uma área não alteram outra (preços, velocidade, capacidades e cozimento das outras áreas, nos dois sentidos);
- marcos nos níveis 5, 10, 15 e 20 dobram o que a área gera;
- com o cofre automático, a venda entra direto no caixa;
- a seta sugere a melhor compra que cabe no bolso;
- 1 ou 2 por área, em quadrados diferentes e dentro da própria área; a 2ª compra só é paga depois da 1ª;
- prestígio só com as 4 áreas no nível 10;
- salvar e carregar por área;
- salva-vidas e cozinheiro sem travar por 10 minutos;
- a fila do chuveirão para com a caixa vazia e volta ao encher;
- cadeira bagunçada não é alugada;
- ritmo das 4 áreas.

`npm test`: 6 arquivos, 40 testes passando. `npm run build`: ok.

### Conferido no navegador (porta 5175, modo ∞, em 390×844 e 360×640)
- Barraca com a placa do Sorvete "(3/5)".
- Nível 5: comemoração, bandeirinhas, o quadro de abrir o Sorvete na cerca e a placa "Pronta para abrir".
- Cofre no lugar da pilha, com as vendas entrando direto no caixa.
- Seta apontando "Mais um guarda-sol".
- Barraca no nível 20, com moldura dourada e luzinhas.
- Sorvete; Chuveirão com o salva-vidas no registro e cadeiras ocupadas; Milho e pastel com a panela cozinhando e o cozinheiro levando pastéis. Cada área com o seu selo de nível.
- Placa "Quadra de futevôlei · em breve".

O que apareceu nessa conferência e foi corrigido:
- o selo de nível cobria a plaquinha de preço e invadia o lote vizinho;
- o título longo da placa saía cortado;
- com o cofre, o tutorial ficava parado esperando o jogador recolher uma pilha que não existe mais.

### Tabela do simulador (`npm run sim`, bot humano, semente 1)
```
Bot humano, semente 1
Fase 1    19.3 s  Barraca do Sol  nv  1  Máquina de açaí 2 (R$ 100)
Fase 1    23.2 s  Barraca do Sol  nv  2  Guarda-sol (R$ 160)
Fase 1    25.7 s  Barraca do Sol  nv  3  Coqueiro (R$ 255)
Fase 1    32.7 s  Barraca do Sol  nv  4  Ajudante (R$ 410)
Fase 1    45.7 s  Barraca do Sol  nv  5  Açaí com granola (R$ 655)
Fase 1    33.4 s  Barraca do Sol  nv  6  Bolsa maior (R$ 1050)
Fase 1    45.9 s  Barraca do Sol  nv  7  Cofre automático (R$ 1680)
Fase 1    74.5 s  Barraca do Sol  nv  8  Mais um guarda-sol (R$ 2685)
Fase 1    94.5 s  Barraca do Sol  nv  9  Máquinas turbo (R$ 4295)
Fase 1   150.8 s  Barraca do Sol  nv 10  Coqueiro 2 (R$ 6870)
Fase 1   121.7 s  Sorvete         nv  1  Quiosque de sorvete (R$ 12000)
Fase 2     9.3 s  Sorvete         nv  2  Duas bolas (R$ 1000)
Fase 2    20.1 s  Sorvete         nv  3  Sorveteiro (R$ 1400)
Fase 2    16.5 s  Sorvete         nv  4  Freezer maior (R$ 1960)
Fase 2    30.3 s  Sorvete         nv  5  Cofre automático (R$ 2745)
Fase 2    22.2 s  Sorvete         nv  6  Três bolas (R$ 3840)
Fase 2    39.9 s  Sorvete         nv  7  Depósito rápido (R$ 5380)
Fase 2    52.0 s  Sorvete         nv  8  Freezer maior 2 (R$ 7530)
Fase 2    79.3 s  Sorvete         nv  9  Granulado (R$ 10540)
Fase 2    90.3 s  Sorvete         nv 10  Mais um sorveteiro (R$ 14760)
Fase 2    51.8 s  Barraca do Sol  nv 11  Leite condensado (R$ 10995)
Fase 2    75.5 s  Barraca do Sol  nv 12  Mais um ajudante (R$ 17590)
Fase 2   233.2 s  Chuveirão       nv  1  Chuveirão (R$ 55000)
Fase 3    49.2 s  Chuveirão       nv  2  Mais cadeiras (R$ 3000)
Fase 3    40.0 s  Sorvete         nv 11  Cereja no topo (R$ 20660)
Fase 3    17.8 s  Chuveirão       nv  3  Salva-vidas (R$ 3900)
Fase 3    33.6 s  Chuveirão       nv  4  Caixa d'água maior (R$ 5070)
Fase 3    23.3 s  Chuveirão       nv  5  Mais um chuveiro (R$ 6590)
Fase 3    59.6 s  Chuveirão       nv  6  Aluguel mais caro (R$ 8570)
Fase 3    53.6 s  Sorvete         nv 12  Freezer maior 3 (R$ 28925)
Fase 3    41.2 s  Chuveirão       nv  7  Cofre automático (R$ 11140)
Fase 3    51.0 s  Chuveirão       nv  8  Banho caprichado (R$ 14480)
Fase 3    64.1 s  Chuveirão       nv  9  Mais cadeiras 2 (R$ 18825)
Fase 3    82.9 s  Chuveirão       nv 10  Caixa d'água maior 2 (R$ 24470)
Fase 3   226.3 s  Chuveirão       nv 11  Aluguel mais caro 2 (R$ 31815)
Fase 3   100.8 s  Milho e Pastel  nv  1  Barraca do milho (R$ 72000)
Sorvete abriu 11.1 min depois da anterior
Chuveirão abriu 12.0 min depois da anterior
Milho e Pastel abriu 14.1 min depois da anterior
4 áreas abertas em 37.2 min

Fora da faixa (3):
  Fase 2 #12 Chuveirão nv 1 (Chuveirão): 233.2 s (alvo ~90 s)
  Fase 3 #1 Chuveirão nv 2 (Mais cadeiras): 49.2 s (alvo ~15 s)
  Fase 3 #12 Chuveirão nv 11 (Aluguel mais caro 2): 226.3 s (alvo ~84 s)
```
