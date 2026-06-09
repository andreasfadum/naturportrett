import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Frontend monteres på subpath /workshop_01/ (matcher produksjons-URL
// naturportrett.figurate.studio/workshop_01). I dev kjører den på 5174,
// proxer /workshop_01/api → Express på 3002.
export default defineConfig({
  plugins: [react()],
  base: '/workshop_01/',
  server: {
    port: 5174,
    proxy: { '/workshop_01/api': 'http://localhost:3002' }
  },
  build: { outDir: 'dist' }
})
