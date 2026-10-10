# Relatório: Barraca na Praia, rodada 4 (refeita)

Resultado: CONCLUÍDA
Commit: ce7d059 (último commit de código; o relatório e o roteiro vão no commit final logo depois)

## Partes
- [x] **Parte 0:** trabalho interrompido salvo (`0ee98cb`).
- [x] **Parte A:** consentimento de anúncios, UMP (`c631874`).
- [x] **Parte B:** progressão por áreas independentes (`5447287`; texto do relatório corrigido em `1a17685`).
- [x] **Parte C:** área 5, quadra de futevôlei (`ce7d059`).

## Critérios de pronto
- [x] **`npm test` e `npm run build` passam ao fim de cada parte.**
  - Parte 0: 35 testes. Parte A: 35. Parte B: 40. Parte C: 41, em 6 arquivos. Build ok em todas.
  - Testes novos pedidos, todos em `src/core/jogo.test.ts`:
    - a área N+1 só abre com a área N no nível mínimo;
    - melhorias de uma área não alteram outra;
    - salva-vidas e cozinheiro nunca ficam travados em 10 minutos sem o jogador;
    - a fila do chuveirão para com a caixa vazia e volta ao encher;
    - cadeira bagunçada não é alugada.
- [x] **Conferido no navegador** (porta 5175, modo ∞, em 390×844 e 360×640):
  - cada área: Barraca, Sorvete, Chuveirão, Milho e pastel e Quadra;
  - a placa com progresso: "abre com Barraca do Sol nv 5 (3/5)" e depois "Pronta para abrir: compre na cerca";
  - um marco de nível: comemoração "Barraca do Sol nível 5! Produção x2" e bandeirinhas; no nível 20, luzinhas e moldura dourada;
  - o cofre automático: cofre no lugar da pilha, com as vendas entrando direto no caixa;
  - a seta, apontando "Mais um guarda-sol" (melhor custo-benefício que cabe no bolso);
  - nenhum erro no console.
- [x] **Um commit por parte:** `0ee98cb`, `c631874`, `5447287`, `ce7d059`.

## O que foi feito

### Parte 0: salvar o que ficou da rodada interrompida
- **`git status`:** 9 arquivos de código modificados sem commit, com 405 linhas a mais e 34 a menos, e o `ROTEIRO.md` atualizado. Os arquivos: `src/core/economia.ts`, `jogo.ts`, `jogo.test.ts`, `simulador.ts`, `simulador.test.ts`, `src/dados/mapa.ts`, `planos.ts`, `src/main.ts` e `src/render/desenho.ts`.
- **`npm test`:** 35 testes passando. **`npm run build`:** ok.
- **Revisão:** as mecânicas (chuveirão, cadeiras, milho, pastel, salva-vidas, cozinheiro) estavam prontas e foram reaproveitadas na parte B. A ordem intercalada (`SERV_AT`, `PREP_AT`) foi descartada.
- **Commit:** "Rodada 4 interrompida: mecânicas das Praias 3 e 4 (incompleto)".

### Parte A: consentimento de anúncios (UMP)
- **Onde:** `src/plataforma/anuncios.ts`, em `iniciarAnuncios`, depois do `AdMob.initialize`.
- **Como funciona:** chama `requestConsentInfo`. Se o status for `REQUIRED` e houver formulário, chama `showConsentForm`. Se `canRequestAds` vier falso, devolve `null` e o app segue sem anúncios; os botões usam o anúncio simulado.
- **Origem:** copiado e adaptado do Metrô Lotado, sem código compartilhado.
- **No navegador:** nada muda.

### Parte B: progressão por áreas independentes
- **Dados** (`src/dados/planos.ts`):
  - `AREAS` e `TRILHAS` (uma trilha por área), mais `CAUDAS` (melhorias repetidas depois da lista fixa);
  - `NIVEL_ABRE = 5`, `MARCOS = [5, 10, 15, 20]` e `NIVEL_PRESTIGIO = 10`;
  - `ECONOMIA` com `abrir`, `base` e `cresce` por área.
  - Saíram a lista única, `SERV_AT`, `PREP_AT` e `PRESTIGE_AFTER`.
- **Lugares no chão** (`src/dados/mapa.ts`): todas as melhorias ficam dentro da área delas; o quadro de abrir uma área fica na cerca dela.
- **Núcleo** (`src/core/jogo.ts`): `trilhas` e `nivel[]` no lugar de `plan`/`done`.
  - `visibleSteps()`: a próxima compra de cada área aberta e uma prévia da seguinte. Da área fechada, só o quadro de abrir, quando `liberada(a)`.
  - `applyStep(a)`: compra o próximo nível da área.
  - `marco(a)` e `tier(a)`: ×2 no dinheiro da área a cada marco.
  - `receber()`: com o cofre, a venda entra direto no caixa.
  - `melhorCompra()`: custo-benefício, usado pela seta, pelo HUD e pelo bot.
  - `comemorar()`: efeito dos marcos.
  - **Turbo por área:** antes, o turbo da Barraca acelerava também o depósito do sorvete.
- **Melhorias novas:**
  - cofre automático em cada área;
  - Depósito rápido e Mais um sorveteiro no Sorvete;
  - Banho caprichado no Chuveirão;
  - Mais um cozinheiro no Milho e pastel.
- **Desenho** (`src/render/desenho.ts`):
  - placas com progresso;
  - prévia apagada do 2º quadro da área ("depois");
  - selo "Nv N ★" ao lado do balcão;
  - visual dos marcos: bandeirinhas (nível 5), selo dourado (10), luzinhas (15), moldura dourada (20);
  - cofre no lugar da pilha;
  - seta para a melhor compra que cabe no bolso.
- **HUD** (`src/ui/hud.ts`): "próximo" mostra a sugestão, por exemplo "Barraca do Sol: Mais um guarda-sol".
- **Salvamento** (`src/plataforma/salvar.ts`): versão 3, com `niveis` por área.
- **Simulador** (`src/core/simulador.ts`, `scripts/sim.ts`): o bot escolhe a melhor compra entre todas as áreas abertas e mede o ritmo por fase.
- **GDD:** seções 6, 7 e 8 reescritas.

### Parte C: área 5, quadra de futevôlei (atração)
- **O que faz:** não vende nada. O jogo na quadra junta público, e `publico()` multiplica a chegada de clientes em todas as outras áreas: balcões, quiosque, chuveirão e cadeiras.
  - Ao abrir: 1,15.
  - Arquibancada: +0,10 por nível. Rede nova: +0,06. Torneio da tarde: +0,15.
  - Os marcos da quadra dobram esse bônus.
  - Com a quadra fechada, vale exatamente 1. Por isso o simulador das 4 primeiras áreas deu os mesmos tempos.
- **Trilha própria:** arquibancada, rede nova e torneio da tarde. Abre com o Milho e pastel no nível 5, por R$ 150 mil.
- **Desenho:**
  - quadra com dois jogadores e a bola indo e voltando;
  - rede listrada quando é nova;
  - arquibancada com público pulando, mais gente a cada nível;
  - faixa "TORNEIO DA TARDE" com troféu;
  - plaquinha "Clientes x2,74".
- **Área 6:** placa "AMBULANTES · em breve", com silhueta de carrinhos.
- **Teste novo:** "não vende nada, mas aumenta a chegada de clientes em todas as outras áreas".

## Números

Simulador (`npm run sim`, bot humano, semente 1), igual nas partes B e C:
```
Sorvete abriu 11.1 min depois da anterior
Chuveirão abriu 12.0 min depois da anterior
Milho e Pastel abriu 14.1 min depois da anterior
4 áreas abertas em 37.2 min

Fora da faixa (3):
  Fase 2 #12 Chuveirão nv 1 (Chuveirão): 233.2 s (alvo ~90 s)
  Fase 3 #1 Chuveirão nv 2 (Mais cadeiras): 49.2 s (alvo ~15 s)
  Fase 3 #12 Chuveirão nv 11 (Aluguel mais caro 2): 226.3 s (alvo ~84 s)
```

Tabela completa:
```
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
```

Robustez (sementes 1 a 3, preços finais):

| Semente | Sorvete | Chuveirão | Milho e pastel | Total |
|---|---|---|---|---|
| 1 | 11,1 | 12,0 | 14,1 | 37,2 min |
| 2 | 11,2 | 13,1 | 11,2 | 35,5 min |
| 3 | 11,3 | 12,2 | 12,3 | 35,8 min |

Os tempos de cada área são minutos depois da abertura da área anterior.

Preços finais (Praia 1; × 1,5 por praia):

| Área | Abrir | 1ª melhoria | Cresce |
|---|---|---|---|
| Barraca do Sol | (aberta) | 100 | 1,6 |
| Sorvete | 12 mil | 1.000 | 1,4 |
| Chuveirão | 55 mil | 3.000 | 1,3 |
| Milho e pastel | 72 mil | 6.000 | 1,3 |
| Quadra | 150 mil | 20.000 | 1,35 |

## O que depende do usuário
- **Gerar o APK** continua dependendo de instalar o Android Studio (traz o Android SDK e o Java 21). O passo a passo está no relatório da rodada 3, seção A.
- **Consentimento (UMP):** para os anúncios reais, o formulário de consentimento é configurado na própria conta AdMob (*Privacidade e mensagens → Mensagens do GDPR*). Com os IDs de teste, o Google não mostra formulário fora da Europa. Para testar o formulário num aparelho, é preciso adicioná-lo como dispositivo de teste na conta AdMob.

## Problemas e decisões
- **Saves antigos recomeçam do zero.** O formato subiu para a versão 3, com níveis por área, e as versões 1 e 2 e o save do protótipo não são convertidos, como o roteiro permite. O jogo novo começa do zero sem aviso na tela.
- **"Produção dobra" nos marcos** virou **dinheiro gerado ×2** (preço de venda). O ritmo é limitado pela chegada de clientes, então dobrar a velocidade das máquinas mudaria pouco.
- **Nova praia** exige **todas as áreas abertas** (hoje 5) no nível 10, não só as que estiverem abertas. Com só a Barraca aberta, a regra liberava o prestígio aos 4 minutos, e o quadrado dourado no meio da área drenava o dinheiro de quem passava por cima. O quadrado foi para o canto da Barraca.
- **Prévia do 2º quadro:** cada área mostra a próxima compra e, apagada, a seguinte ("depois"), que só pode ser paga depois da próxima. A trilha é uma sequência, e deixar pagar fora de ordem pediria guardar compras soltas no save.
- **Preço de abrir separado:** abrir uma área tem preço próprio (`abrir`), separado da base das melhorias da área. Com o mesmo preço, a primeira melhoria de uma área nova custava tanto quanto abri-la, e não dava para ter as compras de ~15 s no começo da fase.
- **Ritmo:** as fases e o total ficaram dentro da faixa em todas as sementes. Sobram 3 compras isoladas fora da faixa na semente 1: duas esperas de 3,5 a 4 min antes de uma compra cara, e uma 1ª compra de fase com 49 s. Abrir uma área é um salto de preço, e baixá-lo encurta as fases para menos de 8 min. O teste de ritmo exige as fases e o total dentro da faixa e aceita no máximo esses 3 desvios, sem nenhuma espera acima de 4 min.
- **Bot do simulador:**
  - contorna obstáculos também quando estão na mesma altura (antes, ficava preso empurrando o depósito do sorvete);
  - desvia dos outros quadros enquanto junta dinheiro;
  - recolhe as pilhas paradas das áreas automatizadas.
- **Desenho:** o selo de nível ficou à esquerda do balcão, preso ao lote da área (cobria a plaquinha de preço e invadia o lote vizinho), e títulos longos de placa usam fonte menor.
- **Tutorial com cofre:** com o cofre, a venda já conta como "recolheu o dinheiro" (sem pilha, o tutorial ficava parado).
- **Exceção à independência das áreas:** a quadra aumenta a chegada de clientes nas outras áreas por definição do roteiro. As melhorias das áreas 1 a 4 seguem sem afetar umas às outras, com teste.
- **Melhorias do jogador:** "Bolsa maior" e "Chinelo novo" estão na trilha da Barraca, mas valem para o jogador em todas as áreas, como antes.
- **Escrita do relatório:** na parte B, o texto foi gravado pelo bash, que comeu os trechos entre crases. Corrigi num commit separado (`1a17685`).

## Sugestões
- **Aviso na tela para saves antigos:** hoje quem tinha progresso simplesmente recomeça. Vale um aviso ("Nova versão: sua praia recomeçou").
- **Esperas antes de abrir uma área:** suavizar na etapa 7. Opções: um quadro intermediário (por exemplo, "cerca nova" a 30%) ou o jogador receber parte do preço de volta em vendas da área nova.
- **Selo de nível da quadra:** fica um pouco sobre a quadra, porque não há espaço à esquerda dela. Vale um lugar próprio quando a área 6 entrar.
- **Bot com a quadra:** o simulador para na 4ª área. Quando houver metas para a área 5, ensinar o bot a escolher melhorias de atração.
- **Ícone/abertura e APK:** seguem como na rodada 3.
