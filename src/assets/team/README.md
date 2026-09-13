# Fotos da equipe Lime

Extraídas da apresentação institucional 2026 v3, preservando os PNGs originais e a transparência.

- `carol-melo.png`: retrato com notebook, associado ao nome Carol Melo no slide 11.
- `julia-lima.png`: retrato de braços cruzados, associado ao nome Julia Lima no slide 11.
- `equipe-lime.png`: foto das duas em cores.
- `equipe-lime-preto-e-branco.png`: foto das duas com notebook em preto e branco.
- `equipe-lime-avatares.png`: composição de dois retratos circulares.

As associações dos retratos individuais foram conferidas pela posição de fotos e nomes no slide 11. O arquivo sources.json registra origem e dimensões.

Na implementação Astro, importar por astro:assets e gerar tamanhos responsivos com formatos WebP/AVIF. Usar object-fit: contain nos retratos recortados para preservar o enquadramento. Reservar largura e altura e usar lazy loading na seção de equipe.

Os retratos individuais estão integrados em src/components/sections/Team.astro, com geração responsiva de AVIF/WebP por astro:assets.
