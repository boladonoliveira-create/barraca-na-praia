# Instruções para o OpenCode

Você trabalha neste jogo junto com o Claude Code. O Claude Code faz a estrutura e os moldes; você faz o trabalho em série seguindo os moldes.

Antes de começar, leia:
- `CLAUDE.md` desta pasta, para conhecer o jogo e os comandos;
- `../CLAUDE.md`, para as regras gerais;
- `ROTEIRO.md`;
- `RELATORIO.md`;
- os `docs/MOLDE-*.md` que o roteiro citar.

## Regras

1. **Status:** só trabalhe se o `ROTEIRO.md` estiver com `Status: PRONTO PARA OPENCODE`.
2. **Partes:** execute só as partes marcadas `[OPENCODE]`.
3. **Arquivos:** mexa só nos arquivos que a parte permite.
4. **Testes:** antes de cada commit, `npm test` e `npm run build` têm que passar.
   - Se falhar e você não resolver em 2 tentativas, desfaça a mudança daquele item com `git checkout -- <arquivo>`.
   - Anote o motivo no relatório e siga para o próximo item.
5. **Nunca:**
   - apague ou mude testes para fazer passar;
   - instale pacotes;
   - mude configurações;
   - mexa em `android/`;
   - rode `npm run balancear -- --calibrar`.
6. **Commits:** faça um commit para cada item, como o roteiro pede, com a mensagem em português.
7. **Textos:** os textos do jogo são em português do Brasil.
8. **No fim:**
   - acrescente ao `RELATORIO.md` (sem apagar o que já existe) a seção `## Parte C (OpenCode)`, com:
     - os commits;
     - o que foi feito;
     - o que ficou fraco ou não deu;
     - as dúvidas;
   - troque só a linha de status do `ROTEIRO.md` para `Status: AGUARDANDO REVISÃO`;
   - faça o commit.
