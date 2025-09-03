// @ts-check

import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
// import "./src/env";

const env = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), "");


// https://astro.build/config
export default defineConfig({
  output: 'server',
  vite: {
    plugins: [tailwindcss()],
  },

  site: env.APP_URL || 'http://localhost:4321',
  integrations: [react(), mdx(), sitemap()],

  adapter: vercel(),
});