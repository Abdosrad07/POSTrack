import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
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

