// @ts-check

import mdx from '@astrojs/mdx';
import node from '@astrojs/node';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
// import "./src/env";


// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },

  site: import.meta.env.APP_URL || 'http://localhost:4321',
  integrations: [react(), mdx(), sitemap()],

  adapter: node({
    mode: 'standalone',
  }),
});