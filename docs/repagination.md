# Repaginação da home — decisões e manutenção

## Auditoria do projeto existente

- **Reutilizado:** `BaseLayout`, cabeçalho flutuante, menu, rodapé, Lenis, bootstrap de motion, fontes, tokens, SEO, fotos da equipe, dados de sócias/métricas/serviços/processo, componente dos números e o fluxo de contato por e-mail.
- **Refatorado:** navegação, home, entrada do manifesto, orquestração da animação e verificação do build.
- **Substituído na home:** sequência anterior de seções por uma narrativa com sete âncoras, frase de destaque, manifesto interno e formulário final. Os componentes anteriores permanecem no repositório para as outras páginas ou referência; não são montados na nova home.
- **Ausente:** `manifesto-lime.webm` e `manifesto-lime.mp4`. Não foi criado vídeo simulado. A entrada mostra um caminho de acesso ao site até que o filme seja fornecido.

## Lime Line

`src/components/common/NarrativeLine.astro` guarda oito pares de `d` SVG, um desktop e um mobile por capítulo. No desktop, as saídas horizontais dos capítulos são 85% (home e manifesto), 40% (frase), 50% (sócias), 97% (resultados), 35% (expertises) e 85% (processo); a última curva termina perto do CTA. As entradas coincidem com a saída anterior e todas as emendas têm tangente vertical. A linha visita a margem esquerda e passa geometricamente por trás da primeira foto antes de retornar ao centro. O mobile tem paths próprios, com deslocamentos laterais mais curtos. O conector do marquee liga home e manifesto. Para ajustar a geometria, edite os pares de paths nesse arquivo; desktop usa `viewBox="0 0 1000 1000"` e mobile usa `viewBox="0 0 400 1000"`.

`src/motion/narrative.ts` usa um ScrollTrigger para toda a rota, incluindo o conector do marquee. A ponta do traço é calculada a partir de amostras do path em pixels de tela, mantendo a mesma altura durante curvas largas; um segmento só começa quando o anterior termina. A chegada da ponta à altura de cada headline dispara uma única entrada por linhas com SplitText. Os títulos permanecem visíveis no scroll reverso. As medidas são refeitas em refresh, resize e navegação por âncora. Em `prefers-reduced-motion`, o bootstrap não carrega GSAP e os paths e títulos permanecem inteiros.

## Manifesto

Não há mais overlay de entrada obrigatório. O manifesto interno da home e o diálogo de replay permanecem. Adicione o filme em `public/videos/manifesto-lime.webm` e/ou `.mp4`. Fontes do vídeo ficam em `MANIFESTO_SOURCES` (`src/lib/manifesto.ts`).

## Pendências externas

- Fornecer o vídeo definitivo e, se desejado, pôster WebP.
- Fornecer URLs oficiais de Instagram e LinkedIn e telefone/WhatsApp, se esses canais devem aparecer no rodapé.
- Se o formulário precisar realmente enviar sem cliente de e-mail, definir serviço ou endpoint. A integração atual foi preservada e informa ao visitante que ele confirma o envio no aplicativo de e-mail.
