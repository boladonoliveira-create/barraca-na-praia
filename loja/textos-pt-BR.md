# Barraca na Praia: textos da loja (pt-BR)

## Título (29)

Barraca na Praia: Idle Tycoon

## Descrição curta (70)

Venda açaí, abra quiosques e transforme sua barraca no point da praia!

## Descrição longa

```
Comece com uma barraquinha de açaí e coco e transforme a praia no lugar mais animado do litoral! Ande com um dedo só, leve os produtos até o balcão, junte o dinheiro e expanda.

🏖️ 10 PRAIAS PARA CONQUISTAR
Cada praia libera algo novo: sorveteria, chuveirão, milho e pastel, quadra de futevôlei, ambulantes, escolinha de surf, sucos, palco de pagode e o grande torneio.

⭐ FAMA QUE FICA
A cada praia nova você ganha fama e recomeça mais forte. O que levava minutos passa voando.

👷 CONTRATE A EQUIPE
Ajudantes, sorveteiros, cozinheiros, instrutores e barmen trabalham por você, até com o jogo fechado.

🎶 SHOW E CAMPEONATO
Shows de pagode lotam a praia, e o torneio de futevôlei transforma você em campeão.

😌 FEITO PARA RELAXAR
Sem derrota e sem pressa. Jogue um pouquinho por dia ou passe a tarde na praia.
```

## Imagens (pasta `loja/`, geradas em `http://localhost:5175/?loja`)

| Arquivo | Uso no Play Console | Tamanho |
|---|---|---|
| `icone-512.png` | Ícone do app | 512 × 512 |
| `destaque-1024x500.png` | Recurso gráfico (imagem de destaque) | 1024 × 500 |
| `captura-1-monte-o-seu-point.png` | Captura de tela do celular 1 | 1080 × 1920 |
| `captura-2-contrate-ajudantes.png` | Captura de tela do celular 2 | 1080 × 1920 |
| `captura-3-viaje-para-praias-novas.png` | Captura de tela do celular 3 | 1080 × 1920 |
| `captura-4-show-de-pagode.png` | Captura de tela do celular 4 | 1080 × 1920 |
| `captura-5-seja-campeao.png` | Captura de tela do celular 5 | 1080 × 1920 |
| `captura-6-jogue-com-um-dedo.png` | Captura de tela do celular 6 | 1080 × 1920 |

## Checklist do Play Console

Preenchido a partir dos pacotes do app (`package.json`): `@capacitor-community/admob` (anúncios e UMP),
`@capacitor-firebase/analytics`, `@capacitor/preferences` (save no aparelho), `@capacitor/haptics`,
`@capacitor/app`, `@capacitor/status-bar` e `@capacitor/splash-screen`. O app não tem conta, login, compras
nem servidor próprio.

### Configuração do app
- [ ] **Categoria:** Jogos › Simulação (idle tycoon).
- [ ] **Tags:** idle, tycoon, casual, offline (escolher as que o console oferecer).
- [ ] **Contém anúncios:** Sim (AdMob: recompensado e intersticial; sem banner).
- [ ] **Compras no app:** Não.
- [ ] **Acesso ao app:** todo o app funciona sem login (nenhuma instrução especial).

### Classificação etária (questionário IARC)
- [ ] Categoria do questionário: **Jogo**.
- [ ] Violência: não. Medo/terror: não. Linguagem imprópria: não. Conteúdo sexual: não. Drogas, álcool, tabaco: não.
- [ ] Apostas ou simulação de apostas: não.
- [ ] Interação entre usuários / chat: não. Compartilha localização: não.
- [ ] Compras digitais: não.
- [ ] Anúncios: **sim** (o questionário pergunta à parte).
- Resultado esperado: classificação Livre / 3+ ou equivalente.

### Público-alvo e conteúdo
- [ ] **Faixa etária:** marcar só **13 a 15, 16 a 17 e 18+** (13 anos ou mais).
- [ ] **Não marcar** faixas de crianças (menos de 13): o AdMob para crianças exige a configuração "tratamento para crianças"
      (`tagForChildDirectedTreatment`) e anúncios certificados para famílias, que o app não usa.
- [ ] "O app pode atrair crianças sem querer?": responder **Não** e, se o console pedir, explicar que o público é geral
      (jogo de gestão/idle), sem personagens infantis licenciados.

### Segurança dos dados
Dados **coletados** (todos de forma automática pelos SDKs, criptografados em trânsito, sem venda de dados):

| Tipo de dado | Quem coleta | Finalidade | Compartilhado? | Opcional? |
|---|---|---|---|---|
| IDs do dispositivo ou outros IDs (ID de publicidade, ID da instância do app) | AdMob, Firebase Analytics | Publicidade, análise | Sim, com o Google (AdMob) para anúncios | Não (o jogador pode limitar o ID de publicidade no Android) |
| Interações no app (praias, compras, anúncios vistos) | Firebase Analytics, AdMob | Análise, publicidade | Sim (AdMob) | Não |
| Diagnóstico (falhas, desempenho) | Firebase Analytics, AdMob | Análise | Não | Não |
| Localização aproximada (derivada do IP) | AdMob | Publicidade, prevenção de fraude | Sim | Não |

- [ ] **Dados criptografados em trânsito:** Sim.
- [ ] **O usuário pode pedir a exclusão dos dados:** o app não guarda dados em servidor próprio; indicar o e-mail de contato
      e o link do Google para dados de anúncios (ver política de privacidade).
- [ ] **Progresso do jogo** (dinheiro, nível das áreas, praia, fama, recompensa diária e configurações): fica só no aparelho
      (`@capacitor/preferences`) e **não é coletado** (não precisa declarar).
- [ ] **Consentimento (UMP):** o formulário do Google aparece na Europa e no Reino Unido; o botão "Opções de privacidade"
      fica nas configurações do jogo quando exigido.
- [ ] Vibração: local, sem envio de dados (não declarar).

### Política de privacidade
- [ ] Publicar `loja/privacidade.md` num link público (GitHub Pages ou Google Sites), trocando os campos entre colchetes.
- [ ] Colar o link em **Política do app › Política de privacidade** e na página da loja.

### Outros itens da Política do app
- [ ] **ID de publicidade:** declarar que o app usa (AdMob e Firebase), para publicidade e análise.
- [ ] **Apps governamentais / financeiros / saúde / notícias:** não.
- [ ] **Permissões sensíveis:** apenas as dos plugins de anúncios/vibração; o app não pede notificações nem alarmes.
