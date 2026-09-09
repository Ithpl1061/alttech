import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
        agent: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            console.error('[vite proxy error]', err.message)
            if (res && !res.headersSent && typeof res.writeHead === 'function') {
              res.writeHead(504, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ success: false, message: 'Connection reset. Please try again.' }))
            }
          })
        },
      },
    },
  },
})
