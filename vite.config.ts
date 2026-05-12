import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'icons.svg',
        'pwa-icon.svg',
        'apple-touch-icon.png',
        'pwa-72x72.png',
        'pwa-96x96.png',
        'pwa-128x128.png',
        'pwa-144x144.png',
        'pwa-152x152.png',
        'pwa-192.png',
        'pwa-384x384.png',
        'pwa-512.png',
        'pwa-maskable-512.png',
      ],
      manifest: {
        name: 'Founder OS',
        short_name: 'Founder OS',
        description: 'Founder workspace for building and shipping.',
        theme_color: '#141716',
        background_color: '#141716',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          ...([72, 96, 128, 144, 152] as const).map((size) => ({
            src: `pwa-${size}x${size}.png`,
            sizes: `${size}x${size}`,
            type: 'image/png',
          })),
          {
            src: 'pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-384x384.png',
            sizes: '384x384',
            type: 'image/png',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
