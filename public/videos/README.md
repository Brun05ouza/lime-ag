# Vídeo-manifesto — Lime Ag

A experiência de entrada espera estes arquivos neste diretório:

```
public/videos/manifesto-lime.webm
public/videos/manifesto-lime.mp4
public/videos/manifesto-poster.webp   (opcional; hoje o fallback é manifesto-poster.svg)
```

Substitua pelos arquivos definitivos **sem mudar os nomes**. O site já aponta para esses caminhos.

Se o manifesto for refilmado e todos os visitantes precisarem vê-lo de novo, altere `MANIFESTO_VERSION` em `src/lib/manifesto.ts` (hoje `v1`). Isso muda a chave do localStorage para `lime_manifesto_seen_v2`.
