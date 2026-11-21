import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// En local, le front appelle /api : on le renvoie vers le backend (server/).
// API_PROXY_TARGET change la cible quand le port 3000 est déjà pris.
const backend = process.env.API_PROXY_TARGET || 'http://localhost:3000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': backend,
      '/uploads': backend,
    },
  },
})
