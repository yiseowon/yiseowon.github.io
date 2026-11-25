// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.PORTFOLIO_SITE_URL || 'https://yiseowon.github.io',
  output: 'static',
  devToolbar: { enabled: false },

  compressHTML: true,

  redirects: {
    '/about': '/#about',
    '/contact': '/#contact',
  },

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      tsconfig: {
        configFile: true,
      },
    },
    define: {
      'import.meta.env.GITHUB_USERNAME': JSON.stringify(process.env.GITHUB_USERNAME || 'yiseowon'),
    },
  },

  integrations: [
    mdx(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],
});
