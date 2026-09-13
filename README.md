# Lime Ag — Website 2026

Site institucional estático em Astro 5, TypeScript strict, SCSS, GSAP (ScrollTrigger e SplitText) e Lenis. A Home segue a narrativa do briefing e incorpora as fotos originais da apresentação.

## Executar

Use Node.js 22.14+ e pnpm. A versão usada nesta entrega foi Node 24 e pnpm 11.

```sh
pnpm install
pnpm dev
pnpm astro check
pnpm build
pnpm preview
```

`pnpm dev` abre o servidor na porta 4321. `dist/` contém o site estático publicável. Os scripts de instalação aprovados em `pnpm-workspace.yaml` são os binários de esbuild, Sharp e Parcel.

## Páginas e arquitetura

- `/`: Home completa, do manifesto inicial ao contato.
- `/sobre/`: visão da agência e equipe.
- `/servicos/`: escopo e método.
- `/trabalhos/`: seleção de cases, com estado editorial vazio até haver conteúdo real.
- `/trabalhos/[slug]/`: páginas geradas apenas para cases cadastrados.
- `/contato/`: briefing e contatos diretos.
- `src/components/sections`: seções narrativas reutilizáveis.
- `src/components/common`, `ui`, `navigation`: identidade, controles e navegação.
- `src/data`: serviços, métricas, método, equipe e links tipados.
- `src/layouts`: documento base, metadados e template de cases.
- `src/styles`: tokens, tipografia, componentes, páginas, responsividade e movimento.
- `src/motion`: módulos de animação com limpeza de contextos e listeners.
- `src/lib`: contrato de analytics e validação de contato.

## Direção visual e motion

A paleta segue o briefing. A composição usa escalas tipográficas diferentes, espaço negativo, linhas divisórias e fotografias grandes. A Lime Line aparece no hero e na tensão inicial. O gradiente fica reservado ao grafismo e às interações.

O preloader dura no máximo 650 ms, não espera recursos, não bloqueia cliques e não aparece sem JavaScript ou com movimento reduzido. Texto e navegação já estão no HTML inicial. SplitText anima linhas mascaradas e refaz a divisão após mudanças tipográficas. Os contadores usam valores semânticos e mantêm o valor final disponível para leitores de tela.

O método usa `position: sticky` com ScrollTrigger para acompanhar etapas no desktop, preservando o scroll natural. No mobile e sem motion, as quatro etapas ficam em uma timeline contínua. Serviços usam botões com `aria-expanded`, setas/Home/End e painéis associados. O menu usa `dialog`, Escape e retorno de foco.

Lenis, cursor auxiliar e magnetismo só são ativados para interação adequada no desktop, com movimento permitido. `gsap.matchMedia()` desfaz os efeitos se a preferência mudar. Os módulos são revertidos em `pagehide`; `pageshow` restaura a experiência quando há BFCache. O cursor nativo permanece disponível.

As transições entre páginas são navegações nativas; nenhum ClientRouter foi introduzido. Isso preserva simplicidade de ciclo de vida e navegação sem JavaScript.

## Fontes e imagens

Inter e Space Grotesk são fontes locais fornecidas por pacotes Fontsource, com `font-display: swap`. Nenhuma fonte é buscada em serviços externos durante a navegação. Space Grotesk é o apoio temporário de display: **o arquivo licenciado da Asgard não foi fornecido**. Para ativá-lo, colocar `Asgard.woff2` em `public/fonts/` e habilitar o `@font-face` preparado em `src/styles/typography.scss`. O token já prioriza Asgard.

As fotos em `src/assets/team` vieram do PPTX do usuário. Os nomes das fontes e dimensões estão em `sources.json`. `astro:assets` gera AVIF/WebP responsivos com largura reservada e carregamento lazy. Os originais ficam preservados.

O briefing inverte as biografias em relação ao slide 11. A implementação segue as posições dos nomes/textos no XML do slide: Carol corresponde às contas Goodyear/Brasif/Multiplan; Julia corresponde ao MBA e às marcas Globo/Boehringer/Bwin. A associação foi confirmada visualmente pela renderização do slide 11 com o runtime de apresentações. A referência está em artifacts/slide11-reference.png.

## SEO e domínio

Todas as páginas têm título, descrição, canonical, Open Graph, Twitter Card e um H1. Organization JSON-LD contém apenas nome, URL e e-mails conhecidos, sem endereço, telefone ou CNPJ inventados.

Copie `.env.example` para `.env` e configure `PUBLIC_SITE_URL` antes de publicar. O valor de partida é `https://limeagencia.com.br`, derivado do domínio dos e-mails e sujeito à confirmação do domínio definitivo. Variáveis de ambiente do processo têm precedência.

O build gera `sitemap-index.xml`, `sitemap-0.xml`, `sitemap.xml` e `robots.txt`. A imagem social `public/og/default.jpg` tem 1200 × 630; pode ser recriada com `node scripts/generate-og.mjs`. Substitua-a quando a tipografia Asgard estiver disponível.

## Adicionar um case real

Crie um Markdown em `src/content/cases/`. O schema de `src/content.config.ts` exige:

- `title`, `slug` (minúsculo com hífens), `client`, `year`, `services`, `excerpt`;
- `cover`: caminho relativo para uma imagem;
- `overview`, `challenge`, `strategy`, `execution`;
- opcionais: `ogImage`, `featured`, `metrics` (objetos `value`/`label`) e `gallery` (objetos `image`/`alt`).

O corpo Markdown é opcional. `featured: true` inclui o trabalho na Home. A rota usa o slug, gera SEO individual e mostra o próximo projeto. Não há cases, clientes ou resultados inventados. Enquanto a coleção estiver vazia, Astro pode emitir um aviso informativo de coleção vazia.

## Contato e endpoint futuro

O formulário valida os campos e prepara um `mailto:` para Julia, com cópia para Carol. O navegador abre o aplicativo de e-mail; o visitante revisa e envia. A interface explica isso e nunca exibe confirmação falsa de envio. Os links de e-mail funcionam também sem JavaScript.

Não há endpoint, armazenamento, chaves ou dependência de provedor. Para receber envios diretamente: escolher o serviço/hospedagem, criar endpoint com adaptador apropriado, reutilizar `contactSchema` **no servidor**, validar limites e origem, aplicar proteção contra abuso, enviar o e-mail server-side e retornar estados reais de sucesso/erro. Turnstile pode ser integrado depois da configuração das chaves, com verificação do token no servidor. Não inserir segredos com prefixo `PUBLIC_`.

## Analytics

`track()` emite eventos locais `lime:analytics`: `cta_click`, `contact_click`, `case_view` e `service_view`. Nenhum dado é enviado a terceiros e não há GA4 automático. Um fornecedor pode assinar esse evento após a escolha da ferramenta e da política de privacidade.

## Validação

Consulte `artifacts/validation.md` para a revisão desta entrega. O build é estático e não depende de JavaScript para conteúdo indexável. Métricas Core Web Vitals reais devem ser medidas no domínio final; verificações locais não substituem dados de campo.

## Pendências de conteúdo/publicação

- Arquivo licenciado da Asgard.
- Cases e respectivas imagens/contexto/resultados reais.
- Confirmação do domínio e escolha do serviço para envio direto do formulário, caso desejado.

O projeto não foi publicado.
