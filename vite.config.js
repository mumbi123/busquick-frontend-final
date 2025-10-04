import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',  // Fixed: Fallback to root for Render serving
  server: {
    proxy: {
      '/api': {
        target: 'https://busquick.onrender.com',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
