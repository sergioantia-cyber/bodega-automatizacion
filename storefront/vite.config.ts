import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/zenrows': {
        target: 'https://api.zenrows.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/zenrows/, '')
      }
    }
  }
})
