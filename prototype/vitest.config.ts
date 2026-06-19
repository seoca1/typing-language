import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // jsdom provides window, localStorage, document for browser-like tests
    environment: 'jsdom',
    globals: true,
  },
});
