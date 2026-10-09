# Roteiro: Barraca na Praia

Status: AGUARDANDO REVISÃO
Rodada: 3
Porta do servidor: 5175

## Contexto

Etapas 1 e 2 (seção 12 do `GDD-BARRACA-NA-PRAIA.md`) estão feitas e revisadas, com o ritmo das Praias 1 e 2 dentro da faixa no bot humano. Esta rodada é a etapa 3: transformar o jogo em app Android. A Barraca é o piloto: o que for feito aqui vai ser repetido nos outros dois jogos, então documente bem os passos.

Medição do revisor (`npm run sim 3`, bot humano): Praia 1 em 10,4 min, Praia 2 em 13,5 min, tudo dentro da faixa. As últimas compras da Praia 2 levam de 113 a 160 s. Não mexa nisso nesta rodada; fica para o balanceamento da etapa 7.

Atenção ao caminho: o projeto está em `C:\dev jogos\Barraca na praia`, com espaços. Algumas ferramentas do Android no Windows falham com espaço no caminho. Se o Gradle der erro por causa disso, não mova nem renomeie pastas: registre o erro exato no relatório, em "O que depende do usuário".

## Tarefa

### 1. Capacitor (Android)
- Adicione o Capacitor com id de app `com.jogosbr.barracanapraia` e nome "Barraca na Praia".
- Somente retrato, tela cheia, sem barra de status sobre o jogo, ícone e tela de abertura provisórios (gerados a partir do visual atual).
- Troque o salvamento por `@capacitor/preferences` no app, mantendo o `localStorage` no navegador, com a mesma interface de `plataforma/salvar.ts` e os testes passando.
- Vibração por `@capacitor/haptics` no app.
- Ciclo de vida por `@capacitor/app`: pausar jogo, sons e mar ao sair do app; ao voltar, aplicar ganhos offline (já existe a lógica).
- Ganhos offline não podem se perder: hoje, se o app fecha com o cartão "Bem-vindo de volta" aberto sem tocar em "Pegar", o valor some. Guarde o valor pendente no save assim que o cartão abrir e só limpe quando ele for pego (ou dobrado). Crie um teste para isso.
- Gere um APK de depuração (`gradlew assembleDebug`). Se o ambiente não tiver Android SDK ou JDK, não instale nada pesado: descreva no relatório o que falta e como instalar.

### 2. AdMob (só IDs de teste)
- Use `@capacitor-community/admob` com o ID de app de teste do Google (`ca-app-pub-3940256099942544~3347511713`) e os blocos de anúncio de teste oficiais.
- Troque o anúncio simulado do "Dinheiro em dobro" e do "Dobrar ganhos offline" pelo recompensado de verdade no app. No navegador, mantenha o simulado.
- Intersticial conforme a seção 9 do GDD (a partir da Praia 2, no máximo a cada 4 min, só logo depois de uma compra).
- Deixe os IDs reais num único arquivo de configuração, com um aviso claro de que só entram quando o usuário criar a conta AdMob.

### 3. Analytics
- Crie `plataforma/analytics.ts` com uma interface única e os eventos da seção 11 do GDD.
- Implementação padrão: só registra no console (e é usada nos testes).
- Implementação Firebase, ativada só quando existir `android/app/google-services.json`. Não crie projeto Firebase nem invente esse arquivo.

## Critérios de pronto
- `npm test` e `npm run build` passam.
- No navegador (porta 5175), o jogo continua funcionando igual, com anúncio simulado.
- APK de depuração gerado, ou relatório explicando exatamente o que falta no ambiente.
- Relatório com o passo a passo do que o usuário precisa fazer para: instalar o APK no celular, criar a conta AdMob e o projeto Firebase, e gerar a chave de assinatura para a Play Store.
- Commit feito.

## Fora do escopo
- Criar contas, chaves de assinatura ou senhas. Isso é do usuário.
- Publicação na Play Store.
- Praias 3 a 10 (etapas 4 a 6).
