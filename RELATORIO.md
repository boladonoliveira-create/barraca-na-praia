# Relatório: Barraca na Praia, rodada 4 (refeita)

Resultado: EM ANDAMENTO
Commit: (preenchido no fim)

## Partes
- [x] Parte 0: trabalho interrompido salvo.
- [x] Parte A: consentimento de anúncios (UMP).
- [x] Parte B: progressão por áreas independentes.
- [ ] Parte C: área 5, quadra de futevôlei.

## Parte 0: estado encontrado
- `git status`: 9 arquivos de código modificados sem commit (`src/core/economia.ts`, `jogo.ts`, `jogo.test.ts`, `simulador.ts`, `simulador.test.ts`, `src/dados/mapa.ts`, `planos.ts`, `src/main.ts`, `src/render/desenho.ts`), 405 linhas a mais e 34 a menos, e o `ROTEIRO.md` atualizado pelo revisor.
- `npm test`: 6 arquivos, 35 testes passando.
- `npm run build`: ok.
- O que existia: as mecânicas do chuveirão, das cadeiras, do milho e do pastel, o salva-vidas e o cozinheiro no núcleo; o desenho dessas áreas; o bot do simulador operando tudo isso; e a lista de compras intercalada (`SERV_AT`, `PREP_AT`), que esta rodada descarta.

## Parte A: consentimento (UMP)
- `src/plataforma/anuncios.ts`, em `iniciarAnuncios`: depois do `AdMob.initialize`, chama `requestConsentInfo`; se o status for `REQUIRED` e houver formulário, chama `showConsentForm`. Se `canRequestAds` vier falso, devolve `null` e o app segue sem anúncios (a UI usa o anúncio simulado nos botões "Dinheiro em dobro" e "Dobrar").
- Copiado e adaptado do Metrô Lotado, sem código compartilhado entre os jogos.
- No navegador nada muda: `iniciarAnuncios` sai antes, como já fazia.
- `npm test` (35 testes) e `npm run build` passam. Não testado num aparelho (o APK depende do Android Studio).

## Parte B: progressão por áreas independentes

### Estrutura
- **Trilhas por área** ():
  -  e  (uma trilha por área), mais  (melhorias repetidas depois da lista fixa).
  - ,  e .
  -  com ,  e  por área.
  - A lista única e a ordem intercalada (, , ) foram removidas.
- **Núcleo** (): no lugar de  e , entram  e .
  - : em cada área aberta, a próxima compra e uma prévia da seguinte; de uma área fechada, só o quadro de abrir, e só quando .
  - : compra o próximo nível da área.
  - : ×2 por marco no preço de venda da área (incluindo banho e cadeira).
  - : com o cofre, a venda vai direto ao caixa.
  - : custo-benefício; abrir área vale ×3, chegar a um marco ou ao nível que abre a próxima vale ×2.
  - : efeito dos marcos (confete, "Barraca do Sol nível 5!", "Produção x2", vibração).
  - O turbo agora é por área ( na Barraca,  no depósito do sorvete). Antes, o turbo da Barraca acelerava o depósito do sorvete.
- **Melhorias novas:** cofre automático em cada área,  e  no Sorvete,  no Chuveirão,  no Milho e pastel.
- **Lugares no chão:** dentro de cada área (). O quadro de abrir uma área fica na cerca dela.
- **Desenho** ():
  - placas com progresso: "abre com Barraca do Sol nv 5 (3/5)" e, depois, "Pronta para abrir: compre na cerca";
  - prévia apagada ("depois");
  - selo "Nv N ★" ao lado do balcão;
  - visual dos marcos: bandeirinhas, selo dourado, luzinhas, moldura dourada;
  - um cofre no lugar da pilha de dinheiro;
  - a seta aponta a melhor compra que cabe no bolso.
- **HUD:** "próximo" mostra a sugestão ("Barraca do Sol: Mais um guarda-sol"), e o texto da nova praia foi atualizado.
- **Mecânicas das áreas 3 e 4:** reaproveitadas da rodada interrompida (chuveirão, cadeiras, salva-vidas, milho, pastel, cozinheiro).
- **Salvamento:** , com  por área.
  - **Aviso:** saves antigos (v1, v2 e o do protótipo) **recomeçam do zero**, sem conversão, como o roteiro permite.
- **Simulador** (, ): o bot escolhe a melhor compra entre as áreas abertas e mede o ritmo por fase (de uma área aberta até a próxima).
- **GDD:** seções 6, 7 e 8 reescritas com a estrutura nova.

### Testes novos
- .
-  (preços, velocidade, capacidades e cozimento das outras áreas, nos dois sentidos).
- .
- .
- .
-  e .
- Prestígio só com as 4 áreas no nível 10.
- Salvar e carregar por área.
- Salva-vidas e cozinheiro sem travar por 10 min.
- A fila do chuveirão para com a caixa vazia.
- Cadeira bagunçada não é alugada.
- Ritmo das 4 áreas.

Resultado: Unknown command: "test"


Did you mean this?
  npm test # Test a package
To see a list of supported npm commands, run:
  npm help com 6 arquivos e 40 testes passando;  ok.

### Conferido no navegador (porta 5175, modo ∞)
Em 390×844 e 360×640:
- Barraca com a placa do Sorvete "(3/5)".
- Nível 5: comemoração, bandeirinhas, quadro de abrir o Sorvete na cerca e placa "Pronta para abrir".
- Cofre no lugar da pilha (vendas entrando direto).
- Seta apontando "Mais um guarda-sol".
- Barraca no nível 20, com moldura dourada e luzinhas.
- Sorvete, Chuveirão (salva-vidas no registro, cadeiras ocupadas) e Milho e pastel (panela cozinhando, cozinheiro levando pastéis), cada um com o seu selo de nível.
- Placa "Quadra de futevôlei · em breve".

Corrigi o que apareceu nessa conferência:
- o selo de nível cobria a plaquinha de preço e invadia o lote vizinho;
- o título longo da placa saía cortado;
- com o cofre, o tutorial ficava parado esperando o jogador recolher uma pilha que não existe mais.

### Tabela do simulador (npm run sim, bot humano, semente 1)
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
