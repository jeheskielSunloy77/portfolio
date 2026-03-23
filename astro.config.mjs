// @ts-check

import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, envField } from 'astro/config';
import { loadEnv } from 'vite';
// import "./src/env";

const env = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), "");

// https://astro.build/config
export default defineConfig({
  output: 'server',
  vite: {
    plugins: [tailwindcss()],
  },
  env: {
    schema: {
      APP_URL: envField.string({
        access: 'public',
        context: 'client',
        optional: false,
        url: true,
      }),
      GEMINI_API_KEY: envField.string({
        access: 'secret',
        context: 'server',
        optional: false,
      }),
      GEMINI_MODEL: envField.string({
        access: 'secret',
        context: 'server',
        optional: false,
      }),
      MONGODB_URI: envField.string({
        access: 'secret',
        context: 'server',
        optional: false,
      }),
      MONGODB_DB: envField.string({
        access: 'secret',
        context: 'server',
        optional: false,
      }),
      SMTP_HOST: envField.string({
        access: 'secret',
        context: 'server',
        optional: false,
      }),
      SMTP_PORT: envField.number({
        access: 'secret',
        context: 'server',
        optional: false,
      }),
      SMTP_USER: envField.string({
        access: 'secret',
        context: 'server',
        optional: false,
      }),
      SMTP_PASS: envField.string({
        access: 'secret',
        context: 'server',
        optional: false,
      }),
    },
    validateSecrets: true,
  },
  site: env.APP_URL || 'http://localhost:4321',
  integrations: [
    react(),
    mdx(),
    sitemap({
      filter: (page) => {
        try {
          return new URL(page).pathname !== '/';
        } catch {
          return true;
        }
      },
    }),
  ],
  redirects: {
    "resume/en": "https://drive.google.com/uc?export=download&id=17wnmxr6lTSdWMYS4YtYdU9i_w23IEqf7",
    "resume/id": "https://drive.google.com/uc?export=download&id=1KGXAMT65Ir0-i_PFdlHJIlap5mcjlJnP",
  },
  adapter: vercel(),
});
