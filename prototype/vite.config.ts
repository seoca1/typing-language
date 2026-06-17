import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Support GitHub Pages deployment
  build: {
    rollupOptions: {
      external: ['ollama'],
    },
  },
  optimizeDeps: {
    exclude: ['ollama'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});