import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: proces.env.VITE_BASE_PATH || ""

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
