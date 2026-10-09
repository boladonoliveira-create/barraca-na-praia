# Relatório: Barraca na Praia, rodada 3

Resultado: PARCIAL
Commit: COMMIT_HASH

O código da etapa 3 está pronto. O APK de depuração não foi gerado porque o computador não tem o Android SDK e nem o JDK 21. O passo a passo está em "O que depende do usuário".

## Critérios de pronto
- [x] `npm test` e `npm run build` passam: 6 arquivos, 30 testes passando. Build: `✓ built`, sem erros de tipo.
- [x] O jogo funciona no navegador (porta 5175) com o anúncio simulado. Conferido em 390×844:
  - tela inicial → Jogar;
  - "Dinheiro em dobro" com o simulado liga o "2x R$";
  - um save com R$ 777 pendente reabriu o cartão "Bem-vindo de volta"; "Dobrar com anúncio" deu R$ 1.554;
  - o console mostrou `session_start`, `ad_offer`, `ad_watch` e `offline_claim`, sem erros.
- [ ] APK de depuração: não gerado, porque faltam o Android SDK e o JDK 21 (detalhes abaixo).
- [x] Passo a passo para o usuário: instalar o APK, criar a conta AdMob e o projeto Firebase, gerar a chave da Play Store (abaixo).
- [x] Commit feito (hash acima).

## O que foi feito

### 1. Capacitor (Android)
- **Capacitor 8.5:** `capacitor.config.ts` com o id `com.jogosbr.barracanapraia` e o nome "Barraca na Praia". A pasta `android/` foi gerada por `npx cap add android`.
- **Retrato e tela cheia:**
  - `android:screenOrientation="portrait"` no `AndroidManifest.xml`;
  - `windowFullscreen` e `windowLayoutInDisplayCutoutMode=shortEdges` em `res/values/styles.xml`;
  - `StatusBar.hide()` ao abrir o app (`src/main.ts`).
- **Ícone e abertura provisórios:**
  - `scripts/icones.mjs` desenha os PNGs em `assets/` com a arte da tela inicial (guarda-sol, copo de açaí, mar e areia);
  - `npx capacitor-assets generate --android` gerou os 74 recursos em `android/app/src/main/res`;
  - a abertura fica 1,2 s com fundo areia (`capacitor.config.ts`).
- **Salvamento** (`src/plataforma/salvar.ts`):
  - no app usa `@capacitor/preferences`; no navegador continua no `localStorage`;
  - a interface não mudou (`lerSave`, `gravarSave`, `lerPrefs`, `gravarPrefs`). Como o Preferences é assíncrono, `iniciarArmazenamento()` carrega as chaves para a memória antes do jogo começar; depois, a leitura é síncrona e a gravação vai para o Preferences sem esperar.
- **Vibração:** `@capacitor/haptics` no app (`src/plataforma/som.ts`). Um padrão vira uma vibração só, com a soma dos trechos ligados.
- **Ciclo de vida:** `@capacitor/app` (`appStateChange`) no app e `visibilitychange` no navegador, as duas por `aoSair`/`aoVoltar` em `src/main.ts`.
  - Ao sair: salva, pausa o laço do jogo e suspende o áudio (sons e mar).
  - Ao voltar: retoma e aplica os ganhos offline.
- **Ganhos offline não se perdem:**
  - o save tem o campo `pendente` (formato v2; o v1 continua sendo lido);
  - `Jogo.abrirOffline(valor)` grava o valor assim que o cartão abre, e `Jogo.pegarOffline(vezes)` o soma ao dinheiro e zera;
  - se o app fechar com o cartão aberto, na próxima abertura o pendente volta somado ao novo tempo fora;
  - se o anúncio de "dobrar" fechar antes da recompensa, o jogador recebe o valor normal.
  - Testes: `ganhos offline pendentes` em `src/core/jogo.test.ts` e `salvamento v1` em `src/plataforma/salvar.test.ts`.

### 2. AdMob (só IDs de teste)
- **`admob.config.json`:** é o único lugar dos IDs. Tem os IDs de teste oficiais do Google, campos vazios para os reais, `usarReais: false` e um aviso no topo.
  - O TypeScript lê o arquivo em `src/plataforma/anuncios.ts`.
  - O Gradle lê o mesmo arquivo em `android/app/build.gradle`, que preenche o `APPLICATION_ID` no manifesto.
  - Os IDs reais só entram com `usarReais: true` e os três campos preenchidos.
- **`src/plataforma/anuncios.ts`** (`@capacitor-community/admob` 8.2):
  - o recompensado só dá a recompensa no evento `Rewarded`;
  - o recompensado e o intersticial ficam pré-carregados;
  - um intersticial sem carga é pulado, para não travar o jogador;
  - no navegador devolve `null`, e a UI usa o simulado.
- **UI (`src/ui/hud.ts`):** "Dinheiro em dobro" e "Dobrar com anúncio" usam o recompensado de verdade no app e o simulado no navegador.
- **Intersticial (GDD seção 9):** a regra é `podeIntersticial()` (a partir da Praia 2, no máximo a cada 4 min, com teste). Ele é chamado 0,7 s depois de uma compra, pelo `Io.compra`. Nunca aparece no modo teste. No navegador mostra "Intersticial simulado".

### 3. Analytics
- **`src/plataforma/analytics.ts`:** interface única `registrar(evento, params)` com os eventos da seção 11 do GDD: `step_buy`, `prestige`, `session_start`, `session_end`, `ad_offer`, `ad_watch`, `offline_claim`.
- **Implementação padrão:** escreve no console; os testes usam esta (`analytics.test.ts`).
- **Firebase** (`@capacitor-firebase/analytics`): carregada só no app e só quando o build encontra `android/app/google-services.json`.
  - O `vite.config.ts` define `__FIREBASE__` conforme a existência desse arquivo.
  - O Gradle do Capacitor só aplica o plugin google-services se o arquivo existir.
  - Não criei projeto Firebase nem o arquivo.
- **Dados de cada compra:** o núcleo avisa praia, índice e segundos de jogo desde a compra anterior pelo novo `Io.compra` (`src/core/jogo.ts`, com teste).

### Outros arquivos
- **`vite.config.ts`:** porta 5175 e `__FIREBASE__`.
- **Configuração TypeScript:** `tsconfig.json` ganhou `resolveJsonModule`; `src/globais.d.ts` declara o `__FIREBASE__`.
- **`.claude/launch.json`:** porta 5175.
- **`android/.gitignore`:** passou a ignorar `*.jks` e `*.keystore`, para a chave de assinatura nunca ir para o git.
- **`CLAUDE.md`:** atualizado com a estrutura nova e os comandos.

## Números
O simulador não mudou nesta rodada. `npm run sim -- 3` (bot humano):
```
Praia 1 completa em 10.4 min
Praia 2 completa em 13.5 min
Praia 3 completa em 13.2 min

Tudo dentro da faixa da seção 8.
```
Testes: `Test Files  6 passed (6)` e `Tests  30 passed (30)`.

## O que depende do usuário

### A. Preparar o computador para gerar o APK (falta hoje)
O que foi encontrado:
- `ANDROID_HOME` aponta para `C:\Users\000\AppData\Local\Android\Sdk`, mas essa pasta **não existe**, e não há `adb` no sistema.
- Estão instalados os JDKs 17 e 25. O Capacitor 8 compila em **Java 21**: o 17 é antigo demais, e o Gradle 8.14.3 do projeto não roda no 25.

Por isso não rodei o `gradlew assembleDebug`: ele baixaria o Gradle (~150 MB) só para falhar na falta do SDK. Também ainda não dá para saber se o espaço no caminho `C:\dev jogos\...` atrapalha o Gradle. Se atrapalhar, aparece no passo 4 abaixo; anote o erro exato e me mande, sem mover a pasta.

Passo a passo:
1. Instale o **Android Studio** (developer.android.com/studio). Ele já traz o Android SDK e um Java 21 próprio (JBR).
2. Abra o Android Studio uma vez e deixe o assistente instalar o SDK padrão em `C:\Users\000\AppData\Local\Android\Sdk`, o mesmo caminho do seu `ANDROID_HOME`. Em *SDK Manager*, confirme que estão instalados o **Android SDK Platform 36** e o **Build-Tools**.
3. Aponte o `JAVA_HOME` para o Java do Android Studio. Em *Variáveis de ambiente*, troque `C:\Program Files\Java\jdk-17` por `C:\Program Files\Android\Android Studio\jbr`.
4. Abra um terminal novo e gere o APK:
   ```
   cd "C:\dev jogos\Barraca na praia"
   npm run build
   npx cap sync android
   cd android
   gradlew.bat assembleDebug
   ```
   O APK sai em `android\app\build\outputs\apk\debug\app-debug.apk`.

### B. Instalar o APK no celular
1. No celular: *Configurações → Sobre o telefone*, toque 7 vezes em *Número da versão*. Depois, em *Opções do desenvolvedor*, ligue a *Depuração USB*.
2. Ligue o celular no computador pelo USB e aceite o aviso "Permitir depuração".
3. No terminal: `adb install -r "C:\dev jogos\Barraca na praia\android\app\build\outputs\apk\debug\app-debug.apk"`.
   - Sem cabo: copie o `app-debug.apk` para o celular, abra pelo gerenciador de arquivos e permita "instalar apps desconhecidos" quando ele pedir.
4. Os anúncios do app são de teste: aparecem com o selo "Test Ad", e pode clicar à vontade.

### C. Criar a conta AdMob (quando for publicar)
1. Entre em admob.google.com com a conta Google da empresa e aceite os termos.
2. *Apps → Adicionar app → Android*. Responda "Não" para "publicado na loja" (dá para vincular depois) e use o nome "Barraca na Praia".
3. Copie o **ID do app** (formato `ca-app-pub-XXXX~YYYY`).
4. *Blocos de anúncios → Adicionar*: crie um **Premiado** (recompensado) e um **Intersticial**, e copie os dois IDs (`ca-app-pub-XXXX/ZZZZ`).
5. No `admob.config.json`, preencha os três campos de `"reais"` e mude `"usarReais"` para `true`. Depois rode `npm run build`, `npx cap sync android` e gere o APK de novo.
6. Nunca clique nos seus próprios anúncios reais: isso pode suspender a conta. Para testar, use os IDs de teste (`usarReais: false`).

### D. Criar o projeto Firebase (analytics)
1. Entre em console.firebase.google.com → *Adicionar projeto* → nome "Barraca na Praia". O Google Analytics pode ficar ligado.
2. No projeto: *Adicionar app → Android*, com o nome do pacote **`com.jogosbr.barracanapraia`** (precisa ser exatamente este).
3. Baixe o `google-services.json` e coloque em `C:\dev jogos\Barraca na praia\android\app\google-services.json`.
4. Rode `npm run build`, `npx cap sync android` e gere o APK. O build detecta o arquivo sozinho e liga o Firebase. No navegador, os eventos continuam indo para o console.
5. Para ver os eventos na hora: `adb shell setprop debug.firebase.analytics.app com.jogosbr.barracanapraia` e depois *Firebase → Analytics → DebugView*.

### E. Gerar a chave de assinatura para a Play Store
A chave é sua e não pode ser perdida: sem ela, não há como publicar atualizações do app.
1. No terminal, numa pasta **fora do projeto** e com backup (ex.: `C:\chaves`):
   ```
   "C:\Program Files\Android\Android Studio\jbr\bin\keytool" -genkeypair -v -keystore barraca-upload.jks -keyalg RSA -keysize 2048 -validity 10000 -alias barraca
   ```
   Ele pede uma senha e os seus dados. Guarde a senha num gerenciador de senhas.
2. Guarde o `barraca-upload.jks` em dois lugares seguros. Ele nunca vai para o git: o `android/.gitignore` já ignora `*.jks`.
3. Na Play Console, use a **Assinatura de apps do Google Play**: esse arquivo vira só a "chave de upload", e o Google guarda a chave final.
4. Para gerar o pacote da loja: no Android Studio, *Build → Generate Signed App Bundle → Android App Bundle*, escolha o `.jks` e a senha. Sai um `.aab`.

## Problemas e decisões
- **APK não gerado:** faltam o SDK e o Java 21 (seção A). Não instalei nada, como pedia o roteiro.
- **Primeiro intersticial da sessão:** só depois de 4 min de jogo, e não na primeira compra da Praia 2. A Praia 2 começa com duas compras na hora (começo rápido), então um anúncio aparecia segundos depois de chegar.
- **Recompensado fechado antes do fim:**
  - "Dobrar ganhos" dá o valor normal (pilar "sem derrota");
  - "Dinheiro em dobro" não liga o bônus.
- **Ganho pendente + tempo fora:** se o app fechar com o cartão aberto, a próxima abertura soma o pendente ao ganho do novo tempo fora. Os dois são dinheiro devido ao jogador, e o limite de 2 h vale para o tempo fora.
- **Formato do save foi para a v2:** só ganhou o campo opcional `pendente`. A v1 continua sendo lida; o teste está em `salvar.test.ts`.
- **Vibração no app:** o Haptics do Capacitor não aceita padrão. O `[60, 40, 120]` da praia nova vira uma vibração de 180 ms.
- **Pacote `firebase` (web):** não instalado. É dependência opcional do plugin e só seria usado no navegador, onde o analytics fica no console.
- **`npm audit`:** 7 vulnerabilidades, todas em dependências de ferramenta do `@capacitor/assets` (`@trapezedev/project`, `xcode`, `uuid`). É só ferramenta de desenvolvimento; nada disso entra no app. Não rodei `npm audit fix --force`, porque ele troca versões e pode quebrar a ferramenta.
- **Não testado num aparelho:** AdMob, Haptics, Preferences, StatusBar e o ciclo de vida nativo, porque não há APK. Um risco conhecido: o plugin do Firebase sem o `google-services.json`. O JS nunca o chama nesse caso, mas a biblioteca nativa entra no APK; vale abrir o app uma vez antes de criar o projeto Firebase para confirmar que não fecha sozinho.
- **Ferramenta de preview do ambiente:** ela continuou lendo o `launch.json` da pasta antiga no OneDrive e serviu a cópia velha na porta 5173. Para testar a pasta nova na 5175, pus uma entrada temporária naquele arquivo e depois devolvi o original. A pasta antiga ficou como estava.
- **Este relatório:** está no mesmo commit do código. O hash da linha "Commit" foi preenchido num segundo commit, que só muda essa linha, porque um commit não sabe o próprio hash.

## Sugestões
- **Consentimento (UMP):** na Europa e no Reino Unido, o AdMob exige o formulário de consentimento antes dos anúncios. O plugin tem `requestConsentInfo`/`showConsentForm`; vale ligar antes da publicação.
- **Público infantil:** o GDD diz "todas as idades". Se o app entrar no programa Famílias da Play Store, o AdMob precisa de `tagForChildDirectedTreatment` e de conteúdo adequado nos anúncios.
- **Ícone e abertura:** são provisórios e geométricos. Um ícone desenhado melhora a conversão na loja.
- **Celulares lentos:** testar num aparelho modesto (2 a 3 GB de RAM). O jogo desenha tudo no canvas a cada quadro, então vale medir o FPS no app real.
- **Versão do app:** `versionCode 1` / `versionName "1.0"` em `android/app/build.gradle` precisam subir a cada envio para a loja.
- **Últimas compras da Praia 2:** continuam entre 113 e 160 s, como o revisor apontou. Fica para a etapa 7.
