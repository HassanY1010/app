import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo_final.png'],
      manifest: {
        name: 'Admin Panel',
        short_name: 'Admin',
        description: 'Admin Panel for Classified Ads App',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'logo_final.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    host: true
  }
})
