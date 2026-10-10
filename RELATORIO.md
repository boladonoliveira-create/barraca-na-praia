# Relatório: Barraca na Praia, rodada 4 (refeita)

Resultado: EM ANDAMENTO
Commit: (preenchido no fim)

## Partes
- [x] Parte 0: trabalho interrompido salvo.
- [x] Parte A: consentimento de anúncios (UMP).
- [ ] Parte B: progressão por áreas independentes.
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
