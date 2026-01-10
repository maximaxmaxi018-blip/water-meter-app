import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/water-meter-app/', // Базовый путь для GitHub Pages
  build: {
    outDir: 'dist'
  }
})
