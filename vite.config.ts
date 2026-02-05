import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {

    host: '0.0.0.0',
    port: 5173,
    strictPort: true,

    allowedHosts: [
      'intelligens.app',
      'www.intelligens.app',
      'hrapi.intelligens.app',
    ],

    hmr: {
      protocol: 'wss',
      host: 'hrapi.intelligens.app',
      clientPort: 443,
    }

  }
})
