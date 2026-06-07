import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vike from 'vike/plugin'

export default defineConfig({
  base: '/', // ✅ critical for Netlify + nested routes
  plugins: [react(), vike()],
  server: {
    host: true,
    allowedHosts: true,
    port: 3000,
    strictPort: true,
    hmr: {
      protocol: 'wss',
      clientPort: 443
    }
  },
  optimizeDeps: {
    include: ['react-fast-compare', 'lucide-react']
  },
  ssr: {
    noExternal: ['react-helmet-async']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})
