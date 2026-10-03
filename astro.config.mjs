import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import { existsSync } from 'node:fs';
if (existsSync('.env')) process.loadEnvFile('.env');
const site = process.env.PUBLIC_SITE_URL || 'https://limeagencia.com.br';
export default defineConfig({
  site,
  integrations: [
    sitemap(),
    react(),
    {
      name: 'isolated-vite-cache',
      hooks: {
        'astro:config:setup': ({ command, updateConfig }) => {
          updateConfig({ vite: { cacheDir: `node_modules/.vite-lime/${command}` } });
        },
      },
    },
  ],
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  vite: {
    resolve: {
      dedupe: ['react', 'react-dom', 'gsap'],
    },
    optimizeDeps: {
      // Prepare the island and its renderer together so they share one React runtime.
      include: [
        'react',
        'react-dom/client',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'lucide-react',
        'gsap',
        'gsap/ScrollTrigger',
        'gsap/SplitText',
        'lenis',
      ],
    },
  },
});
