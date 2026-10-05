// @ts-check

import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, envField, fontProviders } from 'astro/config';
import { loadEnv } from 'vite';
// import "./src/env";

const env = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), "");
const appUrlString = env.APP_URL || process.env.APP_URL || 'http://localhost:4321';
const configuredSiteUrl = new URL(appUrlString);

if (configuredSiteUrl.hostname.startsWith('www.')) {
  configuredSiteUrl.hostname = configuredSiteUrl.hostname.replace(/^www\./, '');
}

// https://astro.build/config
export default defineConfig({
  output: 'server',
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Inter',
      cssVariable: '--font-inter',
      weights: [400, 500, 600, 700],
      styles: ['normal'],
      subsets: ['latin'],
      display: 'swap',
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Calistoga',
      cssVariable: '--font-calistoga',
      weights: [400],
      styles: ['normal'],
      subsets: ['latin'],
      display: 'swap',
    },
  ],
  vite: {
    optimizeDeps: {
      include: ['react-dom/client'],
    },
    plugins: [tailwindcss()],
  },
  env: {
    schema: {
      APP_URL: envField.string({
        access: 'public',
        context: 'client',
        optional: true,
        default: 'http://localhost:4321',
      }),
      AI_PROVIDER: envField.string({
        access: 'secret',
        context: 'server',
        optional: true,
        default: 'google',
      }),
      AI_API_KEY: envField.string({
        access: 'secret',
        context: 'server',
        optional: true,
      }),
      AI_MODEL: envField.string({
        access: 'secret',
        context: 'server',
        optional: true,
      }),
      AI_BASE_URL: envField.string({
        access: 'secret',
        context: 'server',
        optional: true,
      }),
      DB_PROVIDER: envField.string({
        access: 'secret',
        context: 'server',
        optional: true,
      }),
      DATABASE_URL: envField.string({
        access: 'secret',
        context: 'server',
        optional: true,
      }),
      SMTP_URL: envField.string({
        access: 'secret',
        context: 'server',
        optional: true,
      }),
      SMTP_HOST: envField.string({
        access: 'secret',
        context: 'server',
        optional: true,
      }),
      SMTP_PORT: envField.number({
        access: 'secret',
        context: 'server',
        optional: true,
        default: 587,
      }),
      SMTP_USER: envField.string({
        access: 'secret',
        context: 'server',
        optional: true,
      }),
      SMTP_PASS: envField.string({
        access: 'secret',
        context: 'server',
        optional: true,
      }),
    },
    validateSecrets: true,
  },
  site: configuredSiteUrl.toString(),
  integrations: [
    react(),
    mdx(),
    sitemap({
      filter: (page) => {
        try {
          const pathname = new URL(page).pathname;
          return !pathname.startsWith('/en');
        } catch {
          return true;
        }
      },
    }),
  ],
  redirects: {
    '/en': '/',
    '/en/[...slug]': '/[...slug]',
  },
  adapter: vercel(),
});
