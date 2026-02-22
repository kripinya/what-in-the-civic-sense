import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1500, // Phaser is large
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['phaser'],
        }
      }
    }
  }
})
