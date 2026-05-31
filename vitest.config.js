import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,

    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'text-summary', 'html'],
      include: ['src/**'],
      exclude: ['src/**/index.js']
    }
  }
});
