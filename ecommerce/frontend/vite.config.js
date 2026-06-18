import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://ecommerce-website-r0dw.onrender.com',
        changeOrigin: true,
      },
    },
  },
})