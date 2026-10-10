# Barraca na Praia

Jogo mobile "idle arcade" (no estilo do Pizza Ready): o jogador anda com um dedo por uma praia brasileira, leva produtos das máquinas até as barracas, junta dinheiro e transforma uma barraca simples num complexo de praia. O ciclo é andar, carregar, entregar, expandir e automatizar. Público de todas as idades, sessões de 5 a 15 minutos.

- Design completo: `GDD-BARRACA-NA-PRAIA.md` (fonte da verdade para regras e números).
- Protótipo de referência: `barraca-na-praia.html`. O que o GDD marca como "já existe no protótipo" precisa manter o mesmo comportamento.
- **Áreas:** a praia é dividida em áreas, da esquerda para a direita: Barraca do Sol, Sorvete, Chuveirão e cadeiras, Milho e pastel, Quadra de futevôlei (atração: não vende, aumenta a chegada de clientes nas outras); depois, só a placa dos Ambulantes.
- **Trilhas:** cada área tem a sua trilha de níveis, independente das outras, e a área N+1 abre quando a área N chega ao nível 5 (GDD seções 6 a 8).
- **Praia:** é o nível de prestígio, opcional, com todas as áreas abertas no nível 10.

## Pilares (GDD seção 2, não quebrar)

1. **Um dedo só.** Arrastar em qualquer lugar move o personagem. Nada exige precisão.
2. **Sem derrota e sem relógio.** O pior que acontece é ganhar mais devagar.
3. **Sem menus.** Comprar é pisar num quadrado no chão. A próxima compra aparece ao lado da coisa que ela melhora.
4. **Progresso sempre visível.** Toda compra muda algo na tela.
5. **Trabalho manual vira automação, área por área.** Cada área nova começa manual e o ajudante dela automatiza depois. Sempre existe uma área onde o jogador ainda trabalha com as mãos.
6. **O futuro fica à vista.** Lotes fechados ficam atrás de uma cerca com placa ("abre na Praia N").

## Estrutura (GDD seção 11)

Vite + TypeScript, empacotado com Capacitor 8 para Android (`android/`, id `com.jogosbr.barracanapraia`).

```
src/
  dados/        mapa.ts (lotes, lojas/SHOPS, SERVICO, PREPARO, ATRACAO, produtos, slots), planos.ts (AREAS, TRILHAS, ECONOMIA)
  core/         jogo.ts (estado, clientes, ajudantes, compras; sem canvas e sem DOM)
                economia.ts (trilhas e preços), simulador.ts (bot que mede o ritmo)
  render/       desenho.ts (câmera, cenário, personagens, máquinas, efeitos)
  ui/           hud.ts (placar, telas, botões), estilo.css
  plataforma/   salvar.ts (save versionado e preferências; Preferences no app, localStorage no navegador)
                som.ts (sons, mar, vibração; Haptics no app), anuncios.ts (AdMob no app, simulado no navegador)
                analytics.ts (console; Firebase só com android/app/google-services.json)
  main.ts       entrada (joystick/teclado) e laço principal
scripts/sim.ts  relatório do simulador no terminal
scripts/icones.mjs  gera assets/*.png (ícone e abertura provisórios)
admob.config.json   único lugar dos IDs do AdMob (teste até usarReais = true)
```

- O núcleo (`core/`) não toca em canvas nem DOM. Som, vibração, salvar e telas saem pela interface `Io` passada ao `Jogo`. A aleatoriedade vem de `rand`, que os testes e o simulador trocam por um gerador com semente.
- **Uma área nova:** a área i é a loja `SHOPS[i]`, o lote `LOTS[i]` e a trilha `TRILHAS[i]`. Ela entra como dados em `dados/` (produtos, zonas, trilha, regra de ajudante), não reescrevendo o motor.
- **Independência:** melhorias de uma área não podem mudar outra. Cada área tem o seu turbo e o seu cardápio, e há teste para isso.
- **Salvar:**
  - O progresso fica em `barraca-na-praia:save` como `{ versao: 3, jogo }`, com `niveis` por área.
  - Se a estrutura do `Save` mudar, suba `SAVE_VERSION` e converta em `lerSave`. Hoje saves de versões antigas recomeçam do zero.
  - Um save de versão mais nova nunca é sobrescrito.
  - Som, vibração e modo teste ficam em `barraca-na-praia:prefs`.
- Ganhos offline valem ao abrir o jogo e ao voltar do segundo plano (`Jogo.offlineGain`). O valor do cartão fica no save (`pendente`) até ser pego ou dobrado.
- Ciclo de vida: `@capacitor/app` no app, `visibilitychange` no navegador (`aoSair`/`aoVoltar` em `main.ts`).
- Modo teste (botão ∞): só existe em `npm run dev` (`import.meta.env.DEV`). Nunca na versão da loja.

## Comandos

```
npm run dev     # jogo em http://localhost:5175
npm test        # testes do núcleo e do simulador (vitest)
npm run sim     # tempos de compra por fase/área e o que está fora da faixa da seção 8 (-- --perfeito, -- 2 = semente)
npm run build   # checa os tipos e gera dist/
npx cap sync android                      # copia dist/ e plugins para android/
cd android && gradlew.bat assembleDebug   # APK de depuração (precisa do Android SDK)
```

O `npm run sim` roda com o Node 24, que executa TypeScript direto. Por isso os imports usam a extensão `.ts`.

## Balanceamento

- **O que o simulador mede:** o bot joga até abrir as 4 áreas. Em cada fase (de uma área aberta até a próxima), as compras devem ir de ~15 s a ~90 s; cada área nova deve abrir de 8 a 15 min depois da anterior; e as 4 áreas, em 35 a 60 min.
- **O bot:**
  - escolhe a melhor compra por custo-benefício (`Jogo.melhorCompra`);
  - enquanto junta dinheiro, desvia dos outros quadros;
  - recolhe as pilhas paradas;
  - opera chuveirão, cadeiras e panelas.
- **Variações:** o bot humano (padrão) reage com 200 a 400 ms de atraso, anda com desvio leve e para 3 a 5 s a cada 30 s. `npm run sim -- --perfeito` usa o bot perfeito.
- **Números:** ficam em `ECONOMIA` (`src/dados/planos.ts`). Hoje as áreas abrem a 11 / 12 / 14 min, e as 4 estão abertas em 37 min.
- **Desvios conhecidos:** 3 esperas de 3,5 a 4 min antes de compras caras. Ficam para a etapa 7.

## Ordem de trabalho (GDD seção 12)

Feitas: etapa 1 (base, porte, testes, simulador) e etapa 2 (personagens, sons e mar, vibração, tela inicial, save versionado, ganhos offline). Rodada 3 (etapa 3: Capacitor, AdMob de teste, analytics) feita. Rodada 4 (refeita): consentimento de anúncios, progressão por áreas independentes com as áreas 3 e 4, e a área 5 (quadra); ver RELATORIO.md. Não avance além do roteiro sem o usuário pedir.
