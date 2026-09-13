import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { existsSync } from 'node:fs';
if (existsSync('.env')) process.loadEnvFile('.env');
const site = process.env.PUBLIC_SITE_URL || 'https://limeagencia.com.br';
export default defineConfig({
  site,
  integrations: [sitemap()],
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
});
