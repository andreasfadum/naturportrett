import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ISO-dato (YYYY-MM-DD) ved build-tid. Klienten formaterer per språk
// via formatBuildDate() i src/utils/buildDate.js — tidligere var dette
// hardkodet på norsk format på build-tid, så engelsk UI viste norsk
// dato. Nå velges format ut fra valgt språk.
const buildDateISO = new Date().toISOString().slice(0, 10)

export default defineConfig({
  plugins: [react()],
  define: {
    __BUILD_DATE_ISO__: JSON.stringify(buildDateISO),
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
