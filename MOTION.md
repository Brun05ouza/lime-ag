# Motion pass — Lime Ag

Implementado sobre o layout existente, sem alterar textos, ordem de seções ou identidade visual.

## Módulos e comportamento

| Seção | Módulos em src/motion | Movimento |
| --- | --- | --- |
| Hero | hero.ts | Header, assinatura, linhas mascaradas, desenho do SVG e CTA em sequência; deslocamento discreto apenas no elemento decorativo. |
| Problema | problem.ts, limeLine.ts | Pergunta e resposta em etapas, conexão com subida e ajuste de espaçamento; traço SVG conduzido pela rolagem. |
| Manifesto | manifesto.ts | Títulos escalonados e progressão de leitura no bloco principal. |
| Resultados | counters.ts | Nove contadores semânticos; 100M+ com entrada própria em escala e deslocamento. |
| Serviços | services.ts | Saída e entrada de painéis, interrupção segura de transições; navegação por teclado preservada. |
| Parceira estratégica e próximos passos | editorial.ts | Entradas editoriais, palavras selecionadas e linhas divisórias. |
| Método | method.ts | Índice sticky existente, etapa ativa e progresso vertical; mantém a lista no fluxo natural. |
| Equipe | revealMedia.ts, team.ts | Máscara das fotos, escala inicial, parallax discreto e hover de imagem/número. |
| Trabalhos | editorial.ts | Entrada lateral discreta do título; VIEW permanece reservado a cases reais. |
| Manifesto final | finalManifesto.ts | Frases sequenciais; primeira frase recua quando a segunda entra; destaque do propósito. |
| CTA e rodapé | cta.ts, magnetic.ts, editorial.ts | Título mascarado, linha, texto e seta escalonados; magnetismo limitado e rodapé leve. |
| Transversal | tokens.ts, revealText.ts, transitions.ts, header.ts, cursor.ts, smoothScroll.ts | Tempos comuns, máscaras, transições rasas entre seções, header compacto, cursor e Lenis. |
| Ciclo de vida | initMotion.ts, reducedMotion.ts | Inicialização única, matchMedia, limpeza de contextos/listeners, retorno via BFCache e mudança de preferência. |

## Responsividade e acessibilidade

- Desktop com ponteiro fino: Lenis, cursor, magnetismo, parallax, índice sticky e resposta do header.
- Tablet/mobile: rolagem nativa, entradas menores, sem efeitos dependentes de hover e sem índice lateral.
- Movimento reduzido: GSAP não é carregado na entrada; conteúdo permanece visível e interações continuam funcionando. Alterar a preferência encerra ou reinicia o motion.
- Sem JavaScript: conteúdo completo e todos os painéis de serviços disponíveis; nenhum CSS inicial oculta o conteúdo.
- SplitText usa máscaras de linha e reconstrução automática; entradas já vistas não se repetem ao cruzar breakpoints. O método usa sticky CSS, sem espaçadores artificiais de pin.

## Arquivos de integração alterados

Além dos módulos acima: src/layouts/BaseLayout.astro, src/scripts/ui.ts, src/styles/motion.scss, componentes de seção em src/components e MagneticButton.astro (atributos de motion e separação da seta). tsconfig.json exclui artifacts, que contém cópias geradas para revisão. scripts/prepare-motion-review.mjs cria uma prévia isolada, sem modificar dist.

## Validação

- Build Astro: concluído, seis páginas e doze imagens otimizadas.
- verify-build.mjs: aprovado; links/arquivos locais, metadados e conteúdo inicial.
- Larguras 390, 430, 768, 1024, 1366, 1440 e 1920: sem overflow horizontal na revisão com motion ativo.
- Trocas consecutivas de serviços: um único painel expandido, opacidade final 1.
- Rolagem rápida até o rodapé, retorno e redimensionamento: conteúdo visível nos pontos inspecionados.
- Navegação/recarregamento com #equipe em 390px: título e retratos visíveis.
- Cópia sem scripts: quatro painéis disponíveis e sem overflow.
- Preferência real do navegador: reduced; inicialização corretamente desativada.
- Revisão completa com preferência normal simulada exclusivamente na cópia de QA: status ready, GSAP e Lenis ativos.
- Touch e trackpad físicos não estavam disponíveis para validação. A ausência de duplicação de triggers é protegida pelo ciclo de limpeza, mas não foi medida por instrumentação; CLS também não foi quantificado nesta passagem.

## Prévia local

- Site: http://127.0.0.1:4322/
- Revisão com motion normal simulado: http://127.0.0.1:4323/

A segunda cópia serve apenas à revisão quando o navegador solicita movimento reduzido. Seus arquivos ficam em artifacts/motion-preview e não entram no build de produção.

Verificação final: pnpm astro check — 67 arquivos, zero erros, zero warnings e zero hints. O build emite apenas avisos esperados da coleção de cases ainda vazia.

# Motion V2 — Cinematic Hero + Kinetic Editorial

Atualização implementada em 12/09/2026 sobre a identidade e o conteúdo aprovados.

## Mudança de linguagem

- Hero: abertura curta com logo e linha rosa; palavras entram em escala maior por direções opostas, deslocam-se fisicamente e assentam no layout original. Loop SVG desenhado, passagem de linha por estratégia e resposta decorativa ao ponteiro. Sequência termina em aproximadamente 2,3 s e é concluída imediatamente se o visitante começar a rolar.
- Hero → Problema: headline expande na saída, loop acompanha por mais tempo e a seção clara sobe como uma folha.
- Problema: pergunta recua, resposta assume foco e criar conexão cresce por escala até o tamanho original, conduzido pelo scroll.
- Manifesto: palavras com escala/deslocamento independente; TextSwap substitui as três frases no mesmo espaço e recompõe a leitura original ao concluir. Resultado se separa para a ponte transitória ESTRATÉGIA.
- Resultados: faixa de contadores rápida; 100M+ cresce de 0,7 para 1, reduz o contraste da faixa anterior e conduz a entrada lateral das métricas digitais.
- Serviços: saída horizontal e entrada oposta, destaque leve do título selecionado; suporte a cliques consecutivos e teclado preservado.
- Processo: no desktop com ponteiro fino, palco com uma etapa por vez, número rolante, título e descrição em colunas; pin de 150vh. Mobile/tablet mantêm a lista natural.
- Equipe: máscaras alternadas e mais rápidas, mantendo protagonismo nas fotografias.
- Manifesto final: palco compartilhado no desktop, substituição de frases, movimentos opostos em mente/coração; propósito conclui sem decoração concorrente. Pin de 115vh; telas menores seguem o fluxo natural.
- CTA: entrada rápida, linha rosa atravessa o botão e seta nasce ao fim do desenho.

## Arquivos

Novos helpers: src/motion/TextSwap.ts, src/motion/RollingNumber.ts e src/motion/results.ts.
Revisados: hero.ts, problem.ts, manifesto.ts, counters.ts, method.ts, finalManifesto.ts, services.ts, cta.ts, revealMedia.ts, tokens.ts, transitions.ts e initMotion.ts. Marcação em Hero.astro, Manifesto.astro, FinalManifesto.astro e ServiceExplorer.astro; estilos em src/styles/motion.scss.

## Validação V2

- pnpm astro check: 70 arquivos; zero erros, warnings ou hints.
- pnpm build: seis páginas; aprovado. Aviso esperado: coleção de cases vazia.
- verify-build.mjs: aprovado, incluindo links, assets, metadados e imagens.
- 390, 430, 768, 1024, 1366, 1440, 1920px: sem overflow após correção de contenção das composições horizontais.
- Resize: zero palcos fixos até 768px; dois no desktop; nenhum pin aninhado após cruzamentos repetidos de breakpoints.
- Processo inspecionado visualmente com etapa 02 e número rolante; manifesto final inspecionado na substituição e no segundo texto consolidado.
- Serviços: cliques consecutivos + ArrowDown terminam em Inteligência & Crescimento, um painel aberto e opacidade 1.
- Sem scripts: quatro serviços e quatro etapas disponíveis.
- A preferência de movimento reduzido continua desativando o motion, com HTML completo disponível.
- Limites: touch e trackpad físicos não testados; CLS/LCP não quantificados nesta revisão. A entrada do hero deve ser medida em dispositivo real para avaliação final de desempenho.

A cópia de revisão em 4323 simula preferência normal apenas para permitir inspeção de motion; a versão de produção em 4322 respeita a preferência real do visitante.
