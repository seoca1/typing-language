import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/typing-language/', // GitHub Pages repository name
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