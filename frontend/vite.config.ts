import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Allow connections from any origin (useful behind proxies)
    allowedHosts: true,
    // Ensure HMR WebSocket works behind reverse proxies
    hmr: {
      // Use the same protocol/host as the browser sees
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
    },
  },
})
