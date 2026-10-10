# Roteiro: Barraca na Praia

Status: AGUARDANDO REVISÃO
Rodada: 4 (refeita)
Porta do servidor: 5175

## Contexto

**A rodada 4 anterior foi interrompida no meio.** Há mudanças sem commit desde as 16h43 (mecânicas do chuveirão, das cadeiras, do milho e do pastel em `src/core/jogo.ts`, `src/dados/mapa.ts`, `src/dados/planos.ts`, `src/core/simulador.ts`, `src/render/desenho.ts` e `src/main.ts`), e o consentimento (UMP) não foi feito.

Além disso, o usuário jogou e trouxe um problema de estrutura. Hoje existe uma lista única de compras que mistura todas as áreas. Por isso:
- a próxima compra pode estar em qualquer canto do mapa, e o jogador atravessa tudo toda hora;
- uma área trava a outra (comprar caixa d'água para liberar o sorveteiro);
- o jogador não escolhe nada.

**Decisão de design** (baseada no Idle Miner Tycoon, em que cada parte da mina tem trilha de níveis independente e o jogador escolhe onde investir, e no My Perfect Hotel, que libera áreas por marcos): **cada área tem a sua trilha, e a próxima área abre pelo nível mínimo da anterior.** Isto substitui as seções 6 a 8 do GDD; atualize o GDD no fim.

Esta rodada é grande e está dividida em partes. **Faça commit ao fim de cada parte e registre no `RELATORIO.md` quais partes terminaram.** Se a sessão for interrompida, a próxima confere o `git log` e o relatório e continua da parte seguinte.

## Parte 0: salvar o que ficou da rodada interrompida
- Rode `git status`, `npm test` e `npm run build` e registre o resultado no relatório.
- Revise as mudanças pela metade. As mecânicas (chuveirão, cadeiras, milho, pastel, salva-vidas, cozinheiro) serão reaproveitadas na parte B; a ordem de compras intercalada (`SERV_AT`, `PREP_AT`) será descartada.
- Faça commit do que existe, mesmo incompleto, com a mensagem "Rodada 4 interrompida: mecânicas das Praias 3 e 4 (incompleto)". Não perca esse trabalho.

## Parte A: consentimento de anúncios (UMP)
- Igual ao do Metrô Lotado (`..\Metro lotado\src\plataforma\anuncios.ts`, função `iniciarAnuncios`): `requestConsentInfo` e, se for exigido, `showConsentForm`. Se `canRequestAds` vier falso, o app segue sem anúncios.
- Copie e adapte, sem código compartilhado entre os jogos.

## Parte B: progressão por áreas independentes

### Estrutura
- **Uma praia, várias áreas, da esquerda para a direita:**
  1. Barraca do Sol (açaí e coco);
  2. Sorvete;
  3. Chuveirão e cadeiras;
  4. Milho e pastel.
  
  Depois delas, só a placa da área 5 ("Quadra de futevôlei").
- **Cada área tem a sua trilha de níveis:** máquinas, ajudante, cardápio, capacidade e o que for próprio dela. As melhorias aparecem no chão **só dentro da área, ao lado do que melhoram**, 1 ou 2 por vez por área. Melhorar uma área nunca depende de outra.
- **Liberação:** a cerca da área N+1 abre quando a área N chega ao **nível 5** (ajuste com o simulador). Enquanto não abre, a placa mostra o progresso: "Sorvete · abre com a Barraca do Sol no nível 5 (3/5)". Ao chegar no mínimo, o quadro de compra da área nova aparece na cerca.
- **Marcos em cada área:** nos níveis 5, 10, 15 e 20, a produção daquela área dobra e ela muda de visual (balcão novo, letreiro, mais enfeites), com um efeito de comemoração.
- **Cofre automático:** melhoria de cada área. Com ele, o dinheiro daquela área entra sozinho no caixa e não precisa ser buscado.
- **Dinheiro:** um caixa só, compartilhado. As melhorias são independentes, mas o lucro de uma área ajuda a abrir a próxima.
- **Seta:** sugere a compra de melhor custo-benefício que cabe no bolso, sem obrigar. O jogador vai onde quiser.
- **Nova praia (prestígio):** opcional, liberada quando todas as áreas abertas chegarem ao nível 10. Recomeça com multiplicador permanente e mar de outra cor.

### Mecânicas das áreas 3 e 4 (reaproveite o que ficou da rodada interrompida)
- **Chuveirão:** clientes saindo do mar fazem fila, tomam banho e pagam. A caixa d'água esvazia a cada alguns banhos, e o jogador enche ficando parado no registro. Com a caixa vazia, a fila para.
- **Cadeiras de aluguel:** o cliente senta, fica um tempo e paga ao sair. A cadeira fica bagunçada até o jogador passar por cima, e cadeira bagunçada não é alugada.
- **Salva-vidas:** ajudante da área 3. Enche a caixa e arruma as cadeiras.
- **Milho e pastel:** pegar cru, levar à panela ou fritadeira, esperar o preparo (barra de tempo visível) e levar ao balcão.
- **Cozinheiro:** ajudante da área 4. Faz o ciclo todo.

### Salvamento
Suba a versão do save. Ainda não há jogadores, então um save antigo pode recomeçar do zero (com aviso no relatório), sem conversão.

### Simulador e ritmo
- O bot escolhe a melhor compra entre todas as áreas abertas (custo-benefício) e sabe operar as mecânicas novas.
- Metas para o bot humano:
  - compras de ~15 s no começo de cada área, subindo até ~90 s;
  - uma área nova liberada a cada 8 a 15 min;
  - as 4 áreas abertas em 35 a 60 min.
- Teste de ritmo cobrindo as 4 áreas, com a tabela no relatório.

### GDD
Reescreva as seções 6 (mapa), 7 (áreas) e 8 (progressão e economia) do `GDD-BARRACA-NA-PRAIA.md` com a estrutura nova.

## Parte C (se der tempo): área 5, quadra de futevôlei (atração)
- Não vende nada. Um jogo rola na quadra e junta público; a área aumenta a chegada de clientes em todas as outras áreas.
- Trilha própria: arquibancada, rede nova, torneio da tarde. Liberação pela área 4 no nível 5.
- Placa da área 6 ("Ambulantes") depois dela.

## Critérios de pronto
- `npm test` e `npm run build` passam ao fim de cada parte. Testes novos:
  - a área N+1 só abre com a área N no nível mínimo;
  - melhorias de uma área não alteram outra;
  - salva-vidas e cozinheiro nunca ficam travados em 10 minutos sem o jogador;
  - a fila do chuveirão para com a caixa vazia e volta ao encher;
  - cadeira bagunçada não é alugada.
- Conferido no navegador (porta 5175, modo teste ∞) em 390x844 e 360x640: cada área, a placa com progresso, um marco de nível, o cofre automático e a seta.
- Um commit por parte.

## Fora do escopo
- Áreas 6 a 10 (próximas rodadas).
- Gerar o APK (depende do usuário instalar o Android Studio).
