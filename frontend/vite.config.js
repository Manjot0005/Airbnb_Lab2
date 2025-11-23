import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:4000',
      '/auth': 'http://localhost:4000',
      '/owner': 'http://localhost:4000',
      '/listings': 'http://localhost:4000',
      '/bookings': 'http://localhost:4000',
      '/favorites': 'http://localhost:4000',
      '/uploads': 'http://localhost:4000'
    }
  }
})