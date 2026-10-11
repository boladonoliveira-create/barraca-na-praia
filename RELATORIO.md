# Relatório: Barraca na Praia, rodada 8

Resultado: PARCIAL. A1 e A2 estão feitas. A3 encontrou o `JAVA_HOME` errado e a variável `JOGOS_CHAVE_SENHA` faltando, então A4 (APK) e A5 (assinatura e AAB) foram puladas, como o roteiro manda. A parte B fica para o OpenCode.

Commit:
- `1ff9d1d`: roteiro;
- `bda63a4`: A1;
- `19ea356`: A2;
- o deste relatório vem logo depois.

A3 não mudou nenhum arquivo, então não teve commit.

## Critérios de pronto
- [x] Nenhum banhista para perto de balcão, quadro, fila ou entrega, e o jogador fica sempre visível. Evidências:
  - teste "param a 50 ou mais de balcões, quadros, filas, entregas, pilhas e bancada (em todas as praias)", que confere todos os pontos de parada, das 10 praias, com `livre(x, y, 50)`;
  - no navegador (Praia 3), a área do Chuveirão fica limpa;
  - os banhistas são desenhados numa camada por baixo do jogador e dos clientes.
- [x] A recompensa diária funciona, inclusive dobrando com anúncio, com testes. Evidências:
  - 7 testes em `src/core/diaria.test.ts`, com data simulada: avanço de dia, virada do mês e do ano, dia perdido, relógio voltando, os 3 tipos de prêmio, o dobro, não pegar duas vezes e o calendário no save;
  - no navegador, o cartão com os 7 dias; "Pegar em dobro (anúncio)" passou pelo anúncio simulado e deu R$ 360;
  - no console, `recompensa_diaria {dia: 1, dobrou: true}`.
- [ ] `dist-android/barraca-na-praia-debug.apk` existe. Não existe: A4 foi pulada pela regra da A3 (ver "O que depende do usuário"). O AAB também não existe, pelo mesmo motivo e por falta da senha.
- [ ] A calçada tem as ondas pretas e brancas. É o item B1 (OpenCode).
- [ ] `?loja` gera o ícone, a imagem de destaque e as 6 capturas, e os textos estão em `loja/`. São os itens B2 e B3 (OpenCode).
- [x] `npm test` (76 testes, com o simulador na semente 1) e `npm run build` passam.

## O que foi feito

### A1. Legibilidade
- **Distância:** os banhistas só escolhem pontos de parada a 50 ou mais (`BANHISTA_LONGE`) de balcões, zonas de entrega, dinheiro, filas, quadros de compra e da zona de cada área (que inclui as pilhas de caixas e a bancada). A dupla do frescobol confere os dois lugares. Quem não acha lugar livre na areia vai nadar, e fica com a ação "nada" (antes ficava com uma ação de areia dentro do mar).
- **Filas:** `livre` agora cobre a fila inteira dos balcões, inclusive a parte que dobra para o lado quando ela cresce.
- **Desenho:** os banhistas foram para uma camada própria, desenhada antes de clientes, ajudantes e jogador. Assim o jogador fica sempre por cima, e quem importa no jogo também.
- **Contraste:** escolhi deixar os banhistas mais claros (transparência de 0,75), e não saturar os clientes. Os clientes usam as mesmas camisas e peles dos banhistas, e saturar mudaria o visual do jogo inteiro. Clareando só os banhistas, eles viram "fundo" e os clientes, os ajudantes e o jogador saltam à vista.
- **Travamento corrigido** (achado pelo simulador). Com o balcão de açaí cheio, os 4 primeiros da fila pedindo coco e o jogador com a bolsa cheia de açaí, ninguém comprava e o jogador não conseguia pegar coco: a barraca travava. Agora quem está entre os 4 primeiros e espera mais de 6 s (`TROCA_MS`) por um produto em falta troca pelo que tem no balcão ("Então me vê esse!"). Tem teste.
- **Rebalanceamento leve:** o sorteio dos banhistas e a troca de pedido mudaram o caminho do bot. Para voltar às metas, mudei 3 números de `ECONOMIA`:
  - base dos Sucos: 6 → 6,5 mi;
  - base do Torneio: 19 → 18 mi;
  - viagem da Praia 4: 1,6 → 1,4.

### A2. Recompensa diária
- **Lógica:** `src/core/diaria.ts` tem o calendário de 7 dias (`PREMIOS`) e `diaDeHoje`, que recebe a data como texto, para os testes simularem.
  - **Dia seguinte:** avança 1 dia; depois do 7º, recomeça no 1.
  - **Dia perdido:** volta 1 dia, ou seja, repete o último que pegou.
  - **Relógio voltou:** espera chegar o dia de novo.
- **No `Jogo`:**
  - `pegarDiaria(hoje, dobro)`: dinheiro de 3, 5 ou 8 min de lucro da praia; turbo ×2 ou ×3; ou +10% da fama da praia (no mínimo 1), com confete. O dobro dobra o valor, o tempo ou a fama.
  - `lucroPorMin()`: o que entrou na praia ÷ o tempo jogado, com um mínimo de R$ 60 × fama no começo.
  - `turbo()`: o multiplicador das vendas, que agora pode ser 2 ou 3.
- **Cartão** (`index.html`, `estilo.css`, `hud.ts`):
  - aparece depois de tocar em "Jogar", na primeira abertura do dia, e antes do cartão dos ganhos com o app fechado;
  - mostra os 7 dias (os pegos em verde, o de hoje em destaque);
  - tem "Pegar" e "Pegar em dobro (anúncio)": se o anúncio fechar antes do fim, entrega o prêmio normal;
  - fecha com 1 toque e não volta no mesmo dia;
  - o selo do turbo na tela mostra "3x R$" quando é o ×3.
- **Save:** o calendário fica no campo novo `diaria`.
- **Analytics:** `recompensa_diaria` com `{ dia, dobrou }`.
- **Documentação:** GDD, seção 10, e o `CLAUDE.md`, item do save.

### A3. Ambiente
- **`ANDROID_HOME`:** `C:\Users\000\AppData\Local\Android\Sdk`. Está certo (tem `build-tools/36.0.0` e `platforms/android-37.0`).
- **`JAVA_HOME`:** `C:\Program Files\Java\jdk-17`. Está errado: não é o `jbr` do Android Studio.
- **Android Studio:** está instalado em `D:\Android`, e não no lugar padrão. O `jbr` dele está em `D:\Android\jbr` (OpenJDK 25.0.3).
- **`JOGOS_CHAVE_SENHA`:** não existe.

Seguindo a regra do roteiro, não tentei o build e pulei A4 e A5.

## Números

Simulador (`npm run sim`, bot humano, sementes 1, 2 e 3), com o código final:

```
Bot humano, semente 1
| Praia | Minutos | Meta | Áreas antigas abertas | Maior espera | Fama ganha |
|---|---|---|---|---|---|
| 1 | 8.6 | 8 a 10 | - | 110 s | 3 |
| 2 | 18.6 | 15 a 20 | 0% | 110 s | 8 |
| 3 | 21.8 | 20 a 25 | 9% | 79 s | 40 |
| 4 | 29.3 | 25 a 35 | 16% | 111 s | 98 |
| 5 | 36.6 | 35 a 45 | 18% | 99 s | 224 |
| 6 | 49.0 | 45 a 55 | 18% | 105 s | 490 |
| 7 | 58.3 | 55 a 65 | 10% | 86 s | 1092 |
| 8 | 73.7 | 60 a 75 | 9% | 87 s | 2267 |
| 9 | 74.3 | 70 a 85 | 12% | 88 s | 3737 |
| 10 | 86.7 | 80 a 95 | 12% | 74 s | 6125 |
Total: 457.0 min (7.6 h)
Tudo dentro da faixa.

Bot humano, semente 2
| Praia | Minutos | Meta | Áreas antigas abertas | Maior espera | Fama ganha |
|---|---|---|---|---|---|
| 1 | 8.6 | 8 a 10 | - | 112 s | 3 |
| 2 | 18.6 | 15 a 20 | 0% | 118 s | 8 |
| 3 | 22.2 | 20 a 25 | 9% | 86 s | 40 |
| 4 | 29.7 | 25 a 35 | 18% | 140 s | 99 |
| 5 | 38.5 | 35 a 45 | 18% | 108 s | 232 |
| 6 | 46.7 | 45 a 55 | 17% | 100 s | 480 |
| 7 | 61.9 | 55 a 65 | 9% | 98 s | 1136 |
| 8 | 68.3 | 60 a 75 | 9% | 89 s | 2152 |
| 9 | 78.3 | 70 a 85 | 11% | 88 s | 3800 |
| 10 | 86.2 | 80 a 95 | 12% | 71 s | 6075 |
Total: 459.0 min (7.7 h)
Tudo dentro da faixa.

Bot humano, semente 3
| Praia | Minutos | Meta | Áreas antigas abertas | Maior espera | Fama ganha |
|---|---|---|---|---|---|
| 1 | 8.7 | 8 a 10 | - | 113 s | 3 |
| 2 | 18.2 | 15 a 20 | 0% | 116 s | 8 |
| 3 | 21.8 | 20 a 25 | 9% | 84 s | 40 |
| 4 | 30.6 | 25 a 35 | 16% | 123 s | 100 |
| 5 | 37.3 | 35 a 45 | 18% | 104 s | 226 |
| 6 | 49.8 | 45 a 55 | 15% | 109 s | 501 |
| 7 | 57.9 | 55 a 65 | 7% | 98 s | 1092 |
| 8 | 67.4 | 60 a 75 | 9% | 86 s | 2109 |
| 9 | 81.8 | 70 a 85 | 11% | 104 s | 3921 |
| 10 | 84.5 | 80 a 95 | 12% | 89 s | 6091 |
Total: 458.0 min (7.6 h)
Tudo dentro da faixa.
```

**Antes da correção da fila,** com os banhistas já longe das áreas, o bot travou na Praia 1 da semente 3 ("o bot travou": balcão de açaí cheio, fila pedindo coco, bolsa cheia de açaí).

**Depois da correção, antes do rebalanceamento,** sobraram 4 desvios:

| Semente | Praia | O quê | Meta |
|---|---|---|---|
| 2 | 4 | espera de 156 s | até 150 s |
| 2 | 6 | espera de 157 s | até 150 s |
| 3 | 8 | 58,4 min | 60 a 75 |
| 3 | 10 | 97 min | 80 a 95 |

## O que depende do usuário
1. **Corrigir o `JAVA_HOME`** para o Java do Android Studio. No Prompt de Comando ou no PowerShell:
   ```
   setx JAVA_HOME "D:\Android\jbr"
   ```
   O `ANDROID_HOME` já está certo. Se quiser deixar explícito:
   ```
   setx ANDROID_HOME "%LOCALAPPDATA%\Android\Sdk"
   ```
2. **Criar a senha da chave de upload** (escolha uma senha forte e guarde-a num lugar seguro: sem ela não dá para publicar atualizações):
   ```
   setx JOGOS_CHAVE_SENHA "sua-senha-aqui"
   ```
3. **Fechar e abrir de novo** o terminal e o Claude Code, porque o `setx` só vale em janelas novas. Depois, rodar A4 e A5 de novo (APK e AAB).

## Problemas e decisões
- **Pulei A4 e A5 mesmo com um JDK 17 instalado.** O JDK 17 avulso provavelmente compilaria, mas o roteiro pede o `jbr` do Android Studio e manda pular se não estiver certo. Segui a regra, para não gerar um APK com um Java diferente do que o usuário vai usar.
- **Correção do travamento da fila.** É uma regra nova de jogo: o cliente troca de pedido depois de 6 s esperando um produto em falta. Ela era necessária porque o travamento acontecia com o jogador de verdade, não só com o bot, e quebrava o pilar 2 ("sem derrota").
- **Save:** o campo `diaria` é opcional e entrou sem subir `SAVE_VERSION`. Os saves v4 antigos carregam normalmente, com o calendário zerado, então não precisa de conversão.
- **Contraste:** escolhi clarear os banhistas, e não saturar os clientes (ver A1).

## Sugestões
- **Retomar A4 e A5** assim que o `JAVA_HOME` e a `JOGOS_CHAVE_SENHA` estiverem certos. Os passos estão no roteiro; pela A4, ainda falta conferir `versionCode 1`, `versionName "1.0.0"` e o nome do app no `android/`.
- **Calendário no litoral:** um selo "recompensa de amanhã" no HUD, para lembrar de voltar (fora do escopo desta rodada).
- **Recompensa diária e o tutorial:** na primeira abertura, o cartão aparece antes do tutorial. Vale avaliar se no dia 1 ele deveria aparecer só depois da primeira venda.
