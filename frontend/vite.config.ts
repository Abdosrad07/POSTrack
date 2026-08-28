import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks for large libraries
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor'
            }
            if (id.includes('@tanstack/react-query')) {
              return 'query-vendor'
            }
            if (id.includes('leaflet') || id.includes('react-leaflet')) {
              return 'leaflet-vendor'
            }
            if (id.includes('recharts')) {
              return 'charts-vendor'
            }
            if (id.includes('jspdf')) {
              return 'pdf-vendor'
            }
            if (id.includes('xlsx')) {
              return 'excel-vendor'
            }
            if (id.includes('@heroicons/react')) {
              return 'icons-vendor'
            }
          }
        },
      },
    },
  },
  server: {
    /**
     * Proxy de développement : toutes les requêtes "/api" du navigateur sont
     * relayées vers le backend par Node, ce qui rend le front indépendant de
     * la pile réseau sur laquelle uvicorn écoute (127.0.0.1 vs ::1) et
     * supprime tout problème de CORS en local.
     * Avec VITE_API_URL=/api dans frontend/.env, axios appelle le front
     * en same-origin et c'est ce proxy qui joint le backend réel.
     */
    proxy: {
      '/api': {
        // Le backend uvicorn écoute uniquement en IPv4 (127.0.0.1:8000).
        // Node résout "localhost" en "::1" (IPv6) d'abord, d'où l'erreur
        // ECONNREFUSED ::1:8000 : on cible donc explicitement l'IPv4.
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})

