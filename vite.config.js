import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || "/busquick-frontend-final",  // Fixed: Added comma and corrected 'process.env'
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
