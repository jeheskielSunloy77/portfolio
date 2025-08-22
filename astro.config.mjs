// @ts-check

import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
// import "./src/env";


// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },

  site: import.meta.env.APP_URL || 'https://example.com',
  integrations: [react(), mdx(), sitemap()],

  adapter: node({
    mode: 'standalone',
  }),
});