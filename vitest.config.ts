import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['packages/**/*.test.ts', 'apps/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@nice-travel/shared': new URL('./packages/shared/src/index.ts', import.meta.url).pathname,
      '@nice-travel/domain': new URL('./packages/domain/src/index.ts', import.meta.url).pathname,
      '@nice-travel/providers': new URL('./packages/providers/src/index.ts', import.meta.url).pathname,
    },
  },
});

