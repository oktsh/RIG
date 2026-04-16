import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'e2e',
    globals: true,
    testTimeout: 60_000,
  },
});
