import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// En local, le front appelle /api : on le renvoie vers le backend (server/).
// API_PROXY_TARGET change la cible quand le port 3000 est déjà pris.
const backend = process.env.API_PROXY_TARGET || 'http://localhost:3000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Bibliothèques dans des fichiers à part : elles changent rarement, le navigateur
        // les garde en cache d'un déploiement à l'autre (seul le code du site est retéléchargé).
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (/node_modules\/(react|react-dom|scheduler|react-router|react-router-dom)\//.test(id)) return 'vendor-react'
          if (/node_modules\/(gsap|@gsap)\//.test(id)) return 'vendor-gsap'
          if (/node_modules\/(axios|zustand)\//.test(id)) return 'vendor-utils'
          return undefined
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': backend,
      '/uploads': backend,
    },
  },
})
