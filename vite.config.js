import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const buildDate = new Date().toLocaleDateString('no-NB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export default defineConfig({
  plugins: [react()],
  define: {
    __BUILD_DATE__: JSON.stringify(buildDate),
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
