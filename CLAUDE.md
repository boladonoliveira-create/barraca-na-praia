# Barraca na Praia

Jogo mobile "idle arcade" (no estilo do Pizza Ready): o jogador anda com um dedo por uma praia brasileira, leva produtos das máquinas até as barracas, junta dinheiro e transforma uma barraca simples num complexo de praia. O ciclo é andar, carregar, entregar, expandir e automatizar. Público de todas as idades, sessões de 5 a 15 minutos.

- Design completo: `GDD-BARRACA-NA-PRAIA.md` (fonte da verdade para regras e números).
- Protótipo de referência: `barraca-na-praia.html`. O que o GDD marca como "já existe no protótipo" precisa manter o mesmo comportamento.
- "Praia" é o nível de prestígio. O mapa é o mesmo, dividido em lotes que abrem da esquerda para a direita (Praia 1: Barraca do Sol, açaí e coco; Praia 2: quiosque de sorvete; Praia 3 em diante: ver GDD seções 6 e 7).

## Pilares (GDD seção 2, não quebrar)

1. **Um dedo só.** Arrastar em qualquer lugar move o personagem. Nada exige precisão.
2. **Sem derrota e sem relógio.** O pior que acontece é ganhar mais devagar.
3. **Sem menus.** Comprar é pisar num quadrado no chão. A próxima compra aparece ao lado da coisa que ela melhora.
4. **Progresso sempre visível.** Toda compra muda algo na tela.
5. **Trabalho manual vira automação, área por área.** Cada área nova começa manual e o ajudante dela automatiza depois. Sempre existe uma área onde o jogador ainda trabalha com as mãos.
6. **O futuro fica à vista.** Lotes fechados ficam atrás de uma cerca com placa ("abre na Praia N").

## Estrutura (GDD seção 11)

Vite + TypeScript (depois, Capacitor para Android).

```
src/
  dados/        mapa.ts (lotes, lojas/SHOPS, produtos, slots), planos.ts (planos de compra)
  core/         jogo.ts (estado, clientes, ajudantes, compras; sem canvas e sem DOM)
                economia.ts (plano e preços), simulador.ts (bot que mede o ritmo)
  render/       desenho.ts (câmera, cenário, personagens, máquinas, efeitos)
  ui/           hud.ts (placar, telas, botões), estilo.css
  plataforma/   salvar.ts (localStorage), som.ts (som e vibração)
  main.ts       entrada (joystick/teclado) e laço principal
scripts/sim.ts  relatório do simulador no terminal
```

- O núcleo (`core/`) não toca em canvas nem DOM. Som, vibração, salvar e telas saem pela interface `Io` passada ao `Jogo`. A aleatoriedade vem de `rand`, que os testes e o simulador trocam por um gerador com semente.
- Cada mecânica nova da seção 7 é uma "loja" com dados próprios em `dados/` (produtos, zonas, regra de ajudante), no modelo de `SHOPS`. Adicionar uma praia deve ser adicionar dados, não reescrever o motor.
- Salvar: a versão do formato vai na chave (`barracaPraia.v5`). Se a estrutura mudar, use uma chave nova.
- Modo teste (botão ∞): só existe em `npm run dev` (`import.meta.env.DEV`). Nunca na versão da loja.

## Comandos

```
npm run dev     # jogo em http://localhost:5173
npm test        # testes do núcleo e do simulador (vitest)
npm run sim 3   # tempos de compra por praia e o que está fora da faixa da seção 8
npm run build   # checa os tipos e gera dist/
```

O `npm run sim` roda com o Node 24, que executa TypeScript direto. Por isso os imports usam a extensão `.ts`.

## Balanceamento

O simulador compara o ritmo com a faixa da seção 8: compras de ~15 s no começo da praia subindo até ~90 s no fim, e cada praia completa em 8 a 15 min. Com os números do protótipo cada praia leva cerca de 4 min, então o teste do ritmo está marcado com `it.fails` em `src/core/simulador.test.ts`. Quando o balanceamento (etapa 7) acertar a faixa, troque `it.fails` por `it`.

## Ordem de trabalho (GDD seção 12)

Feita: etapa 1 (base, porte do protótipo, testes do núcleo e simulador). Não avance para a próxima etapa sem o usuário pedir.
