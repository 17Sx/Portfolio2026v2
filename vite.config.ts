import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/visitors': {
        target: 'https://api.counterapi.dev',
        changeOrigin: true,
        rewrite: () => '/v1/17sx-portfolio/visits/up',
      },
    },
  },
})
